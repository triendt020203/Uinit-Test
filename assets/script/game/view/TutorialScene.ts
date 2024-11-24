import OverlayLoader from "../../main/component/OverlayLoader";
import AdapterManager from "../../main/controllers/AdapterManager";
const { ccclass, property } = cc._decorator;
import { cyberGame } from "../../main/CyberGame";
import { GameInfo } from "../constants/GameInfo";
import CardUtil from "../util/CardUtil";
import CardManagerV2 from "./card/CardManagerV2";
import BidTutorial from "./tutorials/BidTutorial";
import TutSeatManager from "./tutorials/TutSeatManager";

@ccclass
export default class TutorialScene extends cc.Component {
    @property(TutSeatManager)
    seatManager: TutSeatManager = null;

    @property(CardManagerV2)
    cardManager: CardManagerV2 = null;

    @property({ type: BidTutorial })
    bidTutorial: BidTutorial = null;

    private overlayLoader: any = null;
    currentTurn: string = "2";
    noc = [];
    dump1: number = 1;

    onLoad(): void {
        AdapterManager.inst.autoFitCanvas(this.node);
    }

    start(): void {
        this.seatManager.init(this);
        this.cardManager.init(this);
        this.noc = [2, 5, 9, 14, 18, 20, 21, 38, 39, 48, 49, 50, 51];
        setTimeout(() => {
            this.updatePlayers();
        }, 200);
        this.node.on(cyberGame.event.GameEvent.CARD_CLICK, this.onCardClick, this);
    }

    updatePlayers() {
        this.seatManager.allocate();
        this.node.once(cyberGame.event.GameEvent.CARD_DIVIDED, () => {
            this.showStep(1);
        });
        this.cardManager.divideTutCard([2, 5, 9, 14, 18, 20, 21, 38, 39, 48, 49, 50, 51]);
    }

    showStep(num: number): void {
        let node = this.node.getChildByName("step" + num)
        node.active = true;
        node.opacity = 120;
        cc.tween(node)
            .to(0.7, { opacity: 255 })
            .call(() => {
            })
            .start();

        let girl = node.getChildByName("girl");
        girl.scale = 0.9;
        cc.tween(girl)
            .to(0.3, { scale: 1 })
            .call(() => {
            })
            .start();
    }

    hideStep(num: number) {
        let node = this.node.getChildByName("step" + num);
        node.active = false;
    }

    updateCurrentTurn(guserid: string): void {
        this.currentTurn = guserid;
        this.seatManager.hideTimers();
        let seat = this.seatManager.getSeatByGuserid(guserid);
        seat.startTimer(GameInfo.TIME_COUNTDOWN_EACH_TURN);
    }

    updateCurrentBid(guserid: string): void {
        this.seatManager.hideTimers();
        let seat = this.seatManager.getSeatByGuserid(guserid);
        seat.biding();
        if (seat.user.isItMe) {
            this.bidTutorial.show();
            seat.cardControl.addOverlay();
            let cards = CardUtil.tutBidCardHighlight(seat.user.cards);
            seat.cardControl.chooseCards(cards, true);
            this.hideStep(2);
            this.showStep(3);
        }
        else {
            seat.startTimer(GameInfo.TIME_COUNTDOWN_EACH_TURN)
            setTimeout(() => {
                this.betHandler()
            }, 1000);
        }
    }

    onCardClick(): void {
        let seat = this.seatManager.getSeatByGuserid(this.currentTurn);
        if (this.dump1 == 1) {
            this.cardManager.dumpCardsTut.dumpCards(seat, 14);
            seat.cardControl.addOverlay();
            this.seatManager.hideTimers()
            this.step6();
            this.dump1 = 2;
        }
        else if (this.dump1 == 2) {
            this.cardManager.dumpCardsTut.dumpCards(seat, 39);
            seat.cardControl.addOverlay();
            this.seatManager.hideTimers();
            this.step81();
        }
    }

    betHandler(): void {
        let seat = this.seatManager.getSeatByGuserid(this.currentTurn);
        if (seat.user.bid == -1) {
            seat.user.bid = (this.currentTurn == "3") ? 3 : 4;
            seat.updateBid();

            switch (this.currentTurn) {
                case "2":
                    this.currentTurn = "3";
                    break;
                case "3":
                    this.currentTurn = "4";
                    break;
                case "4":
                    this.currentTurn = "1";
                    break;
            }
            this.updateCurrentBid(this.currentTurn);
        }
    }

    hideStep1(): void {
        this.hideStep(1);
        setTimeout(() => {
            this.showStep(2);
            this.updateCurrentBid(this.currentTurn)
        }, 200);
    }

    hideStep2(): void {
        this.hideStep(2);
    }

    step3(): void {
        this.bidTutorial.hide();
        let seat = this.seatManager.getSeatByGuserid(this.currentTurn);
        seat.user.bid = 5;
        seat.updateBid();
        seat.cardControl.addOverlay();
        this.step4();

    }

