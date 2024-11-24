import InterstitialManager from "../main/controllers/InterstitialManager";
import { cyberGame } from "../main/CyberGame";
import { GameRequest } from "./constants/GameRequest";
import Game from "./Game";

export default class SocketControl {

    private static _INSTANCE: SocketControl = new SocketControl();

    public static get instance() {
        return this._INSTANCE;
    }

    joinedRoom: boolean = false;

    switchedTable: boolean = false;

    lastJoinedId: number = 0;

    game: Game = null;

    initialize(): void {
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, this.onConnectionLost, this);
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse, this);
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.ROOM_JOIN, this.onRoomJoin, this);
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.USER_ENTER_ROOM, this.onUserEnterRoom, this);
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.USER_EXIT_ROOM, this.onUserExitRoom, this);
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.USER_VARIABLES_UPDATE, this.onUserVariablesUpdate, this);
    }

    onExtensionResponse(event: any): void {
        try {
            if (this.game && event.room && this.game.room.id == event.room.id) {
                // console.log(event.cmd, event.params);
                this.game.handleServerResponse(event.cmd, event.params);
            }
        } catch (error) {
            console.log("onExtensionResponse exception: ", error);
        }
    }

    onRoomJoin(event: any): void {
        try {
            // init game
            this.game = new Game(event.room);
            this.game.initialize();
            this.joinedRoom = true;
            this.switchedTable = false;
            this.lastJoinedId = event.room.id;
            InterstitialManager.instance.init();
            // cyberGame.socket.send(new SFS2X.ExtensionRequest("disableReconnect", null, this.game.room)); //chặn reconnect
            // cyberGame.socket.send(new SFS2X.ExtensionRequest("disableTimer", null, this.game.room));     //chặn auto

            // if (CyberGlobals.gameConfig.isPreviewMode) {
            //     let params = new SFS2X.SFSObject();
            //     params.putInt("size", 3);
            //     cyberGame.socket.send(new SFS2X.ExtensionRequest("enableNpc", params, this.game.room));

            //     // cyberGame.socket.send(new SFS2X.ExtensionRequest("mockSwap", null, this.game.room));

            //     // if (GameConfig.disableReconnect == true)
            //     // cyberGame.socket.send(new SFS2X.ExtensionRequest("disableReconnect", null, this.game.room)); 

            //     // // cyberGame.socket.disconnect();

            //     // if (GameConfig.disableTimer == true)
            //     //     cyberGame.socket.send(new SFS2X.ExtensionRequest("disableTimer", null, this.game.room));
            // }
        } catch (error) {
            console.log(error);
        }
    }

    onUserEnterRoom(event: any): void {
        if (this.game && this.game.room.id == event.room.id) {
            try {
                this.game.handleUserEnterRoom(event.user);
            } catch (error) {
                console.error("onUserEnterRoom", error);
            }
        }
    }

    onUserExitRoom(event: any): void {
        if (this.game && this.game.room.id == event.room.id) {
            // current user left game
            if (event.user.isItMe) {
                this.joinedRoom = false;
                let canLeave = false;
                if (this.game.playing) {
                    if (!this.game.playerManager.has(event.user.name))
                        canLeave = true;
                } else
                    canLeave = true;
                if (canLeave) {
                    cyberGame.storage.put("lastJoinedRoomId", -1);
                    if (this.switchedTable && cyberGame.lobbyCtrl.canPlay(5000)) {
                        this.game.screen.prepareForSwitchTable();
                        this.destroy();
                        if (cyberGame.storage.get("interstitialShowingAllowed")) {
                            cyberGame.storage.put("interstitialShowingAllowed", false);
                            if (InterstitialManager.instance.canShow()) {
                                cyberGame.audio.stopAllEffects();
                                InterstitialManager.instance.showAsync().then(() => {
                                    cyberGame.lobbyCtrl.sendFindGameRequestExcludeId(this.lastJoinedId);
                                });
                            } else
                                cyberGame.lobbyCtrl.sendFindGameRequestExcludeId(this.lastJoinedId);
                        } else
                            cyberGame.lobbyCtrl.sendFindGameRequestExcludeId(this.lastJoinedId);
                    } else {
                        this.destroy();
                        cc.director.loadScene("home", (err: any) => {
                            if (!err)
                                cyberGame.audio.playSound('leaveRoom');
                        });
                    }
                }
            } else {
                if (CyberGlobals.gameConfig.isPreviewMode)
                    console.log("user " + event.user.name + " exit room");
            }
        }
    }

    onUserVariablesUpdate(event: any): void {
        if (this.game && this.game.room.containsUser(event.user) && event.changedVars.indexOf("coin") != -1)
            this.game.handleUserVariablesUpdate(event);
    }

    getCoin() {
        try {
            return cyberGame.socket.mySelf.getVariable('coin').value;
        } catch (error) {
            return 0;
        }
    }

    ready() {
        try {
            if (this.joinedRoom)
                return cyberGame.socket.send(new SFS2X.ExtensionRequest(GameRequest.READY, null, this.game.room));
        } catch (error) {
            console.log("send ready exception", error);
        }
        return false;
    }

    getPlayingInfoRequest() {
        try {
            if (this.joinedRoom)
                return cyberGame.socket.send(new SFS2X.ExtensionRequest(GameRequest.GET_PLAYING_INFO, null, this.game.room));
        } catch (error) {
            console.log("send getPlayingInfoRequest exception", error);
        }
        return false;
    }

    startGame() {
        try {
            return cyberGame.socket.send(new SFS2X.ExtensionRequest("startGame", null, this.game.room));
        } catch (error) {
            console.log("send start game exception", error);
        }
        return false;
    }

    sendDumpCardRequest(ids: number) {
        if (this.joinedRoom) {
            let params = new SFS2X.SFSObject();
            params.putInt("cards", ids);
            cyberGame.socket.send(new SFS2X.ExtensionRequest(GameRequest.DUMP_CARD, params, this.game.room));
            return true;
        }
        return false;
    }

    sendBet(ids: number): void {
        if (this.joinedRoom) {
            let params = new SFS2X.SFSObject();
            params.putInt("betBid", ids);
            cyberGame.socket.send(new SFS2X.ExtensionRequest(GameRequest.BET_BID, params, this.game.room));
        }
    }

    seeCards(): void{
        if (this.joinedRoom) {
            cyberGame.socket.send(new SFS2X.ExtensionRequest(GameRequest.SEE_CARDS, null, this.game.room));
        }
    }

    sendBlind(): void{
        if (this.joinedRoom) {
            let params = new SFS2X.SFSObject();
            params.putInt("betBid", 100);
            cyberGame.socket.send(new SFS2X.ExtensionRequest(GameRequest.BET_BID, params, this.game.room));
        }
    }

    sendRequestInfoScore(): void {
        if (this.joinedRoom) {
            cyberGame.socket.send(new SFS2X.ExtensionRequest(GameRequest.SCORE_INFO, null, this.game.room));
        }
    }

    leaveGame(): void {
        if (this.joinedRoom && cyberGame.socket.lastJoinedRoom)
            cyberGame.socket.send(new SFS2X.ExtensionRequest(GameRequest.QUIT_GAME, null, this.game.room));
        else {
            this.destroy();
            cyberGame.audio.playSound('leaveRoom');
            cyberGame.storage.put("lastJoinedRoomId", -1);
            cc.director.loadScene("home", (err: any) => {
                if (!err)
                    cyberGame.audio.playSound('leaveRoom');
            });
        }
    }

    sendGift(params: any) {
        try {
            if (this.joinedRoom)
                return cyberGame.socket.send(new SFS2X.ExtensionRequest(GameRequest.SEND_GIFT, params, this.game.room));
        } catch (error) {
            console.log("send gift cmd exception: ", error);
        }
        return false;
    }

    onConnectionLost(): void {
        cyberGame.storage.put("lastJoinedRoomId", -1);
        this.destroy();
    }

    destroy(): void {
        if (this.game)
            this.game.destroy();
        this.game = null;
        this.joinedRoom = false;
    }
}