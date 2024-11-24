import Game from '../Game';
import AbstractHandler from './AbstractHandler';

class QuitGameHandler extends AbstractHandler {

    constructor(game: Game) {
        super(game);
    }

    execute(params: SFS2X.SFSObject): void {
        this.screen.hideOverlayLoader();
        this.game.releaseCurrentQueue();
    }
}
export default QuitGameHandler;