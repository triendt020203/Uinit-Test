window._CCSettings = {
    platform: "fb-instant-games",
    groupList: ["default"],
    collisionMatrix: [
        [true]
    ],
    hasResourcesBundle: true,
    hasStartSceneBundle: false,
    remoteBundles: [],
    subpackages: [],
    launchScene: "db://assets/scene/splash.fire",
    orientation: "landscape",
    jsList: ["assets/script/lib/sfs2x-api-1.7.18.js"]
};

window.CyberGlobals = {
    startGameAsyncResolved: false,

    initializeAsyncResolved: false,

    getDataAsyncResolved: false,

    progress: 10,

    tutorialPlayed: false,

    gameLocale: "th_TH",

    noel_1_99: 0,

    gameConfig: {
        globalChatUrl: "wss://cybergame.live:8888/zone/Kaeng/",
        appId: 577504820415303,
        isPreviewMode: false,
        debugLoadingProgress: false,
        musicEnabled: true,
        soundEnabled: true
    },

    adConfig: {
        rewardedVideoId: "577504820415303_577520543747064",
        interstitialId: "577504820415303_577520443747074"
    },

    sfsConfig: {
        host: "sg.cybergame.live",
        port: 8443,
        useSSL: true,
        zone: "Phikhaeng",
        debug: false
    },

    signedPlayer: {
        guserid: -1,
        playerId: undefined,
        signature: undefined
    },

    isSignedPlayerResolved() {
        if (this.signedPlayer.signature != undefined && this.signedPlayer.playerId != undefined && this.signedPlayer.guserid != -1)
            return true;
        return false;
    },

    getLocale() {
        return this.gameLocale;
    }
}

function initializeGameAsync() {
    FBInstant.initializeAsync().then(function () {
        CyberGlobals.initializeAsyncResolved = true;
        FBInstant.setLoadingProgress(CyberGlobals.progress);
        getDataAsync();
        getSignedPlayerInfoAsync();
    }).catch(function (error) {
        console.log("initializeGameAsync exception", error);
        setTimeout(function () {
            initializeGameAsync();
        }, 100);
    });
}

function updateLoadingProgress(progress) {
    CyberGlobals.progress += progress;
    if (CyberGlobals.initializeAsyncResolved)
        FBInstant.setLoadingProgress(CyberGlobals.progress);
}

function getSignedPlayerInfoAsync() {
    FBInstant.player.getSignedPlayerInfoAsync().then(function (result) {
        CyberGlobals.signedPlayer.playerId = result.getPlayerID();
        CyberGlobals.signedPlayer.signature = result.getSignature();
        updateLoadingProgress(15);
    }).catch(function (error) {
        console.log("getSignedPlayerInfoAsync exception", error);
        setTimeout(function () {
            getSignedPlayerInfoAsync();
        }, 500);
    })
}

function getDataAsync() {
    FBInstant.player
        .getDataAsync(['gameLocale', 'guserid', 'tutorialPlayedV1', 'm', 's', 'noel_1_99'])
        .then(function (data) {
            if (data['tutorialPlayedV1'])
                CyberGlobals.tutorialPlayed = data['tutorialPlayedV1'];

            if (data['noel_1_99'])
                CyberGlobals.noel_1_99 = parseInt(data['noel_1_99']);

            if (data['gameLocale'])
                CyberGlobals.gameLocale = data['gameLocale'];
            else {
                let locale = FBInstant.getLocale();
                if (locale.indexOf("th") != -1) {
                    CyberGlobals.gameLocale = "th_TH";
                    CyberGlobals.tutorialPlayed = true;
                } else
                    CyberGlobals.gameLocale = 'en_US';
            }

            if (data['m'] === false)
                CyberGlobals.gameConfig.musicEnabled = false;

            if (data['s'] === false)
                CyberGlobals.gameConfig.soundEnabled = false;

            if (data['guserid'])
                CyberGlobals.signedPlayer.guserid = parseInt(data['guserid']);
            else
                CyberGlobals.signedPlayer.guserid = 0;

            CyberGlobals.getDataAsyncResolved = true;

            updateLoadingProgress(15);
        }).catch(function (error) {
            CyberGlobals.signedPlayer.guserid = 0;
            CyberGlobals.tutorialPlayed = true;
            CyberGlobals.gameLocale = "th_TH";
            var currentDate = new Date();
            CyberGlobals.noel_1_99 = currentDate.getFullYear();
            CyberGlobals.getDataAsyncResolved = true;
            console.log("getDataAsync", error);
        });
}

