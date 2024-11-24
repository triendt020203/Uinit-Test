import { cyberGame } from "../main/CyberGame";
import { GameRequest } from "./constants/GameRequest";
import { GameState } from "./constants/GameState";
import { RoomVariable } from "./constants/Variable";
import Player from "./entities/Player";
import AutoStartTimerHandler from "./handlers/AutoStartTimerHandler";
import DealCardHandler from "./handlers/DealCardHandler";
import GameOverHandler from "./handlers/GameOverHandler";
import GetPlayingInfo from "./handlers/GetPlayingInfo";
import InitGameHandler from "./handlers/InitGameHandler";
import ReadyHandler from "./handlers/ReadyHandler";
import UpdatePositionHandler from "./handlers/UpdatePositionHandler";
import UserEnterRoomHandler from "./handlers/UserEnterRoomHandler";
import UserExitRoomHandler from "./handlers/UserExitRoomHandler";
import UserVarUpdateHandler from "./handlers/UserVarUpdateHandler";
import QuitGameHandler from "./handlers/QuitGameHandler";
import BetHandler from "./handlers/BetHandler";
import DumpCardHandler from "./handlers/DumpCardHandler";
import PlayerManager from "./PlayManager";
import SocketControl from "./SocketControl";
import Queue from "./util/Queue";
import RequestParameter from "./util/RequestParameter";
import GameScene from "./view/GameScene";
import EndRoundHandler from "./handlers/EndRoundHandler";
import TeamEndRoundHandler from "./handlers/TeamEndRoundHandler";
import ScoreInfoHandler from "./handlers/ScoreInfoHandler";
import DealRoundHandler from "./handlers/DealRoundHandler";

export default class Game {

    readonly room: SFS2X.SFSRoom;

    inited: boolean = false;

    paused: boolean = false;

    screenReady: boolean = false;

    bet: number;

    targetPoint: number;

    playing: boolean;

    bidding: boolean;

    gameState: string;

    friendMode: boolean;

    teamMode: boolean;

    screen: GameScene = null;

    queue: Queue<RequestParameter> = null;

    currentRequest: RequestParameter = null;

    jobTracker: any = null;

    handlers = new Map();

    userList = null;

    boardPositions = null;

    playerManager: PlayerManager = null;

    currentTurn: string;

    deskSize: number = 52;

    dumpList: any = null;

    dealer: string = null;

    spadeBroken: boolean = false;

    pausedTime: number = 0;

    timeRemain: number;

    followSuit: boolean = false;
    leadCard: number = -1;

    constructor(room: SFS2X.SFSRoom) {
        this.room = room; // SFSRoom
    }

    initialize(): void {
        this.initializeJobTracker();

        /* init some data from room variables */
        this.playing = false;
        this.bet = this.room.getVariable(RoomVariable.BET).value;
        this.friendMode = this.room.containsVariable(RoomVariable.FRIEND_MODE) ? this.room.getVariable(RoomVariable.FRIEND_MODE).value : false;
        this.teamMode = this.room.containsVariable(RoomVariable.TEAM_MODE) ? this.room.getVariable(RoomVariable.TEAM_MODE).value : false;        
        this.gameState = GameState.WAITING;

        /* init board positions */
        this.boardPositions = [];

        /* init user list */
        this.userList = new Map();

        /* init player manager */
        this.playerManager = new PlayerManager(this); // List of users who's playing the game(not include spectators)

        /* add request handlers */

        // init game
        this.handlers.set(GameRequest.INIT_GAME, new InitGameHandler(this));

        // default sfs system event        
        this.handlers.set(GameRequest.USER_ENTER_ROOM, new UserEnterRoomHandler(this));

        this.handlers.set(GameRequest.GET_PLAYING_INFO, new GetPlayingInfo(this));
        this.handlers.set(GameRequest.READY, new ReadyHandler(this));
        this.handlers.set(GameRequest.UPDATE_POSITION, new UpdatePositionHandler(this));
        this.handlers.set(GameRequest.USER_VAR_UPDATE, new UserVarUpdateHandler(this));
        this.handlers.set(GameRequest.QUIT_GAME, new QuitGameHandler(this));
        this.handlers.set(GameRequest.START_AFTER, new AutoStartTimerHandler(this));
        this.handlers.set(GameRequest.DEALCARD, new DealCardHandler(this));
        this.handlers.set(GameRequest.GAMEOVER, new GameOverHandler(this));
        this.handlers.set(GameRequest.ENDROUND, new EndRoundHandler(this));
        this.handlers.set(GameRequest.TEAMENDROUND, new TeamEndRoundHandler(this));
        this.handlers.set(GameRequest.SCORE_INFO, new ScoreInfoHandler(this));
        this.handlers.set(GameRequest.DEALCARD_ROUND, new DealRoundHandler(this));
        this.handlers.set(GameRequest.BET_BID, new BetHandler(this));
        this.handlers.set(GameRequest.DUMP_CARD, new DumpCardHandler(this));
        this.handlers.set(GameRequest.USER_LEAVE_ROOM, new UserExitRoomHandler(this));

        // put init game request into queue to ensure UserEnterRoom or other requests will never be fired till screen is 100% ready.
        this.queue.enqueue(new RequestParameter(GameRequest.INIT_GAME));

        // cc.game.on(cyberGame.event.ON_GAME_PAUSE, this.onGamePause, this);
        // cc.game.on(cc.game.EVENT_SHOW, this.onGameResume, this);
    }

