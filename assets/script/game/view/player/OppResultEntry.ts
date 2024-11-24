import { cyberGame } from "../../../main/CyberGame";
import MoneyEntry from "../component/MoneyEntry";
import Avatar from "./Avatar";

const { ccclass, property } = cc._decorator;

@ccclass
export default class OppResultEntry extends cc.Component {

    @property(cc.Label)
    readonly playerName: cc.Label = null;

    @property(cc.Node)
    readonly coin: cc.Node = null;

    @property(Avatar)
    readonly avatar: Avatar = null;

    setName(txt: string): void {
        this.playerName.getComponent(cc.Label).string = cyberGame.utils.formatName(txt, 12, false);
    }

    setCoin(val: number): void {
        if (val > 0)
            this.coin.getComponent(MoneyEntry).showWin(val);
        else
            this.coin.getComponent(MoneyEntry).showLose(val);
    }

    setAvatar(sf: cc.SpriteFrame): void {
        this.avatar.getComponent(cc.Sprite).spriteFrame = sf;
        this.avatar.node.setContentSize(82, 82);
    }

    hide(): void {
        this.coin.getComponent(MoneyEntry).hide();
        this.node.active = false;
    }
}
