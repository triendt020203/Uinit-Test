import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

const GIFT_TIME = 10800;

@ccclass
export default class SpinPopup extends cc.Component {

    @property(cc.Node)
    spinMain: cc.Node = null;

    @property(cc.Node)
    spinButton: cc.Node = null;

    @property(cc.Node)
    collectButton: cc.Node = null;

    private spinValue: number = 20000;

    private spinCoin: number = 0;

    private watched: boolean = false;

    start() {
        let buttonType = 0;
        let collectTime = cyberGame.storage.get("collectTime");

        if (collectTime < GIFT_TIME) {
            if (cyberGame.ad.ready && cyberGame.ad.spinCounter < 2 && GIFT_TIME - collectTime > 500)
                buttonType = 2;
            else {
                let spinTimeNode = this.spinButton.getChildByName("spinTime");
                spinTimeNode.active = true;
                spinTimeNode.getComponent(cc.Label).string = this.formatTime(GIFT_TIME - collectTime);
            }
        } else
            buttonType = 1;

        if (buttonType == 1)
            this.enableSpinButton();
        else if (buttonType == 2) {
            cc.game.once(cyberGame.event.AdsEvent.REWARD, this.onAdReward, this);

            this.spinButton.getChildByName("ads_icon").active = true;
            this.spinButton.getComponent(cc.Button).node.once('click', () => {
                cyberGame.ad.show(cyberGame.ad.SPIN_POSITION);
            });
        }

        let node = this.node.getChildByName('spin_wrap');
        node.setScale(0.6);
        cc.tween(node)
            .to(1, { scale: 1 }, { easing: 'elasticOut' })
            .start();
    }

    onEnable() {
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse, this);
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, true);
    }

    onDisable() {
        cyberGame.socket.removeEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse);
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, false);
    }

    onExtensionResponse(event: any) {
        if (event.cmd == "luckywheels.spin") {
            if (!event.params.containsKey("ad")) {
                cyberGame.storage.put("collectTime", 0);
                cyberGame.socket.initHeartBeat();
            } else
                cyberGame.ad.increaseSpinCounter();
            this.spinValue = event.params.getInt("value");
            this.spinCoin = event.params.getLong("coin");
            this.playSpin();
        }
    }

    onAdReward(params: any) {
        if (params.type == cyberGame.ad.SPIN_POSITION) {
            this.watched = true;
            this.spinButton.getChildByName("ads_icon").active = false;
            this.enableSpinButton();
        }
    }

    enableSpinButton() {
        this.spinButton.getChildByName("spin_text").active = true;
        this.spinButton.getComponent(cc.Button).node.once('click', () => {
            this.sendSpinRequest();
        })
    }

    sendSpinRequest() {
        this.node.getChildByName("icon_close").active = false;
        if (this.watched) {
            var params = new SFS2X.SFSObject();
            params.putBool("ad", true);
            cyberGame.socket.send(new SFS2X.ExtensionRequest('luckywheels.spin', params));
        } else
            cyberGame.socket.send(new SFS2X.ExtensionRequest('luckywheels.spin'));
    }

    playSpin() {
        this.spinMain.angle = 0;
        this.spinButton.getComponent(cc.Button).interactable = false;
        this.node.getChildByName("spin_wrap").getChildByName("spinAnim").getComponent(cc.Animation).play();

        const slicePrizes = [20000, 100000, 50000, 20000, 200000, 50000, 20000, 500000, 100000, 20000, 50000, 100000, 20000, 50000, 300000];
        const degrees = -slicePrizes.indexOf(this.spinValue) * 24;

        cc.tween(this.spinMain)
            .to(5, { angle: 360 * 5 - degrees }, { easing: 'cubicOut' })
            .call(() => {
                cc.director.getScheduler().setTimeScale(1);
                this.node.getChildByName("spin_wrap").getChildByName("spinArrowAnim").getComponent(cc.Animation).play();
                this.showResult();
            })
            .start();
        if (cyberGame.audio.soundEnabled) {
            this.getComponent(cc.AudioSource).play();
        }
    }

    showResult() {
        this.node.getChildByName("bg_claim").active = true;
        this.node.getChildByName("bg_claim").getChildByName("successText").getComponent(cc.Label).string = cyberGame.text("YOU_GOT_CHIP", cyberGame.utils.shortenLargeNumber(this.spinCoin, 0));

        // add collect click
        this.collectButton.getComponent(cc.Button).node.once('click', this.collectCoin, this);
    }

    collectCoin() {
        this.closePopup();

        // refresh request to server
        cyberGame.socket.send(new SFS2X.ExtensionRequest('profile.refreshCoin'));

        // show result popup
        cyberGame.openCommonPopup({ content: cyberGame.text("YOU_GOT_CHIP", cyberGame.utils.shortenLargeNumber(this.spinCoin, 0)) });
    }

    formatTime(t: number) {
        let hours = "0" + Math.floor(t / 60 / 60);
        let minutes = "0" + Math.floor((t - parseInt(hours) * 60 * 60) / 60);
        return hours.substr(-2) + " : " + minutes.substr(-2);
    }

    closePopup() {
        cyberGame.audio.playButton();
        this.node.destroy();
    }

}
