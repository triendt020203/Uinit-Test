import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Popup extends cc.Component {

    @property(cc.Label)
    popupContent: cc.Label = null;

    @property(cc.Button)
    actionButton: cc.Button = null;

    private options = null;

    start() {
        this.popupContent.string = this.options.content;

        if (this.options.hideOverlay === true)
            this.node.getChildByName("overlay").active = false;

        this.createTransition();
    }

    createTransition() {
        let wrapper = this.node.getChildByName("wrapper");
        var tweenTo = wrapper.y;
        wrapper.y = wrapper.y + 200;
        cc.tween(wrapper).to(0.5, { position: cc.v2(wrapper.x, tweenTo) as any, }, { easing: "backOut" })
            .call(() => {
                this.actionButton.node.once('click', this.onAction, this);
            })
            .start();
    }

    onAction() {
        this.closePopup();
    }

    onEnable() {
    }

    init(options: any) {
        this.options = options;
    }

    closePopup() {
        cyberGame.audio.playButton();
        this.node.destroy();
    }

}
