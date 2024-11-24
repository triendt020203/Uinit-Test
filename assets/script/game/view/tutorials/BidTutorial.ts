import { cyberGame } from "../../../main/CyberGame";
import ProgressBarBidding from "../component/ProgressBarBidding";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BidTutorial extends cc.Component {

    @property(cc.Node)
    row: cc.Node = null;

    @property(cc.Node)
    hand: cc.Node = null;

    progressBar: ProgressBarBidding = null;
    clicked: boolean = false;

    protected onLoad(): void {
        this.progressBar = this.node.getChildByName("ProgressBar").getComponent(ProgressBarBidding);
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

    show(): void {
        this.rcmBid();
        this.node.active = true;
        this.clicked = false;
    }

    rcmBid(): void {
        for (let i = 0; i < 12; i++) {
            let node = this.getNumbgNode(i);
            node.opacity = 255;
        }
    }

    hide(): void {
        this.node.active = false;
    }

    private getNumbgNode(id: number): cc.Node {
        return this.row.getChildByName(`numBg_${id}`);
    }

}
