import AbstractHandler from './AbstractHandler';
import CardEntity from '../entities/CardEntity';
import { GameState } from '../constants/GameState';
import Game from '../Game';
import { cyberGame } from '../../main/CyberGame';
import Player from '../entities/Player';
import PlayerInfo from '../view/player/PlayerInfo';
import { GameInfo } from '../constants/GameInfo';
import CardUtil from '../util/CardUtil';

class DealCardHandler extends AbstractHandler {

    constructor(game: Game) {
        super(game);
    }

    execute(params: SFS2X.SFSObject): void {
        if (this.game.inited && !params.containsKey('error')) {
            this.addDisUsers(params.getSFSArray("playerList"));
            this.game.gameState = GameState.PLAYING;
            this.game.playing = true;
            this.game.currentTurn = params.getUtfString("currentTurn");
            this.game.dealer = params.getUtfString("dealer");
            this.game.leadCard = -1;
            this.game.spadeBroken = false;

            this.addPlayers(params.getSFSArray("playerList"));

            if (params.containsKey('cards')) {
                this.initCardsForCurrentPlayer(params.getIntArray('cards'));
                cyberGame.storage.put("interstitialShowingAllowed", true);
            }
            this.screen.updateDealCard();
            this.game.releaseCurrentQueue();
        } else
            this.game.releaseCurrentQueue();
    }

    initCardsForCurrentPlayer(cardIDs: number[]): void {
        const currentPlayer = this.playerManager.getCurrentPlayer();
        for (let i = 0; i < cardIDs.length; i++) {
            const cardEntity = CardEntity.getInstance(cardIDs[i]);
            currentPlayer.addCard(cardEntity);
        }
        CardUtil.sortCardEntityByValue(currentPlayer.cards)
    }

    addPlayers(playerList: SFS2X.SFSArray): void {
        for (let i = 0; i < playerList.size(); i++) {
            let guserid = playerList.getSFSObject(i).getUtfString("guserid");
            try {
                let user = this.game.getUser(guserid);
                if (user) {
                    user.playing = true;
                    user.numCard = GameInfo.TOTAL_CARDS_FOR_EACH_PLAYER - 1;
                    if (!user.isItMe) {
                        user.cards = [];
                        for (let j = 0; j < GameInfo.TOTAL_CARDS_FOR_EACH_PLAYER; j++)
                            user.cards.push(-1);
                    }
                    this.playerManager.add(user);
                }
            } catch (error) {
                console.log("add player id " + guserid + " exception: ", error);
                cyberGame.socket.disconnect();
            }
        }
    }

    addDisUsers(disUsers: SFS2X.SFSArray): void {
        for (let i = 0; i < disUsers.size(); i++) {
            let obj = disUsers.getSFSObject(i);
            let guserid = obj.getUtfString("guserid");

            if (!this.game.containsUser(guserid)) {
                let player = Player.newInstance(obj);
                player.position = obj.getInt('pos');
                player.ready = true;
                this.game.addUser(player);

                for (let p = 0; p < this.game.boardPositions.length; p++) {
                    if (this.game.boardPositions[p] == player.position) {
                        player.positionIndex = p;
                        break;
                    }
                }
                this.updateUserEnterRoom(player);
                this.screen.seatManager.highLightPlayer(player);
            }
        }
    }

    updateUserEnterRoom(user: Player): void {
        if (!this.game.playing)
            cyberGame.audio.playJoinRoomSound();

        const seat: PlayerInfo = this.screen.seatManager.getSeatAt(user.positionIndex);

        seat.updateData(user);
        this.screen.deskLayer.hideWatingPlayerText();
        console.log("crazy user enter room :D");
    }

}
export default DealCardHandler;