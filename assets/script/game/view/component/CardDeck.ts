const { ccclass, property } = cc._decorator;

@ccclass
export default class CardDeck extends cc.Component {
    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    @property({ type: [cc.SpriteFrame] })
    spriteList: cc.SpriteFrame[] = [];

    private currSprite: number = 0;

    changeSpriteCardDeck(): void {
        this.node.y = this.node.y + 1;
        if (this.currSprite < this.spriteList.length) {
            this.currSprite++;
            this.sprite.spriteFrame = this.spriteList[this.currSprite];
        }
    }
}
