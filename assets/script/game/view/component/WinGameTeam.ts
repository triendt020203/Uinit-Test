import { cyberGame } from "../../../main/CyberGame";
import SocketControl from "../../SocketControl";
import GameScene from "../GameScene";
import PlayerWinGame from "../player/PlayerWinGame";
import { ResultEntryPlayerTeamGame, ResultTeam } from "../../entities/ResultTeam";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WinGameTeam extends cc.Component {
    @property({ type: [PlayerWinGame] })
    players: PlayerWinGame[] = [];

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

    updateData(data: ResultTeam): void {
        for (let i = 0; i < data.winTeamPlayers.length; i++) {
            data.winTeamPlayers.sort((a, b) => b.point - a.point);
        }
        for (let i = 0; i < data.winTeamPlayers.length; i++) {
            let entry: ResultEntryPlayerTeamGame = data.winTeamPlayers[i];
            let seat = this.gameScene.seatManager.getSeatByGuserid(entry.guserid);
            this.players[i].updateWinResult(data.winTeamPlayers[i]);
            this.players[i].setName(seat.user.displayName);
            this.players[i].setAvatar(seat.avatar.node.getComponent(cc.Sprite).spriteFrame);
            this.players[i].node.active = true;
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