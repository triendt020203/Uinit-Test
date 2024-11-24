const { ccclass, property } = cc._decorator;

@ccclass
export default class ChatContent extends cc.Component {

    @property(cc.Node)
    private readonly avatar: cc.Node = null;

    @property(cc.Label)
    private readonly playerName: cc.Label = null;

    @property(cc.Node)
    private readonly msgWrap: cc.Node = null;

    @property(cc.Label)
    private msg: cc.Label = null;

    _isOnlyMsgEnabled: boolean = false;

    start(): void {
        let w = this.msg.node.getContentSize().width + 40;
        let h = this.msg.node.getContentSize().height + 20;
        if (w > 460) {

        }
        this.msgWrap.setContentSize(w, h);
        if (!this.isOnlyMsgEnabled)
            this.node.height = h + 30;
        else
            this.node.height = h;
    }

    setPlayerName(name: string): void {
        if (name == "undefined" || name == undefined)
            name = "Player";
        this.playerName.string = name;
    }

    setMsg(msg: string): void {
        this.msg.string = msg;
    }

    setAvatar(path: string): void {
        if (path) {
            // cd /p
            cc.assetManager.loadRemote(path, { ext: '.jpg' }, (err, texture: cc.Texture2D) => {
                if (!err && cc.isValid(this.node)) {
                    texture.packable = false;
                    this.avatar.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                    this.avatar.setContentSize(58, 58);
                }
            })
        }
    }

    set isOnlyMsgEnabled(val: boolean) {
        this._isOnlyMsgEnabled = val;
        if (this._isOnlyMsgEnabled) {
            this.avatar.destroy();
            this.playerName.destroy();
            this.msgWrap.getComponent(cc.Widget).top = 0;
        }
    }

    get isOnlyMsgEnabled() {
        return this._isOnlyMsgEnabled
    }
}
