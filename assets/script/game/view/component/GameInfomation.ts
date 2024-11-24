import { ResultEntrySpades, ResultSpades } from "../../entities/ResultSpades";
import { ResultTeam } from "../../entities/ResultTeam";
import SocketControl from "../../SocketControl";
import GameScene from "../GameScene";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameInfomation extends cc.Component {

    gameScene: GameScene;

    @property(cc.Label)
    betNum: cc.Label = null;
    @property(cc.Label)
    targetPoint: cc.Label = null;

    @property(cc.Label)
    point1: cc.Label = null;
    @property(cc.Label)
    point2: cc.Label = null;
    @property(cc.Label)
    point3: cc.Label = null;
    @property(cc.Label)
    point4: cc.Label = null;

    @property(cc.Label)
    bag1: cc.Label = null;
    @property(cc.Label)
    bag2: cc.Label = null;
    @property(cc.Label)
    bag3: cc.Label = null;
    @property(cc.Label)
    bag4: cc.Label = null;
    
    @property(cc.Label)
    team1p: cc.Label = null;
    @property(cc.Label)
    team2p: cc.Label = null;
    @property(cc.Label)
    team1b: cc.Label = null;
    @property(cc.Label)
    team2b: cc.Label = null;

    init(gameScene: any): void {
        this.gameScene = gameScene;
    }

    editTeamMode():void{
        this.node.getChildByName("pointPopup").active = false;
        this.node.getChildByName("pointPopupTeam").active = true;
    }

    updateRoundPoint(data: ResultSpades): void {
        if (data.my) {
            this.point1.getComponent(cc.Label).string = data.my.totalPoint.toString();
            this.bag1.getComponent(cc.Label).string = data.my.totalbag.toString();
        }
        for (let i = 0; i < data.players.length; i++) {
            let entry: ResultEntrySpades = data.players[i];
            let seat = this.gameScene.seatManager.getSeatByGuserid(entry.guserid);
            if (seat.index == 1) {
                this.point2.getComponent(cc.Label).string = data.players[i].totalPoint.toString();
                this.bag2.getComponent(cc.Label).string = data.players[i].totalbag.toString();
            }
            else if (seat.index == 2) {
                this.point3.getComponent(cc.Label).string = data.players[i].totalPoint.toString();
                this.bag3.getComponent(cc.Label).string = data.players[i].totalbag.toString();
            }
            else if (seat.index == 3) {
                this.point4.getComponent(cc.Label).string = data.players[i].totalPoint.toString();
                this.bag4.getComponent(cc.Label).string = data.players[i].totalbag.toString();
            }
        }
    }

    updateGamePoint(): void {
        this.point1.getComponent(cc.Label).string = "0";
        this.point2.getComponent(cc.Label).string = "0";
        this.point3.getComponent(cc.Label).string = "0";
        this.point4.getComponent(cc.Label).string = "0";

        this.bag1.getComponent(cc.Label).string = "0";
        this.bag2.getComponent(cc.Label).string = "0";
        this.bag3.getComponent(cc.Label).string = "0";
        this.bag4.getComponent(cc.Label).string = "0";

    }

    updateReconnect(result): void {
        this.point1.getComponent(cc.Label).string = result[0].ttpoint.toString();
        this.point2.getComponent(cc.Label).string = result[1].ttpoint.toString();
        this.point3.getComponent(cc.Label).string = result[2].ttpoint.toString();
        this.point4.getComponent(cc.Label).string = result[3].ttpoint.toString();

        this.bag1.getComponent(cc.Label).string = result[0].ttbag.toString();
        this.bag2.getComponent(cc.Label).string = result[1].ttbag.toString();
        this.bag3.getComponent(cc.Label).string = result[2].ttbag.toString();
        this.bag4.getComponent(cc.Label).string = result[3].ttbag.toString();

    }

    updateRoundPointTeam(data:ResultTeam): void {
        this.team1p.getComponent(cc.Label).string = data.myTeam.totalPoint.toString();
        this.team2p.getComponent(cc.Label).string = data.oppTeam.totalPoint.toString(); 
        this.team1b.getComponent(cc.Label).string= data.myTeam.totalBag.toString();
        this.team2b.getComponent(cc.Label).string= data.oppTeam.totalBag.toString();
    }

    updateGamePointTeam(): void {
        this.team1p.getComponent(cc.Label).string = "0";
        this.team2p.getComponent(cc.Label).string = "0";
        this.team1b.getComponent(cc.Label).string= "0";
        this.team2b.getComponent(cc.Label).string= "0";
    }

    updateReconnectTeam(): void {

    }

    popupGameInfo(): void {
        SocketControl.instance.sendRequestInfoScore();
    }
}