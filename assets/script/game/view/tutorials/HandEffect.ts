const { ccclass } = cc._decorator;

@ccclass
export default class HandEffect extends cc.Component {

    protected onEnable(): void {
        this.node.scale = 1;
        this.tweenLoseDec();
    }

    show(): void {
        this.node.active = true;
    }

    hide(): void {
        this.node.active = false;
    }

    private tweenLoseDec(): void {
        cc.tween(this.node)
            .to(1, { scale: 0.85 })
            .call(() => {
                this.tweenLoseInc();
            })
            .start()
    }

    private tweenLoseInc(): void {
        cc.tween(this.node)
            .to(1, { scale: 1.05 })
            .call(() => {
                this.tweenLoseDec();
            })
            .start()
    }
}