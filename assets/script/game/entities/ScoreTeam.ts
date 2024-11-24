export interface ScoretEntryTeam {
    name: string
    totalPoint: number;
    totalBag: number;
    made: number;
    bonus: number;
    fiveBagPen: number;
    bag: number;
    bid: number;
    point: number;
    member: ScoretEntryPlayerTeam[];
}

export interface ScoretEntryPlayerTeam {
    guserid: string;
    made: number;
    bid: number;
}

export class ScoreTeam {
    readonly myTeam: ScoretEntryTeam = null;
    readonly oppTeam: ScoretEntryTeam = null;
    readonly roundsmy: ScoretEntryTeam[][] = [];
    readonly roundsopp: ScoretEntryTeam[][] = [];


    constructor(params: SFS2X.SFSObject, myName: string) {
        let playerList = params.getSFSArray("onTimeScoreInfo");
        for (let i = 0; i < playerList.size(); i++) {
            let obj = playerList.getSFSObject(i);

            let membersArray: ScoretEntryPlayerTeam[] = [];
            let teamArray = obj.getSFSArray("team");
            for (let j = 0; j < teamArray.size(); j++) {
                let teamMember = teamArray.getSFSObject(j);
                membersArray.push({
                    guserid: teamMember.getUtfString("guserid"),
                    made: teamMember.getInt("made"),
                    bid: teamMember.getInt("bid"),
                });
            }
            let entry: ScoretEntryTeam = {
                name: obj.getUtfString("name"),
                totalPoint: obj.getInt("totalPoint"),
                totalBag: obj.getInt("totalBag"),
                made: obj.getInt("made"),
                bonus: obj.containsKey("bonus") ? obj.getInt("bonus") : 0,
                fiveBagPen: obj.containsKey("fiveBagPen") ? obj.getInt("fiveBagPen") : 0,
                bag: obj.containsKey("bag") ? obj.getInt("bag") : 0,
                bid: obj.getInt("bid"),
                point: obj.containsKey("point") ? obj.getInt("point") : 0,
                member: membersArray,
            };
            if (membersArray.some(member => member.guserid === myName)) {
                this.myTeam = entry;
            } else {
                this.oppTeam = entry;
            }
        }

        if (params.containsKey("roundScoreInfo")) {
            let roundList = params.getSFSArray("roundScoreInfo");
            for (let i = 0; i < roundList.size(); i++) {
                let round = roundList.getSFSArray(i);


                let roundScoresMy: ScoretEntryTeam[] = [];
                let roundScoresOpp: ScoretEntryTeam[] = [];
                for (let j = 0; j < round.size(); j++) {
                    let obj = round.getSFSObject(j);
                    let membersArray: ScoretEntryPlayerTeam[] = [];
                    let teamArray = obj.getSFSArray("team");
                    for (let j = 0; j < teamArray.size(); j++) {
                        let teamMember = teamArray.getSFSObject(j);
                        membersArray.push({
                            guserid: teamMember.getUtfString("guserid"),
                            made: teamMember.getInt("made"),
                            bid: teamMember.getInt("bid"),
                        });
                    }

                    let roundEntry: ScoretEntryTeam = {
                        name: obj.getUtfString("name"),
                        totalPoint: obj.getInt("totalPoint"),
                        totalBag: obj.getInt("totalBag"),
                        made: obj.getInt("made"),
                        bonus: obj.getInt("bonus"),
                        fiveBagPen: obj.getInt("fiveBagPen"),
                        bag: obj.getInt("bag"),
                        bid: obj.getInt("bid"),
                        point: obj.getInt("point"),
                        member: membersArray,
                    };                    
                    if (membersArray.some(member => member.guserid === myName)) {
                        roundScoresMy.push(roundEntry);
                    } else {
                        roundScoresOpp.push(roundEntry);
                    }
                }
                this.roundsmy.push(roundScoresMy);
                this.roundsopp.push(roundScoresOpp);
            }
        }

    }
}
