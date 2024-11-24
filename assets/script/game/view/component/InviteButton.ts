import { cyberGame } from "../../../main/CyberGame";

const { ccclass } = cc._decorator;

@ccclass
export default class InviteButton extends cc.Component {

    start(): void {
        this.node.once("click", this.onInvite, this);
    }

    onInvite(): void {
        cyberGame.audio.playButton();
        cc.resources.load("images/shareimage", cc.Texture2D, (err, image: cc.Texture2D) => {
            if (!err) {
                image.packable = false;
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = 960;
                canvas.height = 544;
                context.drawImage(image.getHtmlElementObj(), 0, 0, 960, 544);
                FBInstant.inviteAsync({
                    image: canvas.toDataURL(),
                    text: '\"' + FBInstant.player.getName() + '\"' + ' invited you to play',
                    data: {
                        guserid: cyberGame.player.guserid
                    }
                }).then(() => {
                    this.node.once("click", this.onInvite, this);
                }).catch(() => {
                    this.node.once("click", this.onInvite, this);
                });
            } else {
                this.node.once("click", this.onInvite, this);
            }
        })
    }
}
