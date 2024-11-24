const { ccclass } = cc._decorator;

const AVATAR_RADIUS = 50; // = width of avatar / 2

@ccclass
export default class ProgressBar extends cc.Component {
    private duration: number = 0;
    private interVal = null;
    private r = 0;

    onLoad(): void {
        this.r = AVATAR_RADIUS;
    }

    onDestroy() {
        this.pause();
    }

    get dot() {
        return this.node.getChildByName("dot");
    }

    get progressBar() {
        return this.node.getComponent(cc.ProgressBar);
    }

    setPercent(percent: number) {
        percent = percent / 100;
        this.progressBar.progress = percent;
        let a = (1 - percent) * 360 * Math.PI / 180;
        let x = this.r * Math.sin(a);
        let y = this.r * Math.cos(a);
        if (this.dot) {
            this.dot.x = x;
            this.dot.y = y;
        }
    }

    reset(): void {
        this.setPercent(0);
        if (this.dot)
            this.dot.active = false;
    }

    pause(): void {
        if (this.interVal)
            clearInterval(this.interVal);
        this.unscheduleAllCallbacks();
    }

    stop(): void {
        if (this.node.active) {
            this.pause();
            this.reset();
            this.node.active = false;
        }
    }

    setDuration(duration: number) {
        this.node.active = true;
        this.duration = duration;
        return this;
    }

    play(duration?: number): void {
        this.duration = duration;
        this.node.active = true;
        this.setPercent(100);
        if (this.dot)
            this.dot.active = true;

        let delta = 0;
        // let delta = timeRemain ? this.duration - timeRemain : 0;
        this.schedule((dt: number) => {
            try {
                delta += dt;
                if (delta >= this.duration) {
                    this.stop();
                    return;
                }
                let timeLeft = this.duration - delta;
                let ratio = timeLeft / this.duration;
                this.setPercent(ratio * 100);
            } catch (error) {
                console.log(error);
            }
        }, 0.05);
    }
}
