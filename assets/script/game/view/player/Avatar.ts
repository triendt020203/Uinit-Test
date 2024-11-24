const { ccclass } = cc._decorator;

@ccclass
export default class Avatar extends cc.Component {

    private defaultAvatarFrame: cc.SpriteFrame = null;

    start(): void {
        this.defaultAvatarFrame = this.node.getComponent(cc.Sprite).spriteFrame;
    }

    loadAvatar(path: string): void {
        if (path != "no_avatar") {
            cc.assetManager.loadRemote(path, { ext: '.jpg' }, (err, texture: cc.Texture2D) => {
                if (!err && cc.isValid(this.node)) {
                    texture.packable = false;
                    this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                    this.node.setContentSize(102, 102);
                }
            });
        }
    }

    show(): void {
        this.node.active = true;
    }

    hide(): void {
        this.node.active = false;
    }

    onDisable(): void {
        if (this.defaultAvatarFrame) {
            this.node.getComponent(cc.Sprite).spriteFrame = this.defaultAvatarFrame;
            this.node.setContentSize(102, 102);
        }
    }
}