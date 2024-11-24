const { ccclass, property } = cc._decorator;

@ccclass
export default class OptInPopup extends cc.Component {

    start() {

    }

    onConfirmClick() {
        this.closePopup();
        FBInstant.player.subscribeBotAsync().then(
            // Player is subscribed to the bot
        ).catch(function (e) {
            // Handle subscription failure
            console.log(e);
        });
    }

    closePopup() {
        this.node.destroy();
    }

}
