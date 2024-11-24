import Game from "../Game";
import AbstractHandler from "./AbstractHandler";
import { ScoreInfo } from "../entities/ScoreInfo";
import { ScoreTeam } from "../entities/ScoreTeam";

class ScoreInfoHandler extends AbstractHandler {
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
                let resultData = new ScoreInfo(params, this.game.mySelf.name, 0);
                this.screen.showFullScore(resultData);
            } else {
                let resultData = new ScoreTeam(params, this.game.mySelf.name);
                this.screen.showTeamScore(resultData);
            }
            this.game.releaseCurrentQueue();
        } catch (error) {
            this.game.releaseCurrentQueue();
            console.log("ScoreInfoHandler exception", error);
        }
    }
}
export default ScoreInfoHandler;