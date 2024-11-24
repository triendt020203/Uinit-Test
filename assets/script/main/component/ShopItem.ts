import { cyberGame } from "../CyberGame";
import PromotionEntry from "../entities/PromotionEntry";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopItem extends cc.Component {

    @property(cc.Button)
    buyButton: cc.Button = null;

    @property(cc.SpriteFrame)
    p50SF: cc.SpriteFrame = null;

    @property
    productId: string = '';

    @property
    coin: number = 0;

    start(): void {
        let promotionEntry: PromotionEntry = cyberGame.iap.getPromotion();
        if (promotionEntry && promotionEntry.getDuration() > 0) {
            let percentVal = promotionEntry.getPromoPercent(this.productId);
            if (percentVal == 100 || percentVal == 50) {
                let promoCoin = Math.round(this.coin * percentVal / 100);
                this.node.getChildByName("coin").getComponent(cc.Label).string = cyberGame.utils.formatCoinWithCommas(this.coin + promoCoin);

                if (percentVal == 50)
                    this.node.getChildByName("percent").getComponent(cc.Sprite).spriteFrame = this.p50SF;

                this.node.getChildByName("percent").active = true;
                this.node.getChildByName("discount").active = true;
                this.node.getChildByName("discount").getComponent(cc.Label).string = cyberGame.utils.formatCoinWithCommas(this.coin);

                if (this.productId == "2_99") {
                    this.node.getChildByName("coinIcon").y = -2;
                } else if (this.productId == "4_99") {
                    this.node.getChildByName("coinIcon").y = -2;
                    this.node.getChildByName("coin").x = 5;
                } else if (this.productId == "9_99") {
                    this.node.getChildByName("coin").x = 5;
                    this.node.getChildByName("coinIcon").y = -6;
                }
            } else
                this.node.getChildByName("coin").getComponent(cc.Label).string = cyberGame.utils.formatCoinWithCommas(this.coin);
        } else
            this.node.getChildByName("coin").getComponent(cc.Label).string = cyberGame.utils.formatCoinWithCommas(this.coin);
    }

    updatePrice(price: string): void {
        this.buyButton.node.getChildByName("money").getComponent(cc.Label).string = price;
    }

}
