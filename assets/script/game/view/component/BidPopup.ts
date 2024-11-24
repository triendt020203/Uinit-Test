import { cyberGame } from "../../../main/CyberGame";
import SocketControl from "../../SocketControl";
import ProgressBarBidding from "./ProgressBarBidding";

const { ccclass } = cc._decorator;

@ccclass
export default class BidPopup extends cc.Component {

    progressBar: ProgressBarBidding = null;

    clicked: boolean = false;

    protected onLoad(): void {
        this.progressBar = this.node.getChildByName("ProgressBar").getComponent(ProgressBarBidding);
    }

    onSendRequest(event: any, num: number): void {
        cyberGame.audio.playSound('coinmove');
        if (!this.clicked) {
            SocketControl.instance.sendBet(Number(num));
            this.clicked = true;
        }
        this.hide();
    }

    protected onEnable(): void {
        this.progressBar.updateProgress();
        this.node.setScale(0.8);
        cc.tween(this.node)
            .to(0.8, { scale: 1 }, { easing: 'elasticOut' })
            .start();
    }

    protected onDisable(): void {
        this.progressBar.stopProgress();
    }

    show(rcn: number[]): void {
        this.rcmBid(rcn);
        this.node.active = true;
        this.clicked = false;
    }

    rcmBid(rcn: number[]): void {
        if (rcn[0] == 0) {
            for (let i = 0; i < rcn.length; i++) {
                let node = this.getNumbgNode(i);
                node.opacity = 255;
            }
        }
        else if (rcn[0] == 1) {
            for (let i = 0; i < rcn.length; i++) {
                let node = this.getNumbgNode(i + 1);
                node.opacity = 255;
            }
        }
    }

    hide(): void {
        this.node.active = false;
    }

    private getNumbgNode(id: number): cc.Node {
        return this.node.getChildByName(`numBg_${id}`);
    }
}

