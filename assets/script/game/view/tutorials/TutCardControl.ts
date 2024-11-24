import TutPlayerInfo from "./TutPlayerInfo";
import Card from "../card/Card";
import { CardPosition } from "../player/PositionHelper";
import TutPositionHelper from "./TutPositionHelper";
import { CardSize } from "../card/CardSize";
import { GameInfo } from "../../constants/GameInfo";
import CardEntity from "../../entities/CardEntity";


export default class TutCardControl {
    readonly index: number;
    readonly seat: TutPlayerInfo;
    readonly point: cc.Node;
    readonly cards: Card[] = [];
    readonly positions: CardPosition[] = [];
    private refresh: number = 0;
    lastDumpCards: Card[] = [];

    constructor(seat: TutPlayerInfo) {
        this.seat = seat;
        this.index = seat.index;
        TutPositionHelper.createCardPositions(this);
    }

    public size(): number {
        return this.cards.length;
    }

    public getPointStart(): CardPosition {
        if (this.index < 3) {
            for (let i = 0; i < this.positions.length; i++) {
                let position = this.positions[i];
                if (position.isUsed == false) {
                    position.isUsed = true;
                    return position;
                }
            }
        } else {
            for (let i = this.positions.length - 1; i >= 0; i--) {
                let position = this.positions[i];
                if (position.isUsed == false) {
                    position.isUsed = true;
                    return position;
                }
            }
        }
    }

    public dumpCards(ids: number[]): void {
        let cards = this.removeCards(ids);
        let startX = 0;
        const cardW = CardSize.TABLE_WIDTH;
        const spacing = 25;
        if (cards.length > 1)
            startX = - (cardW + (cards.length - 1) * spacing) / 2 + cardW / 2;

        let point = TutPositionHelper.getDumpPosition(this.index, ids.length);

        for (let i = 0; i < cards.length; i++) {
            cards[i].node.zIndex = i;
            cards[i].setCardPositon({
                x: startX + point[i].x,
                y: 130 + point[i].y,
                angle: point[i].a,
                scale: CardSize.TABLE_SCALE
            });
            cards[i].moveToTable();
            startX += spacing;
        }
        for (let i = 0; i < this.positions.length; i++)
            this.positions[i].isUsed = false;
        this.refreshPositions(this.size());
    }

    public dumpOppCards(num: number): void {
        let ids = [];
        ids.push(num);
        let cards = this.removeCards(ids);
        let point = TutPositionHelper.getDumpPosition(this.index, ids.length);
        let startX = point.x;
        let startY = point.y;

        if (cards.length > 1 && this.index > 2)
            startX -= 30 * (cards.length - 1);

        for (let i = 0; i < cards.length; i++) {
            cards[i].node.zIndex = i;
            cards[i].setCardPositon({
                x: startX + point.angles[i].x,
                y: startY + point.angles[i].y,
                angle: point.angles[i].a,
                scale: CardSize.TABLE_SCALE
            });
            cards[i].moveOppCardToTable();
            startX += 30;
        }
    }

    public addOverlay(exludeIDs?: any[]): void {
        for (let i = 0; i < this.cards.length; i++) {
            if (exludeIDs) {
                let exluded = false;
                for (let j = 0; j < exludeIDs.length; j++) {
                    if (this.cards[i].getId() == exludeIDs[j].id) {
                        exluded = true;
                        break;
                    }
                }
                if (exluded)
                    continue;
            }
            this.cards[i].addOverlay();
        }
    }

    public chooseCards(cardEntities: CardEntity[], clickEnabled?: boolean): void {
        for (let i = 0; i < cardEntities.length; i++) {
            for (let j = 0; j < this.cards.length; j++) {
                if (this.cards[j].getId() == cardEntities[i].id) {
                    this.cards[j].hideOverlay();
                    break;
                }
            }
        }
    }

    public selectThisCard(cardEntities: CardEntity[], num: number): void {
        for (let i = 0; i < cardEntities.length; i++) {
            if (this.cards[i].getId() == num) {
                this.cards[i].tutEnableCardClick();
                break;
            }
        }
    }

    public addCard(card: Card): void {
        this.cards.push(card);
        if (this.index >= 3 && this.cards.length > 1) {
            let z = 0;
            for (let i = this.cards.length - 1; i >= 0; i--) {
                this.cards[i].node.zIndex = z;
                z++;
            }
        }
    }

