import cyberEvent from "../constants/CyberEvent";
import { cyberGame } from "../CyberGame";

export namespace adController {

    export const REWARDED_POPUP_POSITION: number = 1;
    export const IAP_POSITION: number = 2;
    export const OUT_OFF_MONEY_POSITION: number = 3;
    export const SPIN_POSITION: number = 4;
    export const MAX_VIDEOS: number = 10;
    export const REWARD_ARRAY = [50000, 100000, 200000, 300000, 500000];

    export let watchCounter: number = 0;
    export let spinCounter: number = 0;
    export let ready: boolean = false;

    // private
    let entities: adController.AdEntity[] = [];
    let inited: boolean = false;
    let testMode: boolean = false;
    let currentDate = null;
    let type: number = 1;
    let anyPriceInstance: adController.AdEntity;
    let RV2Instance: adController.AdEntity;
    let RV3Instance: adController.AdEntity;

    export function init(placementIDs: [string], isTestMode: boolean) {
        if (inited)
            return;

        for (let i = 0; i < placementIDs.length; i++) {
            let entity = new AdEntity(placementIDs[i], i == 0 ? true : false);
            entities.push(entity);
        }

        anyPriceInstance = entities[0];
        RV2Instance = entities[1];
        RV3Instance = entities[2];

        cc.game.on(cyberEvent.AdsEvent.ON_SHOW, onShow, this);
        cc.game.on(cyberEvent.AdsEvent.ON_LOAD, onLoad, this);
        cc.game.on(cyberEvent.AdsEvent.ON_LOAD_ERROR, onLoadError, this);

        testMode = isTestMode;

        if (!testMode && FBInstant.getSupportedAPIs().indexOf('getRewardedVideoAsync') != -1) {
            getDataAsync(() => {
                if (entities.length > 1) {
                    if (!RV3Instance.blocked)  
                        RV3Instance.preload();
                    else if (!RV2Instance.blocked)
                        RV2Instance.preload();
                    else
                        anyPriceInstance.preload();
                } else
                    anyPriceInstance.preload();
            });
        } else
            enableTestMode();

        inited = true;
    }

    export function show(t: number): void {
        if (ready) {
            type = t;
            if (!testMode) {
                for (let i = 0; i < entities.length; i++) {
                    if (entities[i].loaded) {
                        cyberGame.audio.pauseMusic();
                        entities[i].show();
                        break;
                    }
                }
            } else {
                let node = null;
                cc.resources.load("dev/FakeAdVideo", cc.Prefab, (err, prefab) => {
                    if (!err) {
                        node = cc.instantiate(prefab) as any;
                        cc.director.getScene().addChild(node);
                        cyberGame.audio.pauseMusic();
                        setTimeout(() => {
                            if (node != null)
                                node.destroy();
                            cc.game.emit(cyberEvent.AdsEvent.ON_SHOW, "fakeid");
                        }, 5000)
                    }
                })
            }
        }
    }

    export function increaseSpinCounter() {
        spinCounter++;
        FBInstant.player.setDataAsync({
            spinCounter: spinCounter
        });
    }

    function getDataAsync(callback: Function): void {
        FBInstant.player.getDataAsync(['currentDate', 'watchCounter', 'spinCounter']).then((data) => {
            let date = new Date();
            currentDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split("T")[0];

            if (data['watchCounter'])
                watchCounter = parseInt(data['watchCounter']);

            if (data['spinCounter'] != currentDate)
                spinCounter = parseInt(data['spinCounter']);

            if (data['currentDate'] !== currentDate) {
                watchCounter = 0;
                spinCounter = 0;
            }

            FBInstant.player.setDataAsync({
                currentDate: currentDate,
                watchCounter: watchCounter,
                spinCounter: spinCounter
            });

            callback();

        }).catch((e) => {
            console.log(e);
            setTimeout(() => {
                getDataAsync(callback);
            }, 5000);
        });
    }

    function enableTestMode(): void {
        getDataAsync(() => {
            setTimeout(() => {
                cc.game.emit(cyberEvent.AdsEvent.ON_LOAD, "fakeid");
            }, 5000);
        });
    }

    function onLoad(): void {
        if (!ready)
            updateReady(true);
    }

    function updateReady(val: boolean) {
        ready = val;
        cc.game.emit(cyberEvent.AdsEvent.READY, ready);
    }

    function onLoadError(adEntity: AdEntity): void {
        if (entities.length > 1) {
            if (adEntity.id == RV3Instance.id)
                RV2Instance.preload();
            else if (adEntity.id == RV2Instance.id)
                anyPriceInstance.preload();
        }
    }

    function onShow(id: string): void {
        updateReady(false);

        if (type == REWARDED_POPUP_POSITION) {
            watchCounter++;
            FBInstant.player.setDataAsync({
                watchCounter: watchCounter
            });
            let coin = watchCounter <= 5 ? REWARD_ARRAY[watchCounter - 1] : REWARD_ARRAY[4];
            cc.game.emit(cyberEvent.AdsEvent.REWARD, {
                id: id,
                type: type,
                coin: coin
            });
        } else if (type == SPIN_POSITION) {
            cc.game.emit(cyberEvent.AdsEvent.REWARD, {
                id: id,
                type: type
            });
        }
        if (testMode) {
            setTimeout(() => {
                cc.game.emit(cyberEvent.AdsEvent.ON_LOAD, "fakeid");
            }, 3000);
        }
        cyberGame.audio.resumeMusic();
    }

    export class AdEntity {
        blocked: boolean = false;
        loaded: boolean = false;
        adInstance: FBInstant.AdInstance = null;

        constructor(public readonly id: string, private isAnyPrice: boolean) {
        }

        preload(): void {
            if (this.adInstance !== null) {
                this.adInstance.loadAsync().then(() => {
                    this.handleLoadSuccess();
                }).catch((error) => {
                    this.handleLoadError(2);
                });
            } else {
                FBInstant.getRewardedVideoAsync(this.id).then((rewardedVideo) => {
                    this.adInstance = rewardedVideo;
                    return this.adInstance.loadAsync();
                }).then(() => {
                    this.handleLoadSuccess();
                }).catch((error) => {
                    this.handleLoadError(2);
                });
            }
        }

        handleLoadSuccess(): void {
            this.loaded = true;
            cc.game.emit(cyberEvent.AdsEvent.ON_LOAD, this.id);
        }

        handleLoadError(attemptNumber: number) {
            if (this.isAnyPrice) {
                setTimeout(() => {
                    if (this.adInstance != null)
                        this.handleAdsNoFill(attemptNumber);
                }, 30000);
            } else
                this.blocked = true;
            cc.game.emit(cyberEvent.AdsEvent.ON_LOAD_ERROR, this);
        }

        handleAdsNoFill(retryNumber: number) {
            if (retryNumber > 3)
                this.blocked = true;
            else {
                this.adInstance.loadAsync().then(() => {
                    this.handleLoadSuccess();
                }).catch((error) => {
                    console.log(error);
                    this.handleLoadError(retryNumber + 1);
                });
            }
        }

        show() {
            this.adInstance.showAsync().then(() => {
                // reset data
                this.adInstance = null;
                this.loaded = false;

                // emit ad show
                cc.game.emit(cyberEvent.AdsEvent.ON_SHOW, this.id);

                // preload again after 1 sec
                setTimeout(() => {
                    this.preload();
                }, 1000);
            }).catch(() => {
                this.adInstance = null;
                this.loaded = false;
                cyberGame.audio.resumeMusic();
                // preload again after 1 sec
                setTimeout(() => {
                    this.preload();
                }, 1000);
            })
        }
    }

}