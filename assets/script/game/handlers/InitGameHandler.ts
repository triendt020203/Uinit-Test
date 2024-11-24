import { cyberGame } from '../../main/CyberGame';
import Game from '../Game';
import GameScene from '../view/GameScene';
import AbstractHandler from './AbstractHandler';

class InitGameHandler extends AbstractHandler {

    constructor(game: Game) {
        super(game);
    }

    execute(): void {
        cc.Label.clearCharCache();
        cc.director.loadScene("game", (err: any, scene: cc.Scene) => {
            if (!err) {
                this.game.screen = scene.getChildByName("Canvas").getComponent(GameScene);
                this.game.screen.setGame(this.game);
                this.game.screen.node.once(cyberGame.event.GameEvent.GAMESCENE_LAUNCHED, () => {
                    this.game.screenReady = true;
                    this.game.releaseCurrentQueue();
                });
                this.game.screen.node.on(cyberGame.event.GameEvent.QUEUE_COMPLETE, (task: string) => {
                    this.game.releaseCurrentQueue();
                });
                cyberGame.storage.put("currentScene", "game");
                cyberGame.audio.pauseMusic();
            }
        });
    }
}
export default InitGameHandler;