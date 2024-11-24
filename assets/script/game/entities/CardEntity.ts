// private singleton const
const cardMap = new Map();

class CardEntity {

    readonly rank: number;
    readonly suit: number;
    readonly id: number;
    readonly point: number;

    constructor(rank: number, suit: number) {
        this.rank = rank;
        this.suit = suit;
        this.id = rank + 13 * suit - 1;
        this.point = rank < 10 ? rank : 10;
    }

    /**
     * Gets an instance of CardEntity
     * 
     * @param {*} cardId - card id
     */
    static getInstance(cardId: number): CardEntity {
        if (cardMap.size == 0) {
            for (let i = 0; i < 4; i++) {
                for (let j = 1; j <= 13; j++) {
                    let card = new CardEntity(j, i);
                    cardMap.set(card.id, card);
                }
            }
        }
        return cardMap.get(cardId);
    }

    equals(card: CardEntity) {
        return this.id != -1 && this.id == card.id;
    }

    compareTo(card: CardEntity) {
        if (card.id == -1 || this.id == -1)
            throw new Error("Can not compare invalid card");
        if (this.id < card.id)
            return -1;
        else if (this.id == card.id)
            return 0;
        else
            return 1;
    }

}
export default CardEntity;