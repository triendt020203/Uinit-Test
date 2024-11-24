import CardEntity from "../../entities/CardEntity";
import Player from "../../entities/Player";
import TutPlayerInfo from "./TutPlayerInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TutSeatManager extends cc.Component {

    @property({ type: [TutPlayerInfo] })
    players: TutPlayerInfo[] = [];

    gameScene: any;
    userList: Player[] = [];

    init(gameScene: any) {
        this.gameScene = gameScene;
        let my = Player.newTutInstance();
        my.guserid = "1";
        my.displayName = FBInstant.player.getName();
        my.avatar = FBInstant.player.getPhoto();
        my.coin = 500000;
        my.positionIndex = 0;
        my.playing = true;
        my.isItMe = true;
        let cardIDs = [2, 5, 9, 14, 18, 20, 21, 38, 39, 48, 49, 50, 51];
        for (let i = 0; i < cardIDs.length; i++) {
            const cardEntity = CardEntity.getInstance(cardIDs[i]);
            my.addCard(cardEntity);
        }
        this.userList.push(my);

        let opp_1 = Player.newTutInstance();
        opp_1.guserid = "2";
        opp_1.displayName = "Peter";
        opp_1.coin = 3450000;
        opp_1.isItMe = false;
        opp_1.positionIndex = 1;
        opp_1.numCard = 13;
        opp_1.cards = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
        opp_1.playing = true;
        this.userList.push(opp_1);

        let opp_2 = Player.newTutInstance();
        opp_2.guserid = "3";
        opp_2.displayName = "Parker";
        opp_2.coin = 7680000;
        opp_2.isItMe = false;
        opp_2.positionIndex = 2;
        opp_2.numCard = 13;
        opp_2.cards = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
        opp_2.playing = true;
        this.userList.push(opp_2);

        let opp_3 = Player.newTutInstance();
        opp_3.guserid = "4";
        opp_3.displayName = "Ben";
        opp_3.coin = 9320000;
        opp_3.isItMe = false;
        opp_3.positionIndex = 3;
        opp_3.numCard = 13;
        opp_3.cards = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
        opp_3.playing = true;
        this.userList.push(opp_3);
    }


    showCurrentPlayer() {
        const seat: TutPlayerInfo = this.getSeatAt(0);
        seat.updateDataTutorial(this.userList[0]);
    }

    allocate(): void {
        ;
        this.userList.forEach((user: Player) => {
            if (user.positionIndex >= 0) {
                const seat: TutPlayerInfo = this.getSeatAt(user.positionIndex);
                seat.updateData(user);
                seat.reset();
            }
        })
    }

    getSeatAt(idx: number): TutPlayerInfo {
        return this.players[idx];
    }

    getSeatByGuserid(guserid: string) {
        for (let i = 0; i < this.players.length; i++) {
            const seat = this.players[i];
            if (seat.user != null && seat.user.guserid == guserid)
                return seat;
        }
        return null;
    }

    hideTimers() {
        this.players.forEach((seat) => {
            if (seat.user != null)
                seat.hideTimer();
        });
    }

    get my() {
        return this.getSeatAt(0);
    }
}
