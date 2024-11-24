import { cyberGame } from "../CyberGame";

var _getMySqlDate = function () {
    var date = new Date();
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
}

var INSTANCE = null;

class InterstitialManager {

    public inited = false;
    public adInstance = null;
    public ready = false;
    public loading = false;
    public blocked = false;
    public interstitialCounter = 0;
    public lastShowingTime = 0;
    public maxShow = 100000;
    public interstitialDate = null;

    constructor() {
        this.inited = false;
        this.adInstance = null;
        this.ready = false;
        this.loading = false;
        this.blocked = false;
        this.interstitialCounter = 0;
        this.lastShowingTime = 0;
    }

    static get instance(): InterstitialManager {
        if (!INSTANCE)
            INSTANCE = new InterstitialManager();
        return INSTANCE;
    }

    init() {
        if (cyberGame.isAdRemoved())
            return;
        if (!this.inited) {
            FBInstant.player.getDataAsync(['interstitialDate', 'interstitialCounter', 'lastShowingTime'])
                .then((data) => {
                    if (!this.inited) {
                        this.inited = true;
                        this.interstitialDate = _getMySqlDate();
                        var ok = false;
                        if (data['lastShowingTime'])
                            this.lastShowingTime = parseInt(data['lastShowingTime']);
                        if (data['interstitialDate']) {
                            if (data['interstitialCounter'])
                                this.interstitialCounter = parseInt(data['interstitialCounter']);
                            if (data['interstitialDate'] != this.interstitialDate) {
                                this.interstitialCounter = 0;
                                ok = true;
                            }
                        } else
                            ok = true;
                        if (ok) {
                            FBInstant.player.setDataAsync({
                                interstitialDate: this.interstitialDate,
                                interstitialCounter: this.interstitialCounter
                            });
                        }
                        this.load();
                    }
                })
                .catch(() => {
                    setTimeout(() => {
                        InterstitialManager.instance.init();
                    }, 5000);
                });
        } else {
            this.load();
        }
    }

    load() {
        if (this.interstitialCounter >= this.maxShow)
            return;
        if (!this.ready && !this.loading) {
            this.loading = true;
            this.loadNormalInterstitial();
        }
    }

    loadNormalInterstitial() {
        FBInstant.getInterstitialAdAsync(CyberGlobals.adConfig.interstitialId).then((interstitial) => {
            this.adInstance = interstitial;
            return this.adInstance.loadAsync();
        }).then(() => {
            this.loading = false;
            this.ready = true;
        }).catch((error) => {
            this.handleLoadError(error, 2);
            console.log("loadNormalInterstitial error", error);
        });
    }

    handleLoadError(error, attemptNumber) {
        setTimeout(() => {
            if (this.adInstance != null)
                this.handleAdsNoFill(attemptNumber);
        }, 30000);
    }

    handleAdsNoFill(retryNumber) {
        if (retryNumber > 3)
            this.blocked = true;
        else {
            this.adInstance.loadAsync()
                .then(() => {
                    this.loading = false;
                    this.ready = true;
                })
                .catch((error) => {
                    this.handleLoadError(error, retryNumber + 1);
                });
        }
    }

    canShow(): boolean {
        return this.ready;
    }

    show() {
        if (this.interstitialCounter >= this.maxShow)
            return;
        if (this.ready) {
            this.adInstance.showAsync()
                .then(() => {
                    this.adInstance = null;
                    this.ready = false;
                    this.interstitialCounter = this.interstitialCounter + 1;
                    this.lastShowingTime = new Date().getTime();
                    FBInstant.player.setDataAsync({
                        interstitialCounter: this.interstitialCounter,
                        lastShowingTime: this.lastShowingTime
                    });
                    cyberGame.audio.resumeMusic();
                })
                .catch(() => {
                    cyberGame.audio.resumeMusic();
                    this.adInstance = null;
                    this.ready = false;
                })
        }
    }

    showAsync(): Promise<void> {
        return new Promise((resolve) => {
            this.adInstance.showAsync()
                .then(() => {
                    this.adInstance = null;
                    this.ready = false;
                    this.interstitialCounter = this.interstitialCounter + 1;
                    this.lastShowingTime = new Date().getTime();
                    FBInstant.player.setDataAsync({
                        interstitialCounter: this.interstitialCounter,
                        lastShowingTime: this.lastShowingTime
                    });
                    cyberGame.audio.resumeMusic();
                    resolve();
                })
                .catch(() => {
                    this.adInstance = null;
                    this.ready = false;
                    cyberGame.audio.resumeMusic();
                    resolve();
                })
        });
    }

}

export default InterstitialManager;