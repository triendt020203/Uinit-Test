import { ResultEntrySpades, ResultSpades } from "../../entities/ResultSpades";
import GameScene from "../GameScene";
import PlayerWinPopup from "../player/PlayerWinPopup";
import { cyberGame } from "../../../main/CyberGame";
import SocketControl from "../../SocketControl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WinPopup extends cc.Component {

    @property({ type: [PlayerWinPopup] })
    players: PlayerWinPopup[] = [];

    gameScene: GameScene;

    start(): void {
        this.hide();
    }

    init(gameScene: any): void {
        this.gameScene = gameScene;
    }

    show(): void {
        this.node.getChildByName("overlay").active = true;
        this.node.getChildByName("bg").active = true;
    }

    updateData(data: ResultSpades): void {
        if (data.my) {
            this.players[0].updateWinResult(data.my);
            let myInfo = this.gameScene.seatManager.my;
            this.players[0].setAvatar(myInfo.avatar.node.getComponent(cc.Sprite).spriteFrame)
            this.players[0].node.active = true;
        }
        for (let i = 0; i < data.players.length; i++) {
            let entry: ResultEntrySpades = data.players[i];
            let seat = this.gameScene.seatManager.getSeatByGuserid(entry.guserid);
            if (seat.index == 1) {
                this.players[1].updateWinResult(data.players[i]);
                this.players[1].setAvatar(seat.avatar.node.getComponent(cc.Sprite).spriteFrame);
                this.players[1].node.active = true;
            }
            else if (seat.index == 2) {
                this.players[2].updateWinResult(data.players[i]);
                this.players[2].setAvatar(seat.avatar.node.getComponent(cc.Sprite).spriteFrame);
                this.players[2].node.active = true;
            }
            else if (seat.index == 3) {
                this.players[3].updateWinResult(data.players[i]);
                this.players[3].setAvatar(seat.avatar.node.getComponent(cc.Sprite).spriteFrame);
                this.players[3].node.active = true;
            }
        }
    }

    hide(): void {
        this.node.getChildByName("overlay").active = false;
        this.node.getChildByName("bg").active = false;
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].hide();
        }
    }

    onContinue(): void {
        cyberGame.audio.playButton();
        this.hide();
    }

    onQuitGame(): void {
        cyberGame.audio.playButton();
        this.hide();
        SocketControl.instance.switchedTable = false;
        this.gameScene.onForceLeaveRoom();
    }
}
