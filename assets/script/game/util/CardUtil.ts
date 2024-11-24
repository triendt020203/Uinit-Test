import CardEntity from "../entities/CardEntity";

export default class CardUtil {
    static tutBidCardHighlight(cards: CardEntity[]): CardEntity[] {
        let ids = [];
        const validIds = [51, 50, 49, 48, 38];
        for (let i = 0; i < cards.length; i++) {
            if (validIds.includes(cards[i].id)) {
                ids.push(cards[i]);
            }
        }
        return ids;
    }

    static checkAce(cards: CardEntity[]): boolean {
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].id == 51)
                return true;
        }
        return false;
    }

    static bidTeamRcm(cards: CardEntity[], num: number): number[] {
        let number = [];
        if (this.checkAce(cards)) {
            for (let i = 1; i <= num; i++) {
                number.push(i);
            }
        } else {
            for (let i = 0; i <= num; i++) {
                number.push(i);
            }
        }
        return number;
    }

    static bidRecommend(cards: CardEntity[]): number[] {
        let number = [];
        let ace = 0, king = 0, queen = 0, jack = 0, outTen = 0;
        let s = 0, h = 0, c = 0, d = 0;
        let slength = 0, hlength = 0, clength = 0, dlength = 0;
        let emptySuit = 0;

        for (const card of cards) {
            switch (card.rank) {
                case 13:
                    ace += 1;
                    break;
                case 12:
                    king += 0.5;
                    break;
                case 11:
                    queen += 0.3;
                    break;
                case 10:
                    if (card.suit === 3) {
                        jack += 0.2;
                    }
                    break;
                default:
                    if (card.rank < 10 && card.suit === 3) {
                        outTen += 0.1;
                    }
                    break;
            }
            switch (card.suit) {
                case 0: d++; break;
                case 1: c++; break;
                case 2: h++; break;
                case 3: s++; break;
            }
        }
        let stringSpades = 0;
        let faketrick = 0
        for (let i = 51; i >= 38; i--) {
            if (cards.some(card => card.id === i)) {
                stringSpades++;
            } else {
                for (let i = 0; i < cards.length; i++) {
                    if (cards[i].rank === 13 && cards[i].suit != 3)
                        faketrick += 1;
                    if (cards[i].rank === 12 && cards[i].suit != 3)
                        faketrick += 0.5;
                    if (cards[i].rank === 11 && cards[i].suit != 3)
                        faketrick += 0.3;
                }
                let trick = Math.round(stringSpades + faketrick);
                if (this.checkAce(cards)) {
                    for (let i = 1; i <= trick; i++) {
                        number.push(i);
                    }
                } else {
                    for (let i = 0; i <= trick; i++) {
                        number.push(i);
                    }
                }
                return number;
            }
        }

        emptySuit = [s, h, c, d].filter(suitCount => suitCount < 2).length * 0.5;
        emptySuit += [s, h, c, d].filter(suitCount => suitCount === 2).length * 0.2;
        slength = Math.max(0, s - 4);
        hlength = Math.max(0, h - 4);
        clength = Math.max(0, c - 4);
        dlength = Math.max(0, d - 4);
        let lengthSuit = (slength + hlength + clength + dlength) * 0.1;
        let trick = Math.round(ace + king + queen + jack + outTen + lengthSuit + emptySuit);

        if (this.checkAce(cards)) {
            for (let i = 1; i <= trick; i++) {
                number.push(i);
            }
        } else {
            for (let i = 0; i <= trick; i++) {
                number.push(i);
            }
        }
        return number;
    }

    static checkFollow(cards: CardEntity[], cardId: number): boolean {
        let cardIdRank = this.getRankById(cardId);
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].rank == cardIdRank)
                return true;
        }
        return false;
    }

    static firstCard(cards: CardEntity[]): CardEntity[] {
        let ids = [];
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].suit == 0 || cards[i].suit == 1 || cards[i].suit == 2) {
                ids.push(cards[i]);
            }
        }
        return ids;
    }

    static onlySpadesLeft(cards: CardEntity[]): CardEntity[] {
        let ids = [];
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].suit == 3) {
                ids.push(cards[i]);
            }
        }
        return ids;
    }

    static brokenSpades(cards: CardEntity[]) {
        let ids = [];
        for (let i = 0; i < cards.length; i++) {
            ids.push(cards[i]);
        }
        return ids;
    }

    static doGetFollowCards(cards: CardEntity[], cardId: number): CardEntity[] {
        let ids = [];
        let cardIdRank = this.getSuitById(cardId);
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].suit == cardIdRank) {
                ids.push(cards[i]);
            }
        }
        return ids;
    }

    static isSameRankCardGroup(ids: number[]): boolean {
        for (let i = 0; i < ids.length - 1; i++) {
            let r = this.getRankById(ids[i]);
            let nr = this.getRankById(ids[i + 1]);
            if (r != nr)
                return false;
        }
        return true;
    }

    static doGetBestDump(cards: CardEntity[]): CardEntity[] {
        let ids = [];
        let map = this.createMapByValue(cards);
        let maxPoint = 0;
        let maxR = 0;
        map.forEach((cardArr: CardEntity[]) => {
            let p = 0;
            for (let i = 0; i < cardArr.length; i++) {
                p += cardArr[i].point;
            }
            if (p > maxPoint) {
                maxPoint = p;
                ids = cardArr;
                maxR = cardArr[0].rank;
            } else if (p == maxPoint) {
                if (cardArr[0].rank > maxR) {
                    maxPoint = p;
                    ids = cardArr;
                    maxR = cardArr[0].rank;
                }
            }
        })
        return ids;
    }

    static getRankById(cardId: number): number {
        return cardId % 13 + 1;
    }

    static getSuitById(cardId: number): number {
        return Math.floor(cardId / 13);
    }

    static sortCardEntityByValue(cards: CardEntity[]): void {
        cards.sort((a: CardEntity, b: CardEntity) => {
            return (a.id - b.id);
        })
    }

    static sortCardsByValue(ids: any): void {
        ids.sort((a: any, b: any) => {
            return (this.getRankById(a.getId()) - this.getRankById(b.getId()));
        })
    }

    static sortCardsByRank(ids: any): void {
        ids.sort((a: number, b: number) => {
            return (this.getRankById(a) - this.getRankById(b));
        })
    }

    static createMapByValue(cards: CardEntity[]) {
        let map = new Map();
        for (let i = 0; i < cards.length; i++) {
            let card = cards[i];
            if (map.has(card.rank))
                map.get(card.rank).push(card);
            else
                map.set(card.rank, [card]);
        }
        return map;
    }
}