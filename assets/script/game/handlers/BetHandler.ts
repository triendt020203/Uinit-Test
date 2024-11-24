import AbstractHandler from "./AbstractHandler";
import Game from "../Game";
import { cyberGame } from "../../main/CyberGame";
import { GameState } from "../constants/GameState";
import { GameInfo } from "../constants/GameInfo";

class BetHandler extends AbstractHandler {

    constructor(game: Game) {
        super(game);
    }

    execute(params: SFS2X.SFSObject): void {
        if (this.game.inited && this.game.gameState != GameState.WAITING && !params.containsKey("error")) {
            this.game.currentTurn = params.getUtfString("nextTurn");
            let guserid = params.getUtfString("guserid");
            let user = this.game.getUser(guserid);
            let bet = params.getInt("betBid");

            if (user) {
                user.bid = bet;
                this.updateBetV2(guserid)
            } else {
                this.game.releaseCurrentQueue();
            }
        } else {
            this.game.releaseCurrentQueue();
        }
    }

    updateBetV2(guserid: string): void {
        let bidCompleted = this.screen.seatManager.isBidComplete();
        let seat = this.screen.seatManager.getSeatByGuserid(guserid);
        seat.updateBid();
        this.updateNextTurn();
        if(this.game.teamMode !=true){
            this.screen.scorePopup.updateRealTime();
        } else{
            this.screen.scoreTeam.updateOnTime();
        }

        if (seat.user.isItMe){
            this.screen.bidPopup.hide();
            this.screen.seeCards.hide();
            if(this.game.teamMode){
                if(seat.user.seeCards != true)
                    seat.cardControl.openCardOnHand();
            }
        }

        if (bidCompleted) {
            this.game.gameState = GameState.PLAYING;
            this.game.playing = true;
            this.game.bidding = false;
            if (this.game.isMyTurn()) {
                cyberGame.audio.playSound('myturn');
                let seat = this.screen.seatManager.getSeatByGuserid(this.game.currentTurn);
                seat.cardControl.recommendCard(this.game);
            }
        }
        else {
            let nextTurn = this.screen.seatManager.getSeatByGuserid(this.game.currentTurn);
            nextTurn.biding();
            if (this.game.isMyTurn()) {

                if (this.game.teamMode == true) {
                    this.screen.seeCards.show();
                } else {
                    let bidRecommend = nextTurn.cardControl.recommendBid();
                    this.screen.bidPopup.show(bidRecommend);
                }
                cyberGame.audio.playSound('myturn');
            }
        }
        this.game.releaseCurrentQueue();
    }

    updateNextTurn(): void {
        this.screen.seatManager.hideTimers();
        let seat = this.screen.seatManager.getSeatByGuserid(this.game.currentTurn);
        seat.startTimer(GameInfo.TIME_COUNTDOWN_EACH_TURN);
    }
}
export default BetHandler;