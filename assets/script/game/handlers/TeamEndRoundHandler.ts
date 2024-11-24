import Game from '../Game';
import AbstractHandler from './AbstractHandler';
import { ResultSpades } from '../entities/ResultSpades';

class TeamEndRoundHandler extends AbstractHandler {

    constructor(game: Game) {
        super(game);
    }

    execute(params: SFS2X.SFSObject): void {
        try {
            if (!this.game.inited) {
                this.game.releaseCurrentQueue();
                return;
            }
            let resultData = new ResultSpades(params, this.game.mySelf.name, 0);
            setTimeout(() => {
                this.screen.updateWinRound(resultData);
            }, 100);
            this.game.releaseCurrentQueue();
        } catch (error) {
            this.game.releaseCurrentQueue();
            console.log("TeamEndRoundHandler exception", error);
        }
    }
}
export default TeamEndRoundHandler;