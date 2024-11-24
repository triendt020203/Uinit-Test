import Game from '../Game';
import PlayerInfo from '../view/player/PlayerInfo';
import AbstractHandler from './AbstractHandler';

class UserExitRoomHandler extends AbstractHandler {

    constructor(game: Game) {
        super(game);
    }

    execute(params: SFS2X.SFSObject): void {
        try {
            if (this.game.inited && params.containsKey("guserid")) {
                let guserid = params.getUtfString("guserid");
                let player = this.game.getUser(guserid);
                if (player) {
                    // remove player
                    this.game.removeUser(player.guserid);

                    // rendering
                    this.updateUserExitRoom(player.guserid);
                }
            }
        } catch (error) {
            console.log("UserExitRoomHandler exception", error);
        }
        this.game.releaseCurrentQueue();
    }

    updateUserExitRoom(guserid: string): void {
        let seat: PlayerInfo = this.screen.seatManager.getSeatByGuserid(guserid);
        if (seat) {
            seat.updateData(null);
            if (!this.game.playing) {
                if (this.screen.seatManager.getSize() == 1) {
                    this.screen.deskLayer.hideStartCountDown();
                    this.screen.deskLayer.showWatingPlayerText();
                }
            } else
                seat.reset();
            if (this.game.friendMode && this.screen.invitePopup)
                this.screen.invitePopup.updateUserExitRoom(guserid, this.game.userCount);
        }
    }
}
export default UserExitRoomHandler;