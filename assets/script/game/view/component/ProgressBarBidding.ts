
const { ccclass } = cc._decorator;

@ccclass
export default class ProgressBarBidding extends cc.Component {

    get progressBar() {
        return this.node.getComponent(cc.ProgressBar);
    }

    updateProgress(): void {
        let duration = 15;
        let elapsedTime = 0;
        this.schedule((dt: number) => {
            if (elapsedTime < duration) {
                elapsedTime += dt;
                this.progressBar.progress = (duration - elapsedTime) / duration;
            } else {
                this.progressBar.progress = 0;
                this.unscheduleAllCallbacks();
            }
        }, 0.05);
    }

    stopProgress(): void {
        this.unscheduleAllCallbacks();
    }
}
