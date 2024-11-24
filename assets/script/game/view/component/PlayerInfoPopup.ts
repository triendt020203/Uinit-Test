import { cyberGame } from "../../../main/CyberGame";
import Player from "../../entities/Player";
import SocketControl from "../../SocketControl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerInfoPopup extends cc.Component {

    @property(cc.Label)
    playerName: cc.Label = null;

    @property(cc.Label)
    playerCoin: cc.Label = null;

    @property(cc.Sprite)
    playerAvatar: cc.Sprite = null;

    lastSent: number = Date.now();
    guserid: string;
    playerIdMap = new Map();
    noAvatar: cc.SpriteFrame = null;
    avatarPath = null;

    onEnable(): void {
        if (this.noAvatar == null)
            this.noAvatar = this.playerAvatar.spriteFrame;
        else
            this.playerAvatar.spriteFrame = this.noAvatar;

        if (this.avatarPath) {
            cc.assetManager.loadRemote(this.avatarPath, { ext: '.jpg' }, (err, texture: cc.Texture2D) => {
                if (!err && cc.isValid(this.node)) {
                    texture.packable = false;
                    this.playerAvatar.spriteFrame = new cc.SpriteFrame(texture);
                    this.playerAvatar.node.setContentSize(180, 180);
                }
            });
        }
    }

    showEmoPopup(name: string, coin: number, avatar: string): void {
        this.node.getChildByName("bg").getChildByName("emoGrid").active = true;
        this.node.getChildByName("bg").getChildByName("grid").active = false;
        this.playerName.string = name;
        this.playerCoin.string = cyberGame.utils.formatCoinWithCommas(coin);
        this.avatarPath = avatar;
        this.node.active = true;
    }

    showGiftPopup(user: Player): void {
        this.guserid = user.guserid;
        this.node.getChildByName("bg").getChildByName("emoGrid").active = false;
        this.node.getChildByName("bg").getChildByName("grid").active = true;
        this.playerName.string = user.displayName;
        this.playerCoin.string = cyberGame.utils.formatCoinWithCommas(user.coin);
        this.avatarPath = user.avatar;
        this.node.active = true;
    }

    onEmoClick(event: any, emoCode: string): void {
        if (Date.now() - this.lastSent < 3000) {
            return
        }
        else {
            let params = new SFS2X.SFSObject();
            params.putInt('id', 0);
            params.putUtfString('emoCode', emoCode);
            SocketControl.instance.sendGift(params);
            this.lastSent = Date.now();
            this.hidePopup();
        }
    }

    onGiftClick(event: any, id: string): void {
        if (this.playerIdMap.has(this.guserid) && new Date().getTime() - this.playerIdMap.get(this.guserid) < 3000)
            return;
        let params = new SFS2X.SFSObject();
        params.putInt('id', parseInt(id));
        params.putUtfString('recipient', this.guserid);
        SocketControl.instance.sendGift(params);
        this.playerIdMap.set(this.guserid, new Date().getTime());
        this.hidePopup();
    }

    hidePopup(): void {
        this.node.active = false;
    }
}
