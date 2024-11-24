import { CardSize } from "./CardSize";
import CardEntity from "../../entities/CardEntity";
import CardUtil from "../../util/CardUtil";
import Card from "./Card";
import PlayerInfo from "../player/PlayerInfo";
import PositionHelper, { CardPosition } from "../player/PositionHelper";
import { GameInfo } from "../../constants/GameInfo";
import Game from "../../Game";

export default class CardControl {

    readonly index: number;
    readonly seat: PlayerInfo;
    readonly point: cc.Node;
    readonly cards: Card[] = [];
    readonly positions: CardPosition[] = [];
    private refresh: number = 0;

    constructor(seat: PlayerInfo) {
        this.seat = seat;
        this.index = seat.index;
        PositionHelper.createCardPositions(this);
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

    /**
     * For current player only
     * 
     * @param cardEntities 
     * @param clickEnabled 
     */

    public recommendBid(): number[] {
        let bid = CardUtil.bidRecommend(this.seat.user.cards);
        return bid;
    }

    public recommendTeam(num): number[] {
        let me;
        if (num === -1) {
            me = 12 - num;
        } else {
            me = 13 - num;
        }
        let bid = CardUtil.bidTeamRcm(this.seat.user.cards, me);
        return bid;
    }

    public recommendCard(game: Game): void {
        this.addOverlay();
        let firstCard = CardUtil.firstCard(this.seat.user.cards);
        if (firstCard.length == 0)
            this.chooseCards(this.seat.user.cards, true);
        if (game.spadeBroken == false) {
            if (game.leadCard != -1) {
                let cards = CardUtil.doGetFollowCards(this.seat.user.cards, game.leadCard);
                let callcards = CardUtil.brokenSpades(this.seat.user.cards);
                if (cards.length > 0) {
                    this.addOverlay();
                    this.chooseCards(cards, true);
                }
                else if (cards.length < 1) {
                    this.chooseCards(callcards, true);
                }
            }
            else if (game.leadCard == -1) {
                let spadesCards = CardUtil.onlySpadesLeft(this.seat.user.cards);
                let callcards = CardUtil.brokenSpades(this.seat.user.cards);
                if (spadesCards.length == callcards.length) {
                    this.chooseCards(callcards, true);
                }
                else if (spadesCards.length < callcards.length) {
                    this.addOverlay();
                    this.firstTurn(firstCard, true);
                }
            }
        }
        else if (game.spadeBroken == true) {
            if (game.leadCard != -1) {
                let cards = CardUtil.doGetFollowCards(this.seat.user.cards, game.leadCard);
                let callcards = CardUtil.brokenSpades(this.seat.user.cards);
                if (cards.length > 0) {
                    this.addOverlay();
                    this.chooseCards(cards, true);
                }
                else if (cards.length < 1) {
                    this.addOverlay();
                    this.chooseCards(callcards, true);
                }
            }
            else if (game.leadCard == -1) {
                this.addOverlay();
                this.chooseCards(this.seat.user.cards, true);
            }
        }

    }

    public openCardOnHand(exludeIDs?: any[]): void {
        const cardsToOpen = this.cards
            .filter(card => {
                return !exludeIDs || !exludeIDs.some(exclude => exclude.id === card.getId());
            })
            .reverse();
            
        let index = 0;
        const interval = 60;
        const openNextCard = () => {
            if (index < cardsToOpen.length) {
                cardsToOpen[index].openCurrentPlayerCard(true);
                index++;
                setTimeout(openNextCard, interval);
            }
        };
        openNextCard(); 
    }   

    public closeCardOnHand(exludeIDs?: any[]): void {
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
            this.cards[i].simpleClose();
        }
    }

    public chooseCards(cardEntities: CardEntity[], clickEnabled?: boolean): void {
        for (let i = 0; i < cardEntities.length; i++) {
            for (let j = 0; j < this.cards.length; j++) {
                if (this.cards[j].getId() == cardEntities[i].id) {
                    if (clickEnabled) {
                        this.cards[j].enableCardClick();
                        this.cards[j].hideOverlay();
                    }
                    break;
                }
            }
        }
    }

    public firstTurn(cardEntities: CardEntity[], clickEnabled?: boolean): void {
        for (let i = 0; i < cardEntities.length; i++) {
            for (let j = 0; j < this.cards.length; j++) {
                if (this.cards[j].getId() == cardEntities[i].id) {
                    if (clickEnabled) {
                        this.cards[j].enableCardClick();
                        this.cards[j].hideOverlay();
                    }
                    break;
                }
            }
        }
    }

    public refreshPositions(totalCard: number): void {
        this.refresh++;
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

    public hideOverlay(): void {
        for (let i = 0; i < this.cards.length; i++)
            this.cards[i].hideOverlay();
    }

    public size(): number {
        return this.cards.length;
    }

    public reset(): void {
        this.cards.forEach(card => {
            card.resetCard();
        });
        this.cards.length = 0;
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

    disableClick(): void {
        for (let j = 0; j < this.cards.length; j++) {
            let card = this.cards[j];
            card.disableCardClick();
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