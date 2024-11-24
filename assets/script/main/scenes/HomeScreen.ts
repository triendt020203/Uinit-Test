import { cyberGame } from "../CyberGame";
import OverlayLoader from "../component/OverlayLoader";
import AdapterManager from "../controllers/AdapterManager";
import PlayFriendPopup from "../popup/PlayFriendPopup";
import SettingPopup from "../popup/SettingPopup";
import LobbyChat from "../chat/LobbyChat";
import FriendGiftPopup from "../popup/FriendGiftPopup";
import ChatButton from "../chat/ChatButton";
import InterstitialManager from "../controllers/InterstitialManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeScreen extends cc.Component {

    @property(ChatButton)
    readonly chatButton: ChatButton = null;

    private playFriendPopup: PlayFriendPopup = null;

    private lobbyChat: LobbyChat = null;

    private overlayLoader: any = null;

    private lobbyOpenning: boolean = false;

    protected onLoad(): void {
        AdapterManager.inst.autoFitCanvas(this.node);
    }

    protected start(): void {
        /* Update badge icons */
        if (cyberGame.ad.ready) {
            this.refreshSpinBadge(true);
            this.refreshAdsBadge(true);
        }

        // handle ig entry point data        
        cyberGame.processEntryPointData().then((isProcessing) => {
            if (!isProcessing)
                this.handleResumeGame();
        });

        // show ig optin popup
        this.showOptIn();

        // connect to chat server
        cyberGame.chat.connect();

        // open lobby game when possible
        if (cyberGame.storage.get("currentLobby") === 2)
            this.openLobbyScene();

        // update chat button
        const messages = cyberGame.chat.messages();
        if (messages.length > 0) {
            if (messages.length == 1) {
                this.updateChatBadge(messages[0]);
            } else {
                this.updateChatBadge(messages[messages.length - 2]);
                this.updateChatBadge(messages[messages.length - 1]);
            }
        }

        // show inter when possible
        if (cyberGame.storage.get("interstitialShowingAllowed")) {
            if (InterstitialManager.instance.canShow()) {
                cyberGame.audio.stopAllEffects();
                InterstitialManager.instance.show();
            }
            else {
                this.showShortcut();
                cyberGame.audio.resumeMusic();
            }
            cyberGame.storage.put("interstitialShowingAllowed", false);
        } else
            cyberGame.audio.resumeMusic();

        cyberGame.storage.put("currentScene", "home");
    }

    private showShortcut() {
        if (!cyberGame.storage.get("canCreateShortcut")) {
            FBInstant.player.getDataAsync(['canCreateShortcut']).then((data) => {
                if (data['canCreateShortcut']) return;
                FBInstant.canCreateShortcutAsync().then((canCreateShortcut) => {
                    if (!canCreateShortcut) return;
                    FBInstant.createShortcutAsync()
                        .then(() => {
                            cyberGame.storage.put("canCreateShortcut", true);
                            FBInstant.player.setDataAsync({ canCreateShortcut: true })
                        })
                });
            })
        }
    }

    protected onEnable(): void {
        // sfs event
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse, this);
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.USER_VARIABLES_UPDATE, this.onUserVariablesUpdate, this);

        // ads event
        cc.game.on(cyberGame.event.AdsEvent.REWARD, this.onAdReward, this);
        cc.game.on(cyberGame.event.AdsEvent.READY, this.onAdReady, this);

        // global chat event
        cc.game.on(cyberGame.event.ON_LOBBY_PUBLIC_MSG, this.onPublicMessage, this);

        if (!cyberGame.storage.get("isHomeSceneStarted"))
            cyberGame.storage.put("isHomeSceneStarted", true);
        else
            cc.director.preloadScene("game");

        if (!cyberGame.storage.get("currentLobby"))
            cyberGame.storage.put("currentLobby", 1);
    }

    protected onDisable(): void {
        cyberGame.socket.removeEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse);
        cyberGame.socket.removeEventListener(SFS2X.SFSEvent.USER_VARIABLES_UPDATE, this.onUserVariablesUpdate);

        cc.game.off(cyberGame.event.AdsEvent.REWARD, this.onAdReward, this);
        cc.game.off(cyberGame.event.AdsEvent.READY, this.onAdReady, this);
        cc.game.off(cyberGame.event.ON_LOBBY_PUBLIC_MSG, this.onPublicMessage, this);
    }

    private onPublicMessage(event: any): void {
        this.updateChatBadge(event);
        if (this.lobbyChat)
            this.lobbyChat.updatePublicMessage(event);
    }

    private updateChatBadge(event: any): void {
        this.chatButton.updateMsg(event.name, event.content);
    }

    private handleResumeGame() {
        // resume game if possible        
        if (cyberGame.storage.get("lastJoinedRoomId") && cyberGame.storage.get("lastJoinedRoomId") != -1) {
            this.showOverlayLoader();
            setTimeout(() => {
                cyberGame.lobbyCtrl.resumeRoom(cyberGame.storage.get("lastJoinedRoomId"));
            }, 300);
        }
    }

    private showOptIn(): void {
        if (CyberGlobals.gameConfig.isPreviewMode)
            return;
        let optHandled = cyberGame.storage.get("optHandled");
        if (!optHandled) {
            FBInstant.player.canSubscribeBotAsync().then((can_subscribe) => {
                if (can_subscribe) {
                    cc.resources.load("prefab/OptInPopup", cc.Prefab, (err, prefab: cc.Prefab) => {
                        if (!err && cc.isValid(this.node)) {
                            this.node.addChild(cc.instantiate(prefab));
                            cyberGame.storage.put("optHandled", true);
                        }
                    });
                }
            }).catch((e) => {
                cyberGame.storage.put("optHandled", true);
                console.log(e);
            });
        }
    }

    private onUserVariablesUpdate(event: any): void {
        if (event.user.isItMe) {
            if (event.changedVars.indexOf("coin") != -1) {
                let coin = event.user.getVariable('coin').value;
                this.node.getChildByName("Profile").getChildByName("playerCoin").getComponent(cc.Label).string = cyberGame.utils.formatCoinWithCommas(coin);
            }
        }
    }
    addCoinn() {
        let obj = new SFS2X.SFSObject();
        obj.putLong("coin", 1000000);
        cyberGame.socket.send(new SFS2X.ExtensionRequest("profile.setCoin", obj));
    }

    private onExtensionResponse(event: any): void {
        if (event.cmd == 'findGame') {
            this.hideOverlayLoader();
            if (event.params.getInt('errorCode') === 1)
                this.showAdsPopup();
        }
        else if (event.cmd == 'freeChip')
            this.handleUpdateChip(event.params);
        else if (event.cmd == "resumeGameError")
            this.handleResumeGameError(event.params);
        else if (event.cmd == "joinFriendGameError")
            this.handleJoinFriendGameError(event.params);
        else if (event.cmd == "ads.rewardedInterstitial")
            this.handleUpdateChip(event.params);
        else if (event.cmd == "gift.code") {
            let msg = event.params.containsKey('msg') ? event.params.getUtfString('msg') : null;
            if (msg)
                cyberGame.openCommonPopup({ content: msg });
        }
    }

    private handleResumeGameError(params: SFS2X.SFSObject): void {
        if (params.containsKey("canRetry")) {
            this.scheduleOnce(() => {
                let roomId = params.getInt("roomId");
                cyberGame.lobbyCtrl.resumeRoom(roomId);
            }, 1);
        } else
            this.hideOverlayLoader();
    }

    private handleJoinFriendGameError(params: SFS2X.SFSObject): void {
        if (this.playFriendPopup) {
            this.hideOverlayLoader();
            let errorCode = params.getInt('errorCode');
            if (errorCode == 15)
                cyberGame.openCommonPopup({ content: cyberGame.text("ROOM_WAS_NOT_FOUND") });
            else if (errorCode == 2 || errorCode == 5)
                cyberGame.openCommonPopup({ content: cyberGame.text("ROOM_FULL") });
            else if (errorCode == 1) {
                let bet = params.getLong("bet");
                let text = cyberGame.text("YOU_NEED_AT_LEAST", cyberGame.utils.shortenLargeNumber(cyberGame.lobbyCtrl.miniumMoneyCondition * bet, 0));
                cyberGame.openCommonPopup({ content: text });
            }
        }
    }

    private handleUpdateChip(params: SFS2X.SFSObject): void {
        if (params.containsKey('coin')) {
            let text = cyberGame.text("YOU_GOT_CHIP", cyberGame.utils.shortenLargeNumber(params.getLong('coin'), 2));
            cyberGame.openCommonPopup({ content: text });
        }
    }

    private onAdReward(params: any): void {
        if (params.type == cyberGame.ad.REWARDED_POPUP_POSITION) {
            // update coin
            let obj = new SFS2X.SFSObject();
            obj.putInt("type", params.type);
            cyberGame.socket.send(new SFS2X.ExtensionRequest("ads.rewarded", obj));

            // noficication popup            
            cyberGame.openCommonPopup({
                content: cyberGame.text("WATCH_VIDEO_SUCCESS", cyberGame.utils.formatCoinWithCommas(params.coin))
            });
        }
    }

    private onAdReady(ready: boolean): void {
        this.refreshSpinBadge(ready);
        this.refreshAdsBadge(ready);
    }

    private refreshAdsBadge(ready: boolean): void {
        let adsBadge = this.node.getChildByName("RightMenu").getChildByName("rewardvideo").getChildByName("badge");
        if (ready)
            adsBadge.active = cyberGame.ad.MAX_VIDEOS - cyberGame.ad.watchCounter > 0 ? true : false;
        else
            adsBadge.active = false;
    }

    private refreshSpinBadge(ready: boolean): void {
        let spinBadge = this.node.getChildByName("RightMenu").getChildByName("spin").getChildByName("badge");
        let giftTime = 10800;
        let collectTime = cyberGame.storage.get("collectTime");
        if (collectTime < giftTime) {
            if (ready && cyberGame.ad.spinCounter < 2 && giftTime - collectTime > 500)
                spinBadge.active = true;
            else
                spinBadge.active = false;
        } else
            spinBadge.active = true;
    }

    onPlayNow(): void {
        // user vao game va click play now ngay lap tuc trong preloadResources at splash chua load toi game        
        if (!cyberGame.isGameAssetReady()) {
            cc.director.preloadScene("game", null, () => {
                cyberGame.setGameAssetReady(true);
            });
        }
        if (cyberGame.lobbyCtrl.canPlay(5000)) {
            this.showOverlayLoader();
            cyberGame.lobbyCtrl.sendFindGameRequest();
        } else {
            let text = cyberGame.text("YOU_NEED_AT_LEAST", cyberGame.utils.shortenLargeNumber(cyberGame.lobbyCtrl.miniumMoneyCondition * 5000, 0));
            cyberGame.openCommonPopup({ content: text });
        }
    }

    onPlayTeamNow(): void{
        if (!cyberGame.isGameAssetReady()) {
            cc.director.preloadScene("game", null, () => {
                cyberGame.setGameAssetReady(true);
            });
        }
        if (cyberGame.lobbyCtrl.canPlay(5000)) {
            this.showOverlayLoader();
            cyberGame.lobbyCtrl.sendFindGameTeamRequest();
        } else {
            let text = cyberGame.text("YOU_NEED_AT_LEAST", cyberGame.utils.shortenLargeNumber(cyberGame.lobbyCtrl.miniumMoneyCondition * 5000, 0));
            cyberGame.openCommonPopup({ content: text });
        }
    }

    onCreateGameRequest() {
        this.playFriendPopup.node.active = false;
        let bet = this.playFriendPopup.currentBet;
        if (cyberGame.lobbyCtrl.canPlay(bet)) {
            this.showOverlayLoader();
            cyberGame.lobbyCtrl.sendCreateFriendGameRequest(bet);
        } else {
            let text = cyberGame.text("YOU_NEED_AT_LEAST", cyberGame.utils.shortenLargeNumber(cyberGame.lobbyCtrl.miniumMoneyCondition * bet, 2));
            cyberGame.openCommonPopup({ content: text });
        }
    }

    onJoinFriengGameRequest(roomId: number) {
        this.showOverlayLoader();
        cyberGame.lobbyCtrl.joinPrivateRoom(roomId);
    }

    openCreateFriendGamePopup(): void {
        if (this.playFriendPopup)
            this.playFriendPopup.show();
        else {
            this.showOverlayLoader();
            cyberGame.loadPrefab("prefab/CreateFriendPopup", true).then((node: cc.Node) => {
                if (cc.isValid(this.node)) {
                    this.hideOverlayLoader();
                    this.node.addChild(node);
                    this.playFriendPopup = node.getComponent(PlayFriendPopup);
                    this.playFriendPopup.homeScene = this;
                    this.playFriendPopup.show();
                } else
                    node.destroy();
            }).catch(() => {
                this.hideOverlayLoader();
            })
        }
    }

    showChatPopup(): void {
        cyberGame.audio.playButton();
        if (this.lobbyChat)
            this.lobbyChat.show();
        else {
            this.showOverlayLoader();
            cyberGame.loadPrefab("prefab/LobbyChat", true).then((node: cc.Node) => {
                if (cc.isValid(this.node)) {
                    this.lobbyChat = node.getComponent(LobbyChat);
                    this.hideOverlayLoader();
                    this.node.addChild(node);
                    this.lobbyChat.show();
                    this.updateChatBadge(false);
                } else
                    node.destroy();
            }).catch(() => {
                this.hideOverlayLoader();
            });
        }
    }

    showIAPPopup(): void {
        cyberGame.audio.playButton();
        if (cyberGame.iap.isReady()) {
            this.showOverlayLoader();
            cyberGame.iap.getPurchasesAsync(() => {
                this.loadPrefabThenCreateNode("prefab/IAPPopup");
            });
        }
    }

    showFriendPopup(): void {
        this.showOverlayLoader();
        cyberGame.getConnectedPlayersAsync().then((data: any) => {
            cyberGame.loadPrefab("prefab/FriendGiftPopup", true).then((node: cc.Node) => {
                if (cc.isValid(this.node)) {
                    node.getComponent(FriendGiftPopup).friends = data.players;
                    node.getComponent(FriendGiftPopup).invMap = data.invitation;
                    this.hideOverlayLoader();
                    this.node.addChild(node);
                } else
                    node.destroy();
            }).catch(() => {
                this.hideOverlayLoader();
            });
        }).catch(() => {
            this.hideOverlayLoader();
        });
    }

    showRedeemPopup(): void {
        this.loadPrefabThenCreateNode("prefab/RedeemPopup");
    }

    showLeaderboardPopup(): void {
        this.loadPrefabThenCreateNode("prefab/LeaderboardPopup");
    }

    showSpin(): void {
        this.loadPrefabThenCreateNode("prefab/SpinWheel");
    }

    showAdsPopup(): void {
        this.loadPrefabThenCreateNode("prefab/VideoPopup");
    }

    showInvitePopup(): void {
        this.loadPrefabThenCreateNode("prefab/InvitePopup");
    }

    showTutorialPopup(): void {
        this.loadPrefabThenCreateNode("prefab/TutorialPopup");
        // cc.director.loadScene("tutorial");
    }

    showSettingPopup(): void {
        this.showOverlayLoader();
        cyberGame.loadPrefab("prefab/SettingPopup", true).then((node: cc.Node) => {
            if (cc.isValid(this.node)) {
                node.getComponent(SettingPopup).setScene(this);
                this.hideOverlayLoader();
                this.node.addChild(node);
            } else
                node.destroy();
        }).catch(() => {
            this.hideOverlayLoader();
        });
    }

    openLobbyScene(): void {
        // avoid double click
        if (!this.lobbyOpenning) {
            this.lobbyOpenning = true;
            this.showOverlayLoader();
            cyberGame.loadPrefab("prefab/LobbyGame", true).then((node: cc.Node) => {
                if (cc.isValid(this.node)) {
                    this.hideOverlayLoader();
                    this.node.addChild(node);
                    this.lobbyOpenning = false;
                } else
                    node.destroy();
            }).catch(() => {
                this.hideOverlayLoader();
                this.lobbyOpenning = false;
            });
        }
    }

    private loadPrefabThenCreateNode(name: string): void {
        this.showOverlayLoader();
        cyberGame.loadPrefab(name, true)
            .then((node: cc.Node) => {
                if (cc.isValid(this.node)) {
                    this.hideOverlayLoader();
                    this.node.addChild(node);
                } else
                    node.destroy();
            })
            .catch(() => {
                this.hideOverlayLoader();
            });
    }

    showOverlayLoader(): void {
        if (!this.overlayLoader) {
            this.overlayLoader = cyberGame.createOverlay();
            this.node.addChild(this.overlayLoader);
        }
    }

    hideOverlayLoader(): void {
        if (this.overlayLoader) {
            this.overlayLoader.getComponent(OverlayLoader).close();
            this.overlayLoader = null;
        }
    }

    playButtonAudio(): void {
        cyberGame.audio.playButton();
    }

}