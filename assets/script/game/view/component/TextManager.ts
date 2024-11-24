const { ccclass, property } = cc._decorator;

@ccclass
export default class TextManager extends cc.Component {

    @property({ type: [cc.SpriteFrame] })
    arrOfLoseTextSF: cc.SpriteFrame[] = [];

    @property({ type: [cc.SpriteFrame] })
    arrOfWinTextSF: cc.SpriteFrame[] = [];

    @property({ type: [cc.SpriteFrame] })
    arrOfPointSF: cc.SpriteFrame[] = [];

    charPool: cc.NodePool = new cc.NodePool();

    start(): void {
        for (let i = 0; i < 10; ++i) {
            let charNode = new cc.Node();
            charNode.addComponent(cc.Sprite);
            this.charPool.put(charNode);
        }
    }

    getCharNode(): cc.Node {
        if (this.charPool.size() > 0)
            return this.charPool.get();
        else {
            let charNode = new cc.Node();
            charNode.addComponent(cc.Sprite);
            return charNode;
        }
    }

}
