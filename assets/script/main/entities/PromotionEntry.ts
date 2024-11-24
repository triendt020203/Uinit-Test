export default class PromotionEntry {
    private duration: number = 0;
    private createdDate: number;
    private promoMap: Map<string, number>;

    public isP100: boolean = false;
    public isP50: boolean = false;

    constructor(params: SFS2X.SFSObject) {
        this.createdDate = Date.now();
        this.duration = params.getLong("duration");
        this.promoMap = new Map<string, number>();

        let p100Count = 0;
        let p50Count = 0;
        let ids = ["0_99", "1_99", "2_99", "4_99", "9_99"];

        ids.forEach(productId => {
            if (params.containsKey(productId)) {
                let val = params.getInt(productId);
                this.promoMap.set(productId, val);
                if (val == 100)
                    p100Count++;
                else if (val == 50)
                    p50Count++;
            }
        });

        if (p100Count == ids.length)
            this.isP100 = true;

        if (p50Count == ids.length)
            this.isP50 = true;

        if (this.isNoel())
            cc.resources.preload("prefab/NoelPopup");
    }

    public getDuration(): number {
        if (this.isP100 || this.isP50) {
            let elapsed = Date.now() - this.createdDate;
            return this.duration - elapsed;
        }
        return 0;
    }

    public getPromoMap(): Map<string, number> {
        return this.promoMap;
    }

    public getPromoPercent(productId: string): number {
        return this.promoMap.has(productId) ? this.promoMap.get(productId) : 0;
    }

    public getPrefabName(): string {
        if (this.isNoel())
            return "prefab/NoelPopup";
        if (this.isP100)
            return "prefab/FlashSale";
        else
            return "prefab/AmazingSale";
    }

    public isNoel(): boolean {
        var currentDate = new Date();
        var day = currentDate.getDate();
        var month = currentDate.getMonth() + 1;
        if (month == 12) {
            if (day >= 22 && day <= 26)
                return true;
        }
        return false;
    }

}