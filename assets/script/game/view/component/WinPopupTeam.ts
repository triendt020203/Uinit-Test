import { ResultEntrySpades, ResultSpades } from "../../entities/ResultSpades";
import GameScene from "../GameScene";
import { cyberGame } from "../../../main/CyberGame";
import SocketControl from "../../SocketControl";
import PlayerTeam from "../player/PlayerTeam";
import { ResultEntryTeam, ResultTeam } from "../../entities/ResultTeam";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WinPopupTeam extends cc.Component {

    @property({ type: [PlayerTeam] })
    players: PlayerTeam[] = [];

    @property(cc.Node)
    team: cc.Node = null;

    gameScene: GameScene;

    team1made: number = 0;
    team1bid: number = 0;
    team1roungBag: number = 0;
    team1bonus: number = 0;
    team1point: number = 0;
    team1ttbag: number = 0;
    team1bagpenty: number = 0;
    team1ttpoint: number = 0;

    team2made: number = 0;
    team2bid: number = 0;
    team2roungBag: number = 0;
    team2bonus: number = 0;
    team2point: number = 0;
    team2ttbag: number = 0;
    team2bagpenty: number = 0;
    team2ttpoint: number = 0;

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
        this.updateTeams(data);
        
    }

    updateTeam1(data: ResultTeam): void {
        for (let i = 0; i < data.myTeam.member.length; i++){
            let seat = this.gameScene.seatManager.getSeatByGuserid(data.myTeam.member[i].guserid);
            if (seat.index == 0) {
                this.players[0].updateWinResultTeam(data.myTeam.member[i]);
                this.players[0].setAvatar(seat.avatar.node.getComponent(cc.Sprite).spriteFrame);
                this.players[0].node.active = true;
            }
            else if (seat.index == 2) {
                this.players[2].updateWinResultTeam(data.myTeam.member[i]);
                this.players[2].setAvatar(seat.avatar.node.getComponent(cc.Sprite).spriteFrame);
                this.players[2].node.active = true;
            }
        }
    }

    updateTeam2(data: ResultTeam): void {
        for (let i = 0; i < data.oppTeam.member.length; i++){
            let seat = this.gameScene.seatManager.getSeatByGuserid(data.oppTeam.member[i].guserid);
            if (seat.index == 1) {
                this.players[1].updateWinResultTeam(data.oppTeam.member[i]);
                this.players[1].setAvatar(seat.avatar.node.getComponent(cc.Sprite).spriteFrame);
                this.players[1].node.active = true;
            }
            else if (seat.index == 3) {
                this.players[3].updateWinResultTeam(data.oppTeam.member[i]);
                this.players[3].setAvatar(seat.avatar.node.getComponent(cc.Sprite).spriteFrame);
                this.players[3].node.active = true;
            }
        }
    }

    updateTeams(data: ResultTeam): void {
        this.updateTeam1(data);
        this.updateTeam2(data);
        this.team.getChildByName("madeBid1").getComponent(cc.Label).string = data.myTeam.made.toString() + "/" + data.myTeam.bid.toString();
        this.team.getChildByName("RoundBags1").getComponent(cc.Label).string = data.myTeam.bag.toString()
        this.team.getChildByName("Bonus1").getComponent(cc.Label).string = data.myTeam.bonus.toString()
        this.team.getChildByName("RoundPoint1").getComponent(cc.Label).string = data.myTeam.point.toString()
        this.team.getChildByName("TotalBags1").getComponent(cc.Label).string = data.myTeam.totalBag.toString()
        this.team.getChildByName("BagPenalty1").getComponent(cc.Label).string = data.myTeam.fiveBagPen.toString()
        this.team.getChildByName("TOTALPOINT1").getComponent(cc.Label).string = data.myTeam.totalPoint.toString()

        this.team.getChildByName("madeBid2").getComponent(cc.Label).string = data.oppTeam.made.toString() + "/" + data.oppTeam.bid.toString();
        this.team.getChildByName("RoundBags2").getComponent(cc.Label).string = data.oppTeam.bag.toString()
        this.team.getChildByName("Bonus2").getComponent(cc.Label).string = data.oppTeam.bonus.toString()
        this.team.getChildByName("RoundPoint2").getComponent(cc.Label).string = data.oppTeam.point.toString()
        this.team.getChildByName("TotalBags2").getComponent(cc.Label).string = data.oppTeam.totalBag.toString()
        this.team.getChildByName("BagPenalty2").getComponent(cc.Label).string = data.oppTeam.fiveBagPen.toString()
        this.team.getChildByName("TOTALPOINT2").getComponent(cc.Label).string = data.oppTeam.totalPoint.toString()
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