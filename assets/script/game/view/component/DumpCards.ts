import Card from "../card/Card";
import CardManagerV2 from "../card/CardManagerV2";
import { CardSize } from "../card/CardSize";
import PlayerInfo from "../player/PlayerInfo";
import PositionHelper from "../player/PositionHelper";

const { ccclass } = cc._decorator;

@ccclass
export default class DumpCards extends cc.Component {
    chars = [];
    cardManagerV2: CardManagerV2 = null;
    lastDumpCards: Card[] = [];

    start(): void {
        this.cardManagerV2 = this.node.parent.getComponent(CardManagerV2);
        this.cardManagerV2.dumpCards = this;
    }

    public dumpCards(seat: PlayerInfo, cardId: number): void {
        let ids = [];
        ids.push(cardId);

        let cards = seat.cardControl.removeCards(ids);
        seat.cardControl.disableClick();
        this.lastDumpCards.push(cards[0]);

        let point = PositionHelper.getDumpPosition(seat.index, ids.length);
        cards[0].node.zIndex = 0;
        cards[0].setCardPositon({
            x: 0 + point[0].x,
            y: 60 + point[0].y,
            angle: point[0].a,
            scale: CardSize.TABLE_SCALE
        });
        cards[0].moveToTable();

        for (let i = 0; i < seat.cardControl.positions.length; i++)
            seat.cardControl.positions[i].isUsed = false;
        seat.cardControl.refreshPositions(seat.cardControl.cards.length);
    }

    public dumpOppCards(seat: PlayerInfo, cardId: number): void {
        let ids = [];
        ids.push(cardId)

        let cards = seat.cardControl.removeCards(ids);
        this.lastDumpCards.push(cards[0])

        if (seat.index == 2)
            cards[0].node.angle = 180;

        let point = PositionHelper.getDumpPosition(seat.index, ids.length);

        let startX = point.x;
        let startY = point.y;

        cards[0].node.zIndex = 0;
        cards[0].setCardPositon({
            x: startX + point.angles[0].x,
            y: startY + point.angles[0].y,
            angle: point.angles[0].a,
            scale: CardSize.TABLE_SCALE
        });
        cards[0].moveOppCardToTable();
        startX += 30;
    }

    public simpleDumpOpp(seat: PlayerInfo, cardID: Card): void {
        let cards = [];
        cards.push(cardID);
        this.lastDumpCards.push(cardID);

        let point = PositionHelper.getDumpPosition(seat.index, cards.length);
        let startX = point.x;
        let startY = point.y;

        for (let i = 0; i < cards.length; i++) {
            let card = cards[i];
            card.node.zIndex = i;
            card.setCardPositon({
                x: startX + point.angles[i].x,
                y: startY + point.angles[i].y,
                angle: point.angles[i].a,
                scale: CardSize.TABLE_SCALE
            });
            card.open();
            card.node.active = true;
            startX += 30;
        }
    }


    public simpleDump(seat: PlayerInfo, cardID: Card): void {
        let cards = [];
        cards.push(cardID);
        this.lastDumpCards.push(cardID);

        let startX = 0;
        const spacing = 25;
        let point = PositionHelper.getDumpPosition(seat.index, cards.length);

        for (let i = 0; i < cards.length; i++) {
            let card = cards[i];
            card.node.zIndex = i;
            card.setCardPositon({
                x: startX + point[i].x,
                y: 60 + point[i].y,
                angle: point[i].a,
                scale: CardSize.TABLE_SCALE
            });
            card.open();
            card.node.active = true;
            startX += spacing;
        }
    }

    public moveToWinner(seat: PlayerInfo): void {
        let cards = this.lastDumpCards;
        this.lastDumpCards = [];
        let angle = 0;

        switch (seat.index) {
            case 1:
                angle = -90;
                break;
            case 2:
                angle = 180;
                break;
            case 3:
                angle = 90;
                break;
            default:
                angle = 0;
                break;
        }
        for (let i = 0; i < cards.length; i++) {
            cards[i].setCardPositon({
                x: seat.node.x,
                y: seat.node.y,
                angle: angle,
                scale: 1
            });
            cards[i].moveToWinner();
        }
    }
}