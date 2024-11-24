import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AdsPopup extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    wrapper: cc.Node = null;

    watchCounter: number = 0;

    watchButton: cc.Node = null;

    start() {
        this.wrapper = this.node.getChildByName("rw_popup_bg");
        this.watchButton = this.wrapper.getChildByName("vid_watch_button");
        this.watchButton.getComponent(cc.Button).node.once('click', this.onWatchClick, this);

        if (cyberGame.lang.code == "th") {
            this.wrapper.getChildByName("title").y = this.wrapper.getChildByName("title").y + 15;
        }

        this.watchCounter = cyberGame.ad.watchCounter;
        if (this.watchCounter > cyberGame.ad.MAX_VIDEOS)
            this.watchCounter = cyberGame.ad.MAX_VIDEOS;

        let start = this.watchCounter < 5 ? 0 : this.watchCounter - 4;
        if (this.watchCounter == cyberGame.ad.MAX_VIDEOS)
            start = this.watchCounter - 5;
        let i = 0;
        while (i < 5) {
            let coin = start < 5 ? cyberGame.ad.REWARD_ARRAY[start] : cyberGame.ad.REWARD_ARRAY[4];
            this.wrapper.getChildByName("coin" + (i + 1)).getComponent(cc.Label).string = cyberGame.utils.formatCoinWithCommas(coin);

            if (start <= this.watchCounter - 1)
                this.wrapper.getChildByName("box" + (i + 1)).getChildByName("completeIcon").active = true;

            this.wrapper.getChildByName("txt" + (i + 1)).getComponent(cc.Label).string = (start + 1) + "";
            i++;
            start++;
        }

        this.updateAdsLeftCounter();

        if (cyberGame.ad.ready)
            this.disableButtonOverlay();
        else
            this.enableButtonOverlay();
    }

    onEnable() {
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, true);

        let node = this.node.getChildByName("rw_popup_bg");
        node.setScale(0.8);
        cc.tween(node)
            .to(0.8, { scale: 1 }, { easing: 'elasticOut' })
            .start();
    }

    onDisable() {
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, false);
    }

    onWatchClick() {
        if (!cyberGame.ad.ready) {
            this.node.destroy();
            cyberGame.openCommonPopup({ content: cyberGame.text("ADS_NOT_AVAILABLE") });
        } else {
            if (this.watchCounter < cyberGame.ad.MAX_VIDEOS)
                cyberGame.ad.show(cyberGame.ad.REWARDED_POPUP_POSITION);
            else
                cyberGame.openCommonPopup({ content: cyberGame.text("DAILY_ADS_REACHED") });
            this.node.destroy();
        }
    }

    updateAdsLeftCounter() {
        this.wrapper.getChildByName("adsLeft").getComponent(cc.Label).string = (cyberGame.ad.MAX_VIDEOS - this.watchCounter) + "";
    }

    enableButtonOverlay() {
        this.watchButton.getChildByName("vid_watch_button_overlay").active = true;
    }

    disableButtonOverlay() {
        this.watchButton.getChildByName("vid_watch_button_overlay").active = false;
    }

    closePopup() {
        cyberGame.audio.playButton();
        this.node.destroy();
    }

}
