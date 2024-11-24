import { cyberGame } from "../CyberGame";
import RoomItem from "../component/RoomItem";
import OverlayLoader from "../component/OverlayLoader";
import LobbyCreateGamePopup from "../popup/LobbyCreateGamePopup";
import LobbyTabs from "../component/LobbyTabs";
import Notification from "../../game/view/component/Notification";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LobbyScreen extends cc.Component {

    @property(cc.ScrollView)
    roomListView: cc.ScrollView = null;

    @property(LobbyCreateGamePopup)
    createGamePopup: LobbyCreateGamePopup = null;

    @property(cc.Prefab)
    roomItemPrefab: cc.Prefab = null;

    @property(cc.Button)
    homeButton: cc.Button = null;

    @property(cc.Node)
    avatar: cc.Node = null;

    @property(cc.Label)
    profileName: cc.Label = null;

    @property(cc.Label)
    profileCoin: cc.Label = null;

    @property(LobbyTabs)
    lobbyTabs: LobbyTabs = null;

    @property(Notification)
    notification: Notification = null;

    overlayLoader: any = null;

    refreshAtLeastOnce: boolean = false;

    start() {
        this.updateLobbyNodes(false);
        this.homeButton.node.once("click", () => {
            cyberGame.storage.put("currentLobby", 1);
            cyberGame.audio.playButton();
            this.node.destroy();
        });
        cyberGame.storage.put("currentLobby", 2);
        cyberGame.loadAvatar(FBInstant.player.getPhoto(), this.avatar, 102);
        this.profileName.string = FBInstant.player.getName();
        this.profileCoin.string = cyberGame.utils.shortenLargeNumber(cyberGame.coin(), 2);
        this.scheduleOnce(() => {
            this.sendSubscribeRequest(cyberGame.storage.get("currentLobbyGroup"));
        }, 0.3);
        this.lobbyTabs.node.on(cyberGame.event.ON_LOBBY_TAB_CHANGE, this.onTabChange, this);
        this.lobbyTabs.setActiveTab(cyberGame.storage.get("currentLobbyGroup"));
    }

    onEnable() {
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse, this);
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, true, true);
    }

    onDisable() {
        cyberGame.socket.removeEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse);
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, false, true);
    }

    onTabChange(groupId: string) {
        this.roomListView.content.removeAllChildren();
        this.showOverlayLoader();
        this.scheduleOnce(() => {
            cyberGame.storage.put("currentLobbyGroup", groupId);
            this.sendSubscribeRequest(groupId);
        }, 0.3);
    }

    sendSubscribeRequest(groupId) {
        var params = new SFS2X.SFSObject();
        params.putUtfString("gameGroup", groupId);
        cyberGame.socket.send(new SFS2X.ExtensionRequest("getRoomList", params));
    }

    refreshRoomList(rooms: any[]) {
        if (rooms.length > 0) {
            for (let i = 0; i < rooms.length; i++) {
                let data = rooms[i];
                if (data.userCount < 5) {
                    let item = cc.instantiate(this.roomItemPrefab);
                    item.getComponent(RoomItem).init(this, data);
                    this.roomListView.content.addChild(item);
                }
            }
            for (let i = 0; i < rooms.length; i++) {
                let data = rooms[i];
                if (data.userCount == 5) {
                    let item = cc.instantiate(this.roomItemPrefab);
                    item.getComponent(RoomItem).init(this, data);
                    this.roomListView.content.addChild(item);
                }
            }
            this.roomListView.scrollToTop(0.1);
        }
    }

    onExtensionResponse(event: any) {
        if (event.cmd == 'joinGameError')
            this.handleJoinRoomError(event.params);
        else if (event.cmd == 'createGameError')
            this.hideOverlayLoader();
        else if (event.cmd == "getRoomList")
            this.updateRoomList(event.params);
    }

    updateRoomList(params: SFS2X.SFSObject) {
        if (!this.refreshAtLeastOnce) {
            this.refreshAtLeastOnce = true;
            this.node.getChildByName("loadingText").active = false;
            this.updateLobbyNodes(true);
        } else
            this.hideOverlayLoader();
        let roomList = [];
        if (params.containsKey("roomList")) {
            let sfsArray = params.getSFSArray("roomList");
            if (sfsArray.size() > 0) {
                for (let i = 0; i < sfsArray.size(); i++) {
                    let obj = sfsArray.getSFSObject(i);
                    let entry = {
                        id: obj.getInt("id"),
                        userCount: obj.getInt("userCount"),
                        bet: obj.getLong("bet")
                    }
                    if (entry.userCount == 0)
                        entry.userCount = 1;
                    roomList.push(entry);
                }
                if (roomList.length > 1)
                    roomList = this.shuffleArray(roomList);
            }
        }
        this.refreshRoomList(roomList)
    }

    handleJoinRoomError(params: SFS2X.SFSObject): void {
        this.hideOverlayLoader();
        let errorCode = params.getInt('errorCode');
        if (errorCode == 1) {
            let bet = params.getLong("bet");
            let text = cyberGame.text("YOU_NEED_AT_LEAST", cyberGame.utils.shortenLargeNumber(cyberGame.lobbyCtrl.miniumMoneyCondition * bet, 0));
            this.showNoti(text);
        } else
            this.showNoti(cyberGame.text("ROOM_FULL"));
    }

    onCreateGame() {
        cyberGame.audio.playButton();
        let bet = this.createGamePopup.currentBet;
        if (cyberGame.lobbyCtrl.canPlay(bet)) {
            this.createGamePopup.hide();
            this.showOverlayLoader();
            cyberGame.lobbyCtrl.sendRequest(() => {
                let params = new SFS2X.SFSObject();
                params.putLong('bet', bet);
                cyberGame.socket.send(new SFS2X.ExtensionRequest("createGame", params));
            });
        } else {
            let text = cyberGame.text("YOU_NEED_AT_LEAST", cyberGame.utils.shortenLargeNumber(cyberGame.lobbyCtrl.miniumMoneyCondition * bet, 2));
            //cyberGame.openCommonPopup({ content: text });
            this.showNoti(text);
        }
    }

    onQuickPlayRequest() {
        cyberGame.audio.playButton();
        if (cyberGame.lobbyCtrl.canPlay(5000)) {
            this.showOverlayLoader();
            cyberGame.lobbyCtrl.sendFindGameRequest();
        } else {
            let text = cyberGame.text("YOU_NEED_AT_LEAST", cyberGame.utils.shortenLargeNumber(cyberGame.lobbyCtrl.miniumMoneyCondition * 5000, 0));
            cyberGame.openCommonPopup({ content: text });
        }
    }

    private updateLobbyNodes(active: boolean) {
        this.roomListView.node.active = active;
        this.node.getChildByName("buttons").active = active;
        this.node.getChildByName("scroll_bg").active = active;
        this.node.getChildByName("header_titles").active = active;
        this.node.getChildByName("bottom").active = active;
        this.node.getChildByName("title").active = active;
        this.homeButton.node.active = active;
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

    showNoti(text: string): void {
        if (this.notification.node.active == true) {
            this.notification.unscheduleAllCallbacks();
            this.notification.hide();
        }
        this.notification.show(text);
    }

    private shuffleArray(a: any) {
        let j: number, x: any, i: number;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

}