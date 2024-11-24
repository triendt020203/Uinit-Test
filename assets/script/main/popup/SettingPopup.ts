import { cyberGame } from "../CyberGame";
import HomeScreen from "../scenes/HomeScreen";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SettingPopup extends cc.Component {

    @property(cc.Toggle)
    soundToggle: cc.Toggle = null;

    @property(cc.Toggle)
    musicToggle: cc.Toggle = null;

    @property(cc.Button)
    redeemButton: cc.Button = null;

    @property(cc.Button)
    enButton: cc.Button = null;

    @property(cc.Button)
    thButton: cc.Button = null;

    homeScene: HomeScreen = null;

    setScene(scene: any) {
        this.homeScene = scene;
    }

    start() {
        //this.node.getChildByName("wrapper").getChildByName("idTxt").getComponent(cc.Label).string = "ID: " + cyberGame.player.guserid;
        if (cyberGame.audio.soundEnabled)
            this.soundToggle.check();
        else
            this.soundToggle.uncheck();
        if (cyberGame.audio.musicEnabled)
            this.musicToggle.check();
        else
            this.musicToggle.uncheck();
        this.redeemButton.node.on('click', this.onRedeem, this);
    }

    protected onEnable(): void {
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, true);

        if (cyberGame.lang.code == "en") {
            this.enButton.node.opacity = 255;
            this.thButton.node.opacity = 100;
            this.thButton.node.once("click", this.onLangChange, this);
        } else {
            this.enButton.node.opacity = 100;
            this.thButton.node.opacity = 255;
            this.enButton.node.once("click", this.onLangChange, this);
        }

        let node = this.node.getChildByName("wrapper");
        node.setScale(0.8);
        cc.tween(node)
            .to(0.8, { scale: 1 }, { easing: 'elasticOut' })
            .start();
    }

    protected onDisable(): void {
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, false);
        FBInstant.player.setDataAsync({
            m: cyberGame.audio.musicEnabled,
            s: cyberGame.audio.soundEnabled
        });
    }

    onRedeem() {
        this.closePopup();
        this.homeScene.showRedeemPopup();
    }

    onSoundToggle(toggle: cc.Toggle) {
        cyberGame.audio.soundEnabled = toggle.isChecked;
        cyberGame.audio.playButton();
    }

    onMusicToggle(toggle: cc.Toggle) {
        cyberGame.audio.musicEnabled = toggle.isChecked;
        cyberGame.audio.playButton();
        if (cyberGame.audio.musicEnabled) {
            cyberGame.audio.loadThenPlayMusic();
        } else {
            cyberGame.audio.stopMusic();
        }
    }

    closePopup() {
        cyberGame.audio.playButton();
        this.node.destroy();
    }

    onLangChange() {
        let overlayLoader = cyberGame.createOverlay();
        this.node.addChild(overlayLoader);
        this.scheduleOnce(() => {
            cyberGame.setLocale(cyberGame.lang.code == "en" ? "th_TH" : "en_US");
            FBInstant.player.setDataAsync({ gameLocale: cyberGame.lang.locale });
            cc.director.loadScene("home");
        }, 0.1);
    }

}
