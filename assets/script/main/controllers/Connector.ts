import { cyberGame } from "../CyberGame";

export default class Connector {
    private static instance: Connector = new Connector();

    private sfs: SFS2X.SmartFox = null;
    private connectionErrorCount: number = 0;
    private loginErrorCount: number = 0;

    private heartBeat = null;

    private connected: boolean = false;
    private logged: boolean = false;
    private variableUpdated: boolean = false;

    private constructor() {
    }

    public static getInstance(): Connector {
        return Connector.instance;
    }

    public init(): void {
        if (!this.sfs) {
            this.sfs = new SFS2X.SmartFox(CyberGlobals.sfsConfig);
            this.sfs.addEventListener(SFS2X.SFSEvent.CONNECTION, this.onConnection, this);
            this.sfs.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, this.onConnectionLost, this);
            this.sfs.addEventListener(SFS2X.SFSEvent.LOGIN, this.onLogin, this);
            this.sfs.addEventListener(SFS2X.SFSEvent.LOGIN_ERROR, this.onLoginError, this);
            this.sfs.addEventListener(SFS2X.SFSEvent.USER_VARIABLES_UPDATE, this.onUserVariablesUpdate, this);
            CyberGlobals.sfsConfig = undefined;
        }
    }

    public isConnectionReady() {
        return this.logged && this.variableUpdated;
    }

    public connect() {
        this.sfs.connect();
    }

    public send(request: SFS2X.BaseRequest): void {
        this.sfs.send(request);
    }

    public disconnect(): void {
        this.sfs.disconnect();
    }

    public get isConnected(): boolean {
        return this.sfs.isConnected;
    }

    public get lastJoinedRoom(): SFS2X.SFSRoom {
        return this.sfs.lastJoinedRoom;
    }

    public get mySelf(): SFS2X.SFSUser {
        return this.sfs.mySelf;
    }

    public get roomManager(): SFS2X.SFSRoomManager {
        return this.sfs.roomManager;
    }

    public addEventListener(evtType: string, callback: (...params: any[]) => any, scope: any): void {
        this.sfs.addEventListener(evtType, callback, scope);
    }

    public removeEventListener(evtType: string, callback: (...params: any[]) => any): void {
        this.sfs.removeEventListener(evtType, callback);
    }

    private sendLoginRequest() {
        // the connection has been established, so send the login request to the server
        let obj = new SFS2X.SFSObject();
        obj.putLong("guserid", cyberGame.player.guserid);
        obj.putUtfString("token", cyberGame.player.signature);
        obj.putUtfString("platform", cyberGame.platform());
        this.sfs.send(new SFS2X.LoginRequest(cyberGame.player.playerId, "", obj));
    }

    private onConnection(event: any) {
        this.connected = event.success;
        if (this.connected) {
            // the connection has been established, so send the login request to the server
            this.sendLoginRequest();
            this.loginErrorCount = 0;
            if (CyberGlobals.gameConfig.debugLoadingProgress)
                console.log("connection has been established");
        }
        else {
            let delay = this.connectionErrorCount == 0 ? 100 : 1000;
            setTimeout(() => {
                this.connect();
            }, delay);
            this.connectionErrorCount++;
        }
    }

    private onConnectionLost(): void {
        this.connected = false;
        this.logged = false;
        this.variableUpdated = false;
        this.removeHearBeat();
        if (!cyberGame.storage.get("isHomeSceneStarted")) {
            // disconnect trong splash scene => auto reconnect
            setTimeout(() => {
                this.connect();
            }, 300);
        }
    }

    private onLogin(event: any): void {
        this.logged = true;

        // enable lag monitor
        this.sfs.enableLagMonitor(true, 2);

        // save guserid to ig storage
        cyberGame.player.guserid = parseInt(event.user.name);
        FBInstant.player.setDataAsync({ guserid: cyberGame.player.guserid });

        cyberGame.storage.put("collectTime", event.data.getInt('collectTime'));

        this.initHeartBeat();

        // the room id that player is playing and got disconnected        
        cyberGame.storage.put("lastJoinedRoomId", event.data.containsKey('roomId') ? event.data.getInt("roomId") : -1);

        this.connectionErrorCount = 0;

        if (event.data.containsKey('isNewUser')) {
            cyberGame.storage.put("canShowFlashSale", false);
            this.handleInvitation();
        }

        if (event.data.containsKey('promotion')) {
            let promotionData = event.data.getSFSObject("promotion");
            cyberGame.iap.handlePromotion(promotionData);
        }

        if (CyberGlobals.gameConfig.debugLoadingProgress)
            console.log("logged to game server");
    }

    private handleInvitation(): void {
        let entryPointData = FBInstant.getEntryPointData();
        if (entryPointData && entryPointData["guserid"]) {
            let params = new SFS2X.SFSObject();
            params.putUtfString("inviter", entryPointData["guserid"] + '');
            this.sfs.send(new SFS2X.ExtensionRequest("fbinstant.invite", params));
        }
    }

    private onUserVariablesUpdate(event: any): void {
        if (event.user.isItMe && event.changedVars.indexOf("guserid") != -1) {
            try {
                let displayName = this.sfs.mySelf.getVariable('username').value;
                if (displayName == FBInstant.player.getID()) {
                    let obj = new SFS2X.SFSObject();
                    obj.putUtfString("username", FBInstant.player.getName());
                    obj.putInt("timezone", cyberGame.utils.timezoneOffset());
                    this.sfs.send(new SFS2X.ExtensionRequest("profile.update", obj));
                } else {
                    if (displayName != FBInstant.player.getName()) {
                        let obj = new SFS2X.SFSObject();
                        obj.putUtfString("username", FBInstant.player.getName());
                        this.sfs.send(new SFS2X.ExtensionRequest("profile.update", obj));
                    }
                }
                if (FBInstant.player.getPhoto() != null) {
                    let obj = new SFS2X.SFSObject();
                    obj.putUtfString("avatar", FBInstant.player.getPhoto());
                    this.sfs.send(new SFS2X.ExtensionRequest("profile.updateAvatar", obj));
                }
                FBInstant.player.getDataAsync(['asid'])
                    .then((data) => {
                        if (!data['asid']) {
                            FBInstant.player.getASIDAsync().then((asid: string) => {
                                let obj = new SFS2X.SFSObject();
                                obj.putUtfString("asid", asid);
                                this.sfs.send(new SFS2X.ExtensionRequest("profile.updateAsid", obj));
                                FBInstant.player.setDataAsync({ 'asid': asid });
                            })
                        }
                    });
            } catch (error) {
                console.log(error)
            }
            this.variableUpdated = true;
            if (CyberGlobals.gameConfig.debugLoadingProgress)
                console.log("user variable updated");
        }
    }

    private onLoginError(evtParams: any): void {
        if (evtParams.errorMessage && evtParams.errorMessage === "MAINTENANCE")
            return;

        if (evtParams.errorCode === 4)
            return;

        if (this.loginErrorCount < 4) {
            this.loginErrorCount++;
            if (this.loginErrorCount == 1)
                cyberGame.player.guserid = 0;
            setTimeout(() => {
                if (this.connected)
                    this.sendLoginRequest();
            }, 500);
        }
    }

    public initHeartBeat(): void {
        this.removeHearBeat();

        let GIFT_TIME = 10800;

        if (cyberGame.storage.get("collectTime") > (GIFT_TIME - 60) && cyberGame.storage.get("collectTime") < GIFT_TIME)
            cyberGame.storage.put("collectTime", GIFT_TIME - 60);

        if (cyberGame.storage.get("collectTime") < GIFT_TIME) {
            this.heartBeat = setInterval(() => {
                if (cyberGame.storage.get("collectTime") < GIFT_TIME)
                    cyberGame.storage.put("collectTime", cyberGame.storage.get("collectTime") + 60);
                else
                    this.removeHearBeat();
            }, 60000);
        }
    }

    public removeHearBeat(): void {
        if (this.heartBeat) {
            clearInterval(this.heartBeat);
            this.heartBeat = null;
        }
    }

}
