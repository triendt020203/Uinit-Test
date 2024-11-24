//import PreloadManager from "./PreloadManager.js";
//import InterstitialManager from './InterstitialManager.js';

import { cyberGame } from "../CyberGame";

class LobbyController {
    private static instance: LobbyController = null;

    readonly minBet: number = 5000;

    readonly miniumMoneyCondition: number = 5;

    private constructor() {
    }

    public static getInstance() {
        if (!LobbyController.instance)
            LobbyController.instance = new LobbyController();
        return LobbyController.instance;
    }

    sendRequest(request: Function): void {
        if (cyberGame.isGameAssetReady())
            request();
        else {
            setTimeout(() => {
                this.sendRequest(request);
            }, 100);
        }
    }

    canPlay(_bet: number): boolean {
        let bet = (typeof _bet == 'undefined' || _bet == null) ? this.minBet : _bet;
        if (cyberGame.coin() >= bet * this.miniumMoneyCondition)
            return true;
        return false;
    }

    sendFindGameRequest(): void {
        this.sendRequest(() => {
            cyberGame.socket.send(new SFS2X.ExtensionRequest("findGame"));
        })
    }

    sendFindGameTeamRequest(): void {
        this.sendRequest(() => {
            cyberGame.socket.send(new SFS2X.ExtensionRequest("findTeamGame"));
        })
    }

    sendFindGameRequestExcludeId(id: number): void {
        this.sendRequest(() => {
            var params = new SFS2X.SFSObject();
            params.putInt('id', id);
            cyberGame.socket.send(new SFS2X.ExtensionRequest("findGame", params));
        })
    }

    sendCreateFriendGameRequest(bet: number): void {
        this.sendRequest(() => {
            var params = new SFS2X.SFSObject();
            params.putLong('bet', bet);
            params.putBool('friendMode', true);
            cyberGame.socket.send(new SFS2X.ExtensionRequest("createGame", params));
        })
    }

    joinRoom(roomId: number): void {
        this.sendRequest(() => {
            try {
                let params = new SFS2X.SFSObject();
                params.putInt("roomId", roomId);
                cyberGame.socket.send(new SFS2X.ExtensionRequest("joinGame", params));
            } catch (error) {
                console.log("LobbyController.joinRoom", error);
            }
        })
    }

    resumeRoom(roomId: number): void {
        this.sendRequest(() => {
            try {
                let params = new SFS2X.SFSObject();
                params.putInt("roomId", roomId);
                cyberGame.socket.send(new SFS2X.ExtensionRequest("resumeGame", params));
            } catch (error) {
                console.log("LobbyController.resumeGame", error);
            }
        })
    }

    joinPrivateRoom(roomId: number): void {
        this.sendRequest(() => {
            var params = new SFS2X.SFSObject();
            params.putInt("roomId", roomId);
            cyberGame.socket.send(new SFS2X.ExtensionRequest("joinFriendGame", params));
        })
    }

}

export default LobbyController;