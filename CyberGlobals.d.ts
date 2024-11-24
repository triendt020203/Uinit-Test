declare namespace CyberGlobals {
    /**
     * FBInstant.startGameAsync().then(() => {CyberGlobals.startGameAsyncResolved = true})
     */
    let startGameAsyncResolved: boolean;

    /**
     * FBInstant.initializeAsync().then(() => {CyberGlobals.initializeAsyncResolved = true})
     */
    let initializeAsyncResolved: boolean;

    /**
     * FBInstant.player.getDataAsync(['gameLocale', 'guserid', 'tutorialPlayedV1']).then(() => {CyberGlobals.getDataAsyncResolved = true})
     */
    let getDataAsyncResolved: boolean;

    let gameConfig: GameConfig;

    let adConfig: AdsConfig;

    /**
     * Contains properties related to socket configuration such as host port zone.
     */
    let sfsConfig: SFSConfig;

    /**
     * Contains signed player info properties related to the current player.
     */
    let signedPlayer: SignedPlayer;

    /**
     * Checks if the current player is played tutorial yet.
     */
    let tutorialPlayed: boolean;

    /**
     * the current avatar that player is ordered in shop
     */
    let avatarId: number;

    let noel_1_99: number;

    /**
     * The current locale. Use this to determine what language the current game should be localized with.     
     *
     * @returns The current locale.
     */
    function getLocale(): string | null;

    function isSignedPlayerResolved(): boolean;

    interface GameConfig {
        appId: number;
        isPreviewMode: boolean;
        globalChatUrl: string;
        debugLoadingProgress: boolean;
        musicEnabled: boolean;
        soundEnabled: boolean;
    }

    interface SFSConfig {
        host: string;
        useSSL: boolean;
        port: number;
        zone: string;
        debug: boolean;
    }

    interface AdsConfig {        
        rewardedVideoId: string;        
        interstitialId: string;
    }

    interface SignedPlayer {
        /**
         * A unique identifier for cyber player.
         *
         * @returns A unique identifier for cyber player.
         */
        guserid: number;

        /**
         * A unique identifier for the player. A Facebook user's player ID will remain constant,
         * and is scoped to a specific game. This means that different games will have different
         * player IDs for the same user. This function should not be called until FBInstant.initializeAsync()
         * has resolved.
         *
         * @returns A unique identifier for the player.
         */
        playerId: string | null;

        /**
         * A signature to verify this object indeed comes from Facebook. The string is base64url encoded and signed with an HMAC version of your App Secret,
         * based on the OAuth 2.0 spec.         
         *
         * @returns The signature string.
         */
        signature: string;
    }

}