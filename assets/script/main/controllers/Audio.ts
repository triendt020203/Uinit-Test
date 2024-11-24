import { cyberGame } from "../CyberGame";

namespace audioController {

    export let soundEnabled: boolean = true;
    export let musicEnabled: boolean = false;

    const clips: Map<string, cc.AudioClip> = new Map();
    let musicClip: cc.AudioClip = null;
    let isLoadingMusic: boolean = false;

    export function loadButtonAudio(): void {
        cc.resources.load("audio/button_game", cc.AudioClip, null, (err, clip: cc.AudioClip) => {
            if (!err)
                addClip(clip.name, clip);
        });
    }

    export function loadThenPlayMusic(): void {
        if (!musicClip) {
            if (isLoadingMusic)
                return;
            isLoadingMusic = true;
            cc.resources.load("audio/bg/music", cc.AudioClip, null, (err, clip: cc.AudioClip) => {
                if (!err) {
                    musicClip = clip;
                    playMusic();
                }
                isLoadingMusic = false;
            });
        } else
            playMusic();
    }

    export function playMusic(): void {
        if (musicEnabled && musicClip) {
            cc.audioEngine.playMusic(musicClip, true);
            cc.audioEngine.setMusicVolume(0.5);
            if (cyberGame.storage.get("currentScene") == "game") {
                setTimeout(() => {
                    pauseMusic();
                }, 100);
            }
        }
    }

    export function stopMusic(): void {
        if (musicClip)
            cc.audioEngine.stopMusic();
    }

    export function pauseMusic(): void {
        if (musicEnabled && cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.pauseMusic();
        }
    }

    export function resumeMusic(): void {
        if (musicEnabled)
            cc.audioEngine.resumeMusic();
    }

    export function preloadGameAudios(): void {
        preloadThenCreateAudioClip("joinRoom", "audio/joinRoom");
        preloadThenCreateAudioClip("leaveRoom", "audio/LeaveRoom");
        preloadThenCreateAudioClip("lose", "audio/lost");
        preloadThenCreateAudioClip("win", "audio/win");
        preloadThenCreateAudioClip("coinmove", "audio/ChipChamNhau");
        preloadThenCreateAudioClip("chiabai", "audio/chia_bai");
        //preloadThenCreateAudioClip("chiabai", "audio/king_outcard");
        //preloadThenCreateAudioClip("chiabai", "audio/chiabai");
        preloadThenCreateAudioClip("myturn", "audio/myturn");
        preloadThenCreateAudioClip("lighting", "audio/lighting");
        preloadThenCreateAudioClip("showmoney", "audio/king_addmoney");
        preloadThenCreateAudioClip("shuffle", "audio/Dummy_shuffle")

        preloadThenCreateAudioClip("kwin", "audio/king_bi_win");
        preloadThenCreateAudioClip("klose", "audio/king_bi_lost");
        preloadThenCreateAudioClip("opencards", "audio/king_hu");
        preloadThenCreateAudioClip("kshow", "audio/king_result_light");
        preloadThenCreateAudioClip("start_game", "audio/start_game");

        let names = ["water", "kiss_flowers", "brick", "kiss", "tomato", "Bom", "beer1", "eggs"];
        for (let i = 0; i < names.length; i++)
            preloadThenCreateAudioClip("gift" + (i + 1), "audio/gift/" + names[i]);
    }

    export function stopAllEffects(): void {
        cc.audioEngine.stopAllEffects();
    }

    function preloadThenCreateAudioClip(key: string, path: string) {
        cc.resources.preload(path, cc.AudioClip, (preloadErr) => {
            cc.resources.load(path, cc.AudioClip, (err, clip: cc.AudioClip) => {
                if (!err)
                    addClip(key, clip);
            });
        });
    }

    export function playLight(): void {
        try {
            if (soundEnabled && clips.has("lighting"))
                cc.audioEngine.play(clips.get("lighting"), false, 0.4);
        } catch (error) {
            console.log("playSound error", error);
        }
    }
    export function playComeOnAsync() {
        return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
            const randomNumber = Math.floor(Math.random() * 2); //Outputs 0 or 1
            if (randomNumber) {
                playSound("come_on_guy");
                setTimeout(() => {
                    resolve();
                }, clips.get("come_on_guy").duration * 1000);
            } else {
                playSound("What_take");
                setTimeout(() => {
                    resolve();
                }, clips.get("What_take").duration * 1000);
            }
        })
    }

    export function playStartGame(): void {
        try {
            if (soundEnabled && clips.has("start_game"))
                cc.audioEngine.play(clips.get("start_game"), false, 0.5);
        } catch (error) {
            console.log("playSound error", error);
        }
    }

    export function playSound(name: string): void {
        try {
            if (soundEnabled && clips.has(name))
                cc.audioEngine.playEffect(clips.get(name), false);
        } catch (error) {
            console.log("playSound error", error);
        }
    }

    export function shuffleSound(): void {
        playSound("shuffle");
    }

    export function playKeangWin(): void {
        playSound("kwin");
    }

    export function playKeangLose(): void {
        playSound("klose");
    }

    export function playMoneyEffect() {
        playSound("showmoney");
    }

    export function playJoinRoomSound() {
        playSound("joinRoom");
    }

    export function playLoseSound() {
        playSound("lose");
    }

    export function playWinSound() {
        playSound("win");
    }

    export function playYourTurn() {
        playSound("denluot");
    }

    export function playDiscard() {
        playSound("danhbai");
    }

    export function playButton(): void {
        //playSound("button");
        playSound("button_game");
    }

    function addClip(key: string, clip: cc.AudioClip): void {
        if (CyberGlobals.gameConfig.debugLoadingProgress)
            console.log("audio " + key + " loaded");
        clips.set(key, clip);
    }

}

export default audioController;
