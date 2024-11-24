import { cyberGame } from "../CyberGame";

const { ccclass } = cc._decorator;

@ccclass
export default class HomeSceneDecorator extends cc.Component {

    protected start(): void {
        /* Update profile info at top left */
        let profileNode = this.node.getChildByName("Profile");
        profileNode.getChildByName("playerName").getComponent(cc.Label).string = FBInstant.player.getName();
        profileNode.getChildByName("playerId").getComponent(cc.Label).string = "ID " + cyberGame.player.guserid;
        profileNode.getChildByName("playerCoin").getComponent(cc.Label).string = cyberGame.utils.formatCoinWithCommas(cyberGame.coin());
        profileNode.getChildByName("profile_level").getChildByName("level").getComponent(cc.Label).string = cyberGame.level().toString();

        // load profile avatar
        cyberGame.loadAvatar(FBInstant.player.getPhoto(), profileNode.getChildByName("avatar_border").getChildByName("avatar"), 86);
    }

    protected onEnable(): void {
        cc.game.on(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, this.onPopupVisibilityChange, this);
    }

    protected onDisable(): void {
        cc.game.off(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, this.onPopupVisibilityChange, this);
    }

    /**
     * Redure drawcall when popup is active
     */
    private onPopupVisibilityChange(popupActive: boolean, allNodes?: boolean): void {
        if (cc.isValid(this.node)) {
            this.node.getChildByName("playNow").active = !popupActive;
            this.node.getChildByName("playWithFriend").active = !popupActive;
            this.node.getChildByName("selectTable").active = !popupActive;
            if (allNodes) {
                this.node.getChildByName("bg").active = !popupActive;
                this.node.getChildByName("BottomMenu").active = !popupActive;
                this.node.getChildByName("Profile").active = !popupActive;
                this.node.getChildByName("RightMenu").active = !popupActive;
            }
        }
    }

}
