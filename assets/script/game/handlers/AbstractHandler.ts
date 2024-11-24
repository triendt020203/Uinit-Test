import Game from '../Game';

export default class AbstractHandler {
    game: Game = null;

    constructor(gameCore: Game) {
        this.game = gameCore;
    }

    /**
     * Abstract method so implementation required
     */
    execute(params: any) {

    }

    get playerManager() {
        return this.game.playerManager;
    }

    get screen() {
        return this.game.screen;
    }

    get room() {
        return this.game.room;
    }
}