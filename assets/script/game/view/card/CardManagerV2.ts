import { cyberGame } from "../../../main/CyberGame";
import { CardSize } from "./CardSize";
import Queue from "../../util/Queue";
import PlayerInfo from "../player/PlayerInfo";
import SeatManager from "../player/SeatManager";
import Card from "./Card";
import { GameInfo } from "../../constants/GameInfo";
import CardDeck from "../component/CardDeck";
import DumpCards from "../component/DumpCards";
import TutPlayerInfo from "../tutorials/TutPlayerInfo";
import TutSeatManager from "../tutorials/TutSeatManager";
import TutDumpCard from "../tutorials/TutDumpCard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardManagerV2 extends cc.Component {

    @property(cc.SpriteAtlas)
    cardAtlas: cc.SpriteAtlas = null;

    @property(sp.Skeleton)
    animTraoBai: (sp.Skeleton) = null;

    @property(cc.SpriteFrame)
    cardBackSF: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    overlay: cc.SpriteFrame = null;

    private cardList: Card[] = [];
    private cardQueue: Queue<Card> = new Queue<Card>(52);
    private gameScene: any;

    dumpCards: DumpCards = null;

    dumpCardsTut: TutDumpCard = null;

    init(gameScene: any): void {
        this.gameScene = gameScene;
    }

    start(): void {
        for (let i = 0; i < 52; i++) {

            let cardNode = new cc.Node("Card_" + i);
            let card = cardNode.addComponent(Card);
            cardNode.addComponent(cc.Sprite).spriteFrame = this.cardBackSF;
            card.cardManager = this;
            card.node.active = false;
            card.overlaySF = this.overlay;
            this.cardList.push(card);
        }
    }

    /** For disconnect */
    updatePlayerCards(): void {
        let cards: Card[] = this.createResumeCardInfo();
        while (cards.length > 0) {
            let card = cards.shift();
            card.node.active = true;
            card.node.parent = this.node;
            card.open();
        }
    }

    doGetCardFromQueue(ids: number[]): Card[] {
        let cards: Card[] = [];
        for (let i = 0; i < ids.length; i++) {
            let card: Card = this.cardQueue.dequeue();
            card.setId(ids[i]);
            card.setDistributed(true);
            card.node.parent = this.node;
            cards.push(card);
        }
        return cards;
    }

    /** End For disconnect */

    divideCard(): void {
        this.deskCard.x = 6;
        this.deskCard.y = 200;
        this.deskCard.scaleY = 0.8;
        this.deskCard.scaleX = 0.7;
        this.animTraoBai.node.scaleY = 0.9;
        this.animTraoBai.node.scaleX = 0.8;
        this.animTraoBai.node.x = this.deskCard.x;
        this.animTraoBai.node.y = this.deskCard.y - 10;
        this.animTraoBai.node.active = true;
        let animName = 'animation';
        cyberGame.audio.shuffleSound();
        this.animTraoBai.setAnimation(1, animName, false);
        this.animTraoBai.setCompleteListener(() => {
            this.deskCard.active = true;
            this.animTraoBai.clearTrack(0);
            let cards: Card[] = this.createCardInfo();
            let num = 52;
            const t = 0.05;
            let i = 0;
            let zIndex = cards.length;
            this.schedule(() => {
                if (i == 0)
                    cyberGame.audio.playSound('chiabai');
                i = 1 - i;
                if (cards.length > 0) {
                    let card = cards.pop();
                    card.node.active = true;
                    if(this.gameScene.game.teamMode != true){
                        card.moveToPlayer(true);
                    }else{
                        card.moveToPlayer(false);
                    }
                    num--;
                    card.node.parent = this.node;
                    card.node.zIndex = zIndex;
                    zIndex--;
                } else {
                    this.unscheduleAllCallbacks();
                    this.deskCard.active = false;
                    this.scheduleOnce(() => {
                        this.gameScene.node.emit(cyberGame.event.GameEvent.CARD_DIVIDED);

                    }, 0.8);
                }
                if (num == 51) {
                    this.deskCard.active = true;
                    this.animTraoBai.node.active = false;
                }
                if (num == 45 || num == 35 || num == 24 || num == 13 || num == 2) {
                    this.deskCard.getComponent(CardDeck).changeSpriteCardDeck();
                }
            }, t);
        });
    }

    divideTutCard(ids: any[]): void {
        this.deskCard.x = 6;
        this.deskCard.y = 200;
        this.deskCard.scaleY = 0.8;
        this.deskCard.scaleX = 0.7;
        this.animTraoBai.node.scaleY = 0.9;
        this.animTraoBai.node.scaleX = 0.8;
        this.animTraoBai.node.x = this.deskCard.x;
        this.animTraoBai.node.y = this.deskCard.y - 10;
        this.animTraoBai.node.active = true;
        let animName = 'animation';
        cyberGame.audio.shuffleSound();
        this.animTraoBai.setAnimation(1, animName, false);
        this.animTraoBai.setCompleteListener(() => {
            this.deskCard.active = true;
            this.animTraoBai.clearTrack(0);
            let cards: Card[] = this.createDevCardInfo(ids);
            let num = 52;
            const t = 0.06;
            let i = 0;
            let zIndex = cards.length;
            this.schedule(() => {
                if (i == 0)
                    cyberGame.audio.playSound('chiabai');
                i = 1 - i;
                if (cards.length > 0) {
                    let card = cards.pop();
                    card.node.active = true;
                    card.moveToPlayer(true);
                    num--;
                    card.node.parent = this.node;
                    card.node.zIndex = zIndex;
                    zIndex--;
                } else {
                    this.unscheduleAllCallbacks();
                    this.deskCard.active = false;
                    this.scheduleOnce(() => {
                        this.gameScene.node.emit(cyberGame.event.GameEvent.CARD_DIVIDED);

                    }, 0.8);
                }
                if (num == 51) {
                    this.deskCard.active = true;
                    this.animTraoBai.node.active = false;
                }
                if (num == 45 || num == 35 || num == 24 || num == 13 || num == 2) {
                    this.deskCard.getComponent(CardDeck).changeSpriteCardDeck();
                }
            }, t);
        });
    }

    private setStartPoint(cardNode: cc.Node, pos: number): void {
        if (pos == 0) {
            cardNode.x = this.deskCard.x;
            cardNode.y = this.deskCard.y + 7;
        }
        else if (pos == 1) {
            cardNode.x = this.deskCard.x;
            cardNode.y = this.deskCard.y + 7;
        }
        else if (pos == 2) {
            cardNode.x = this.deskCard.x;
            cardNode.y = this.deskCard.y + 7;
        }
        else if (pos == 3 || pos == 4) {
            cardNode.x = this.deskCard.x;
            cardNode.y = this.deskCard.y + 7;
        }
    }

    private createDealList(): PlayerInfo[] {
        const seatManager: SeatManager = this.gameScene.seatManager;
        const list: PlayerInfo[] = [];
        for (let i = 0; i < 4; i++) {
            let player: PlayerInfo = seatManager.getSeatAt(i);
            if (player.user != null && this.gameScene.game.playerManager.has(player.user.guserid)) {
                list.push(player);
            }
        }
        return list;
    }

    createDealListTutorial() {
        const seatManager: TutSeatManager = this.gameScene.seatManager;
        const list: TutPlayerInfo[] = [];
        for (let i = 0; i < 4; i++) {
            let player: TutPlayerInfo = seatManager.getSeatAt(i);
            if (player.user != null) {
                list.push(player);
            }
        }
        return list;
    }

    createCardInfo(): Card[] {
        this.cardListToQueue();
        const list: PlayerInfo[] = this.createDealList();
        const cards: Card[] = [];
        for (let i = 0; i < GameInfo.TOTAL_CARDS_FOR_EACH_PLAYER; i++) {
            for (let j = 0; j < list.length; j++) {
                let seat: PlayerInfo = list[j];
                let card: Card = this.cardQueue.dequeue();
                card.setId(seat.user.isItMe ? seat.user.cards[i].id : -1);
                card.setDistributed(true);
                card.setPlayerPos(seat.index);
                card.node.setScale(0.4);
                card.node.angle = 360;
                this.setStartPoint(card.node, card.getPlayerPos());
                let point = seat.cardControl.getPointStart();
                card.setCardPositon({
                    x: point.x,
                    y: point.y,
                    angle: seat.user.isItMe ? 6 - i * 1 : 0,
                    scale: seat.user.isItMe ? CardSize.PLAYER_SCALE : CardSize.OPP_SCALE
                });
                seat.cardControl.addCard(card);
                cards.push(card);
            }
        }
        return cards;
    }

    createResumeCardInfo(): Card[] {
        this.cardListToQueue();
        const list: PlayerInfo[] = this.createDealList();
        const cards: Card[] = [];
        for (let i = 0; i < list.length; i++) {
            let seat: PlayerInfo = list[i];
            let numCard = seat.user.isItMe ? seat.user.cards.length : seat.user.numCard;
            for (let j = 0; j < numCard; j++) {
                let card: Card = this.cardQueue.dequeue();
                card.setId(seat.user.isItMe ? seat.user.cards[j].id : -1);
                card.setDistributed(true);
                card.setPlayerPos(seat.index);

                let point = seat.cardControl.getPointStart();
                card.setCardPositon({
                    x: point.x,
                    y: point.y,
                    angle: seat.user.isItMe ? 6 - j * 1 : 0,
                    scale: seat.user.isItMe ? CardSize.PLAYER_SCALE : CardSize.OPP_SCALE
                });
                seat.cardControl.addCard(card);
                cards.push(card);
            }
            if (seat.user.isItMe && numCard < 13) {
                seat.cardControl.refreshPositions(numCard);
            }
        }
        return cards;
    }


    createDevCardInfo(currentCards: any[]): Card[] {
        this.cardListToQueue();
        const cards: Card[] = [];
        const list: TutPlayerInfo[] = this.createDealListTutorial();
        for (let i = 0; i < GameInfo.TOTAL_CARDS_FOR_EACH_PLAYER; i++) {
            for (let j = 0; j < 4; j++) {
                let seat: TutPlayerInfo = list[j];
                let card: Card = this.cardQueue.dequeue();
                card.setId(seat.user.isItMe ? currentCards[i] : -1);
                card.setDistributed(true);
                card.setPlayerPos(seat.index);
                card.node.setScale(0.4);
                card.node.angle = 360;
                this.setStartPoint(card.node, card.getPlayerPos());;
                let point = seat.cardControl.getPointStart();
                card.setCardPositon({
                    x: point.x,
                    y: point.y,
                    angle: seat.user.isItMe ? 6 - i * 1 : 0,
                    scale: seat.user.isItMe ? CardSize.PLAYER_SCALE : CardSize.OPP_SCALE
                });
                seat.cardControl.addCard(card);
                cards.push(card);
            }
        }
        return cards;
    }

    public hideDesk(): void {
        this.deskCard.active = false;
    }

    private cardListToQueue(): void {
        this.cardQueue.clear();
        for (let i = 0; i < 52; i++)
            this.cardQueue.enqueue(this.cardList[i]);
    }

    private moveBackCardDesk(): void {
        cc.tween(this.deskCard)
            .to(0.8, { y: 236, scale: 0 }, { easing: "backInOut" })
            .start();
    }

    public hideDeskWithEffect(): void {
        cc.tween(this.deskCard)
            .to(0.8, { scale: 0 }, { easing: "backInOut" })
            .call(() => {
                this.hideDesk();
            })
            .start();
    }

    private get deskCard() {
        return this.node.getChildByName("card_desk");
    }

    public reset(): void {
        this.hideDesk();
        if (this.cardList.length > 0)
            for (let i = 0; i < 52; i++)
                this.cardList[i].resetCard();
    }
}


