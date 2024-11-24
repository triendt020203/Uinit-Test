import OverlayLoader from "../component/OverlayLoader";
import { cyberGame } from "../CyberGame";

const { ccclass } = cc._decorator;

@ccclass
export default class TutorialPopup extends cc.Component {

    private tutLanNode: cc.Node = null;
    private overlayLoader: any = null;
    private clickedAtLeastOnce: boolean = false;

    start() {
        this.loadTutLan();
        if (!cyberGame.storage.get("isHomeSceneStarted")) {
            this.node.getChildByName("icon_close").active = false;
        }
    }

    private loadTutLan() {
        cyberGame.loadPrefab("prefab/TutLan", true).then((node: cc.Node) => {
            this.tutLanNode = node;
            if (cyberGame.storage.get("isHomeSceneStarted"))
                cc.director.preloadScene("tutorial");
        }).catch(() => {
            setTimeout(() => {
                this.loadTutLan();
            }, 1000);
        });
    }

    onEnable() {
        this.node.opacity = 100;
        cc.tween(this.node)
            .to(0.4, { opacity: 255 })
            .start();

        this.scaleEffect(this.desc1);
        this.scaleEffect(this.desc3);

        this.hand.scale = 1;
        this.tweenLoseDec();
    }

    scaleEffect(node: cc.Node): void {
        node.scale = 0.7;
        cc.tween(node)
            .to(0.3, { scale: 1 })
            .start();
    }

    private tweenLoseDec() {
        let node = this.hand;
        if (node.active == true) {
            cc.tween(node)
                .to(1, { scale: 0.85 })
                .call(() => {
                    this.tweenLoseInc();
                })
                .start()
        }
    }

    private tweenLoseInc() {
        let node = this.hand;
        if (node.active == true) {
            cc.tween(node)
                .to(1, { scale: 1.05 })
                .call(() => {
                    this.tweenLoseDec();
                })
                .start()
        }
    }

    closePopup() {
        cyberGame.audio.playButton();
        this.node.destroy();
    }

    playTutorial() {
        cyberGame.audio.playButton();
        if (this.clickedAtLeastOnce)
            return;
        this.clickedAtLeastOnce = true;
        if (this.tutLanNode != null) {
            this.tutLanNode.parent = this.node.parent;
            this.node.destroy();
        } else {
            this.showOverlayLoader();
            this.schedule(() => {
                if (this.tutLanNode != null) {
                    this.tutLanNode.parent = this.node.parent;
                    this.unscheduleAllCallbacks();
                    this.hideOverlayLoader();
                    this.node.destroy();
                }
            }, 0.1);
        }
    }

    showOverlayLoader(): void {
        if (!this.overlayLoader) {
            this.overlayLoader = cyberGame.createOverlay();
            this.node.addChild(this.overlayLoader);
        }
    }

    hideOverlayLoader(): void {
        if (this.overlayLoader) {
            this.overlayLoader.getComponent(OverlayLoader).close();
            this.overlayLoader = null;
        }
    }

    get desc1() {
        return this.node.getChildByName("bg").getChildByName("group1");
    }

    get desc3() {
        return this.node.getChildByName("bg").getChildByName("group3");
    }

    get hand() {
        return this.node.getChildByName("bg").getChildByName("hand");
    }
}