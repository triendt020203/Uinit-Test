const { ccclass } = cc._decorator;

@ccclass
export default class BrokenSpadesPopup extends cc.Component {

    protected onEnable(): void {
        this.node.setScale(0.8);
        cc.tween(this.node)
            .to(0.8, { scale: 1 }, { easing: 'elasticOut' })
            .start();

        setTimeout(() => {
            this.hide();
        }, 2000);
    }

    show(): void {
        this.node.active = true;
    }

    hide(): void {
        this.node.active = false;
    }
}
