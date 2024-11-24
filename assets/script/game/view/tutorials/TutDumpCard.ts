import CardManagerV2 from "../card/CardManagerV2";
import Card from "../card/Card";
import TutPlayerInfo from "./TutPlayerInfo";
import TutPositionHelper from "./TutPositionHelper";
import { CardSize } from "../card/CardSize";

const { ccclass } = cc._decorator;

@ccclass
export default class TutDumpCard extends cc.Component {
    cardManagerV2: CardManagerV2 = null;
    lastDumpCards: Card[] = [];

    start(): void {
        this.cardManagerV2 = this.node.parent.getComponent(CardManagerV2);
        this.cardManagerV2.dumpCardsTut = this;
    }

    public disCards(seat: TutPlayerInfo, ids: number[]): void {
        let cards = seat.cardControl.removeCards(ids);
        for (let i = 0; i < cards.length; i++) {
            cards[i].node.scale = 0;
        }
        for (let i = 0; i < seat.cardControl.positions.length; i++)
            seat.cardControl.positions[i].isUsed = false;
        seat.cardControl.refreshPositions(seat.cardControl.cards.length);
    }

    public dumpCards(seat: TutPlayerInfo, cardId: number): void {
        let ids = [];
        ids.push(cardId);

        let cards = seat.cardControl.removeCards(ids);
        this.lastDumpCards.push(cards[0])

        let point = TutPositionHelper.getDumpPosition(seat.index, ids.length);
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

    public dumpOppCards(seat: TutPlayerInfo, cardId: number): void {
        let ids = [];
        ids.push(cardId)

        let cards = seat.cardControl.removeCards(ids);
        this.lastDumpCards.push(cards[0]);
        let point = TutPositionHelper.getDumpPosition(seat.index, ids.length);

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

    public moveToWinner(seat: TutPlayerInfo): void {
        let cards = this.lastDumpCards;
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
                y: seat.node.y + 84,
                angle: angle,
                scale: 1
            });
            cards[i].moveToWinner();
        }
        this.lastDumpCards = [];
    }
}
