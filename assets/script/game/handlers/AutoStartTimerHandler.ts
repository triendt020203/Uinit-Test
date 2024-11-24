import Game from '../Game';
import AbstractHandler from './AbstractHandler';

class AutoStartTimerHandler extends AbstractHandler {

    constructor(game: Game) {
        super(game);
    }

    execute(params: SFS2X.SFSObject): void {
        try {
            if (this.game.inited) {
                this.screen.deskLayer.showStartCountDown(params.getInt('delay'));
                if (this.game.friendMode && this.screen.invitePopup)
                    this.screen.invitePopup.hide();
            }
        } catch (error) {
            console.log("AutoStartTimerHandler exception", error);
        }
        this.game.releaseCurrentQueue();
    }
}
export default AutoStartTimerHandler;