function startGameAsync() {
    if (CyberGlobals.initializeAsyncResolved) {
        FBInstant.startGameAsync()
            .then(() => {
                CyberGlobals.startGameAsyncResolved = true;
            })
            .catch((error) => {
                setTimeout(() => {
                    startGameAsync();
                }, 500);
                console.log("startGameAsync", error);
            });
    } else {
        setTimeout(() => {
            startGameAsync();
        }, 30);
    }
}

function boot() {
    var RESOURCES = cc.AssetManager.BuiltinBundleName.RESOURCES;
    var INTERNAL = cc.AssetManager.BuiltinBundleName.INTERNAL;
    var MAIN = cc.AssetManager.BuiltinBundleName.MAIN;
    var settings = window._CCSettings;
    window._CCSettings = undefined;

    // init engine
    var canvas;

    if (cc.sys.isBrowser)
        canvas = document.getElementById('GameCanvas');

    var onStart = function () {
        cc.view.resizeWithBrowserSize(true);
        cc.view.enableRetina(true);

        if (cc.sys.isMobile) {
            if (settings.orientation === 'landscape') {
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            } else if (settings.orientation === 'portrait') {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            }
            // qq, wechat, baidu
            cc.view.enableAutoFullScreen(
                cc.sys.browserType !== cc.sys.BROWSER_TYPE_BAIDU &&
                cc.sys.browserType !== cc.sys.BROWSER_TYPE_WECHAT &&
                cc.sys.browserType !== cc.sys.BROWSER_TYPE_MOBILE_QQ
            );
        }

        // Limit downloading max concurrent task to 2,
        // more tasks simultaneously may cause performance draw back on some android system / brwosers.
        // You can adjust the number based on your own test result, you have to set it before any loading process to take effect.            

        if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
            cc.assetManager.downloader.maxConcurrency = 2;
        }

        var launchScene = settings.launchScene;

        var bundle = cc.assetManager.bundles.find(function (b) {
            return b.getSceneInfo(launchScene);
        });

        bundle.loadScene(launchScene,
            cc.sys.isBrowser ? function (completedCount, totalCount) {
                var progress = Math.floor(100 * completedCount / totalCount);
                if (CyberGlobals.progress < progress) {
                    if (CyberGlobals.initializeAsyncResolved)
                        FBInstant.setLoadingProgress(progress);
                } else
                    updateLoadingProgress(3);
            } : null,
            function (err, scene) {
                //console.log('Success to load scene: ' + launchScene);
                startGameAsync();
                cc.director.runSceneImmediate(scene);
            }
        );

        // connect server parallel with scene loading 
        CyberGame.initAsync().then(function () {
            console.log("CyberGame initAsync success");
        });
    };

    var option = {
        //width: width,
        //height: height,
        id: 'GameCanvas',
        debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: settings.debug,
        frameRate: 60,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix,
    };

    cc.assetManager.init({
        bundleVers: settings.bundleVers
    });
    var bundleRoot = [INTERNAL];
    settings.hasResourcesBundle && bundleRoot.push(RESOURCES);

    var count = 0;

    function cb(err) {
        if (err) return console.error(err.message, err.stack);
        count++;
        if (count === bundleRoot.length + 1) {
            cc.assetManager.loadBundle(MAIN, function (err) {
                if (!err) cc.game.run(option, onStart);
            });
        }
        updateLoadingProgress(2);
    }

    // load plugins
    cc.assetManager.loadScript(settings.jsList.map(function (x) {
        return 'src/' + x;
    }), cb);

    // load bundles
    for (var i = 0; i < bundleRoot.length; i++) {
        cc.assetManager.loadBundle(bundleRoot[i], cb);
    }
    updateLoadingProgress(10);
}