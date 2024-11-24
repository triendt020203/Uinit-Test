import { cyberGame } from "../../../main/CyberGame";
import { ResultEntryWinGame } from "../../entities/ResultSpades";
import { ResultEntryPlayerTeamGame } from "../../entities/ResultTeam";
import Avatar from "./Avatar";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerWinGame extends cc.Component {

    @property(cc.Label)
    readonly playerName: cc.Label = null;
    @property(Avatar)
    readonly avatar: Avatar = null;
    @property(cc.Label)
    readonly point: cc.Label = null;
    @property(cc.Label)
    readonly money: cc.Label = null;

    setName(txt: string): void {
        this.playerName.getComponent(cc.Label).string = cyberGame.utils.formatName(txt, 12, false);
    }

    setAvatar(sf: cc.SpriteFrame): void {
        this.avatar.getComponent(cc.Sprite).spriteFrame = sf;
        this.avatar.node.setContentSize(82, 82);
    }

    updateWinResult(data: ResultEntryPlayerTeamGame): void {
        console.log("LOLLLLLLLLLLLLLLLLLLLLLLLLLLL");
        
        this.point.getComponent(cc.Label).string = data.point.toString();
        if (data.money > 0)
            this.money.getComponent(cc.Label).string = "+" + data.money.toString();
        if (data.money < 0)
            this.money.getComponent(cc.Label).string = data.money.toString();
    }

    hide(): void {
        this.node.active = false;
    }
}
