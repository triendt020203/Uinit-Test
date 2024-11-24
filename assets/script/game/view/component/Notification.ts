const { ccclass } = cc._decorator;

@ccclass
export default class Notification extends cc.Component {

    tween: cc.Tween = null;

    show(content: string): void {
        this.node.getChildByName("txt").getComponent(cc.Label).string = content;
        this.node.active = true;
    }

    onEnable(): void {
        let yStart = this.node.y;
        this.node.y = yStart + 75;
        this.tween = cc.tween(this.node)
            .to(0.2, { y: yStart })
            .call(() => {
                this.tween = null;
            })
            .start();
        this.scheduleOnce(() => {
            this.hide();
        }, 2);
    }

    hide(): void {
        this.node.active = false;
        if (this.tween)
            this.tween.stop();
        this.node.y = 0;
    }

}
