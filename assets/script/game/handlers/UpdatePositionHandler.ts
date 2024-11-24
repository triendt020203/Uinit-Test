import Player from '../entities/Player';
import Game from '../Game';
import PlayerInfo from '../view/player/PlayerInfo';
import AbstractHandler from './AbstractHandler';

class UpdatePositionHandler extends AbstractHandler {

    constructor(game: Game) {
        super(game);
    }

    execute(params: SFS2X.SFSObject): void {
        if (params.containsKey("guserid") && params.containsKey("pos")) {
            let guserid = params.getUtfString("guserid");
            let player = this.game.getUser(guserid);
            if (player) {
                player.position = params.getInt("pos");
                for (let i = 0; i < this.game.boardPositions.length; i++) {
                    if (this.game.boardPositions[i] == player.position) {
                        player.positionIndex = i;
                        break;
                    }
                }
                let resume = (this.game.playing || this.game.bidding) && this.playerManager.has(guserid) ? true : false;
                this.updateUserEnterRoom(player, resume);
            }
        }
        this.game.releaseCurrentQueue();
    }

    updateUserEnterRoom(user: Player, hasResume: boolean): void {
        if (hasResume) return;

        const seat: PlayerInfo = this.screen.seatManager.getSeatAt(user.positionIndex);
        seat.updateData(user);

        this.screen.deskLayer.hideWatingPlayerText();

        if (this.game.friendMode && this.screen.invitePopup)
            this.screen.invitePopup.updateUserEnterRoom(user);
    }
}
export default UpdatePositionHandler;