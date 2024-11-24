export interface ScoreInfoBoard {
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

export class ScoreInfo {
    readonly players: ScoreInfoBoard[] = [];
    readonly my: ScoreInfoBoard = null;
    readonly rounds: ScoreInfoBoard[][] = [];

    constructor(params: SFS2X.SFSObject, myName: string, type: number) {
        if (params.containsKey("onTimeScoreInfo")) {
            let playerList = params.getSFSArray("onTimeScoreInfo");
            for (let i = 0; i < playerList.size(); i++) {
                let obj = playerList.getSFSObject(i);
                let entry = {
                    guserid: obj.getUtfString("guserid"),
                    made: obj.getInt("made"),
                    bid: obj.getInt("bid"),

                    bonus: obj.containsKey("bonus") ? obj.getInt("bonus") : 0,
                    bag: obj.containsKey("bag") ? obj.getInt("bag") : 0,
                    point: obj.containsKey("point") ? obj.getInt("point") : 0,
                    totalbag: obj.containsKey("totalBag") ? obj.getInt("totalBag") : 0,
                    fiveBag: obj.containsKey("fiveBagPen") ? obj.getInt("fiveBagPen") : 0,
                    totalPoint: obj.containsKey("totalPoint") ? obj.getInt("totalPoint") : 0,
                    isItMe: false
                }
                if (myName == entry.guserid) {
                    entry.isItMe = true;
                    this.my = entry;
                }
                this.players.push(entry)
            }
        }

        if (params.containsKey("roundScoreInfo")) {
            let roundList = params.getSFSArray("roundScoreInfo");
            for (let i = 0; i < roundList.size(); i++) {
                let round = roundList.getSFSArray(i);
                let roundScores: ScoreInfoBoard[] = [];
                for (let j = 0; j < round.size(); j++) {
                    let obj = round.getSFSObject(j);
                    let roundEntry: ScoreInfoBoard = {
                        guserid: obj.getUtfString("guserid"),
                        totalPoint: obj.getInt("totalPoint"),
                        totalbag: obj.getInt("totalBag"),
                        made: obj.getInt("made"),
                        bonus: obj.getInt("bonus"),
                        fiveBag: obj.getInt("fiveBagPen"),
                        bag: obj.getInt("bag"),
                        bid: obj.getInt("bid"),
                        point: obj.getInt("point")
                    }
                    roundScores.push(roundEntry);
                }
                this.rounds.push(roundScores);
            }
        }
    }
}
// if (params.containsKey("roundScoreInfo")) {
//     let roundList = params.getSFSArray("roundScoreInfo");
//     for (let i = 0; i < roundList.size(); i++) {
//         let round = roundList.getSFSArray(i);
//         let roundScores: ScoretEntryTeam[] = [];
//         for (let j = 0; j < round.size(); j++) {
//             let obj = round.getSFSObject(i);
//             let membersArray: ScoretEntryPlayerTeam[] = [];
//             if (obj.containsKey("team" + (i + 1).toString())) {
//                 let teamArray = obj.getSFSArray("team" + (i + 1).toString());
//                 for (let j = 0; j < teamArray.size(); j++) {
//                     let teamMember = teamArray.getSFSObject(j);
//                     membersArray.push({
//                         guserid: teamMember.getUtfString("guserid"),
//                         made: teamMember.getInt("made"),
//                         bid: teamMember.getInt("bid"),
//                     });
//                 }
//             }

//             let roundEntry: ScoretEntryTeam = {
//                 name: obj.getUtfString("name"),
//                 totalPoint: obj.getInt("totalPoint"),
//                 totalBag: obj.getInt("totalBag"),
//                 made: obj.getInt("made"),
//                 bonus: obj.getInt("bonus"),
//                 fiveBagPen: obj.getInt("fiveBagPen"),
//                 bag: obj.getInt("bag"),
//                 bid: obj.getInt("bid"),
//                 point: obj.getInt("point"),
//                 member: membersArray,
//             };
//             roundScores.push(roundEntry);
//         }
//         this.rounds.push(roundScores);
//     }
// }