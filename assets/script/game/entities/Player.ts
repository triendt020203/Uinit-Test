import { GameInfo } from './../constants/GameInfo';
import { UserVariable } from "../constants/Variable";
import CardEntity from "./CardEntity";

export default class Player {
    public guserid: string;
    public displayName: string;
    public coin: number;
    public exp: number;
    public level: number;
    public avatar: string;

    public playing: boolean;
    public ready: boolean;
    public isItMe: boolean;
    public numCard: number;
    public position: number;
    public positionIndex: number;

    public hasBet: boolean;
    public made: number = 0;
    public bid: number = -1;
    public ttpoint: number = 0;
    public ttbag: number = 0;
    public lastDump: number = -1;

    public seeCards: boolean = false;

    public avatarId: number;
    private _cards: any[];

    constructor(user: SFS2X.SFSUser) {
        if (user != null) {
            this.guserid = user.name;
            this.displayName = user.getVariable(UserVariable.DISPLAYNAME).value;
            this.level = user.getVariable(UserVariable.LEVEL).value;
            this.exp = user.getVariable(UserVariable.EXP).value;
            this.coin = user.getVariable(UserVariable.COIN).value;
            this.avatar = user.getVariable(UserVariable.AVATAR).value;
            if (this.avatar == "images/no_avatar")
                this.avatar = null;
            this.isItMe = user.isItMe;
            this.avatarId = user.containsVariable("avatarId") ? user.getVariable("avatarId").value : 0;
        }
        this.cards = [];
    }

    static newInstance(obj: SFS2X.SFSObject) {
        let player = new Player(null);
        player.guserid = obj.getUtfString("guserid");
        player.displayName = obj.containsKey("displayName") ? obj.getUtfString("displayName") : "";
        player.coin = obj.containsKey("coin") ? obj.getLong("coin") : 0;
        player.avatar = obj.containsKey("avatar") ? obj.getUtfString("avatar") : null;
        if (player.avatar == "images/no_avatar")
            player.avatar = null;
        player.level = 1;
        player.exp = 0;
        player.isItMe = false;
        player.avatarId = 0;
        return player;
    }

    static newTutInstance() {
        let player = new Player(null);
        return player;
    }

    addCard(cardEntity: CardEntity): void {
        if (this.cards.length < GameInfo.TOTAL_CARDS_FOR_EACH_PLAYER)
            this.cards.push(cardEntity);
        else
            throw new Error("cards size can not greater than" + (GameInfo.TOTAL_CARDS_FOR_EACH_PLAYER));
    }

    removeCards(ids: number): void {
        if (this.isItMe) {
            for (let j = 0; j < this.cards.length; j++) {
                if (ids == this.cards[j].id) {
                    this.cards.splice(j, 1);
                    break;
                }
            }
        } else
            this.cards.pop();
    }

    removeAllCards(): void {
        if (Array.isArray(this.cards))
            this.cards.length = 0;
    }

    set cards(array) {
        if (Array.isArray(array))
            this._cards = array;
        else
            throw new Error("Player.cards - input was not an instance of native array");
    }

    get cards(): any[] {
        return this._cards;
    }
}