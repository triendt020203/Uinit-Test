import { cyberGame } from "../../../main/CyberGame";
import GameScene from "../GameScene";
import PlayerInfo from "../player/PlayerInfo";

const { ccclass } = cc._decorator;

@ccclass
export default class GiftManager extends cc.Component {

    gameScene: GameScene;
    emodAsset: dragonBones.DragonBonesAsset = null;
    emodAtlas: dragonBones.DragonBonesAtlasAsset = null;
    giftAsset: dragonBones.DragonBonesAsset = null;
    giftAtlas: dragonBones.DragonBonesAtlasAsset = null;
    moveCount = 0;

    init(gameScene: GameScene): void {
        this.gameScene = gameScene;
        cc.resources.load('dragonbones/Icon_All_backup_ske', dragonBones.DragonBonesAsset, (err, res: dragonBones.DragonBonesAsset) => {
            if (!err) {
                if (cc.isValid(this.node)) {
                    this.emodAsset = res;
                    cc.resources.load('dragonbones/Icon_All_backup_tex', dragonBones.DragonBonesAtlasAsset, (err2, res2: dragonBones.DragonBonesAtlasAsset) => {
                        if (!cc.isValid(this.node))
                            return;
                        if (!err2)
                            this.emodAtlas = res2;
                        else
                            cc.error(err2);
                    });
                }
            } else {
                cc.error(err);
            }
        });
        cc.resources.load('dragonbones/Effect_ALL_Copy_ske', dragonBones.DragonBonesAsset, (err, res: dragonBones.DragonBonesAsset) => {
            if (!err) {
                if (cc.isValid(this.node)) {
                    this.giftAsset = res;
                    cc.resources.load('dragonbones/Effect_ALL_Copy_tex', dragonBones.DragonBonesAtlasAsset, (err2, res2: dragonBones.DragonBonesAtlasAsset) => {
                        if (!cc.isValid(this.node))
                            return;
                        if (!err2)
                            this.giftAtlas = res2;
                        else
                            cc.error(err2);
                    });
                }
            } else {
                cc.error(err);
            }
        });
    }

    updateSendGift(params: SFS2X.SFSObject): void {
        if (this.giftAsset && this.giftAtlas && this.moveCount < 8) {
            var id = params.getInt('id');
            var sender = params.getUtfString('sender');
            var recipient = params.getUtfString('recipient');
            var from = this.gameScene.seatManager.getSeatByGuserid(sender);
            var to = this.gameScene.seatManager.getSeatByGuserid(recipient);
            if (from && to)
                this.move(id, from, to);
        }
    }

    move(id: number, fromCorner: PlayerInfo, toCorner: PlayerInfo): void {
        try {
            this.moveCount++;
            let extra = (id == 1) ? 60 : 0;
            let destinationX = toCorner.node.x + extra;
            let destinationY = toCorner.node.y;
            let node = this.gameScene.playerInfoPopup.node.getChildByName("bg").getChildByName("grid").getChildByName("gift_item_bg" + id).getChildByName("gift_" + id);
            if (node) {
                let sf = node.getComponent(cc.Sprite).spriteFrame;
                let giftNode = new cc.Node("GiftItem");
                giftNode.addComponent(cc.Sprite).spriteFrame = sf;
                giftNode.setPosition(fromCorner.node.position);
                this.gameScene.seatManager.giftNode.addChild(giftNode);
                cc.tween(giftNode)
                    .to(0.65, { x: destinationX, y: destinationY })
                    .call(() => {
                        this.moveCount--;
                        giftNode.destroy();
                        this.playgift(toCorner, "GIFT_" + id);
                        cyberGame.audio.playSound('gift' + id);
                    })
                    .start();
            }
        } catch (error) {
            console.log("GiftManager.move: ", error);
        }
    }

