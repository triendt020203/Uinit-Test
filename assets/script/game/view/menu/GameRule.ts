import { cyberGame } from "../../../main/CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameRule extends cc.Component {

    @property(cc.Node)
    readonly content1: cc.Node = null;

    @property(cc.Node)
    readonly content2: cc.Node = null;

    close(): void {
        this.node.destroy();
    }

    onChangeTab(active: cc.Toggle): void {
        cyberGame.audio.playButton();
        if (active.node.name == "toggle2") {
            this.content1.active = false;
            this.content2.active = true;
        } else {
            this.content1.active = true;
            this.content2.active = false;
        }
    }
}
