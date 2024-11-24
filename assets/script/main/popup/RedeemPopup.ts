import OverlayLoader from "../component/OverlayLoader";
import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RedeemPopup extends cc.Component {

    @property(cc.EditBox)
    private codeInput: cc.EditBox = null;

    private overlayLoader: any = null;

    start() {
        if (cyberGame.lang.code == "th") {
            let title = this.node.getChildByName("bg").getChildByName("title");
            title.y = title.y + 9;
            this.codeInput.placeholderLabel.string = "คลิกที่นี่เพื่อเข้าสู่";
        }
    }

    onExtensionResponse(event: any) {
        if (event.cmd == "gift.code") {
            this.hideOverlayLoader();
            let msg = event.params.containsKey('msg') ? event.params.getUtfString('msg') : null;
            if (msg == null) {
                msg = cyberGame.lang.code == "th" ? "รหัสไม่ถูกต้อง" : "Invalid code!";
                cyberGame.openCommonPopup({ content: msg });
            }
            this.closePopup();
        }
    }

    closePopup() {
        this.node.destroy();
    }

    onRedeem() {
        cyberGame.audio.playButton();
        let val = this.codeInput.string;
        if (val.length == 0) return;
        if (val.length < 8) {
            cyberGame.openCommonPopup({ content: cyberGame.lang.code == "th" ? "รหัสไม่ถูกต้อง" : "Invalid code!" });
            return;
        }
        this.node.getChildByName("bg").active = false;
        this.node.getChildByName("overlay").active = false;
        this.showOverlayLoader();

        let obj = new SFS2X.SFSObject();
        obj.putUtfString("code", val);
        cyberGame.socket.send(new SFS2X.ExtensionRequest("gift.code", obj));
    }

    protected onEnable(): void {
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse, this);

        let node = this.node.getChildByName("bg");
        node.setScale(0.8);
        cc.tween(node)
            .to(0.8, { scale: 1 }, { easing: 'elasticOut' })
            .start();
    }

    protected onDisable(): void {
        cyberGame.socket.removeEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse);
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

}
