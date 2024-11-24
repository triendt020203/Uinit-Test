import AdapterManager from "../controllers/AdapterManager";
import { cyberGame } from "../CyberGame";
import PersistNode from "../component/PersistNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SplashDevScreen extends cc.Component {

    @property(cc.Label)
    descText: cc.Label = null;

    @property(cc.Label)
    loadingText: cc.Label = null;

    private totalLoaded = 0;

    private nextScene: string = "game";

    private startedAfterGetData: boolean = false;

    onLoad() {
        AdapterManager.inst.autoFitCanvas(this.node);
        this.node.on(cyberGame.event.ON_LOAD_HOME_RES, this.onLoadHomeScene, this);
    }

    start() {
        cc.director.preloadScene(this.nextScene, (completedCount, totalCount, item) => {
            this.loadingText.string = (((completedCount / totalCount) * 100) >> 0) + "% Loaded";
        }, (error) => {
            if (!error)
                this.node.emit(cyberGame.event.ON_LOAD_HOME_RES, { name: "HomeScene" });
        })

        cyberGame.loadPrefab("prefab/CommonPopup").then((prefab: cc.Prefab) => {
            cyberGame.setCommonPopupPrefab(prefab);
            this.node.emit(cyberGame.event.ON_LOAD_HOME_RES, { name: "CommonPopup" });
        })

        cyberGame.loadPrefab("prefab/LoadingLayer").then((prefab: cc.Prefab) => {
            cyberGame.setOverlayPrefab(prefab);
            this.node.emit(cyberGame.event.ON_LOAD_HOME_RES, { name: "OverlayLoaded" });
        })

        cyberGame.loadPrefab("prefab/PersistNode", true).then((persistNode: cc.Node) => {
            cyberGame.setPersistNode(persistNode);
            cc.game.addPersistRootNode(persistNode);
            this.node.emit(cyberGame.event.ON_LOAD_HOME_RES, { name: "PersistNode" });
        })

        cyberGame.storage.put("currentScene", "splash");
    }

    onLoadHomeScene(data: any) {
        this.totalLoaded++;
        if (this.totalLoaded == 4) {
            cyberGame.setGameAssetReady(true);
            cyberGame.audio.preloadGameAudios();
            if (CyberGlobals.getDataAsyncResolved)
                this.verifyData();
            else {
                this.schedule(() => {
                    if (CyberGlobals.getDataAsyncResolved) {
                        this.unscheduleAllCallbacks();
                        this.verifyData();
                    }
                }, 0.2);
            }
            this.node.off(cyberGame.event.ON_LOAD_HOME_RES, this.onLoadHomeScene, this);
        }
        if (CyberGlobals.gameConfig.debugLoadingProgress)
            console.log(data.name + " loaded success");
    }

    verifyData() {
        if (this.startedAfterGetData)
            return;
        this.startedAfterGetData = true;

        cyberGame.audio.musicEnabled = CyberGlobals.gameConfig.musicEnabled;
        cyberGame.audio.soundEnabled = CyberGlobals.gameConfig.soundEnabled;
        if (cyberGame.audio.musicEnabled)
            cyberGame.audio.loadThenPlayMusic();

        this.runHomeScene();
    }

    runHomeScene() {
        if (cyberGame.socket.isConnectionReady()) {
            cc.director.loadScene(this.nextScene, this.onHomeSceneLaunched);
            this.joinGame();
        }
        else {
            this.schedule(() => {
                if (cyberGame.socket.isConnectionReady()) {
                    this.unscheduleAllCallbacks();
                    this.joinGame();
                    cc.director.loadScene(this.nextScene, this.onHomeSceneLaunched);
                }
            }, 0.1);
        }
    }

    joinGame() {
        if (cyberGame.storage.get("lastJoinedRoomId") && cyberGame.storage.get("lastJoinedRoomId") != -1) {
            cyberGame.lobbyCtrl.resumeRoom(cyberGame.storage.get("lastJoinedRoomId"));
            return;
        }
        cyberGame.lobbyCtrl.sendFindGameRequest();
    }

    onHomeSceneLaunched() {
        cyberGame.getPersistNode().getComponent(PersistNode).addConnectionLostEvent();
    }

}
