import AbstractHandler from './AbstractHandler';
import CardEntity from '../entities/CardEntity';
import Game from '../Game';
import { cyberGame } from '../../main/CyberGame';
import CardUtil from '../util/CardUtil';

class DealRoundHandler extends AbstractHandler {

    constructor(game: Game) {
        super(game);
    }

    execute(params: SFS2X.SFSObject): void {
        if (this.game.inited && !params.containsKey('error')) {
            this.game.currentTurn = params.getUtfString("currentTurn");
            this.game.dealer = params.getUtfString("dealer");
            this.game.leadCard = -1;
            this.game.spadeBroken = false;

            if (params.containsKey('cards')) {
                this.initCardsForCurrentPlayer(params.getIntArray('cards'));
                cyberGame.storage.put("interstitialShowingAllowed", true);
            }
            this.screen.updateDealCardRound();
            this.game.releaseCurrentQueue();
        } else
            this.game.releaseCurrentQueue();
    }

    initCardsForCurrentPlayer(cardIDs: number[]): void {
        const currentPlayer = this.playerManager.getCurrentPlayer();
        for (let i = 0; i < cardIDs.length; i++) {
            const cardEntity = CardEntity.getInstance(cardIDs[i]);
            currentPlayer.addCard(cardEntity);
        }
        CardUtil.sortCardEntityByValue(currentPlayer.cards)
    }
}
export default DealRoundHandler;