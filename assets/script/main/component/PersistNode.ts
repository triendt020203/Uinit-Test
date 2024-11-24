import OverlayLoader from "./OverlayLoader";
import { cyberGame } from "../CyberGame";
import ConnectingScene from "../scenes/ConnectingScene";

const { ccclass } = cc._decorator;

@ccclass
export default class PersistNode extends cc.Component {

    private overlayLoader: any = null;
    private connecting: boolean = false;

    addConnectionLostEvent(): void {
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, this.onConnectionLost, this);
    }

    onConnectionLost(): void {
        if (cyberGame.storage.get("isHomeSceneStarted")) {
            this.connecting = false;
            this.node.getChildByName("DisconnectPopup").active = true;
            if (cc.director.getScene().name != "connect")
                cc.director.preloadScene("connect");
        }
    }

    onConnect(): void {
        if (this.connecting)
            return;
        this.connecting = true;
        cyberGame.audio.playButton();
        this.node.getChildByName("DisconnectPopup").active = false;
        if (cc.director.getScene().name != "connect") {
            this.showOverlayLoader();
            cc.director.loadScene("connect", (err: any) => {
                if (!err)
                    this.hideOverlayLoader();
            });
        } else
            cc.director.getScene().getChildByName("Canvas").getComponent(ConnectingScene).connect();
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
