import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LocalizedTxt extends cc.Component {

    @property()
    langKey: string = "";

    start(): void {
        if (this.langKey && this.langKey.length > 0) {
            this.node.getComponent(cc.Label).string = cyberGame.text(this.langKey);
        }
    }
}
