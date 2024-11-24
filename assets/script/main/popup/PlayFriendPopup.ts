import { cyberGame } from "../CyberGame";
import HomeScreen from "../scenes/HomeScreen";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayFriendPopup extends cc.Component {

    @property(cc.Label)
    roomCode: cc.Label = null;

    @property(cc.Node)
    createGameTab: cc.Node = null;

    @property(cc.Node)
    joinGameTab: cc.Node = null;

    @property(cc.Slider)
    betSlider: cc.Slider = null;

    @property(cc.Label)
    betText: cc.Label = null;

    homeScene: HomeScreen = null;

    currentBet = 5000;

    ratioMap = [{
        value: 5000
    }, {
        value: 10000
    }, {
        value: 20000
    }, {
        value: 50000
    }, {
        value: 100000
    }, {
        value: 200000
    }, {
        value: 300000
    }, {
        value: 500000
    }, {
        value: 1000000
    }, {
        value: 2000000
    }, {
        value: 5000000
    }];

    protected onEnable(): void {
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, true);
        this.roomCode.string = cyberGame.text("ENTER_ROOM_CODE");

        let node = this.node.getChildByName("bg_popup_huge");
        node.setScale(0.8);
        cc.tween(node)
            .to(0.8, { scale: 1 }, { easing: 'elasticOut' })
            .start();
    }

    protected onDisable(): void {
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, false);
    }

    onSlider() {
        //console.log(this.betSlider.handle.node.x, this.betSlider.handle.node.y);
        let p = Math.round(this.betSlider.progress * 100 / 10);
        this.currentBet = this.ratioMap[p].value;
        this.betText.string = cyberGame.utils.shortenLargeNumber(this.ratioMap[p].value, 0);
    }

    onCreateGameTab() {
        cyberGame.audio.playButton();
        this.createGameTab.getChildByName("cg_active_left_tab").active = true;
        this.createGameTab.getChildByName("cg_left_tab").active = false;

        this.joinGameTab.getChildByName("cg_right_tab").active = true;
        this.joinGameTab.getChildByName("cg_active_right_tab").active = false;

        this.node.getChildByName("bg_popup_huge").getChildByName("findRoom").active = false;
        this.node.getChildByName("bg_popup_huge").getChildByName("createForm").active = true;
        this.node.getChildByName("bg_popup_huge").getChildByName("button_taophong").active = true;
        this.node.getChildByName("bg_popup_huge").getChildByName("button_vaophong").active = false;
    }

    onJoinGameTab() {
        cyberGame.audio.playButton();
        this.roomCode.string = cyberGame.text("ENTER_ROOM_CODE");
        this.createGameTab.getChildByName("cg_active_left_tab").active = false;
        this.createGameTab.getChildByName("cg_left_tab").active = true;

        this.joinGameTab.getChildByName("cg_right_tab").active = false;
        this.joinGameTab.getChildByName("cg_active_right_tab").active = true;

        this.node.getChildByName("bg_popup_huge").getChildByName("findRoom").active = true;
        this.node.getChildByName("bg_popup_huge").getChildByName("createForm").active = false;
        this.node.getChildByName("bg_popup_huge").getChildByName("button_taophong").active = false;
        this.node.getChildByName("bg_popup_huge").getChildByName("button_vaophong").active = true;
    }

    onNumberClick(event: any, num: number) {
        cyberGame.audio.playButton();
        if (this.roomCode.string == cyberGame.text("ENTER_ROOM_CODE"))
            this.roomCode.string = "";
        if (this.roomCode.string.length > 8)
            return;
        this.roomCode.string = this.roomCode.string + String(num);
    }

    onBackNum() {
        cyberGame.audio.playButton();
        if (this.roomCode.string == cyberGame.text("ENTER_ROOM_CODE"))
            return;
        if (this.roomCode.string.length > 0) {
            let str =  this.roomCode.string;
            this.roomCode.string = str.substring(0,str.length-1);
        }
    }

    closePopup() {
        cyberGame.audio.playButton();
        this.node.active = false;
    }

    show() {
        this.node.active = true;
    }

    onCreateRoomRequest() {
        cyberGame.audio.playButton();
        this.homeScene.onCreateGameRequest();
    }

    onJoinRoomRequest() {
        cyberGame.audio.playButton();
        let text = this.roomCode.string;
        if (text.length > 0 && text.length < 10 && text != cyberGame.text("ENTER_ROOM_CODE")) {
            let roomId = parseInt(text);
            this.homeScene.onJoinFriengGameRequest(roomId);
        }
    }

}
