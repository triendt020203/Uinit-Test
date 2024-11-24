import PlayerWinPopup from "../player/PlayerWinPopup";
import GameScene from "../GameScene";
import { ScoreInfo, ScoreInfoBoard } from "../../entities/ScoreInfo";
import { cyberGame } from "../../../main/CyberGame";
import { GameInfo } from "../../constants/GameInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScorePopup extends cc.Component {

    @property({ type: [PlayerWinPopup] })
    players: PlayerWinPopup[] = [];

    @property(cc.Node)
    preNode: cc.Node = null;

    @property(cc.Node)
    nextNode: cc.Node = null;

    gameScene: GameScene;
    data: ScoreInfo;
    rounds: ScoreInfoBoard[][] = [];
    private currentRound: number = 1;
    private limitRound: number;

    overlay: cc.Node;
    background: cc.Node;

    start(): void {
        this.hide();
    }

    init(gameScene: GameScene): void {
        this.gameScene = gameScene;
    }

    show(): void {
        this.togglePopup(true);
    }

    hide(): void {
        this.togglePopup(false);
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].hide();
        }
    }

    togglePopup(isVisible: boolean): void {
        this.overlay = this.node.getChildByName("overlay");
        this.background = this.node.getChildByName("bg");
        this.overlay.active = isVisible;
        this.background.active = isVisible;
    }

    updateRealTime(): void {
        if (this.currentRound === this.limitRound) {
            for (let i = 0; i < GameInfo.USER_GAME; i++) {
                const seat = this.gameScene.seatManager.getSeatAt(i);
                if (seat && this.players[seat.index]) {
                    this.players[seat.index].updateRealTime(seat.user);
                }
            }
        }
    }

    updateData(data: ScoreInfo): void {
        this.data = data;
        this.rounds = data.rounds || [];
        this.currentRound = this.limitRound = this.rounds.length;

        const hasRounds = this.rounds.length > 0;
        this.preNode.active = hasRounds;
        this.nextNode.active = hasRounds;

        data.players.forEach(entry => this.updatePlayerData(entry));
    }

    updatePlayerData(entry: ScoreInfoBoard): void {
        const seat = this.gameScene.seatManager.getSeatByGuserid(entry.guserid);
        if (seat && seat.index >= 0 && seat.index < this.players.length) {
            const player = this.players[seat.index];
            player.updateScoreResult(entry);
            player.setAvatar(seat.avatar.node.getComponent(cc.Sprite).spriteFrame);
            player.node.active = true;
        }
    }

    navigateRound(isNext: boolean): void {
        if (isNext && this.currentRound < this.limitRound - 1) {
            this.currentRound++;
            this.updatePreLate(this.rounds[this.currentRound]);
        } else if (!isNext && this.currentRound > 0) {
            this.currentRound--;
            this.updatePreLate(this.rounds[this.currentRound]);
        } else if (isNext && this.currentRound === this.limitRound - 1) {
            this.currentRound = this.limitRound;
            this.updateRealTime();
        }
    }

    preRound(): void {
        this.navigateRound(false);
    }

    nextRound(): void {
        this.navigateRound(true);
    }

    updatePreLate(data: ScoreInfoBoard[]): void {
        data.forEach(entry => this.updatePlayerData(entry));
    }

    closePopup(): void {
        cyberGame.audio.playButton();
        this.hide();
    }
}
