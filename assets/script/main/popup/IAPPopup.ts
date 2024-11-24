import { cyberGame } from "../CyberGame";
import OverlayLoader from "../component/OverlayLoader";
import ShopItem from "../component/ShopItem";
import AvatarBox from "../component/AvatarBox";

const { ccclass, property } = cc._decorator;

@ccclass
export default class IAPPopup extends cc.Component {

    @property(cc.ScrollView)
    avatarScrollView: cc.ScrollView = null;

    @property(cc.Prefab)
    avatarRowPrefab: cc.Prefab = null;

    @property(cc.SpriteAtlas)
    avatarAtlas: cc.SpriteAtlas = null;

    @property({ type: [ShopItem] })
    shopItems: ShopItem[] = [];

    private overlayLoader: cc.Node = null;

    defaultBoxId: number = 31;

    map: Map<number, AvatarBox> = new Map();

    start() {
        for (let i = 0; i < this.shopItems.length; i++) {
            const item = this.shopItems[i];
            const product = cyberGame.iap.getProductInfo(item.productId);
            if (product) {
                const purchase = cyberGame.iap.getPurchase(item.productId);
                if (purchase != null)
                    item.updatePrice("Restore");
                else
                    item.updatePrice(product.price);
                item.buyButton.node.on("click", this.onBuyClick, this);
            } else
                item.node.active = false;
        }

        let profileNode = this.node.getChildByName("profile");
        profileNode.getChildByName("playerName").getComponent(cc.Label).string = FBInstant.player.getName();
        profileNode.getChildByName("profilegold").getChildByName("coin").getComponent(cc.Label).string = cyberGame.utils.shortenLargeNumber(cyberGame.coin(), 2);
        cyberGame.loadAvatar(FBInstant.player.getPhoto(), profileNode.getChildByName("avatar"), 100);
    }

    onEnable() {
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.USER_VARIABLES_UPDATE, this.onUserVariablesUpdate, this);
        cc.game.on(cyberGame.event.IAPEvent.PURCHASE_PRODUCT, this.onPurchaseProduct, this);
        cc.game.on(cyberGame.event.IAPEvent.CONSUME_PURCHASE, this.onConsumePurchase, this);
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, true, true);
    }

    onDisable() {
        cyberGame.socket.removeEventListener(SFS2X.SFSEvent.USER_VARIABLES_UPDATE, this.onUserVariablesUpdate);
        cc.game.off(cyberGame.event.IAPEvent.PURCHASE_PRODUCT, this.onPurchaseProduct, this);
        cc.game.off(cyberGame.event.IAPEvent.CONSUME_PURCHASE, this.onConsumePurchase, this);
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, false, true);
    }

    private onUserVariablesUpdate(event: any): void {
        if (event.user.isItMe && event.changedVars.indexOf("coin") != -1) {
            let coin = event.user.getVariable('coin').value;
            let profileNode = this.node.getChildByName("profile");
            profileNode.getChildByName("profilegold").getChildByName("coin").getComponent(cc.Label).string = cyberGame.utils.shortenLargeNumber(coin, 2);
        }
    }

    onBuyClick(button: cc.Button) {
        cyberGame.audio.playButton();
        this.overlayLoader = cyberGame.createOverlay();
        this.node.addChild(this.overlayLoader);
        const productId = button.node.parent.getComponent(ShopItem).productId;
        cyberGame.iap.purchaseAsync(productId, "Kaeng");
    }

    onPurchaseProduct(params: any) {
        if (this.overlayLoader)
            this.overlayLoader.getComponent(OverlayLoader).close();
        if (!params.error) {
            const msg = cyberGame.text("PAYMENT_SUCCESS", cyberGame.utils.formatCoinWithCommas(params.coin));
            cyberGame.openCommonPopup({ content: msg });
        } else
            cyberGame.openCommonPopup({ content: params.errorMsg });
    }

    onConsumePurchase() {
        cyberGame.iap.getPurchasesAsync(() => {
            try {
                for (let i = 0; i < this.shopItems.length; i++) {
                    const item = this.shopItems[i];
                    const product = cyberGame.iap.getProductInfo(item.productId);
                    if (product) {
                        const purchase = cyberGame.iap.getPurchase(item.productId);
                        if (purchase != null)
                            item.updatePrice("Restore");
                        else
                            item.updatePrice(product.price);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        });
    }

    closePopup() {
        cyberGame.audio.playButton();
        this.node.destroy();
    }

}
