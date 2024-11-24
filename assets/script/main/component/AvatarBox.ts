const { ccclass, property } = cc._decorator;

@ccclass
export default class AvatarBox extends cc.Component {

    @property(cc.Label)
    avatarName: cc.Label = null;

    @property(cc.Label)
    coin: cc.Label = null;

    @property(cc.Sprite)
    img: cc.Sprite = null;

    id: number = 0;

    start() {

    }

    onBoxClick(): void {
        cc.game.emit("ON_AVATAR_BOX_CLICK", this.id);
    }

    removeActiveBg(): void {
        this.node.getChildByName("bg_active").active = false;
    }

    addActiveBg(): void {
        this.node.getChildByName("bg_active").active = true;
    }
}
