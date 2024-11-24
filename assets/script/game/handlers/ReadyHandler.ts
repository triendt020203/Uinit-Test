import Player from '../entities/Player';
import Game from '../Game';
import AbstractHandler from './AbstractHandler';

class ReadyHandler extends AbstractHandler {

    constructor(game: Game) {
        super(game);
    }

    execute(params: SFS2X.SFSObject): void {
        if (!params.containsKey('error')) {
            let guserid = params.getUtfString('guserid');
            let player: Player = this.game.getUser(guserid);
            if (player) {
                player.ready = true;
                this.screen.seatManager.highLightPlayer(player);
            }
        }
        this.game.releaseCurrentQueue();
    }
}
export default ReadyHandler;