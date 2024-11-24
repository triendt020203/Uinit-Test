import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChatButton extends cc.Component {

    @property(cc.RichText)
    readonly msg1: cc.RichText = null;

    @property(cc.RichText)
    readonly msg2: cc.RichText = null;

    updateMsg(name: string, text: string): void {
        if (name && text) {
            if (this.msg1.string.length == 0 && this.msg2.string.length == 0) {
                this.msg1.string = this.doGetMsg(name, text);
                this.msg1.node.y = 0;
            }
            else if (this.msg2.string.length == 0) {
                this.msg1.node.y = 12;
                this.msg2.string = this.doGetMsg(name, text);
            }
            else {
                this.msg1.string = this.msg2.string;
                this.msg2.string = this.doGetMsg(name, text);
            }
        }
    }

    private doGetMsg(name: string, text: string): string {
        return "<color=#ecb65e>" + cyberGame.utils.formatName(name, 12, false) + ":</c> <color=#e9fff3>" + cyberGame.utils.formatName(text, 35, false) + "</color>";
    }
}