    updateEmo(params: SFS2X.SFSObject): void {
        var emoCode = params.getUtfString('emoCode');
        var sender = params.getUtfString('sender');
        var playerInfo = this.gameScene.seatManager.getSeatByGuserid(sender);
        if (emoCode == 'Angry' || emoCode == 'Smile')
            this.playEmo(playerInfo, emoCode, 2);
        else
            this.playEmo(playerInfo, emoCode, 1);
    }

    playEmo(playerInfo: PlayerInfo, name: string, repeat: number): void {
        if (this.emodAsset && this.emodAtlas) {
            let node = new cc.Node();
            node.setPosition(playerInfo.node.position);
            node.x = node.x - this[name].deltaX;
            node.y = node.y + this[name].deltaY;
            this.node.addChild(node);

            let dragon = node.addComponent(dragonBones.ArmatureDisplay);
            dragon.dragonAsset = this.emodAsset;
            dragon.dragonAtlasAsset = this.emodAtlas;
            dragon.armatureName = 'Armature';
            dragon.playAnimation(name, repeat);
            dragon.enableBatch = true;
            dragon.once(dragonBones.EventObject.COMPLETE, () => {
                dragon.destroy();
            });
        }
    }

    playgift(playerInfo: PlayerInfo, name: string): void {
        let node = new cc.Node();
        node.setPosition(playerInfo.node.position);
        node.x = node.x - this[name].deltaX;
        node.y = node.y + this[name].deltaY;
        this.node.addChild(node);

        let dragon = node.addComponent(dragonBones.ArmatureDisplay);
        dragon.dragonAsset = this.giftAsset;
        dragon.dragonAtlasAsset = this.giftAtlas;
        dragon.armatureName = this[name].armature;
        dragon.playAnimation(this[name].animName, 1);
        dragon.enableBatch = true;
        dragon.once(dragonBones.EventObject.COMPLETE, () => {
            dragon.destroy();
        });
    }

    get GIFT_1() {
        return {
            "animName": "animtion0",
            "armature": "Xo_nuoc",
            "deltaX": 133,
            "deltaY": 120
        }
    }

    get GIFT_2() {
        return {
            "animName": "Hoa_hong",
            "armature": "Hoa_hong",
            "deltaX": 118,
            "deltaY": 140
        }
    }

    get GIFT_3() {
        return {
            "animName": "animtion0",
            "armature": "Brick",
            "deltaX": 121,
            "deltaY": 120
        }
    }

    get GIFT_4() {
        return {
            "animName": "Kiss",
            "armature": "Kiss",
            "deltaX": 125,
            "deltaY": 123
        }
    }

    get GIFT_5() {
        return {
            "animName": "Tomato",
            "armature": "Tomato",
            "deltaX": 125,
            "deltaY": 123
        }
    }

    get GIFT_6() {
        return {
            "animName": "bom",
            "armature": "bom",
            "deltaX": 124,
            "deltaY": 124
        }
    }

    get GIFT_7() {
        return {
            "animName": "animtion0",
            "armature": "Beer",
            "deltaX": 80,
            "deltaY": 65
        }
    }

    get GIFT_8() {
        return {
            "animName": "animtion0",
            "armature": "Egg",
            "deltaX": 123,
            "deltaY": 126
        }
    }

    get Angry() {
        return {
            "animName": "Angry",
            "deltaX": 100,
            "deltaY": 60
        }
    }

    get Bye() {
        return {
            "animName": "Bye",
            "deltaX": 105,
            "deltaY": 58
        }
    }

    get Cry() {
        return {
            "animName": "Cry",
            "deltaX": 104,
            "deltaY": 60
        }
    }

    get Like() {
        return {
            "animName": "Like",
            "deltaX": 50,
            "deltaY": 60
        }
    }

    get Please() {
        return {
            "animName": "Please",
            "deltaX": 105,
            "deltaY": 59
        }
    }

    get Smile() {
        return {
            "animName": "Smile",
            "deltaX": 105,
            "deltaY": 59
        }
    }
}