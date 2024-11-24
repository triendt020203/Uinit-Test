import OverlayLoader from "../../main/component/OverlayLoader";
import AdapterManager from "../../main/controllers/AdapterManager";
import { cyberGame } from "../../main/CyberGame";
import { GameState } from "../constants/GameState";
import { ResultSpades, ResultEntrySpades } from "../entities/ResultSpades";
import Game from "../Game";
import SocketControl from "../SocketControl";
import InGameChat from "./chat/InGameChat";
import DeskLayer from "./component/DeskLayer";
import Notification from "./component/Notification";
import PlayerInfoPopup from "./component/PlayerInfoPopup";
import GiftManager from "./gift/GiftManager";
import Menu from "./menu/Menu";
import PlayerInfo from "./player/PlayerInfo";
import GameInvitePopup from "./prefab/GameInvitePopup";
import SeatManager from "./player/SeatManager";
import CardManagerV2 from "./card/CardManagerV2";
import Card from "./card/Card";
import { GameInfo } from "../constants/GameInfo";
import WinPopup from "./component/WinPopup";
import WinPopupTeam from "./component/WinPopupTeam";
import ScorePopup from "./component/ScorePopup";
import ScoreTeamPopup from "./component/ScoreTeamPopup";
import WinGamePopup from "./component/WinGamePopup";
import WinGameTeam from "./component/WinGameTeam";
import GameInfomation from "./component/GameInfomation";
import BidPopup from "./component/BidPopup";
import BrokenSpadesPopup from "./component/BrokenSpadesPopup";
import SeeCards from "./component/SeeCards";
import { ResultTeam } from "../entities/ResultTeam";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {

    @property({ type: DeskLayer })
    deskLayer: DeskLayer = null;

    @property(SeatManager)
    seatManager: SeatManager = null;

    @property(CardManagerV2)
    cardManager: CardManagerV2 = null;

    @property({ type: GiftManager })
    giftManager: GiftManager = null;

    @property({ type: PlayerInfoPopup })
    playerInfoPopup: PlayerInfoPopup = null;

    @property({ type: Menu })
    menu: Menu = null;

    @property({ type: Notification })
    notification: Notification = null;

    @property({ type: GameInfomation })
    gameInfoPoint: GameInfomation = null;

    @property({ type: BidPopup })
    bidPopup: BidPopup = null;

    @property({ type: SeeCards })
    seeCards: SeeCards = null;

    @property({ type: BrokenSpadesPopup })
    brokenSpadesPopup: BrokenSpadesPopup = null;

    avatarDragonData = null;

    winPopup: WinPopup = null;

    winPopupTeam: WinPopupTeam = null;

    winGamePopup: WinGamePopup = null;

    winGameTeam: WinGameTeam = null;

    scorePopup: ScorePopup = null;

    scoreTeam: ScoreTeamPopup = null;

    invitePopup: GameInvitePopup = null;

    chat: InGameChat = null;

    game: Game;

    overlayLoader: any = null;

    gameFinished: boolean = false;

    hasBet: boolean = false;

    followSuit: boolean = false;

    onLoad() {
        AdapterManager.inst.autoFitCanvas(this.node);
    }

    start(): void {
        this.showOverlayLoader();
        this.gameInfoPoint.betNum.string = cyberGame.utils.shortenLargeNumber(this.game.bet, 2);
        this.seatManager.init(this);
        this.cardManager.init(this);
        this.giftManager.init(this);
        this.seeCards.init(this);
        this.menu.init(this);
        this.gameInfoPoint.init(this);

        if (this.game.teamMode) {
            this.seatManager.editTeamMode();
            this.gameInfoPoint.editTeamMode();
        }

        // chat event
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.PUBLIC_MESSAGE, this.onPublicMessage, this);

        // card clicking        
        this.node.on(cyberGame.event.GameEvent.CARD_CLICK, this.onCardClick, this);

        if (this.game.friendMode) {
            cc.resources.load("gameprefab/InvitePopup", cc.Prefab, (err, prefab: cc.Prefab) => {
                if (!err && cc.isValid(this.node)) {
                    let node = cc.instantiate(prefab);
                    this.node.addChild(node);
                    this.invitePopup = node.getComponent(GameInvitePopup);
                    this.loadScorePopup();
                    this.loadScoreTeamPopup();
                    this.loadWinPopup();
                    this.loadWinPopupTeam();
                    this.loadWinGamePopup();
                    this.loadWinGameTeam();
                    this.loadChatPrefab();

                    // scene launched emitted                    
                    this.node.emit(cyberGame.event.GameEvent.GAMESCENE_LAUNCHED);
                }
            });
        } else {
            this.loadScorePopup();
            this.loadScoreTeamPopup();
            this.loadWinPopup();
            this.loadWinPopupTeam();
            this.loadWinGamePopup();
            this.loadWinGameTeam();
            this.loadChatPrefab();

            // scene launched emitted
            this.scheduleOnce(() => {
                this.node.emit(cyberGame.event.GameEvent.GAMESCENE_LAUNCHED);
            }, 0.05);
        }
    }

    private loadScorePopup(): void {
        cc.resources.load("gameprefab/ScoreInfo", cc.Prefab, (err, prefab: cc.Prefab) => {
            if (!err && cc.isValid(this.node)) {
                let node = cc.instantiate(prefab);
                this.scorePopup = node.getComponent(ScorePopup);
                this.scorePopup.init(this);
                this.node.getChildByName("preloadNode").addChild(node);
                this.scorePopup.hide();
            }
        });
    }

    private loadScoreTeamPopup(): void {
        cc.resources.load("gameprefab/ScoreInfoTeam", cc.Prefab, (err, prefab: cc.Prefab) => {
            if (!err && cc.isValid(this.node)) {
                let node = cc.instantiate(prefab);
                this.scoreTeam = node.getComponent(ScoreTeamPopup);
                this.scoreTeam.init(this);
                this.node.getChildByName("preloadNode").addChild(node);
                this.scoreTeam.hide();
            }
        });
    }

    private loadWinPopup(): void {
        cc.resources.load("gameprefab/winPopup", cc.Prefab, (err, prefab: cc.Prefab) => {
            if (!err && cc.isValid(this.node)) {
                let node = cc.instantiate(prefab);
                this.winPopup = node.getComponent(WinPopup);
                this.winPopup.init(this);
                this.node.getChildByName("preloadNode").addChild(node);
                this.winPopup.hide();
            }
        });
    }

    private loadWinPopupTeam(): void {
        cc.resources.load("gameprefab/winPopupTeam", cc.Prefab, (err, prefab: cc.Prefab) => {
            if (!err && cc.isValid(this.node)) {
                let node = cc.instantiate(prefab);
                this.winPopupTeam = node.getComponent(WinPopupTeam);
                this.winPopupTeam.init(this);
                this.node.getChildByName("preloadNode").addChild(node);
                this.winPopupTeam.hide();
            }
        });
    }

    private loadWinGamePopup(): void {
        cc.resources.load("gameprefab/winGamePopup", cc.Prefab, (err, prefab: cc.Prefab) => {
            if (!err && cc.isValid(this.node)) {
                let node = cc.instantiate(prefab);
                this.winGamePopup = node.getComponent(WinGamePopup);
                this.winGamePopup.init(this);
                this.node.getChildByName("preloadNode").addChild(node);
                this.winGamePopup.hide();
            }
        });
    }

    private loadWinGameTeam(): void {
        cc.resources.load("gameprefab/winGameTeam", cc.Prefab, (err, prefab: cc.Prefab) => {
            if (!err && cc.isValid(this.node)) {
                let node = cc.instantiate(prefab);
                this.winGameTeam = node.getComponent(WinGameTeam);
                this.winGameTeam.init(this);
                this.node.getChildByName("preloadNode").addChild(node);
                this.winGameTeam.hide();
            }
        });
    }

    private loadChatPrefab(): void {
        cc.resources.load("gameprefab/ChatInGame", cc.Prefab, (err, prefab: cc.Prefab) => {
            if (!err && cc.isValid(this.node)) {
                let node = cc.instantiate(prefab);
                node.active = false;
                this.node.addChild(node);
                this.chat = node.getComponent(InGameChat);
            }
        })
    }

    private onPublicMessage(event: any): void {
        let seat = this.seatManager.getSeatByGuserid(event.sender.name);
        if (seat) {
            seat.showChat(event.message);
            if (this.chat)
                this.chat.addMessage(seat.user.displayName, event.message);
        }
    }

    public reconnect(): void {
        let result = this.seatManager.reconnect();
        this.gameInfoPoint.updateReconnect(result)
    }

    public updateGameState(): void {
        this.hideOverlayLoader();
        this.seatManager.allocate();
        this.cardManager.reset();
        this.gameFinished = false;
        if (this.scorePopup)
            this.scorePopup.hide();
        if (this.winGamePopup)
            this.winGamePopup.hide();
        if(this.winGameTeam)
            this.winGameTeam.hide();
        if (this.game.gameState != GameState.WAITING) {
            this.seatManager.hideInviteButtons();
            this.seatManager.updateDealer(this.game.dealer);
            this.reconnect();
            let seat = this.seatManager.getSeatByGuserid(this.game.currentTurn);
            seat.startTimer(GameInfo.TIME_COUNTDOWN_EACH_TURN);
            this.cardManager.updatePlayerCards();
            if(this.game.teamMode == true){
                this.seatManager.seeCards();
            }
            cyberGame.audio.playSound('myturn');

            if (this.game.gameState == GameState.PLAYING) {
                seat.cardControl.recommendCard(this.game);
                for (let i = 0; i < this.seatManager.players.length; i++) {
                    let seat = this.seatManager.getSeatAt(i);

                    if (seat.user.lastDump != -1) {
                        let arrm = [];
                        arrm.push(seat.user.lastDump)
                        let card = this.cardManager.doGetCardFromQueue(arrm);

                        if (seat.user.isItMe) {
                            this.cardManager.dumpCards.simpleDump(seat, card[0]);
                        } else {
                            this.cardManager.dumpCards.simpleDumpOpp(seat, card[0]);
                        }
                    }
                }
            }
            else if (this.game.gameState == GameState.BIDDING) {
                seat.biding();
                if (this.game.isMyTurn()) {
                    if (this.game.teamMode == true) {
                        this.seeCards.show();
                    } else {
                        let rcn = seat.cardControl.recommendBid();
                        this.bidPopup.show(rcn);
                    }
                }
            }
        }
        else if (this.seatManager.getSize() == 1) {
            this.deskLayer.showWatingPlayerText();
            if (this.game.friendMode && this.invitePopup)
                this.invitePopup.show(this.game.room.id, this.game.bet);
        }
    }

    public updateDealCard(): void {
        /** reset */
        this.seatManager.prepareForDealcard();

        /** start render dealcards */
        this.node.once(cyberGame.event.GameEvent.CARD_DIVIDED, () => {
            // important if finished whitewin = true then currentTurn = null
            let seat = this.seatManager.getSeatByGuserid(this.game.currentTurn);
            seat.startTimer(GameInfo.TIME_COUNTDOWN_EACH_TURN);
            seat.biding();

            // special thing for current player
            if (seat.user.isItMe) {
                cyberGame.audio.playSound('myturn');
                this.playerInfoPopup.hidePopup();
                if (this.chat)
                    this.chat.closePopup();
                // sort cards                
                cc.game.once("SORT_CARDS_FINISH", () => {
                    this.node.emit(cyberGame.event.GameEvent.QUEUE_COMPLETE, "dealCard");
                });
                if (this.game.teamMode == true) {
                    this.seeCards.show();
                } else {
                    let rcn = seat.cardControl.recommendBid();
                    this.bidPopup.show(rcn);
                }
            } else
                this.node.emit(cyberGame.event.GameEvent.QUEUE_COMPLETE, "dealCard");
        });

        if (this.deskLayer.isCountDownRunning()) {
            cc.game.once("START_COUNT_DOWN_FINISH", () => {
                this.deskLayer.hideStartCountDown();
                cyberGame.audio.playStartGame();
                this.deskLayer.showStartEffect(() => {
                    this.seatManager.updateDealer(this.game.dealer);
                    console.log("START_COUNT_DOWN_FINISH");

                    this.cardManager.divideCard();
                });
            });
        } else {
            this.seatManager.updateDealer(this.game.dealer);
            this.deskLayer.hideStartCountDown();
            cyberGame.audio.playStartGame();
            this.deskLayer.showStartEffect(() => {
                this.cardManager.divideCard();
            });
        }

        if (this.game.friendMode && this.invitePopup) {
            this.invitePopup.destroy();
            this.invitePopup = null;
        }

        if (this.seatManager.my.user.playing)
            this.hideOverlayLoader();
    }

    public updateDealCardRound(): void {
        if (this.winPopup)
            this.winPopup.hide();
        if (this.winPopupTeam)
            this.winPopupTeam.hide();
        this.cardManager.reset();
        this.seatManager.allocate();
        this.node.once(cyberGame.event.GameEvent.CARD_DIVIDED, () => {
            let seat = this.seatManager.getSeatByGuserid(this.game.currentTurn);
            seat.startTimer(GameInfo.TIME_COUNTDOWN_EACH_TURN);
            seat.biding();
            cyberGame.audio.playSound('myturn');

            if (seat.user.isItMe) {
                if (this.game.teamMode == true) {
                    this.seeCards.show();
                } else {
                    let rcn = seat.cardControl.recommendBid();
                    this.bidPopup.show(rcn);
                }
            }
            // special thing for current player
            let currentPlayer: PlayerInfo = this.seatManager.my;
            if (currentPlayer.user.playing) {
                this.playerInfoPopup.hidePopup();
                if (this.chat)
                    this.chat.closePopup();
                cc.game.once("SORT_CARDS_FINISH", () => {
                    this.node.emit(cyberGame.event.GameEvent.QUEUE_COMPLETE, "dealCard");
                });
            } else
                this.node.emit(cyberGame.event.GameEvent.QUEUE_COMPLETE, "dealCard");
        });

        this.seatManager.updateDealer(this.game.dealer);
        this.deskLayer.hideStartCountDown();
        cyberGame.audio.playStartGame();
        this.deskLayer.showStartEffect(() => {
            this.cardManager.divideCard();
        });
        if (this.game.friendMode && this.invitePopup) {
            this.invitePopup.destroy();
            this.invitePopup = null;
        }

        if (this.seatManager.my.user.playing)
            this.hideOverlayLoader();

    }

    public updateCurrentTurnV2(guserid: string): void {
        this.seatManager.hideTimers();
        let seat = this.seatManager.getSeatByGuserid(guserid);
        seat.startTimer(GameInfo.TIME_COUNTDOWN_EACH_TURN);
        if(this.game.teamMode !=true){
            this.scorePopup.updateRealTime();
        } else{
            this.scoreTeam.updateOnTime();
        }
       
        if (seat.user.isItMe) {
            cyberGame.audio.playSound('myturn');
            seat.cardControl.recommendCard(this.game);
        }
    }

    onOrderCard(): void {
        cyberGame.audio.playButton();
        cc.assetManager.loadBundle('testcards', (err, bundle) => {
            bundle.load("TestCard", cc.Prefab, (err, prefab: cc.Prefab) => {
                if (!err) {
                    let node: cc.Node = cc.instantiate(prefab);
                    node.parent = this.node;
                }
            });
        });
    }

    public updateWinRound(resultData: ResultSpades): void {
        this.seatManager.hideTimers();
        for (let i = 0; i < resultData.players.length; i++) {
            let player: ResultEntrySpades = resultData.players[i];
            let seat = this.seatManager.getSeatByGuserid(player.guserid);
            seat.resetRound();
        }
        this.scheduleOnce(() => {
            this.showResultRound(resultData);
        }, 1.5);
    }

    public updateWinRoundTeam(resultData: ResultTeam): void {
        this.seatManager.hideTimers();
        this.seatManager.resetRoundTeam();
        this.scheduleOnce(() => {
            this.showResultTeamRound(resultData);
        }, 1.5);
    }

    public updateWinGame(resultData: ResultSpades): void {
        this.seatManager.hideTimers();
        this.scheduleOnce(() => {
            this.showResultGame(resultData);
        }, 1.5);
    }

    public updateWinGameTeam(resultData: ResultTeam): void {
        console.log(resultData);
        
        this.seatManager.hideTimers();
        this.scheduleOnce(() => {
            this.showResultGameTeam(resultData);
        }, 1.5);
    }

    public showFullScore(resultData): void {
        if (this.game.gameState != GameState.WAITING) {
            this.scorePopup.updateData(resultData)
            this.scorePopup.show();
        }
    }

    public showTeamScore(resultData): void {
        if (this.game.gameState != GameState.WAITING) {
            this.scoreTeam.updateData(resultData)
            this.scoreTeam.show();
        }
    }

    public showResultRound(resultData): void {
        if (this.scorePopup)
            this.scorePopup.hide();
        this.gameInfoPoint.updateRoundPoint(resultData);
        this.winPopup.updateData(resultData)
        this.winPopup.show();
        this.scheduleOnce(this.resetRound, 5);
    }

    public showResultTeamRound(resultData): void {
        if (this.scoreTeam)
            this.scoreTeam.hide();
        this.gameInfoPoint.updateRoundPointTeam(resultData)
        this.winPopupTeam.updateData(resultData)
        this.winPopupTeam.show();
        this.scheduleOnce(this.resetRound, 5);
    }

    public showResultGame(resultData): void {
        if (this.scorePopup)
            this.scorePopup.hide();
        this.gameInfoPoint.updateGamePoint();
        this.winGamePopup.updateData(resultData);
        this.winGamePopup.show();
        this.scheduleOnce(this.resetGame, 5);
    }

    public showResultGameTeam(resultData): void {
        if (this.scoreTeam)
            this.scoreTeam.hide();
        this.gameInfoPoint.updateGamePointTeam();
        this.winGameTeam.updateData(resultData);
        this.winGameTeam.show();
        this.scheduleOnce(this.resetGame, 5);
    }

    private resetRound(): void {
        this.seeCards.clicked = false;
        for (let i = 0; i < this.seatManager.players.length; i++) {
            this.seatManager.players[i].user.bid = -1;
            this.seatManager.players[i].user.made = 0;
            this.seatManager.players[i].user.hasBet = false;
        }
    }

    private resetGame(): void {
        if (this.gameFinished) {
            this.gameFinished = false;
            for (let i = 0; i < this.seatManager.players.length; i++) {
                this.seatManager.players[i].user.hasBet = false;
                this.seatManager.players[i].hideDealer();
            }

            try {
                if (this.menu.quitRegistered === true) {
                    this.showOverlayLoader();
                    this.game.prepareToLeaveGame();
                    SocketControl.instance.leaveGame();
                } else
                    this.game.sendGetGameStateRequest();
                this.node.emit(cyberGame.event.GameEvent.QUEUE_COMPLETE, "gameOver.resetGame");
            } catch (error) {
                SocketControl.instance.leaveGame();
                this.node.emit(cyberGame.event.GameEvent.QUEUE_COMPLETE, "gameOver.resetGame");
            }
        }
    }

    private onCardClick(cardEvent: Card): void {
        if (cardEvent.isChoose()) {
            let cardControl = this.seatManager.my.cardControl;
            for (let i = 0; i < cardControl.cards.length; i++) {
                const card = cardControl.cards[i];
                if (card.isChoose())
                    card.unChoose();
            }
        }
    }

    onLeaveRoom(): void {
        if (this.gameFinished) {
            this.gameFinished = false;
            this.menu.quitRegistered = true;
            this.unscheduleAllCallbacks();
            this.showOverlayLoader();
            this.game.prepareToLeaveGame();
            SocketControl.instance.leaveGame();
            return;
        } else {
            if (!this.game.playing) {
                this.showOverlayLoader();
                SocketControl.instance.leaveGame();
            } else {
                if (!this.seatManager.my.user.playing) {
                    this.showOverlayLoader();
                    SocketControl.instance.leaveGame();
                } else {
                    if (this.notification.node.active == true) {
                        this.notification.unscheduleAllCallbacks();
                        this.notification.hide();
                    }
                    if (this.menu.quitRegistered)
                        this.notification.show(cyberGame.text("WAIT_TO_EXIT"));
                    else
                        this.notification.show(cyberGame.text("WAIT_TO_EXIT_CANCEL"));
                }
            }
        }
    }

    onSwitchRoom(): void {
        if (this.gameFinished) {
            this.gameFinished = false;
            this.menu.quitRegistered = true;
            this.unscheduleAllCallbacks();
            this.showOverlayLoader();
            SocketControl.instance.switchedTable = true;
            this.game.prepareToLeaveGame();
            SocketControl.instance.leaveGame();
            return;
        } else {
            if (!this.game.playing) {
                SocketControl.instance.switchedTable = true;
                this.showOverlayLoader();
                SocketControl.instance.leaveGame();
            } else {
                if (!this.seatManager.my.user.playing) {
                    SocketControl.instance.switchedTable = true;
                    this.showOverlayLoader();
                    SocketControl.instance.leaveGame();
                } else {
                    if (this.notification.node.active == true) {
                        this.notification.unscheduleAllCallbacks();
                        this.notification.hide();
                    }
                    this.notification.show(cyberGame.text("CAN_NOT_CHANGE_TABLE"));
                }
            }
        }
    }

    onForceLeaveRoom(): void {
        if (this.gameFinished) {
            this.gameFinished = false;
            this.unschedule(this.resetGame);
            this.menu.quitRegistered = true;
            this.showOverlayLoader();
            this.game.prepareToLeaveGame();
            SocketControl.instance.leaveGame();
        }
    }

    prepareForSwitchTable(): void {
        this.seatManager.prepareForSwitchTable();
    }

    openEmoPopup(): void {
        this.playerInfoPopup.showEmoPopup(this.seatManager.my.user.displayName, this.seatManager.my.user.coin, this.seatManager.my.user.avatar);
    }

    playButtonClick(): void {
        cyberGame.audio.playButton();
    }

    openSetting(): void {
        cyberGame.audio.playButton();
        this.menu.node.active = true;
    }

    openChat(): void {
        cyberGame.audio.playButton();
        if (this.chat)
            this.chat.show();
    }

    setGame(game: Game): void {
        this.game = game;
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

    onDestroy(): void {
        cyberGame.socket.removeEventListener(SFS2X.SFSEvent.PUBLIC_MESSAGE, this.onPublicMessage);
        this.node.off(cyberGame.event.GameEvent.CARD_CLICK, this.onCardClick, this);
        cc.game.off("WHITE_WIN_OPEN_CARD_FINISH");
        cc.game.off("ON_OPEN_CARD_FINISH");
        cc.game.off("START_COUNT_DOWN_FINISH");
        cc.game.off("SORT_CARDS_FINISH");
    }
}