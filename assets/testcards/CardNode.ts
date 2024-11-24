import TestCard from "./TestCard";

const { ccclass } = cc._decorator;

@ccclass
export default class CardNode extends cc.Component {

    id: number;
    cardSF: cc.SpriteFrame = null;
    distributed: boolean = false;
    testCard: TestCard;

    setId(id: number) {
        this.id = id;
        if (id != -1) {
            let sf: cc.SpriteFrame = this.testCard.cardAtlas.getSpriteFrame("Card_" + id);
            this.setCardSF(sf);
        }
    }

    getId(): number {
        return this.id;
    }

    setCardSF(sf: cc.SpriteFrame) {
        this.cardSF = sf;
    }

    isDistributed(): boolean {
        return this.distributed;
    }

    setDistributed(val: boolean): void {
        this.distributed = val;
    }

    changeSpriteFrame(sf: cc.SpriteFrame) {
        this.node.getComponent(cc.Sprite).spriteFrame = sf;
    }

    enableCardClick(): void {
        this.distributed = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onCardClick, this);
    }

    onCardClick(): void {
        this.testCard.node.emit("testCardClick", this);
    }

}