    step4(): void {
        this.hideStep(3);
        this.showStep(4);
        this.updateCurrentTurn("2");
        let seat = this.seatManager.getSeatByGuserid(this.currentTurn);
        setTimeout(() => {
            this.cardManager.dumpCardsTut.dumpOppCards(seat, 13);
            this.updateCurrentTurn("3");
            this.step41();
        }, 1000);
    }

    hideStep4(): void {
        this.hideStep(4);
    }

    step41(): void {
        setTimeout(() => {
            let seat = this.seatManager.getSeatByGuserid(this.currentTurn);
            this.cardManager.dumpCardsTut.dumpOppCards(seat, 25);
            this.updateCurrentTurn("4");
            this.step42();
        }, 1000);
    }

    step42(): void {
        setTimeout(() => {
            let seat = this.seatManager.getSeatByGuserid(this.currentTurn);
            this.cardManager.dumpCardsTut.dumpOppCards(seat, 15);
            this.updateCurrentTurn("1");
            this.step5();
        }, 1000);
    }

    step5(): void {
        this.hideStep(4);
        let seat = this.seatManager.getSeatByGuserid(this.currentTurn);
        let cards = CardUtil.doGetFollowCards(seat.user.cards, 25);
        seat.cardControl.chooseCards(cards, true);
        seat.cardControl.selectThisCard(cards, 14);
        this.showStep(5);
    }

    step6(): void {
        this.hideStep(5);
        this.showStep(6);
    }

    step61(): void {
        this.hideStep(6);
        let seat = this.seatManager.getSeatByGuserid("3");
        this.cardManager.dumpCardsTut.moveToWinner(seat);
        this.discard();
        seat.updateNewBid();
        this.step7();
    }

    discard(): void {
        let seat = this.seatManager.getSeatByGuserid("1");
        let ids = [2, 5, 9, 18, 20, 21, 38];
        this.cardManager.dumpCardsTut.disCards(seat, ids);
        for (let i = 1; i < 5; i++) {
            let seat = this.seatManager.getSeatByGuserid(`${i}`);

            if (seat.user.positionIndex == 0) {
                seat.user.made = 1;
            } else if (seat.user.positionIndex == 1) {
                seat.user.made = 4;
            } else if (seat.user.positionIndex == 3) {
                seat.user.made = 2;
            }
            seat.updateBid();
        }
    }

    step7(): void {
        this.updateCurrentTurn("3");
        setTimeout(() => {
            let seat = this.seatManager.getSeatByGuserid(this.currentTurn);
            this.cardManager.dumpCardsTut.dumpOppCards(seat, 32);
            this.updateCurrentTurn("4");
            this.step71();
        }, 1000);
    }

    step71(): void {
        setTimeout(() => {
            let seat = this.seatManager.getSeatByGuserid(this.currentTurn);
            this.cardManager.dumpCardsTut.dumpOppCards(seat, 36);
            this.step72();
        }, 1000);
    }

    step72(): void {
        this.seatManager.hideTimers();
        this.showStep(7);
    }

    step8(): void {
        this.hideStep(7);
        this.showStep(8);
        this.updateCurrentTurn("1");
        let seat = this.seatManager.getSeatByGuserid(this.currentTurn);
        let cards = CardUtil.doGetFollowCards(seat.user.cards, 45);
        seat.cardControl.chooseCards(cards);
        seat.cardControl.selectThisCard(cards, 39);
    }

    step81(): void {
        this.hideStep(8);
        this.updateCurrentTurn("2");
        setTimeout(() => {
            let seat = this.seatManager.getSeatByGuserid(this.currentTurn);
            this.cardManager.dumpCardsTut.dumpOppCards(seat, 38);
            this.step82();
        }, 1000);
    }

    step82(): void {
        let winner = this.seatManager.getSeatByGuserid("1");
        this.scheduleOnce(() => {
            this.cardManager.dumpCardsTut.moveToWinner(winner);
            this.seatManager.hideTimers();
            winner.updateNewBid();
            this.step83();
        }, 0.5);
    }

    step83(): void {
        let ids = [48, 49, 50, 51];
        this.cardManager.dumpCardsTut.disCards(this.seatManager.my, ids);
        for (let i = 1; i < 5; i++) {
            let seat = this.seatManager.getSeatByGuserid(`${i}`);
            if (seat.user.positionIndex == 0) {
                seat.user.made = 6;
            }
            seat.updateBid();
        }
        this.step9();
    }

    step9(): void {
        this.showStep(9);
    }

    step10(): void {
        this.hideStep(9);
        this.showStep(10);
    }

    step11(): void {
        this.hideStep(10);
        this.showStep(11);
    }

    step12(): void {
        this.hideStep(11);
        this.loadPrefabThenCreateNode("prefab/TutorialEndPopup");
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
}