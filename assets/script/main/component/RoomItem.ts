import { cyberGame } from "../CyberGame";
import LobbyScreen from "../scenes/LobbyScreen";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoomItem extends cc.Component {

    @property(cc.Sprite)
    betText: cc.Sprite = null;

    @property(cc.Sprite)
    miniBetText: cc.Sprite = null;

    @property(cc.Label)
    roomId: cc.Label = null;

    @property(cc.Button)
    joinButton: cc.Button = null;

    @property({ type: [cc.SpriteFrame] })
    betSF: cc.SpriteFrame[] = [];

    @property({ type: [cc.Sprite] })
    playerCount: cc.Sprite[] = [];

    roomOptions = null;

    lobbyScreen: LobbyScreen = null;

    start(): void {
        if (this.roomOptions != null)
            this.updateData(this.roomOptions);
    }

    init(screen, roomOptions: any): void {
        this.lobbyScreen = screen;
        this.roomOptions = roomOptions;
    }

    updateData(params: any): void {
        // hide background
        //if (params.odd != 0)
        //this.node.getChildByName("bg").active = false;

        // room id        
        this.roomId.string = params.id + "";

        let bet = cyberGame.utils.shortenLargeNumber(params.bet, 0) + "";
        bet = bet.toLowerCase();
        for (let i = 0; i < this.betSF.length; i++) {
            if (this.betSF[i].name == bet) {
                this.betText.spriteFrame = this.betSF[i];
                break;
            }
        }

        let mbet = cyberGame.utils.shortenLargeNumber(params.bet * 5, 1) + "";
        mbet = mbet.toLowerCase();
        if (mbet == "2.5m")
            mbet = "2_5m";
        else if (mbet == "1.5m")
            mbet = "1_5m";

        for (let i = 0; i < this.betSF.length; i++) {
            if (this.betSF[i].name == mbet) {
                this.miniBetText.spriteFrame = this.betSF[i];
                break;
            }
        }

        // update user count
        if (params.userCount > 1) {
            let sf = this.playerCount[0].spriteFrame;
            for (let i = 1; i < params.userCount; i++) {
                this.playerCount[i].spriteFrame = sf;
            }
        }

        // update buttons
        if (params.userCount == 5) {
            this.joinButton.node.active = false;
            this.node.getChildByName("buttons").getChildByName("button_full").active = true;
        } else
            this.joinButton.node.on('click', this.sendJoinRoomRequest, this);
    }

    sendJoinRoomRequest(): void {
        cyberGame.audio.playButton();
        if (cyberGame.lobbyCtrl.canPlay(this.roomOptions.bet)) {
            this.lobbyScreen.showOverlayLoader();
            cyberGame.lobbyCtrl.joinRoom(this.roomOptions.id);
        } else {
            let text = cyberGame.text("YOU_NEED_AT_LEAST", cyberGame.utils.shortenLargeNumber(cyberGame.lobbyCtrl.miniumMoneyCondition * this.roomOptions.bet, 2));
            this.lobbyScreen.showNoti(text);
        }
    }

}
