import { cyberGame } from "../../../main/CyberGame";
import { GameInfo } from "../../constants/GameInfo";
import { ScoreInfo, ScoreInfoBoard } from "../../entities/ScoreInfo";
import { ScoreTeam, ScoretEntryTeam } from "../../entities/ScoreTeam";
import SocketControl from "../../SocketControl";
import GameScene from "../GameScene";
import PlayerTeam from "../player/PlayerTeam";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScoreTeamPopup extends cc.Component {

    @property({ type: [PlayerTeam] })
    players: PlayerTeam[] = [];

    @property(cc.Node)
    preNode: cc.Node = null;

    @property(cc.Node)
    nextNode: cc.Node = null;

    @property(cc.Node)
    team: cc.Node = null;

    gameScene: GameScene;
    data: ScoreTeam;
    myRound: ScoretEntryTeam[][] = [];
    oppRound: ScoretEntryTeam[][] = [];
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

    updateData(data: ScoreTeam): void {
        this.updateRealTime(data);
        this.data = data;
        this.myRound = data.roundsmy;
        this.oppRound = data.roundsopp;
        this.currentRound = this.limitRound = this.myRound.length;

        const hasRounds = this.myRound.length > 0;
        this.preNode.active = hasRounds;
        this.nextNode.active = hasRounds;
    }

    updateOnTime(): void {
        if (this.currentRound === this.limitRound) {
            let team1made = 0;
            let team1bid = 0;
            let team2made = 0;
            let team2bid = 0;
            for (let i = 0; i < GameInfo.USER_GAME; i++) {
                const seat = this.gameScene.seatManager.getSeatAt(i);
                if (seat && this.players[seat.index]) {
                    this.players[seat.index].updateRealTime(seat.user);
                    if ((seat.index == 0 || seat.index == 2) && seat.user.bid > -1) {
                        team1made += seat.user.made;
                        team1bid += seat.user.bid;
                    } else if ((seat.index == 1 || seat.index == 3) && seat.user.bid > -1) {
                        team2made += seat.user.made;
                        team2bid += seat.user.bid;
                    }
                }
            }
            this.team.getChildByName("madeBid1").getComponent(cc.Label).string = team1made.toString() + "/" + team1bid.toString();
            this.team.getChildByName("madeBid2").getComponent(cc.Label).string = team2made.toString() + "/" + team2bid.toString();
        }
    }

    updateRealTime(data: ScoreTeam): void {
        this.updateMyTeam(data.myTeam);
        this.updateOppTeam(data.oppTeam)
    }

    updateMyTeam(data: ScoretEntryTeam): void {
        this.team.getChildByName("madeBid1").getComponent(cc.Label).string = data.made.toString() + "/" + data.bid.toString();
        this.team.getChildByName("RoundBags1").getComponent(cc.Label).string = data.bag.toString();
        this.team.getChildByName("Bonus1").getComponent(cc.Label).string = data.bonus.toString();
        this.team.getChildByName("RoundPoint1").getComponent(cc.Label).string = data.point.toString();
        this.team.getChildByName("TotalBags1").getComponent(cc.Label).string = data.totalBag.toString();
        this.team.getChildByName("BagPenalty1").getComponent(cc.Label).string = data.fiveBagPen.toString();
        this.team.getChildByName("TOTALPOINT1").getComponent(cc.Label).string = data.totalPoint.toString();

        for (let i = 0; i < data.member.length; i++) {
            let seat = this.gameScene.seatManager.getSeatByGuserid(data.member[i].guserid);
            if (seat.index == 0) {
                this.players[0].updateWinResultTeam(data.member[i]);
                this.players[0].setAvatar(seat.avatar.node.getComponent(cc.Sprite).spriteFrame);
                this.players[0].node.active = true;
            }
            else if (seat.index == 2) {
                this.players[2].updateWinResultTeam(data.member[i]);
                this.players[2].setAvatar(seat.avatar.node.getComponent(cc.Sprite).spriteFrame);
                this.players[2].node.active = true;
            }
        }
    }

    updateOppTeam(data: ScoretEntryTeam): void {
        this.team.getChildByName("madeBid2").getComponent(cc.Label).string = data.made.toString() + "/" + data.bid.toString();
        this.team.getChildByName("RoundBags2").getComponent(cc.Label).string = data.bag.toString();
        this.team.getChildByName("Bonus2").getComponent(cc.Label).string = data.bonus.toString();
        this.team.getChildByName("RoundPoint2").getComponent(cc.Label).string = data.point.toString();
        this.team.getChildByName("TotalBags2").getComponent(cc.Label).string = data.totalBag.toString();
        this.team.getChildByName("BagPenalty2").getComponent(cc.Label).string = data.fiveBagPen.toString();
        this.team.getChildByName("TOTALPOINT2").getComponent(cc.Label).string = data.totalPoint.toString();

        for (let i = 0; i < data.member.length; i++) {
            let seat = this.gameScene.seatManager.getSeatByGuserid(data.member[i].guserid);
            if (seat.index == 1) {
                this.players[1].updateWinResultTeam(data.member[i]);
                this.players[1].setAvatar(seat.avatar.node.getComponent(cc.Sprite).spriteFrame);
                this.players[1].node.active = true;
            }
            else if (seat.index == 3) {
                this.players[3].updateWinResultTeam(data.member[i]);
                this.players[3].setAvatar(seat.avatar.node.getComponent(cc.Sprite).spriteFrame);
                this.players[3].node.active = true;
            }
        }
    }

    preRound(): void {
        if (this.currentRound == 0)
            return;
        this.currentRound--;
        let dataMy = this.myRound[this.currentRound];
        let dataOpp = this.oppRound[this.currentRound];
        this.updateMyTeam(dataMy[0]);
        this.updateOppTeam(dataOpp[0]);
    }



    nextRound(): void {
        if (this.currentRound < this.limitRound - 1) {
            this.currentRound++;
            let dataMy = this.myRound[this.currentRound]
            let dataOpp = this.oppRound[this.currentRound]
            this.updateMyTeam(dataMy[0]);
            this.updateOppTeam(dataOpp[0]);
        } else {
            this.currentRound = this.limitRound;
            SocketControl.instance.sendRequestInfoScore();
        }
    }

    closePopup(): void {
        cyberGame.audio.playButton();
        this.hide();
    }
}
