import {cyberGame} from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChatPopup extends cc.Component {

    @property(cc.Button)
    sendButton: cc.Button = null;

    @property(cc.EditBox)
    chatInputText: cc.EditBox = null;

    start() {
        
    }

    closePopup() {
        this.node.destroy();
    }

}
