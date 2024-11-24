import Player from "../../entities/Player";
import { ResultEntryPlayerTeam } from "../../entities/ResultTeam";
import { ScoreInfoBoard } from "../../entities/ScoreInfo";
import Avatar from "./Avatar";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlayerTeam extends cc.Component {

    @property(Avatar)
    readonly avatar: Avatar = null;

    @property(cc.Label)
    madeBid: cc.Label = null;

    hide(): void {
        this.node.active = false;
    }

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
    }

    updateScoreResult(data: ScoreInfoBoard): void {
        this.madeBid.getComponent(cc.Label).string = data.made.toString() + "/" + data.bid.toString();
    }

    updateWinResultTeam(data: ResultEntryPlayerTeam):void{
        this.madeBid.getComponent(cc.Label).string = data.made.toString() + "/" + data.bid.toString();
    }
}
