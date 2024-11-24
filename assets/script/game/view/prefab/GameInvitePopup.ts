import { cyberGame } from "../../../main/CyberGame";
import { GameInfo } from "../../constants/GameInfo";
import SocketControl from "../../SocketControl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameInvitePopup extends cc.Component {

    @property({ type: [cc.Sprite] })
    avatars: cc.Sprite[] = [];

    @property(cc.SpriteFrame)
    noAvatarSF: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    iconInviteSF: cc.SpriteFrame = null;

    @property(cc.Label)
    roomCode: cc.Label = null;

    @property(cc.Label)
    desc: cc.Label = null;

    @property(cc.Label)
    betText: cc.Label = null;

    idMap = new Map();

    roomId = 0;
    roomBet = 0;

    inviteAllowed = true;

    touchAllowed = true;

    show(roomId: any, bet: any) {
        this.touchAllowed = true;
        this.roomId = roomId;
        this.roomBet = bet;
        this.roomCode.string = cyberGame.text("ROOM_NUMBER") + roomId;
        if (cyberGame.lang.code == "th")
            this.desc.string = "";
        else
            this.desc.string = "Invite Your Friends To Play And Send Them The Room Number: " + roomId;
        this.betText.string = cyberGame.text("BET2") + cyberGame.utils.shortenLargeNumber(bet, 0);
        this.node.active = true;
        let avatar = FBInstant.player.getPhoto();
        if (avatar) {
            cc.assetManager.loadRemote(avatar, { ext: '.jpg' }, (err, texture: cc.Texture2D) => {
                if (!err && cc.isValid(this.node)) {
                    texture.packable = false;
                    this.avatars[0].spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        }
    }

    updateUserEnterRoom(user: any) {
        let idx = 1;
        while (idx < GameInfo.USER_GAME) {
            let ok = true;
            this.idMap.forEach((v, k) => {
                if (v == idx)
                    ok = false;
            });
            if (ok)
                break;
            idx++;
        }
        this.avatars[idx].spriteFrame = this.noAvatarSF;
        this.avatars[idx].node.getComponent(cc.Button).interactable = false;
        this.idMap.set(user.guserid, idx);
        if (user.avatar) {
            cc.assetManager.loadRemote(user.avatar, { ext: '.jpg' }, (err, texture: cc.Texture2D) => {
                if (!err && cc.isValid(this.node)) {
                    texture.packable = false;
                    this.avatars[idx].spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        }
        this.enableStartButton();
    }

    updateUserExitRoom(guserid: any, userCount: any) {
        let idx = this.idMap.get(guserid);
        if (idx) {
            this.avatars[idx].spriteFrame = this.iconInviteSF;
            this.avatars[idx].node.getComponent(cc.Button).interactable = true;
            this.idMap.delete(guserid);
        }
        if (userCount == 1)
            this.disableStartButton();
    }

    enableStartButton() {
        this.node.getChildByName("bg").getChildByName("button_start_alpha").active = false;
        this.node.getChildByName("bg").getChildByName("button_startgame").active = true;
    }

    disableStartButton() {
        this.node.getChildByName("bg").getChildByName("button_start_alpha").active = true;
        this.node.getChildByName("bg").getChildByName("button_startgame").active = false;
    }

    onStartGame() {
        if (!this.touchAllowed) {
            return;
        }
        SocketControl.instance.startGame();
        //this.hide();
    }

    onInvite() {
        if (this.inviteAllowed) {
            this.inviteAllowed = false;
            cc.resources.load("images/shareimage", cc.Texture2D, (err, image: cc.Texture2D) => {
                if (!err) {
                    image.packable = false;
                    const canvas = document.createElement("canvas"); // Create a canvas
                    const context = canvas.getContext("2d"); // get the context
                    canvas.width = 960;
                    canvas.height = 544;
                    context.drawImage(image.getHtmlElementObj(), 0, 0, 960, 544);
                    this.touchAllowed = false;
                    FBInstant.inviteAsync({
                        image: canvas.toDataURL(),
                        text: '\"' + FBInstant.player.getName() + '\"' + ' invited you to play',
                        data: {
                            friendMode: true,
                            bet: this.roomBet,
                            roomId: this.roomId
                        }
                    }).then(() => {
                        this.inviteAllowed = true;
                        this.touchAllowed = true;
                    }).catch(() => {
                        this.inviteAllowed = true;
                        this.touchAllowed = true;
                    });
                } else {
                    this.inviteAllowed = true;
                }
            });
        }
    }

    onClose() {
        if (!this.touchAllowed) {
            return;
        }
        SocketControl.instance.leaveGame();
    }

    hide() {
        this.node.active = false;
    }

}
