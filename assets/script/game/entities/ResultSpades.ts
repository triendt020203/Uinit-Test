export interface ResultEntrySpades {
    guserid: string;
    made: number;
    bonus: number;
    bid: number;
    bag: number;
    point: number;
    totalbag: number;
    fiveBag: number;
    totalPoint: number;
}
export interface ResultEntryWinGame {
    guserid: string;
    point: number;
    money: number;
    win: boolean;
}

export class ResultSpades {
    readonly winPlayers: ResultEntryWinGame[] = [];
    readonly myWin: ResultEntryWinGame = null;
    readonly players: ResultEntrySpades[] = [];
    readonly my: ResultEntrySpades = null;
    readonly winRound: ResultEntrySpades;
    readonly winGame: ResultEntrySpades;

    constructor(params: SFS2X.SFSObject, myName: string, type: number) {
        if (type == 0) {
            let win = params.getSFSArray("win");
            for (let i = 0; i < win.size(); i++) {
                let obj = win.getSFSObject(i);
                let entry = {
                    guserid: obj.getUtfString("guserid"),
                    made: obj.getInt("made"),
                    bonus: obj.getInt("bonus"),
                    bid: obj.getInt("bid"),
                    isItMe: false,
                    bag: obj.getInt("bag"),
                    point: obj.getInt("point"),
                    totalbag: obj.getInt("totalBag"),
                    fiveBag: obj.getInt("fiveBagPen"),
                    totalPoint: obj.getInt("totalPoint")
                }
                if (myName == entry.guserid) {
                    entry.isItMe = true;
                    this.my = entry;
                }
                this.players.push(entry);
            }
        }

        else if (type == 1) {
            let playerList = params.getSFSArray("playerList");
            for (let i = 0; i < playerList.size(); i++) {
                let obj = playerList.getSFSObject(i);
                let entry = {
                    guserid: obj.getUtfString("guserid"),
                    point: obj.getInt("point"),
                    money: obj.getLong("money"),
                    isItMe: false,
                    win: obj.getBool("win")
                }
                if (myName == entry.guserid) {
                    entry.isItMe = true;
                    this.myWin = entry;
                }
                this.winPlayers.push(entry);
            }
        }
    }
}
