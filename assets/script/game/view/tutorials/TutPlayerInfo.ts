import Player from "../../entities/Player";
import ProgressBar from "../component/ProgressBar";
import Avatar from "../player/Avatar";
import { cyberGame } from "../../../main/CyberGame";
import TutCardControl from "./TutCardControl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TutPlayerInfo extends cc.Component {

    @property()
    readonly index: number = 0;

    @property(cc.Node)
    readonly coin: cc.Node = null;

    @property(cc.Label)
    readonly playerName: cc.Label = null;

    @property(cc.Label)
    readonly playerCoin: cc.Label = null;

    @property(Avatar)
    readonly avatar: Avatar = null;

    @property(cc.Node)
    bid: cc.Node = null;

    public cardControl: TutCardControl;
    user: Player = null;

    start(): void {
        this.cardControl = new TutCardControl(this);

    }

    updateData(user: Player): void {
        this.user = user;
        if (user != null) {
            this.enablePlayerNodes();
            this.updateCoin(user.coin);
            this.updateDisplayName(user.displayName);
            if (user.avatar != null)
                this.avatar.loadAvatar(user.avatar);
        }
    }

    private enablePlayerNodes(): void {
        this.avatar.show();
        this.playerName.node.active = true;
        this.playerCoin.node.active = true;
        this.playerName.node.active = true;
        this.playerCoin.node.active = true;
    }

    startTimer(delay: number): void {
        this.node.getChildByName("ProgressBar").getComponent(ProgressBar).play(delay);
    }

    hideTimer(): void {
        this.node.getChildByName("ProgressBar").getComponent(ProgressBar).stop();
    }

    pauseTimer(): void {
        this.node.getChildByName("ProgressBar").getComponent(ProgressBar).pause();
    }

    updateCoin(coin: number): void {
        this.playerCoin.string = String(cyberGame.utils.shortenLargeNumber(coin, 2));
    }

    updateDisplayName(displayName: string): void {
        this.playerName.string = cyberGame.utils.formatName(displayName, 8, false);
    }

    updateDataTutorial(user: Player) {
        this.user = user;
        if (user != null) {
            this.enablePlayerNodes();
            this.updateCoin(user.coin);
            this.updateDisplayName(user.displayName);
            if (user.avatar != null)
                this.avatar.loadAvatar(user.avatar);
        }
    }

    biding(): void {
        this.playerName.node.active = false;
        this.playerCoin.node.active = false;
        this.coin.active = false;

        if (!this.user.hasBet) {
            this.user.hasBet = true;
            this.bid.active = true;
            const biddingNode = this.bid.getChildByName("Bidding");
            biddingNode.active = true;
            this.bid.getChildByName("Bid").active = false;

            cc.tween(biddingNode)
                .repeatForever(
                    cc.tween()
                        .to(0.5, { opacity: 0 })
                        .to(0.5, { opacity: 255 })
                )
                .start();
        }
    }

    updateNewBid(): void {
        this.user.made++;
        this.bid.getChildByName("Bid").getComponent(cc.Label).string = this.user.made.toString() + "/" + this.user.bid.toString();
    }

    updateBid(): void {
        this.bid.getChildByName("Bidding").active = false;
        this.bid.getChildByName("Bid").active = true;
        this.bid.getChildByName("Bid").getComponent(cc.Label).string = this.user.made.toString() + "/" + this.user.bid.toString();
    }

    reset(): void {
        this.cardControl.reset();
    }
}
