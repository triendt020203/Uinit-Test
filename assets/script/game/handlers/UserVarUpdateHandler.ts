import Game from '../Game';
import AbstractHandler from './AbstractHandler';

class UserVarUpdateHandler extends AbstractHandler {

    constructor(game: Game) {
        super(game);
    }

    execute(event: any): void {
        let guserid = event.user.name;
        let user = this.game.getUser(guserid);
        if (user) {
            user.coin = event.user.getVariable('coin').value;
            if (!this.screen.gameFinished) {
                let seat = this.screen.seatManager.getSeatByGuserid(guserid);
                if (seat) {
                    seat.updateCoin(user.coin);
                }
            }
        }
        this.game.releaseCurrentQueue();
    }
}
export default UserVarUpdateHandler;