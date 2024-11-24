const { ccclass, property } = cc._decorator;

@ccclass
export default class OverlayLoader extends cc.Component {

    @property(cc.Node)
    preloadIcon: cc.Node = null;

    private tt: cc.Tween = null;

    start(): void {
        this.createRotatorTween();
    }

    createRotatorTween(): void {
        this.preloadIcon.angle = 0;
        this.tt = cc.tween(this.preloadIcon)
            .to(5, { angle: 5 * 360 })
            .call(() => {
                this.createRotatorTween();
            })
            .start();
    }

    close(): void {
        if (this.tt != null)
            this.tt.stop();
        this.node.destroy();
    }
}
