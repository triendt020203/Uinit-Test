import PlayerInfo from "./PlayerInfo";
import Player from "../../entities/Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SeatManager extends cc.Component {

    @property({ type: [PlayerInfo] })
    players: PlayerInfo[] = [];

    @property(cc.Node)
    giftNode: cc.Node = null;

    @property(cc.SpriteFrame)
    sf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    sf1: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    bf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    bf1: cc.SpriteFrame = null;

    gameScene: any;

    init(gameScene: any): void {
        this.gameScene = gameScene;
    }

    editTeamMode(): void {
        const hexColor = "#C5E9FD";
        const hexColor1 = "#FDC5C5";

        function hexToColor(hex: string): cc.Color {
            const red = parseInt(hex.slice(1, 3), 16);
            const green = parseInt(hex.slice(3, 5), 16);
            const blue = parseInt(hex.slice(5, 7), 16);
            return new cc.Color(red, green, blue);
        }

        this.players[2].playerName.node.color = hexToColor(hexColor);
        this.players[2].bid.getChildByName("Bidding").color =  hexToColor(hexColor);
        this.players[2].node.getChildByName("avatar_back").getComponent(cc.Sprite).spriteFrame = this.sf;
        this.players[2].node.getChildByName("name_container").getComponent(cc.Sprite).spriteFrame = this.bf;
        
        this.players[3].playerName.node.color = hexToColor(hexColor1);
        this.players[3].bid.getChildByName("Bidding").color =  hexToColor(hexColor1);
        this.players[3].node.getChildByName("avatar_back").getComponent(cc.Sprite).spriteFrame = this.sf1;
        this.players[3].node.getChildByName("name_container").getComponent(cc.Sprite).spriteFrame = this.bf1;
    }

    reconnect() {
        let grade = []
        for (let i = 0; i < this.players.length; i++) {
            let a = this.players[i].user
            grade.push(a);
        }
        return grade;
    }

    seeCards(): void {
        for (let i = 0; i < this.players.length; i++) {
            const seat = this.players[i];
            if (seat.user.seeCards != true){
                seat.cardControl.closeCardOnHand();
            }
                
        }
    }

    allocate(): void {
        this.players.forEach((seat) => {
            seat.reset();
            seat.updateData(null);
        });
        let userList = this.gameScene.game.userList;
        userList.forEach((user: Player) => {
            if (user.positionIndex >= 0) {
                const seat: PlayerInfo = this.getSeatAt(user.positionIndex);
                seat.updateData(user);
                if (seat.user.ready)
                    seat.highLight();
            }
        })
    }

    isBidComplete(): boolean {
        for (let i = 0; i < this.players.length; i++) {
            const seat = this.players[i];
            if (seat.user != null && seat.user.playing && seat.user.bid == -1)
                return false;
        }
        return true;
    }

    getSize(): number {
        let uCount = 0;
        this.players.forEach((seat) => {
            if (seat.user != null)
                uCount++;
        })
        return uCount;
    }

    prepareForDealcard(): void {
        for (let i = 0; i < this.players.length; i++) {
            const seat = this.players[i];
            if (seat.user == null)
                seat.hideInviteButton();
            else if (!seat.user.playing)
                seat.unHighLight();
        }
    }

    prepareForSwitchTable(): void {
        this.players.forEach((seat) => {
            seat.hideNameAndCoin();
        });
    }

    resetCardControls(): void {
        this.players.forEach((player) => {
            player.cardControl.reset();
        })
    }

    getSeatAt(idx: number): PlayerInfo {
        return this.players[idx];
    }

    getSeatByGuserid(guserid: string) {
        for (let i = 0; i < this.players.length; i++) {
            const seat = this.players[i];
            if (seat.user != null && seat.user.guserid == guserid) {
                return seat;
            }
        }
        return null;
    }

    resetRoundTeam():void{
        this.players.forEach((seat) => {
            seat.resetRound();
        });
    }

    getAllSeat() {
        let seat = [];
        for (let i = 0; i < this.players.length; i++) {
            seat[i] = this.players[i]
        }
        return seat
    }

    updateDealer(dealer: string): void {
        const seat = this.getSeatByGuserid(dealer);
        if (seat)
            seat.showDealer();
    }

    highLightPlayer(player: Player): void {
        for (let i = 0; i < this.players.length; i++) {
            const seat = this.players[i];
            if (seat.user == player) {
                seat.highLight();
                break;
            }
        }
    }

    hideTimers(): void {
        this.players.forEach((seat) => {
            if (seat.user != null)
                seat.hideTimer();
        });
    }

    hideInviteButtons(): void {
        for (let i = 0; i < this.players.length; i++) {
            const seat = this.players[i];
            if (seat.user == null)
                seat.hideInviteButton();
        }
    }

    onAvatarClick(event: any, idx: number): void {
        let seat = this.getSeatAt(idx);
        if (seat.user)
            this.gameScene.playerInfoPopup.showGiftPopup(seat.user);
    }

    get my() {
        return this.getSeatAt(0);
    }
}
