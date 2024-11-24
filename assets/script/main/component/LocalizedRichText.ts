import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LocalizedRichText extends cc.Component {

    @property()
    langKey: string = "";

    start(): void {
        if (this.langKey && this.langKey.length > 0) {
            this.node.getComponent(cc.RichText).string = cyberGame.text(this.langKey);
        }
    }
}
