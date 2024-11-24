import Game from '../Game';
import AbstractHandler from './AbstractHandler';
import { ResultSpades } from '../entities/ResultSpades';
import { ResultTeam } from '../entities/ResultTeam';

class EndRoundHandler extends AbstractHandler {

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
                    this.screen.updateWinRound(resultData);
                }, 100);
            } else {
                let resultData = new ResultTeam(params, this.game.mySelf.name, 0);
                setTimeout(() => {
                    this.screen.updateWinRoundTeam(resultData);
                }, 100);
            }
            this.game.releaseCurrentQueue();
        } catch (error) {
            this.game.releaseCurrentQueue();
            console.log("EndRoundHandler exception", error);
        }
    }
}
export default EndRoundHandler;