import Connector from "./controllers/Connector";
import IAPManager from "./controllers/IAPManager";
import LobbyController from "./controllers/LobbyController";
import cyberEvent from "./constants/CyberEvent";
import DataStorage from "./util/Storage";
import Popup from "./popup/Popup";
import SocketControl from "../game/SocketControl";

import { GameLanguage, LanguageKey } from "../language/GameLanuage";
import { utils as _utils } from "./util/Utils";
import { adController } from "./controllers/Ad";
import audioController from "./controllers/Audio";
import { chatController } from "./controllers/Chat";

// private
var _gameAssetReady: boolean = false;
var _invitationData: Map<string, boolean> = null;
var _inited: boolean = false;
var _persistNode: cc.Node = null;
var _commonPopupPrefab: cc.Prefab = null;
var _overlayPrefab: cc.Prefab = null;

export namespace cyberGame {

    export import utils = _utils;

    export import event = cyberEvent;

    export import ad = adController;

    export import audio = audioController;

    export import chat = chatController;

    export const socket: Connector = Connector.getInstance();

    export const iap: IAPManager = IAPManager.getInstance();

    export const lobbyCtrl: LobbyController = LobbyController.getInstance();

    export const storage: DataStorage = new DataStorage();

    export const lang: GameLanguage = new GameLanguage();

    export let player: CyberGlobals.SignedPlayer = null;

    /**
     * initialize game async
     */
    export async function initAsync(): Promise<void> {
        if (_inited)
            return Promise.reject("initAsync is already initializing");

        _inited = true;

        // add ref to signed player
        player = await getSignedPlayerAsync();
        CyberGlobals.signedPlayer = undefined;

        // set lang 
        setLocale(CyberGlobals.getLocale());

        // init socket
        socket.init();

        // init sfs control for game
        SocketControl.instance.initialize();

        // init iap
        iap.onReady().then(() => {
            console.log("IAP supported");
            iap.init().then(() => {
                console.log("IAP inited success");
            });
        });

        // connect to game server
        socket.connect();

        // init ads manager then preload ads
        ad.init([CyberGlobals.adConfig.rewardedVideoId], CyberGlobals.gameConfig.isPreviewMode);

        // set public chat url
        chat.setUrl(CyberGlobals.gameConfig.globalChatUrl);
        CyberGlobals.gameConfig.globalChatUrl = undefined;

        // on pause event
        FBInstant.onPause(() => {
            cc.game.emit(event.ON_GAME_PAUSE);
        });

        // remove global ref 
        window["CyberGame"] = undefined;

        return Promise.resolve();
    }

    function getSignedPlayerAsync(): Promise<CyberGlobals.SignedPlayer> {
        return new Promise((resolve) => {
            try {
                if (CyberGlobals.isSignedPlayerResolved())
                    resolve(CyberGlobals.signedPlayer);
                else {
                    let loop = setInterval(() => {
                        if (CyberGlobals.isSignedPlayerResolved()) {
                            clearInterval(loop);
                            resolve(CyberGlobals.signedPlayer);
                        }
                    }, 30);
                }
            } catch (err) {
                console.log(err);
            }
        });
    }

    /**
     * Calls this at least once at homescene
     */
    export function processEntryPointData(): Promise<boolean> {
        let isProcessing = true;
        if (!storage.get("entryPointHandled")) {
            let data = FBInstant.getEntryPointData();
            if (data) {
                if (data['friendMode'] && data['roomId'] && data['bet']) {
                    if (lobbyCtrl.canPlay(parseInt(data['bet'])))
                        lobbyCtrl.joinPrivateRoom(parseInt(data['roomId']));
                }
                else if (data['type'] === 'noplay1day') {
                    let obj = new SFS2X.SFSObject();
                    obj.putLong("coin", data["coin"] ? parseInt(data["coin"]) : 1000000);
                    socket.send(new SFS2X.ExtensionRequest("gift.freeChip", obj));
                }
                else if (data['giftcode']) {
                    let giftCode = String(data['giftcode']);
                    if (giftCode.length >= 8) {
                        let obj = new SFS2X.SFSObject();
                        obj.putUtfString("code", giftCode);
                        obj.putBool("isEntryPointData", true);
                        socket.send(new SFS2X.ExtensionRequest("gift.code", obj));
                    }
                } else
                    isProcessing = false;
            } else
                isProcessing = false;
            storage.put("entryPointHandled", true);
        } else isProcessing = false;
        return new Promise((resolve) => {
            resolve(isProcessing);
        });
    }

    /**
     * Load remote ig player photo    
     */
    export function loadAvatar(path: string, node?: cc.Node, size?: number): Promise<cc.SpriteFrame> {
        return new Promise((resolve, reject) => {
            if (!path || path == "images/no_avatar") {
                //reject("avatar path can not be null"); enable for debug
                return;
            }
            cc.assetManager.loadRemote(path, { ext: '.jpg' }, (err, texture: cc.Texture2D) => {
                if (!err) {
                    texture.packable = false;
                    let spriteFrame = new cc.SpriteFrame(texture);
                    if (node && cc.isValid(node)) {
                        node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                        if (size)
                            node.setContentSize(size, size);
                    }
                    resolve(spriteFrame);
                } else
                    reject(err);
            })
        })
    }

