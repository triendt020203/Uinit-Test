import { ResultEntrySpades } from "../../entities/ResultSpades";
import Avatar from "./Avatar";
import { ScoreInfoBoard } from "../../entities/ScoreInfo";
import Player from "../../entities/Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerWinPopup extends cc.Component {
    
    @property(Avatar)
    readonly avatar: Avatar = null;

    @property(cc.Label)
    madeBid: cc.Label = null;

    @property(cc.Label)
    bag: cc.Label = null;

    @property(cc.Label)
    bonus: cc.Label = null;

    @property(cc.Label)
    point: cc.Label = null;

    @property(cc.Label)
    ttbag: cc.Label = null;

    @property(cc.Label)
    bagpen: cc.Label = null;

    @property(cc.Label)
    ttpoint: cc.Label = null;

    setAvatar(sf: cc.SpriteFrame): void {
        this.avatar.getComponent(cc.Sprite).spriteFrame = sf;
        this.avatar.node.setContentSize(82, 82);
    }

    updateRealTime(user: Player): void {
        if (user.bid > -1) {
            this.madeBid.getComponent(cc.Label).string = user.made.toString() + "/" + user.bid.toString();
        } else {
            this.madeBid.getComponent(cc.Label).string = "0/0";
        }
        this.bag.getComponent(cc.Label).string = "0";
        this.bonus.getComponent(cc.Label).string = "0";
        this.point.getComponent(cc.Label).string = "0";
    }

    updateWinResult(data: ResultEntrySpades): void {
        this.madeBid.getComponent(cc.Label).string = data.made.toString() + "/" + data.bid.toString();
        this.bag.getComponent(cc.Label).string = data.bag.toString();
        this.bonus.getComponent(cc.Label).string = data.bonus.toString();
        this.point.getComponent(cc.Label).string = data.point.toString();
        this.ttbag.getComponent(cc.Label).string = data.totalbag.toString();
        this.bagpen.getComponent(cc.Label).string = data.fiveBag.toString();
        this.ttpoint.getComponent(cc.Label).string = data.totalPoint.toString();
    }

    updateScoreResult(data: ScoreInfoBoard): void {
        this.madeBid.getComponent(cc.Label).string = data.made.toString() + "/" + data.bid.toString();
        this.bag.getComponent(cc.Label).string = data.bag.toString();
        this.bonus.getComponent(cc.Label).string = data.bonus.toString();
        this.point.getComponent(cc.Label).string = data.point.toString();
        this.ttbag.getComponent(cc.Label).string = data.totalbag.toString();
        this.bagpen.getComponent(cc.Label).string = data.fiveBag.toString();
        this.ttpoint.getComponent(cc.Label).string = data.totalPoint.toString();
    }

    updatePreRound(data: ScoreInfoBoard): void {
        this.madeBid.getComponent(cc.Label).string = data.made.toString() + "/" + data.bid.toString();
        this.bag.getComponent(cc.Label).string = data.bag.toString();
        this.bonus.getComponent(cc.Label).string = data.bonus.toString();
        this.point.getComponent(cc.Label).string = data.point.toString();
        this.ttbag.getComponent(cc.Label).string = data.totalbag.toString();
        this.bagpen.getComponent(cc.Label).string = data.fiveBag.toString();
        this.ttpoint.getComponent(cc.Label).string = data.totalPoint.toString();
    }

    hide(): void {
        this.node.active = false;
    }
}
