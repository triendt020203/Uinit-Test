import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class InvitePopup extends cc.Component {

    @property(cc.Button)
    inviteButton: cc.Button = null;

    start() {
        this.inviteButton.node.once("click", this.onInvite, this);        
    }

    protected onEnable(): void {
        let node = this.node.getChildByName("invite_popup_bg");
        node.setScale(0.8);
        cc.tween(node)
            .to(0.8, { scale: 1 }, { easing: 'elasticOut' })
            .start();
    }

    onInvite() {
        cyberGame.audio.playButton();
        cc.resources.load("images/shareimage", cc.Texture2D, (err, image: cc.Texture2D) => {
            if (!err) {
                const canvas = document.createElement("canvas"); // Create a canvas
                const context = canvas.getContext("2d"); // get the context
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
                    this.inviteButton.node.once("click", this.onInvite, this);
                });
            } else {
                this.inviteButton.node.once("click", this.onInvite, this);
            }
        })
    }

    closePopup() {
        cyberGame.audio.playButton();
        this.node.destroy();
    }

}
