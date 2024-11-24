import { cyberGame } from "../../main/CyberGame";
import { GameState } from "../constants/GameState";
import Game from "../Game";
import AbstractHandler from "./AbstractHandler";

class DumpCardHandler extends AbstractHandler {
    constructor(game: Game) {
        super(game);
    }

    execute(params: SFS2X.SFSObject): void {
        if (this.game.inited && this.game.gameState == GameState.PLAYING && !params.containsKey("error")) {
            this.game.currentTurn = params.containsKey("nextTurn") ? params.getUtfString("nextTurn") : null;
            let guserid = params.getUtfString("guserid");
            let user = this.game.getUser(guserid);
            let card = params.getInt("cards");
            if (user) {
                user.removeCards(card);
                this.updateDumpCard(guserid, card, params.containsKey("winner") ? params.getUtfString("winner") : null);
            } else
                this.game.releaseCurrentQueue();
        } else
            this.game.releaseCurrentQueue();
    }

    updateDumpCard(guserid: string, cardId: number, winner: string): void {
        if (cardId > 38 && this.game.spadeBroken == false) {
            this.screen.brokenSpadesPopup.show();
            this.game.spadeBroken = true;
        }

        if (this.game.leadCard == -1) {
            this.game.leadCard = cardId;
        }
        let seat = this.screen.seatManager.getSeatByGuserid(guserid);

        if (seat.user.isItMe) {
            this.screen.cardManager.dumpCards.dumpCards(seat, cardId);
            seat.cardControl.hideOverlay();
        } else {
            this.screen.cardManager.dumpCards.dumpOppCards(seat, cardId);
        }
        cyberGame.audio.playSound('chiabai');

        if (!winner) {
            this.screen.scheduleOnce(() => {
                this.screen.updateCurrentTurnV2(this.game.currentTurn);
                this.game.releaseCurrentQueue();
            }, 0.5);
        } else {
            this.screen.scheduleOnce(() => {
                this.updateWinTurn(winner)
                this.game.releaseCurrentQueue();
            }, 0.5);
        }
    }

    updateWinTurn(winner: string): void {
        this.game.leadCard = -1;
        let seat = this.screen.seatManager.getSeatByGuserid(winner);
        seat.updateNewBid();
        this.game.currentTurn = winner;
        setTimeout(() => {
            this.screen.cardManager.dumpCards.moveToWinner(seat);
            this.screen.updateCurrentTurnV2(this.game.currentTurn);
        }, 100);
    }
}
export default DumpCardHandler;