    onGameResume(): void {
        if (this.pausedTime > 0 && Date.now() - this.pausedTime < 30000) {
            this.pausedTime = 0;
            return;
        }
        this.pausedTime = 0;
        this.gameState = GameState.WAITING;
        this.playing = false;
        this.playerManager.clear();
        this.userList.clear();

        this.inited = false;
        this.queue.clear();
        this.screenReady = false;

        cc.director.loadScene("game", (err: any, scene: cc.Scene) => {
            if (!err) {
                this.screen = scene.getChildByName("Canvas").getComponent(GameScene); // shortcut to game scene component 
                this.screen.setGame(this);
                this.screen.node.once(cyberGame.event.GameEvent.GAMESCENE_LAUNCHED, () => {
                    this.screenReady = true;
                    this.releaseCurrentQueue();
                    this.queue.clear();
                    SocketControl.instance.getPlayingInfoRequest();
                    //console.log("---scene launched success");
                });
                // dispatched after every scene request processing
                this.screen.node.on(cyberGame.event.GameEvent.QUEUE_COMPLETE, (task: string) => {
                    //console.log("---scene dispatching " + task);
                    this.releaseCurrentQueue();
                });
            }
        });
    }

    onGamePause(): void {
        this.pausedTime = Date.now();
    }

    initializeJobTracker(): void {
        this.queue = new Queue<RequestParameter>(9999);
        this.jobTracker = setInterval(() => {
            this.doWorker();
        }, 60);
    }

    doWorker(): void {
        if (this.paused)
            return;
        // otherwise dequeue when possible and execute request            
        if (!this.queue.isEmpty() && this.currentRequest == null) {
            this.currentRequest = this.queue.dequeue();
            this.execute(this.currentRequest.cmd, this.currentRequest.params);
        }
    }

    execute(cmd: string, params: any): void {
        if (this.handlers.has(cmd)) {
            if (CyberGlobals.gameConfig.isPreviewMode) {
                // trace
                if (cmd != GameRequest.USER_ENTER_ROOM && cmd != GameRequest.INIT_GAME && cmd != GameRequest.ROOM_VARIABLE_UPDATE && cmd != GameRequest.USER_VAR_UPDATE)
                    console.log("execute cmd: " + cmd, params.getDump());
                else {
                    if (cmd == GameRequest.INIT_GAME) {
                        console.log("INIT GAME");
                    } else if (cmd == GameRequest.USER_ENTER_ROOM) {
                        console.log("user " + params.guserid + " enter room");
                    } else if (cmd == GameRequest.ROOM_VARIABLE_UPDATE) {
                        console.log("update room master");
                    } else if (cmd == GameRequest.USER_VAR_UPDATE) {
                        console.log("update user variable");
                    }
                }
            }
            this.handlers.get(cmd).execute(params);
        }
    }

    releaseCurrentQueue(): void {
        this.currentRequest = null;
    }

    handleServerResponse(cmd: string, params: any): void {
        if (this.handlers.has(cmd)) {
            this.queue.enqueue({
                cmd: cmd,
                params: params
            });
        } else {
            if (cmd == GameRequest.SEND_GIFT)
                this.handleSendGift(params);
        }
    }

    sendGetGameStateRequest(): void {
        this.gameState = GameState.WAITING;
        this.playing = false;
        this.playerManager.clear();
        this.userList.clear();

        this.inited = false;
        this.queue.clear();

        if (cyberGame.socket.lastJoinedRoom && SocketControl.instance.joinedRoom) {
            SocketControl.instance.getPlayingInfoRequest();
        }

        else
            SocketControl.instance.leaveGame();
    }

    prepareToLeaveGame(): void {
        this.playing = false;
        this.inited = false;
        this.queue.clear();
    }

    /**
     * Opponents join room
     * 
     * @param {SFS2X.SFSUser} user 
     */

    handleUserEnterRoom(user: SFS2X.SFSUser): void {
        this.handleServerResponse(GameRequest.USER_ENTER_ROOM, new Player(user));
    }

    handleUserVariablesUpdate(event: any) {
        this.handleServerResponse(GameRequest.USER_VAR_UPDATE, event);
    }

    handleSendGift(params: SFS2X.SFSObject): void {
        if (this.screenReady && !this.paused && this.inited) {
            var id = params.getInt('id');
            if (id > 0)
                this.screen.giftManager.updateSendGift(params);
            else
                this.screen.giftManager.updateEmo(params);
        }
    }

    isDealer(): boolean {
        return this.mySelf.name == this.dealer;
    }

    isMyTurn(): boolean {
        return this.mySelf.name == this.currentTurn;
    }

    containsUser(guserid: string): Player {
        return this.userList.has(guserid);
    }

    getUser(guserid: string): Player {
        return this.userList.has(guserid) ? this.userList.get(guserid) : null;
    }

    addUser(player: Player): void {
        if (!this.userList.has(player.guserid))
            this.userList.set(player.guserid, player);
    }

    removeUser(guserid: string): void {
        if (this.userList.has(guserid))
            this.userList.delete(guserid);
    }

    get mySelf(): SFS2X.SFSUser {
        return cyberGame.socket.mySelf;
    }

    get userCount() {
        return this.room.userCount;
    }

    destroy(): void {
        cc.game.off(cyberGame.event.ON_GAME_PAUSE, this.onGamePause, this);
        cc.game.off(cc.game.EVENT_SHOW, this.onGameResume, this);
        clearInterval(this.jobTracker);

        if (this.playerManager)
            this.playerManager.destroy();

        if (this.userList)
            this.userList.clear();

        this.queue.clear();
        this.handlers.clear();
        this.userList = null;
        this.playerManager = null;
        this.screen = null;
        this.handlers = null;
        this.jobTracker = null;
        this.currentRequest = null;
    }
}