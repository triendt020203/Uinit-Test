export interface ResultEntryTeam {
    totalPoint: number;
    totalBag: number;
    made: number;
    bonus: number;
    fiveBagPen: number;
    bag: number;
    bid: number;
    point: number;
    member: ResultEntryPlayerTeam[];
}

export interface ResultEntryPlayerTeam {
    guserid: string;
    made: number;
    bid: number;
}

export interface ResultEntryPlayerTeamGame {
    guserid: string;
    point: number;
    money: number;
    win: boolean;
}

export interface playerInRoom {
    guserid: string;
}

export class ResultTeam {
    readonly player: playerInRoom[] = [];
    readonly team: ResultEntryTeam[] = [];
    readonly myTeam: ResultEntryTeam = null;
    readonly oppTeam: ResultEntryTeam = null;
    readonly memberRed: ResultEntryPlayerTeam[] = [];
    readonly memberBlue: ResultEntryPlayerTeam[] = [];

    readonly winTeamPlayers: ResultEntryPlayerTeamGame[] = [];

    constructor(params: SFS2X.SFSObject, myName: string, type: number) {
        if (type == 0) {
            let win = params.getSFSArray("win");
            for (let i = 0; i < win.size(); i++) {
                let obj = win.getSFSObject(i);

                let membersArray: ResultEntryPlayerTeam[] = [];
                let teamArray = obj.getSFSArray("team");
                for (let j = 0; j < teamArray.size(); j++) {
                    let teamMember = teamArray.getSFSObject(j);
                    membersArray.push({
                        guserid: teamMember.getUtfString("guserid"),
                        made: teamMember.getInt("made"),
                        bid: teamMember.getInt("bid"),
                    });
                }

                let entry: ResultEntryTeam = {
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
                    this.myTeam = entry;
                } else {
                    this.oppTeam = entry;
                }
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
                }
                this.winTeamPlayers.push(entry);
            }
        }
    }
}