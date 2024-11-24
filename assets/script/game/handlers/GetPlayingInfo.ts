import AbstractHandler from './AbstractHandler';
import CardEntity from '../entities/CardEntity';
import Player from '../entities/Player';
import { GameState } from '../constants/GameState';
import Game from '../Game';
import SocketControl from '../SocketControl';
import CardUtil from '../util/CardUtil';
class GetPlayingInfo extends AbstractHandler {

    private executedAtLeastOnce: boolean;

    constructor(gameCore: Game) {
        super(gameCore);
        this.executedAtLeastOnce = false;
    }

    execute(params: SFS2X.SFSObject): void {
        if (!this.game.inited) {
            this.updateGameState(params);
            this.screen.updateGameState();
            this.game.inited = true;
        }
        this.game.releaseCurrentQueue();
    }

    updateGameState(params: SFS2X.SFSObject): void {
        this.game.gameState = params.getUtfString("gameState");

        if (this.game.gameState != GameState.WAITING) {
            if (this.game.gameState == GameState.PLAYING) {
                this.game.playing = true;
                this.game.spadeBroken = params.getBool("spadeBroken")
                this.game.leadCard = params.getInt('leadCard')
            } else if (this.game.gameState == GameState.BIDDING) {
                this.game.bidding = true;
            }
            this.playerManager.clear();
            this.game.currentTurn = params.getUtfString("currentTurn");
            this.game.dealer = params.getUtfString("dealer");
            this.game.timeRemain = params.getInt("timerRemain") || 0;
        } else
            this.game.playing = false;

        this.addUsers(params);
        this.initBoardPosition();

        if (this.game.playing || this.game.bidding) {
            this.updatePlayingState(params);
        }
        else {
            if (!this.executedAtLeastOnce) {
                SocketControl.instance.ready();
                this.executedAtLeastOnce = true;
            }
        }
    }

    initBoardPosition(): void {
        this.game.boardPositions.length = 0;
        let position = this.game.getUser(this.game.mySelf.name).position;
        this.game.boardPositions.push(position);
        let i = position;
        do {
            i = (i + 1 >= 4) ? 0 : (i + 1);
            if (i == position) {
                break;
            }
            this.game.boardPositions.push(i);
        } while (true);
        this.game.userList.forEach((user: Player) => {
            for (let i = 0; i < this.game.boardPositions.length; i++) {
                if (this.game.boardPositions[i] == user.position) {
                    user.positionIndex = i;
                    break;
                }
            }
        })
    }

    updatePlayingState(params: SFS2X.SFSObject): void {
        let playerList = params.getSFSArray("playerList");
        for (let i = 0; i < playerList.size(); i++) {
            let obj = playerList.getSFSObject(i);
            let player = this.game.getUser(obj.getUtfString("guserid"));
            let card = obj.getInt("lastDump");
            player.lastDump = card;

            if (!player.ready) continue;
            player.playing = true;

            if (!player.isItMe) {
                for (let j = 0; j < player.numCard; j++)
                    player.cards.push(-1);
            } else {
                let cardIDs = obj.getIntArray("cards");
                for (let j = 0; j < cardIDs.length; j++) {
                    const cardEntity = CardEntity.getInstance(cardIDs[j]);
                    player.addCard(cardEntity);
                }
                CardUtil.sortCardEntityByValue(player.cards)
            }
            this.playerManager.add(player);
        }
    }

    addUsers(params: SFS2X.SFSObject): void {
        let playerList = params.getSFSArray("playerList");
        for (let i = 0; i < playerList.size(); i++) {
            let obj = playerList.getSFSObject(i);
            let guserid = obj.getUtfString("guserid");
            let sfsUser = this.game.room.getUserByName(guserid);
            let player: Player;
            if (sfsUser)
                player = new Player(sfsUser);
            else
                player = Player.newInstance(obj);

            player.position = obj.getInt('pos');
            player.ready = obj.containsKey('ready') ? obj.getBool('ready') : false;

            player.numCard = obj.containsKey('numCard') ? obj.getInt('numCard') : 13;
            player.seeCards = obj.containsKey('seeCards') ? obj.getBool('seeCards') : false;
            player.made = obj.containsKey('made') ? obj.getInt('made') : 0;
            player.bid = obj.containsKey('bid') ? obj.getInt('bid') : -1;
            player.ttpoint = obj.containsKey('totalPoint') ? obj.getInt('totalPoint') : 0;
            player.ttbag = obj.containsKey('totalBag') ? obj.getInt('totalBag') : 0;
            this.game.addUser(player);
        }
    }
}
export default GetPlayingInfo;