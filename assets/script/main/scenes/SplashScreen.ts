import AdapterManager from "../controllers/AdapterManager";
import { cyberGame } from "../CyberGame";
import PersistNode from "../component/PersistNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SplashScreen extends cc.Component {

    @property(cc.Label)
    descText: cc.Label = null;

    @property(cc.Label)
    loadingText: cc.Label = null;

    private totalLoaded = 0;

    private nextScene: string = "home";

    private startedAfterGetData: boolean = false;

    private runPreloadRss: boolean = false;

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
            if (CyberGlobals.getDataAsyncResolved)
                this.verifyData();
            else {
                try {
                    if (FBInstant.getLocale().indexOf("th") != -1)
                        this.preloadResources();
                } catch (error) {
                    console.log("locale error at splash");
                }
                this.schedule(() => {
                    if (CyberGlobals.getDataAsyncResolved) {
                        this.unscheduleAllCallbacks();
                        this.verifyData();
                    }
                }, 0.1);
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
        // if (!CyberGlobals.tutorialPlayed){
        //     this.preloadResources();
        //     // this.loadThenPlayTutorial();
        //     this.runHomeScene();
        // }
        // else {
        //     this.preloadResources();
        //     this.runHomeScene();
        // }
        this.preloadResources();
        this.runHomeScene();
        cyberGame.audio.musicEnabled = CyberGlobals.gameConfig.musicEnabled;
        cyberGame.audio.soundEnabled = CyberGlobals.gameConfig.soundEnabled;
        if (cyberGame.audio.musicEnabled)
            cyberGame.audio.loadThenPlayMusic();
    }

    runHomeScene() {
        if (cyberGame.socket.isConnectionReady()){
            cc.director.loadScene(this.nextScene, this.onHomeSceneLaunched);
        }  
        else {
            this.schedule(() => {
                if (cyberGame.socket.isConnectionReady()) {
                    this.unscheduleAllCallbacks();
                    cc.director.loadScene(this.nextScene, this.onHomeSceneLaunched);
                }
            }, 0.1);
        }
    }

    onHomeSceneLaunched() {
        cyberGame.getPersistNode().getComponent(PersistNode).addConnectionLostEvent();    
    }

    preloadResources() {
        if (this.runPreloadRss)
            return;
        this.runPreloadRss = true;

        // load only button sound
        cyberGame.audio.loadButtonAudio();

        // preload game scene hight priority
        cc.director.preloadScene("game", (completedCount, totalCount, item) => {
            if (CyberGlobals.gameConfig.debugLoadingProgress) {
                let txt = (((completedCount / totalCount) * 100) >> 0) + "% Loaded";
                console.log("GameScene progress: " + txt);
            }
        }, () => {
            cyberGame.setGameAssetReady(true);

            cc.resources.preload("gameprefab/resultDialog");
            cc.resources.preload("gameprefab/InvitePopup");

            // preload game sounds
            cyberGame.audio.preloadGameAudios();

            if (CyberGlobals.gameConfig.debugLoadingProgress)
                console.log("game scene preload succes");

            console.log("preload game scene done");
        });

        // preload some important popup prefabs to ensure user no need to wait too long
        const keys = ["InvitePopup", "LobbyGame", "CreateFriendPopup", "SpinWheel", "VideoPopup"];
        let loadedCount = 0;
        keys.forEach((key) => {
            cc.resources.preload("prefab/" + key, cc.Prefab, () => {
                loadedCount++;
                if (loadedCount == keys.length) {
                    cc.resources.preload("images/shareimage");
                    console.log("preload prefabs done");
                }
                if (CyberGlobals.gameConfig.debugLoadingProgress)
                    console.log(key + " prefab loaded success");
            });
        });
    }

    loadThenPlayTutorial() {
        cyberGame.audio.loadButtonAudio();
        cyberGame.loadPrefab("prefab/TutorialPopup", true).then((node: cc.Node) => {
            node.parent = this.node;
        }).catch(() => {
            this.preloadResources();
            this.runHomeScene();
        });
        cc.resources.preload("prefab/TutLan");
        cc.director.preloadScene("tutorial", (completedCount, totalCount, item) => {
            if (CyberGlobals.gameConfig.debugLoadingProgress) {
                let txt = (((completedCount / totalCount) * 100) >> 0) + "% Loaded";
                console.log("tutorial scene progress: " + txt);
            }
        }, () => {
            // preload other sounds
            cyberGame.audio.preloadGameAudios();
        });
    }
}