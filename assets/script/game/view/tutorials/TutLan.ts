import { cyberGame } from "../../../main/CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TutLan extends cc.Component {

    protected start(): void {
        this.showStep(1);
    }

    showStep(num: number) {
        let node = this.node.getChildByName("step" + num)
        node.active = true;
        node.opacity = 120;
        cc.tween(node)
            .to(0.7, { opacity: 255 })
            .call(() => {
            })
            .start();

        let girl = node.getChildByName("girl");
        girl.scale = 0.9;
        cc.tween(girl)
            .to(0.3, { scale: 1 })
            .call(() => {
            })
            .start();

        if (num == 1) {
            this.scheduleOnce(() => {
                let node = this.node.getChildByName("next_button");
                node.active = true;
            }, 0);
        } else {
            this.scheduleOnce(() => {
                let node = this.node.getChildByName("next_button2");
                node.active = true;
            }, 1.5);
        }
    }

    hideStep(num: number) {
        let node = this.node.getChildByName("step" + num);
        node.active = false;
    }

    nextStep() {
        cyberGame.audio.playButton();
        this.node.getChildByName("next_button").active = false;
        this.hideStep(1);
        this.showStep(2);
    }

    goToTutScene() {
        cyberGame.audio.playButton();
        this.node.getChildByName("next_button2").active = false;
        cc.director.loadScene("tutorial");
    }
}