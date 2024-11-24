namespace cyberEvent {

    export const ON_LOAD_HOME_RES = "onLoadHomeRes";

    export const ON_GAME_PAUSE = "onCyberGamePause";

    export const ON_LOBBY_PUBLIC_MSG = "onLobbyPublicMsg";

    export const ON_LOBBY_TAB_CHANGE = "onLobbyTabChange";

    export const ON_POPUP_VISIBILITY_CHANGE = "onPopupVisibilityChange";

    export enum GameEvent {
        QUEUE_COMPLETE = "onRequestQueueComplete",
        GAMESCENE_LAUNCHED = "onGameSceneLaunched",
        CARD_DIVIDED = "onDivideFinish",
        ADD_CARD_FINISH = "onAddCardFinish",
        CARD_CLICK = "onCardClick"
    }

    export enum AdsEvent {
        READY = "onAdsReady",
        REWARD = "onAdsReward",
        ON_SHOW = "onAdsShow",
        ON_LOAD = "onAdsLoaded",
        ON_LOAD_ERROR = "onAdsLoadError",
        ON_INTER_SHOW = "onInterAdsShow"
    }

    export enum IAPEvent {
        CONSUME_PURCHASE = "onConsumePurchase",
        PURCHASE_PRODUCT = "onPurchaseProduct"
    }

}

export default cyberEvent;
