import Player from '../entities/Player';
import AbstractHandler from './AbstractHandler';

class UserEnterRoomHandler extends AbstractHandler {

    constructor(gameCore: any) {
        super(gameCore);
    }

    execute(player: Player): void {
        this.game.addUser(player);
        this.game.releaseCurrentQueue();
    }
}
export default UserEnterRoomHandler;