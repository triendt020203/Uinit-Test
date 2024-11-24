import { cyberGame } from "../../../main/CyberGame";

const { ccclass } = cc._decorator;

@ccclass
export default class TutorialEndPopup extends cc.Component {
    onEnable() {
        this.node.opacity = 100;
        cc.tween(this.node)
            .to(0.4, { opacity: 255 })
            .start();
    }

    playNow(): void {
        cc.director.loadScene("home", (err: any) => {
            if (!err)
                cyberGame.audio.playSound('leaveRoom');
        });
    }
}