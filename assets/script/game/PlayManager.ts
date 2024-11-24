import Player from "./entities/Player";
import Game from "./Game";

class PlayerManager {

    readonly game: Game = null;
    readonly players: Map<string, Player>;

    constructor(gameCore: Game) {
        this.game = gameCore;
        this.players = new Map<string, Player>();
    }

    /**
     * Add a user to map
     * 
     * @param {*} user - entities/Player
     */
    add(user: Player): void {
        if (!this.has(user.guserid))
            this.players.set(user.guserid, user);
        else
            throw new Error("User id " + user.guserid + " is already added");
    }

    has(guserid: string): boolean {
        return this.players.has(guserid);
    }

    isPlayer(guserid: string): boolean {
        if (!guserid)
            return this.has(this.myId);
        else
            return this.has(guserid);
    }

    getPlayer(guserid: string): Player {
        return this.has(guserid) ? this.players.get(guserid) : null;
    }

    getCurrentPlayer(): Player {
        return this.getPlayer(this.myId);
    }

    clear(): void {
        this.players.clear();
    }

    get myId(): string {
        return this.game.mySelf.name;
    }

    get size(): number {
        return this.players.size;
    }

    destroy(): void {
        this.players.clear();
    }

}
export default PlayerManager;