    /**
     * Load cc prefab
     */
    export function loadPrefab(path: string, isNode?: boolean): Promise<cc.Prefab | cc.Node> {
        return new Promise((resolve, reject) => {
            cc.resources.load(path, cc.Prefab, (err, prefab: cc.Prefab) => {
                if (!err) {
                    if (isNode) {
                        let node: cc.Node = cc.instantiate(prefab);
                        resolve(node);
                    } else
                        resolve(prefab);
                } else
                    reject(err);
            });
        });
    }

    /**
     * Load dragon bone asset
     */
    export function loadDragonBone(ske: string, tex: string): Promise<object> {
        return new Promise((resolve, reject) => {
            let result = {} as any;
            cc.resources.load(ske, dragonBones.DragonBonesAsset, (err, res: dragonBones.DragonBonesAsset) => {
                if (!err) {
                    result.DragonBonesAsset = res;
                    if (Object.keys(result).length == 2)
                        resolve(result);
                } else
                    reject(err);
            });
            cc.resources.load(tex, dragonBones.DragonBonesAtlasAsset, (err, res: dragonBones.DragonBonesAtlasAsset) => {
                if (!err) {
                    result.DragonBonesAtlasAsset = res;
                    if (Object.keys(result).length == 2)
                        resolve(result);
                } else
                    reject(err);
            });
        });
    }

    export function getInvitationDataAsync(): Promise<Map<string, boolean>> {
        return new Promise((resolve, reject) => {
            if (_invitationData) {
                resolve(_invitationData);
                return;
            }
            FBInstant.player.getDataAsync(['todayDate', 'invitation'])
                .then((data) => {
                    _invitationData = new Map();
                    let date = new Date();
                    let todayDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
                    if (data['todayDate'] !== todayDate) {
                        FBInstant.player.setDataAsync({
                            todayDate: todayDate,
                            invitation: []
                        });
                    } else {
                        if (data["invitation"] && data["invitation"].length > 0) {
                            for (let i = 0; i < data["invitation"].length; i++) {
                                _invitationData.set(data["invitation"][i], true);
                            }
                        }
                    }
                    resolve(_invitationData);
                }).catch((e) => {
                    reject(e);
                });
        });
    }

    export function updateInvitationData(playerId: string): void {
        if (_invitationData && !_invitationData.has(playerId)) {
            // update to game server
            let params = new SFS2X.SFSObject();
            params.putUtfString("friendId", playerId);
            socket.send(new SFS2X.ExtensionRequest('friend.sendGift', params));

            // update to ig storage
            let data = [];
            _invitationData.set(playerId, true);
            _invitationData.forEach((value: boolean, key: string) => {
                if (data.length < 50)
                    data.push(key);
            })
            FBInstant.player.setDataAsync({
                invitation: data
            });
        }
    }

    export function containsInvitation(playerId: string) {
        return _invitationData.has(playerId);
    }

    export function getConnectedPlayersAsync(): Promise<object> {
        return new Promise((resolve, reject) => {
            let data: any = {};
            FBInstant.player.getConnectedPlayersAsync().then((players) => {
                data.players = players;
                if (Object.keys(data).length == 2)
                    resolve(data);
            }).catch((e) => {
                console.log("getConnectedPlayersAsync", e);
                reject(e);
            });

            getInvitationDataAsync().then((invitation) => {
                data.invitation = invitation;
                if (Object.keys(data).length == 2)
                    resolve(data);
            }).catch((e) => {
                reject(e);
            });
        });
    }

    export function openCommonPopup(options: any): void {
        if (_commonPopupPrefab != null) {
            let node: cc.Node = cc.instantiate(_commonPopupPrefab);
            node.getComponent(Popup).init(options);
            cc.director.getScene().addChild(node);
        }
    }

    export function setCommonPopupPrefab(commonPopupPrefab: cc.Prefab): void {
        _commonPopupPrefab = commonPopupPrefab;
    }

    export function setOverlayPrefab(overlayPrefab: cc.Prefab): void {
        _overlayPrefab = overlayPrefab;
    }

    export function createOverlay(): cc.Node {
        return cc.instantiate(_overlayPrefab);
    }

    export function getPersistNode(): cc.Node {
        return _persistNode;
    }

    export function setPersistNode(node: cc.Node): void {
        _persistNode = node;
    }

    export function isGameAssetReady(): boolean {
        return _gameAssetReady;
    }

    export function setGameAssetReady(ready: boolean): void {
        _gameAssetReady = ready;
    }

    export function setLocale(locale: string): void {
        lang.locale = locale;
    }

    export function text(key: string, ...params: string[]) {
        return lang.text(key, ...params);
    }

    export function coin(): number {
        return socket.mySelf.getVariable("coin").value;
    }

    export function level(): number {
        return socket.mySelf.getVariable("level").value;
    }

    export function guserid(): number {
        return socket.mySelf.getVariable("guserid").value;
    }

    export function getAvatarId(): number {
        return socket.mySelf.containsVariable("avatarId") ? socket.mySelf.getVariable("avatarId").value : 0;
    }

    export function isFirstPurchased(): boolean {
        return socket.mySelf.getVariable("isFirstPurchased").value;
    }

    export function isAdRemoved(): boolean {
        return socket.mySelf.getVariable("isAdRemoved").value;
    }

    export function platform(): string {
        let platform = FBInstant.getPlatform();
        if (!platform) return 'UNDEF';
        return platform;
    }
}

window["CyberGame"] = cyberGame;