export type STORAGE_KEY = "collectTime" | "lastJoinedRoomId" | "entryPointHandled" | "isHomeSceneStarted" | "optHandled" | "interstitialShowingAllowed" | "currentLobby"
    | "currentScene" | "currentLobbyGroup" | "canCreateShortcut" | "canShowBlackFriday" | "canShowFlashSale";

export default class DataStorage {

    private readonly items: Map<STORAGE_KEY, any>;

    constructor() {
        this.items = new Map<STORAGE_KEY, any>();
        this.put("currentLobbyGroup", "beginner");
        this.put("canShowFlashSale", true);
    }

    put(k: STORAGE_KEY, v: any) {
        this.items.set(k, v);
    }

    get(k: STORAGE_KEY): any {
        return this.items.get(k);
    }

}