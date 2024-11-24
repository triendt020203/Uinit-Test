import { cyberGame } from "../CyberGame";

const { ccclass } = cc._decorator;

@ccclass
export default class FriendGiftRow extends cc.Component {

    playerID: string = null;

    start(): void {
        this.node.getChildByName("collect").once("click", this.onCollect, this);
    }

    onInvite(): void {
        cyberGame.audio.playButton();
        FBInstant.context
            .createAsync(this.playerID)
            .then(() => {
                this.updateAsync();
            });
    }

    onCollect(): void {
        cyberGame.audio.playButton();

        let params = new SFS2X.SFSObject();
        params.putUtfString("friendId", this.playerID); // ig instant id
        cyberGame.socket.send(new SFS2X.ExtensionRequest('friend.collectGift', params));

        // hide button
        this.node.getChildByName("collect").active = false;

        // show coin
        let coin = this.node.getChildByName("coin");
        let y = coin.y;
        coin.y = y - 30;
        coin.active = true;
        cc.tween(coin).to(0.5, { y: y }).start();

        // destroy node
        cc.tween(this.node).delay(2).to(1, { opacity: 0 })
            .call(() => {
                this.node.destroy();
            })
            .start();
    }

    updateAsync(): void {
        cc.resources.load("images/shareimage", cc.Texture2D, (err, image: cc.Texture2D) => {
            if (!err) {
                image.addRef();
                const canvas = document.createElement("canvas"); // Create a canvas
                const context = canvas.getContext("2d"); // get the context
                canvas.width = 960;
                canvas.height = 544;
                context.drawImage(image.getHtmlElementObj(), 0, 0, 960, 544);

                let ctaButton = cyberGame.containsInvitation(this.playerID) ? 'Play' : 'GET IT';
                let txt = cyberGame.containsInvitation(this.playerID) ? '\"' + FBInstant.player.getName() + '\"' + ' invited you to play' : '\"' + FBInstant.player.getName() + '\"' + ' sent you a gift! Hurry up and try it out!';

                const updateData = {
                    action: 'CUSTOM',
                    cta: ctaButton,
                    image: canvas.toDataURL(),
                    text: txt,
                    template: 'challenge',
                    data: {
                        guserid: cyberGame.player.guserid
                    },
                    strategy: 'IMMEDIATE',
                    notification: 'NO_PUSH'
                };
                FBInstant.updateAsync(updateData as any).then(() => {
                    this.updateInvite();
                });
            }
        })
    }

    updateInvite(): void {
        // update data to game server and ig storage
        cyberGame.updateInvitationData(this.playerID);
    }
}
