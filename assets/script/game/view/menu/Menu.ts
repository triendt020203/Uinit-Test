import { cyberGame } from "../../../main/CyberGame";
import SocketControl from "../../SocketControl";
import GameScene from "../GameScene";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Menu extends cc.Component {

    @property(cc.Node)
    soundOn: cc.Node = null;

    quitRegistered: boolean = false;

    gameScene: GameScene;

    rulePreloaded: boolean = false;

    ruleClicked: boolean = false;

    init(gameScene: GameScene) {
        this.gameScene = gameScene;
    }

    onEnable(): void {
        this.soundOn.getChildByName("off").active = cyberGame.audio.soundEnabled ? false : true;
        if (!this.rulePreloaded) {
            cc.resources.preload("gameprefab/Rule" + cyberGame.lang.code);
            this.rulePreloaded = true;
        }
    }

    onSoundOn(): void {
        cyberGame.audio.soundEnabled = !cyberGame.audio.soundEnabled;
        this.soundOn.getChildByName("off").active = cyberGame.audio.soundEnabled ? false : true;
    }

    onRule(): void {
        cyberGame.audio.playButton();
        this.hidePopup();
        if (!this.ruleClicked) {
            this.ruleClicked = true;
            cc.resources.load("gameprefab/Rule" + cyberGame.lang.code, cc.Prefab, (err, prefab: cc.Prefab) => {
                if (!err) {
                    this.gameScene.node.addChild(cc.instantiate(prefab));
                    this.ruleClicked = false;
                }
                else
                    console.log(err);
            });
        }
    }

    onSwitchRoom(): void {
        cyberGame.audio.playButton();
        this.quitRegistered = !this.quitRegistered;
        this.hidePopup();
        this.gameScene.onSwitchRoom();
    }

    onLeaveRoom(): void {
        cyberGame.audio.playButton();
        this.quitRegistered = !this.quitRegistered;
        this.hidePopup();
        SocketControl.instance.switchedTable = false;
        this.gameScene.onLeaveRoom();
    }

    hidePopup(): void {
        this.node.active = false;
    }
}
