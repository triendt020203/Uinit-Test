const { ccclass, property } = cc._decorator;

@ccclass
export default class StartCountDown extends cc.Component {

    @property({ type: [cc.SpriteFrame] })
    private numFrames: cc.SpriteFrame[] = [];

    @property(cc.Sprite)
    private numText: cc.Sprite = null;

    private counter: number;

    delay: number = 5000;

    running: boolean = false;

    start(): void {
        this.counter = this.delay;
        this.setText(Math.round(this.counter / 1000));
        this.fadeIn();
        this.schedule(this.onCounter, 1);
        this.running = true;
    }

    private onCounter(): void {
        this.counter = this.counter - 1000;
        var t = Math.round(this.counter / 1000);
        if (t > 0) {
            this.setText(t);
            this.fadeIn();
        } else {
            this.running = false;
            cc.game.emit("START_COUNT_DOWN_FINISH");
            this.stopCounter();
        }
    }

    stopCounter(): void {
        this.unschedule(this.onCounter);
        this.node.destroy();
    }

    private setText(num: number): void {
        if (num > 0 && num < 6)
            this.numText.getComponent(cc.Sprite).spriteFrame = this.numFrames[num - 1];
    }

    private fadeIn(): void {
        this.numText.node.opacity = 0;
        this.numText.node.setScale(0.2);
        cc.tween(this.numText.node)
            .parallel(
                cc.tween().to(0.6, { opacity: 255 }),
                cc.tween().to(0.8, { scale: 1.1 }, { easing: 'elasticOut' })
            )
            .start();
    }
}