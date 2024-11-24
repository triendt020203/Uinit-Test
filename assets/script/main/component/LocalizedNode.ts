import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LocalizedNode extends cc.Component {

    @property(cc.SpriteFrame)
    th: cc.SpriteFrame = null;

    start(): void {
        if (cyberGame.lang.code == "th" && this.th != null) {
            this.node.getComponent(cc.Sprite).spriteFrame = this.th;
        }
    }
}
