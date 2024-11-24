import LobbyController from "../controllers/LobbyController";
import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LobbyCreateGamePopup extends cc.Component {

    @property(cc.Slider)
    betSlider: cc.Slider = null;

    @property(cc.Label)
    betText: cc.Label = null;

    currentBet = 5000;

    ratioMap = [{
        value: 5000
    }, {
        value: 10000
    }, {
        value: 20000
    }, {
        value: 50000
    }, {
        value: 100000
    }, {
        value: 200000
    }, {
        value: 300000
    }, {
        value: 500000
    }, {
        value: 1000000
    }, {
        value: 2000000
    }, {
        value: 5000000
    }];

    start() {

    }

    onSlider() {
        //console.log(this.betSlider.handle.node.x, this.betSlider.handle.node.y);
        let p = Math.round(this.betSlider.progress * 100 / 10);
        this.currentBet = this.ratioMap[p].value;
        this.betText.string = cyberGame.utils.shortenLargeNumber(this.ratioMap[p].value, 0);
    }

    closeCreateGamePopup() {
        cyberGame.audio.playButton();
    }

    closePopup() {
        cyberGame.audio.playButton();
        this.hide();
    }

    openPopup() {
        cyberGame.audio.playButton();
        this.node.active = true;
        let node = this.node.getChildByName("creategame_popup_bg");
        node.setScale(0.8);
        cc.tween(node)
            .to(0.8, { scale: 1 }, { easing: 'elasticOut' })
            .start();
    }

    hide() {
        this.node.active = false;
    }

}
