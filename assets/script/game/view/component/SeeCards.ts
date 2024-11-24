import ProgressBarBidding from "./ProgressBarBidding";
import SocketControl from "../../SocketControl";
import { cyberGame } from "../../../main/CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SeeCards extends cc.Component {

    progressBar: ProgressBarBidding = null;
    clicked: boolean = false;
    gameScene: any;

    init(gameScene: any): void {
        this.gameScene = gameScene;
    }

    protected onLoad(): void {
        this.progressBar = this.node.getChildByName("ProgressBar").getComponent(ProgressBarBidding);
    }


    protected onEnable(): void {
        this.progressBar.updateProgress();
        this.node.setScale(0.8);
        cc.tween(this.node)
            .to(0.8, { scale: 1 }, { easing: 'elasticOut' })
            .start();
    }

    protected onDisable(): void {
        this.progressBar.stopProgress();
    }

    show(): void {
        this.node.active = true;
        this.clicked = false;
    }

    seeCards(): void {
        cyberGame.audio.playSound('coinmove');
        if (!this.clicked) {
            let teamSeatBid = this.gameScene.seatManager.getSeatAt(2).user.bid;
            let seat = this.gameScene.seatManager.getSeatByGuserid(this.gameScene.game.currentTurn);
            this.openCard();
            SocketControl.instance.seeCards();
            let rcn = seat.cardControl.recommendTeam(teamSeatBid);
            this.gameScene.bidPopup.show(rcn);
        }
        this.hide();
    }

    openCard(): void {
        if (!this.clicked){
            let seat = this.gameScene.seatManager.getSeatByGuserid(this.gameScene.game.currentTurn);
            seat.user.seeCards = true;
            seat.cardControl.openCardOnHand();
        }
    }

    blindNil(): void {
        cyberGame.audio.playSound('coinmove');
        this.hide();
        if (!this.clicked) {
            SocketControl.instance.sendBlind();
            this.clicked = true;
        }
        this.hide();
    }

    hide(): void {
        this.node.active = false;
    }
}