    public refreshPositions(totalCard: number): void {
        // this.refresh++;
        const cardW = CardSize.PLAYER_WIDTH;
        const spacing = Math.floor(cardW / 2);
        let startX = - (cardW + (totalCard - 1) * spacing) / 2 + cardW / 2;
        for (let i = 0; i < totalCard; i++) {
            this.positions[i].x = startX;
            if (i < this.size()) {
                let newY = this.newPosAndRotations(this.size())
                this.cards[i].moveToNewXYR(newY.x[i], newY.y[i], newY.r[i]);
                this.positions[i].isUsed = true;
            }
            if (i < totalCard - 1)
                startX += spacing;
        }
    }

    public newPosAndRotations(size: number): { x: number[], y: number[], r: number[] } {
        let x = [];
        let y = [];
        let r = [];

        if (size == 12) {
            x = [-409, -334, -259, -184, -109, -34, 35, 110, 185, 260, 335, 410];
            y = [-201, -193, -186, -181, -177, -175, -175, -177, -181, -186, -193, -201];
            r = [5, 4, 3, 2, 1, 0, 0, -1, -2, -3, -4, -5];
        }
        else if (size == 11) {
            x = [-375, -300, -225, -150, -75, 0, 75, 150, 225, 300, 375];
            y = [-193, -186, -181, -177, -175, -174, -175, -177, -181, -186, -193];
            r = [5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5];
        }
        else if (size == 10) {
            x = [-334, -259, -184, -109, -34, 35, 110, 185, 260, 335];
            y = [-193, -186, -181, -177, -175, -175, -177, -181, -186, -193];
            r = [4, 3, 2, 1, 0, 0, -1, -2, -3, -4];
        }
        else if (size == 9) {
            x = [-300, -225, -150, -75, 0, 75, 150, 225, 300];
            y = [-186, -181, -177, -175, -174, -175, -177, -181, -186];
            r = [4, 3, 2, 1, 0, -1, -2, -3, -4];
        }
        else if (size == 8) {
            x = [-259, -184, -109, -34, 35, 110, 185, 260];
            y = [-186, -181, -177, -175, -175, -177, -181, -186];
            r = [3, 2, 1, 0, 0, -1, -2, -3];
        }
        else if (size == 7) {
            x = [-225, -150, -75, 0, 75, 150, 225];
            y = [-181, -177, -175, -174, -175, -177, -181];
            r = [3, 2, 1, 0, -1, -2, -3];
        }
        else if (size == 6) {
            x = [-184, -109, -34, 35, 110, 185];
            y = [-181, -177, -175, -175, -177, -181];
            r = [2, 1, 0, 0, -1, -2];
        }
        else if (size == 5) {
            x = [-150, -75, 0, 75, 150];
            y = [-177, -175, -174, -175, -177];
            r = [2, 1, 0, -1, -2,];
        }
        else if (size == 4) {
            x = [-109, -34, 35, 110];
            y = [-177, -175, -175, -177];
            r = [1, 0, 0, -1];
        }
        else if (size == 3) {
            x = [-75, 0, 75];
            y = [-175, -174, -175];
            r = [1, 0, -1];
        }
        else if (size == 2) {
            x = [-34, 35];
            y = [-175, -175];
            r = [0, 0];
        }
        else if (size == 1) {
            x = [0];
            y = [-174];
            r = [0];
        }

        return { x, y, r };
    }

    public reset(): void {
        this.cards.length = 0;
        this.lastDumpCards = null;
        for (let i = 0; i < this.positions.length; i++)
            this.positions[i].isUsed = false;
        if (this.index == 0) {
            const cardW = CardSize.PLAYER_WIDTH;
            const spacing = Math.floor(cardW / 1.5) - 5;
            let startX = - (cardW + (GameInfo.TOTAL_CARDS_FOR_EACH_PLAYER - 1) * spacing) / 2 + cardW / 2;
            for (let i = 0; i < GameInfo.TOTAL_CARDS_FOR_EACH_PLAYER; i++) {
                this.positions[i].x = startX;
                startX += spacing;
            }
        }
    }

    public removeCards(ids: number[]): Card[] {
        let cards = [];
        for (let i = 0; i < ids.length; i++) {
            if (this.index == 0) {
                for (let j = 0; j < this.cards.length; j++) {
                    if (this.cards[j].getId() == ids[i]) {
                        let card = this.cards[j];
                        card.disableCardClick();
                        cards.push(card);
                        this.cards.splice(j, 1);
                        break;
                    }
                }
            } else {
                let card = this.cards.pop();
                if (card) {
                    card.setId(ids[i]);
                    cards.push(card);
                } else {
                    console.warn("No card to pop, `this.cards` empty ");
                }
                if (this.index < 3)
                    this.positions[this.cards.length].isUsed = false;
                else
                    this.positions[(GameInfo.TOTAL_CARDS_FOR_EACH_PLAYER - 1) - this.cards.length].isUsed = false;
            }
        }
        return cards;
    }
}
