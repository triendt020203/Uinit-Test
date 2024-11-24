import { cyberGame } from "../../../main/CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class InGameChat extends cc.Component {

    @property(cc.ScrollView)
    msgView: cc.ScrollView = null;

    @property(cc.ScrollView)
    buttonView: cc.ScrollView = null;

    @property(cc.EditBox)
    inputText: cc.EditBox = null;

    @property(cc.Font)
    msgFont: cc.Font = null;

    addMessage(name: string, text: string): void {
        let node = new cc.Node();
        node.setAnchorPoint(0, 0.5);
        node.x = -this.msgView.content.getContentSize().width / 2;
        let richText = node.addComponent(cc.RichText);
        richText.string = "<color=#c45e00>" + name.trim() + ":</c> <color=#b1b1b1>" + text + "</color>";
        richText.font = this.msgFont;
        richText.fontSize = 20;
        richText.lineHeight = 25;
        this.msgView.content.addChild(node);

        if (this.msgView.content.childrenCount > 60)
            this.msgView.content.removeChild(this.msgView.content.children[0], true);
    }

    send(msg: string): void {
        cyberGame.socket.send(new SFS2X.PublicMessageRequest(msg, null, cyberGame.socket.lastJoinedRoom));
        this.closePopup();
    }

    onSend(): void {
        cyberGame.audio.playButton();
        let msg = this.inputText.string.trim(); 
        if(msg.length == 0){
            this.inputText.string = "";
        }
        if (msg.length > 0) {
            this.send(msg);
            this.inputText.string = "";
        }
    }

    onQuickButtonClick(event: cc.Event): void {
        cyberGame.audio.playButton();
        let node: cc.Node = event.currentTarget;
        let msg = node.getChildByName("txt").getComponent(cc.Label).string;
        if (msg.length > 0) {
            this.send(msg);
        }
    }

    show(): void {
        this.node.active = true;
        this.buttonView.scrollToTop();
    }

    closePopup(): void {
        this.node.active = false;
    }

}
