import AbstractHandler from './AbstractHandler';
import Game from '../Game';
import { ResultSpades } from '../entities/ResultSpades';
import { ResultTeam } from '../entities/ResultTeam';

class GameOverHandler extends AbstractHandler {

    constructor(game: Game) {
        super(game);
    }

    execute(params: SFS2X.SFSObject): void {
        try {
            if (!this.game.inited) {
                this.game.releaseCurrentQueue();
                return;
            }
            if (this.game.teamMode != true) {
                let resultData = new ResultSpades(params, this.game.mySelf.name, 0);
                setTimeout(() => {
                    this.screen.updateWinGame(resultData);
                }, 100);
            } else {
                let resultData = new ResultTeam(params, this.game.mySelf.name, 1);
                setTimeout(() => {
                    this.screen.updateWinGameTeam(resultData);
                }, 100);
            }
            this.screen.gameFinished = true;
        }
        catch (error) {
            this.game.releaseCurrentQueue();
            console.log("GameOverHandler exception", error);
        }
    }
}
export default GameOverHandler;