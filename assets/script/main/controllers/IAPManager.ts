import { cyberGame } from "../CyberGame";
import PromotionEntry from "../entities/PromotionEntry";

export default class IAPManager {
    private static instance: IAPManager = new IAPManager();

    private iapSupported: boolean = false;
    private inited: boolean = false;
    private testMode: boolean = false;
    private firstPurchased: boolean = true;
    private catalog: Map<string, FBInstant.Product>;
    private purchases: Map<string, FBInstant.Purchase>;

    private promotionEntry: PromotionEntry = null;

    private constructor() {
        this.catalog = new Map<string, FBInstant.Product>();
        this.purchases = new Map<string, FBInstant.Purchase>();
    }

    public static getInstance(): IAPManager {
        return this.instance;
    }

    public isIAPSupported(): boolean {
        return this.iapSupported;
    }

    public isReady(): boolean {
        return this.inited;
    }

    public isFirstPurchased(): boolean {
        return this.firstPurchased;
    }

    public handlePromotion(params: SFS2X.SFSObject): void {
        this.promotionEntry = new PromotionEntry(params);
    }

    public getPromotion(): PromotionEntry {
        return this.promotionEntry;
    }

    public onReady(): Promise<void> {
        return new Promise((resolve) => {
            FBInstant.payments.onReady(() => {
                if (!this.iapSupported) {
                    cyberGame.socket.addEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse, this);
                    this.iapSupported = true;
                    this.updateCatalog();
                }
                resolve();
            })
        })
    }

    public init(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.inited)
                reject(new Error('IAPManager is already inited'));
            this.canBuyFirstDeal().then((canBuy) => {
                if (canBuy)
                    this.firstPurchased = false;
                if (!this.inited)
                    this.inited = true;
            });
            resolve();
        })
    }

    public canBuyFirstDeal(): Promise<boolean> {
        return new Promise((resolve) => {
            FBInstant.payments.getPurchasesAsync()
                .then((purchases) => {
                    if (purchases && purchases.length > 0) {
                        for (let i = 0; i < purchases.length; i++) {
                            const element = purchases[i];
                            if (element.productID == "first_purchase") {
                                resolve(false);
                                return;
                            }
                        }
                    }
                    resolve(true);
                }).catch((error) => {
                    console.log("getPurchasesAsync", error);
                    resolve(false);
                });
        })
    }

    public purchaseAsync(productId: string, developerPayload?: string): void {
        if (this.purchases.has(productId)) {
            const purchase = this.purchases.get(productId);
            this.restorePurchase(purchase);
        } else {
            FBInstant.payments.purchaseAsync({
                productID: productId,
                developerPayload: !developerPayload ? 'Cyber' : developerPayload
            }).then((data) => {
                if (!this.testMode)
                    this.verifyPayment(data);
            }).catch((error) => {
                cc.game.emit(cyberGame.event.IAPEvent.PURCHASE_PRODUCT, {
                    error: true,
                    errorMsg: error.message
                });
            });
        }
    }

    private restorePurchase(data: any): void {
        if (!this.testMode)
            this.verifyPayment(data);
    }

    private onExtensionResponse(event: any): void {
        if (event.cmd == 'fbinstant.verifyPayment')
            this.handleVerifyPayment(event);
        else if (event.cmd == 'payment.verify')
            this.handleVerifyPayment(event);
    }

    private handleVerifyPayment(event: any): void {
        //console.log(event.params.getDump());
        let productID = event.params.containsKey("productID") ? event.params.getUtfString("productID") : "";
        let success = event.params.getBool('success');
        if (success) {
            let data = {
                error: false,
                coin: event.params.getLong('coin')
            } as any;
            if (productID == "first_purchase") {
                data.avatarId = event.params.getInt('avatarId');
                data.productID = productID;
                this.firstPurchased = true;
            }
            cc.game.emit(cyberGame.event.IAPEvent.PURCHASE_PRODUCT, data);
        }
        else
            cc.game.emit(cyberGame.event.IAPEvent.PURCHASE_PRODUCT, {
                error: true,
                errorMsg: event.params.getUtfString('errorMsg')
            })
        if (success || (event.params.containsKey('errorCode') && event.params.getInt('errorCode') == 6)) {
            // check non-consumeable product
            if (productID == "first_purchase")
                return;
            if (event.params.containsKey("purchaseToken")) {
                FBInstant.payments.consumePurchaseAsync(event.params.getUtfString("purchaseToken"))
                    .then(() => {
                        this.purchases.clear();
                        cc.game.emit(cyberGame.event.IAPEvent.CONSUME_PURCHASE);
                        if (productID == "xmas_1_99") {
                            CyberGlobals.noel_1_99 = new Date().getFullYear();
                            FBInstant.player.setDataAsync({ noel_1_99: CyberGlobals.noel_1_99 });
                        }
                        console.log("consumePurchaseAsync resolved");
                    })
                    .catch((err) => {
                        cc.game.emit(cyberGame.event.IAPEvent.CONSUME_PURCHASE);
                        console.log("consumePurchaseAsync error", err);
                    });
            }
        }
    }

    public getPurchasesAsync(cb: Function): void {
        FBInstant.payments.getPurchasesAsync()
            .then((purchases) => {
                this.purchases.clear();
                if (purchases && purchases.length > 0) {
                    for (let i = 0; i < purchases.length; i++) {
                        const element = purchases[i];
                        this.purchases.set(element.productID, element);
                    }
                }
                cb(this.purchases);
            }).catch(() => {
                cb(this.purchases);
            });
    }

    private verifyPayment(purchase: any): void {
        if (cyberGame.socket.isConnected) {
            var params = new SFS2X.SFSObject();
            params.putUtfString('signedRequest', purchase.signedRequest);
            cyberGame.socket.send(new SFS2X.ExtensionRequest("payment.verify", params));
        }
    }

    private updateCatalog(): void {
        FBInstant.payments.getCatalogAsync().then((products) => {
            if (products.length > 0)
                for (let i = 0; i < products.length; i++)
                    this.catalog.set(products[i].productID, products[i]);
        });
    }

    public getProductInfo(productID: string): FBInstant.Product {
        return this.catalog.get(productID);
    }

    public getPurchase(productID: string): FBInstant.Purchase {
        return this.purchases.get(productID);
    }

    public enableTestMode(): void {
        this.testMode = true;
    }

}