import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ConnectingScene extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    start() {
        this.connect();
        cc.director.preloadScene("home");
    }

    connect() {
        cyberGame.socket.connect();
        this.schedule(() => {
            if (cyberGame.socket.isConnectionReady()) {
                this.unscheduleAllCallbacks();
                cc.director.loadScene("home");
            }
        }, 0.3);
    }

}