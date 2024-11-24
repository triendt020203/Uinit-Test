import FriendGiftRow from "../component/FriendGiftRow";
import OverlayLoader from "../component/OverlayLoader";
import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FriendGiftPopup extends cc.Component {
    @property(cc.ScrollView)
    private readonly listView: cc.ScrollView = null;

    @property(cc.ScrollView)
    private readonly giftView: cc.ScrollView = null;

    @property(cc.Label)
    private readonly noGiftLable: cc.Label = null;

    @property(cc.Prefab)
    private readonly rowPrefab: cc.Prefab = null;

    private currentTab: number = 0;

    private overlayLoader: any = null;

    public friends: FBInstant.ConnectedPlayer[] = null;

    public invMap: Map<string, boolean> = null;

    protected start(): void {
        // update friend list
        if (Array.isArray(this.friends) && this.friends.length > 0) {
            this.friends.forEach((player) => {
                this.addFriendEntry(player);
            });
            this.listView.scrollToTop(0.5);
        }

        // get gifts
        cyberGame.socket.send(new SFS2X.ExtensionRequest('friend.getGifts'));
    }

    protected onEnable(): void {
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, true);
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse, this);
    }

    protected onDisable(): void {
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, false);
        cyberGame.socket.removeEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse);
    }

    private onExtensionResponse(event: any) {
        if (event.cmd == "friend.getGifts") {
            let friendIDs = event.params.getLongArray("friendIDs");
            if (friendIDs.length == 0) return;
            for (let i = 0; i < friendIDs.length; i++) {
                let id = String(friendIDs[i]);
                for (let j = 0; j < this.friends.length; j++) {
                    let player: FBInstant.ConnectedPlayer = this.friends[j];
                    if (player.getID() == id) {
                        this.addGiftEntry(player);
                        break;
                    }
                }
            }
            this.giftView.scrollToTop(0.5);
            this.noGiftLable.node.active = false;
        }
    }

    addFriendEntry(player: FBInstant.ConnectedPlayer) {
        const node = this.createListEntry(player);

        node.getChildByName("invite").active = true;
        node.getChildByName("avatar").active = true;

        //if (!this.invMap.has(player.getID()))
        //  node.getChildByName("giftcoin").active = true;
        //else
        //  node.getChildByName("giftcoin_deactive").active = true;

        // add node to scrollview
        this.listView.content.addChild(node);
    }

    addGiftEntry(player: FBInstant.ConnectedPlayer) {
        const node = this.createListEntry(player);

        //node.getChildByName("name").y = 17;
        node.getChildByName("collect").active = true;
        node.getChildByName("avatar").active = true;
        node.getChildByName("sent_text").active = true;

        // add node to scrollview
        this.giftView.content.addChild(node);
    }

    private createListEntry(player: FBInstant.ConnectedPlayer): cc.Node {
        const node = cc.instantiate(this.rowPrefab);
        node.getChildByName("name").getComponent(cc.Label).string = player.getName();

        // set friend id
        node.getComponent(FriendGiftRow).playerID = player.getID();

        // load avatar       
        cyberGame.loadAvatar(player.getPhoto()).then((spriteFrame: cc.SpriteFrame) => {
            if (cc.isValid(node)) {
                node.getChildByName("avatar").getComponent(cc.Sprite).spriteFrame = spriteFrame;
                node.getChildByName("avatar").setContentSize(68, 68);
            }
        });
        return node;
    }

    onFriendTabClick() {
        cyberGame.audio.playButton();
        if (this.currentTab == 1) {
            this.currentTab = 0;
            this.listView.node.active = true;
            this.giftView.node.active = false;
            this.noGiftLable.node.active = false;
        }
    }

    onGiftTabClick() {
        cyberGame.audio.playButton();
        if (this.currentTab == 0) {
            this.currentTab = 1;
            this.listView.node.active = false;
            this.giftView.node.active = true;
            if (this.giftView.content.childrenCount == 0)
                this.noGiftLable.node.active = true;
        }
    }

    onInviteFriend() {
        cyberGame.audio.playButton();
        this.showOverlayLoader();
        cc.resources.load("images/shareimage", cc.Texture2D, (err, image: cc.Texture2D) => {
            this.hideOverlayLoader();
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
                });
            }
        });
    }

    closePopup(): void {
        cyberGame.audio.playButton();
        this.node.destroy();
    }

    private showOverlayLoader(): void {
        if (!this.overlayLoader) {
            this.overlayLoader = cyberGame.createOverlay();
            this.node.addChild(this.overlayLoader);
        }
    }

    private hideOverlayLoader(): void {
        if (this.overlayLoader) {
            this.overlayLoader.getComponent(OverlayLoader).close();
            this.overlayLoader = null;
        }
    }

}
