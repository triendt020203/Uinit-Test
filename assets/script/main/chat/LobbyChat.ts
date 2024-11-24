import { cyberGame } from "../CyberGame";
import ChatContent from "./ChatContent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LobbyChat extends cc.Component {

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.EditBox)
    inputText: cc.EditBox = null;

    @property(cc.Prefab)
    chatRowPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    chatRowMyPrefab: cc.Prefab = null;

    lastSentId: string = "";

    protected start(): void {
        const messages = cyberGame.chat.messages();
        if (this.lastSentId.length == 0 && messages.length > 0) {
            for (let i = 0; i < messages.length; i++) {
                this.updatePublicMessage(messages[i], true);
            }
            this.scrollView.content.getComponent(cc.Layout).updateLayout();
            this.scrollView.scrollToBottom(0.5);
        }
    }

    protected onEnable(): void {
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, true);
    }

    protected onDisable(): void {
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, false);
    }

    updatePublicMessage(event: any, disableScroll?: boolean): void {
        let node = event.guserid != cyberGame.player.playerId ? cc.instantiate(this.chatRowPrefab) : cc.instantiate(this.chatRowMyPrefab);
        let chatContent = node.getComponent(ChatContent);
        chatContent.setMsg(event.content);
        if (this.lastSentId != event.guserid) {
            chatContent.setPlayerName(event.name);
            chatContent.setAvatar(event.avatar);
        } else
            chatContent.isOnlyMsgEnabled = true;
        this.scrollView.content.addChild(node);

        if (this.scrollView.content.childrenCount > 50)
            this.scrollView.content.removeChild(this.scrollView.content.children[0], true);

        if (!disableScroll)
            this.scrollView.scrollToBottom();

        this.lastSentId = event.guserid;
    }

    playAudio(): void {
        cyberGame.audio.playButton();
    }

    onSend(): void {
        let msg = this.inputText.string;
        if (msg.length > 0) {
            cyberGame.chat.send(msg);
            this.inputText.string = "";
        }
    }

    show(): void {
        this.node.active = true;
    }

    closePopup(): void {
        this.playAudio();
        this.node.active = false;
    }

}
