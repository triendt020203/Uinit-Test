import { cyberGame } from "../../../main/CyberGame";
import SocketControl from "../../SocketControl";

const { ccclass } = cc._decorator;

@ccclass
export default class Card extends cc.Component {

    private id: number;
    private playerPos: number = -1;
    private playerX: number;
    private playerY: number;
    private playerAngle: number;
    private playerScale: number;
    private startY: number;
    private cardSF: cc.SpriteFrame = null;
    public overlaySF: cc.SpriteFrame = null;
    public overlay: cc.Node = null;
    public cardManager: any = null;
    private distributed: boolean = false;
    private choosed: boolean = false;
    private tweening: boolean = false;
    private draggingCircle = null;

    startIndex = 0;
    draggingDistanceX = 0;
    draggingDistanceY = 0;
    draggingCircleTargetX = 0;
    beginX = 0;
    beginY = 0;

    setId(id: number): void {
        this.id = id;
        if (id != -1) {
            let sf: cc.SpriteFrame = this.cardManager.cardAtlas.getSpriteFrame("Card_" + id);
            this.setCardSF(sf);
        }
    }

    getId(): number {
        return this.id;
    }

    setCardPositon(point: any): void {
        this.playerX = point.x;
        this.playerY = point.y;
        this.playerAngle = point.angle;
        this.playerScale = point.scale;
    }

    setNewX(x: number): void {
        this.playerX = x;
    }

    setPlayerPos(pos: number) {
        this.playerPos = pos;
    }

    getPlayerPos(): number {
        return this.playerPos;
    }

    setCardSF(sf: cc.SpriteFrame): void {
        this.cardSF = sf;
    }

    isChoose(): boolean {
        return this.choosed;
    }

    isDistributed(): boolean {
        return this.distributed;
    }

    setDistributed(val: boolean): void {
        this.distributed = val;
    }

    enableCardClick(): void {
        this.choosed = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onHandlerTouchStartCard, this);
    }

    onHandlerTouchStartCard(evt: cc.Event.EventTouch): void {
        let touch = evt.touch;
        this.beginX = this.node.x;
        this.beginY = this.node.y;
        this.draggingCircle = this.node;
        if (this.draggingCircle) {
            this.draggingDistanceX = touch.getLocation().x - this.node.x;
            this.draggingDistanceY = touch.getLocation().y - this.node.y;
            this.draggingCircle.on(cc.Node.EventType.TOUCH_MOVE, this.onHandlerTouchMoveCard, this);
            this.draggingCircle.on(cc.Node.EventType.TOUCH_END, this.onHandlerTouchEndCard, this);
            this.draggingCircle.on(cc.Node.EventType.TOUCH_CANCEL, this.onHandlerTouchEndCard, this);
        }
    }

    onHandlerTouchMoveCard(evt: cc.Event.EventTouch): void {
        let touch = evt.touch;
        let newPosX = touch.getLocation().x - this.draggingDistanceX;
        let newPosY = touch.getLocation().y - this.draggingDistanceY;

        if (newPosX < -460) {
            newPosX = -460;
        } else if (newPosX > 460) {
            newPosX = 460;
        }
        if (newPosY < -260) {
            newPosY = -260;
        } else if (newPosY > 0) {
            newPosY = 0;
        }
        this.draggingCircle.setPosition(newPosX, newPosY);
    }

    onHandlerTouchEndCard(evt: cc.Event.EventTouch): void {
        this.node.x = this.beginX;
        this.node.y = this.beginY;
        SocketControl.instance.sendDumpCardRequest(this.id);
        if (this.draggingCircle) {
            this.draggingCircle.off(cc.Node.EventType.TOUCH_MOVE, this.onHandlerTouchMoveCard, this);
            this.draggingCircle.off(cc.Node.EventType.TOUCH_END, this.onHandlerTouchEndCard, this);
            this.draggingCircle.off(cc.Node.EventType.TOUCH_CANCEL, this.onHandlerTouchEndCard, this);
            this.draggingCircle = null;
        }
    }

    disableCardClick(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onHandlerTouchStartCard, this);
    }

    unChoose(): void {
        if (this.tweening)
            return;
        this.choosed = false;
        this.tweenToNewY(this.startY);
    }

    choose(): void {
        if (this.tweening)
            return;
        this.choosed = true;
        this.tweenToNewY(this.startY + 15);
    }

    tweenToNewY(toY: number): void {
        this.tweening = true;
        cc.tween(this.node)
            .to(0.15, { y: toY })
            .call(() => {
                this.tweening = false;
            })
            .start();
    }

    open(): void {
        this.node.x = this.playerX;
        this.node.y = this.playerY;
        this.startY = this.playerY;
        this.node.setScale(this.playerScale);
        this.node.angle = this.playerAngle;
        if (this.cardSF)
            this.simpleOpen();
    }

    moveToPlayer(isOverlay?: boolean): void {
        this.scheduleOnce(() => {
            if (this.cardSF) {
                this.startY = this.playerY;
                this.openCurrentPlayerCard(isOverlay);
            }
        }, 0.2);

        cc.tween(this.node)
            .to(0.5, { x: this.playerX, y: this.playerY, angle: this.playerAngle, scale: this.playerScale }, { easing: "quintInOut" })
            .start();
    }

    moveToWinner(): void {
        cc.tween(this.node)
            .to(1, { x: this.playerX, y: this.playerY, angle: this.playerAngle, scale: 0.4 }, { easing: "quintOut" })
            .start();
    }

    moveToTable(): void {
        this.onHandlerTouchEndCard({} as cc.Event.EventTouch);
        cc.tween(this.node)
            .to(0.6, { x: this.playerX, y: this.playerY, angle: this.playerAngle, scale: this.playerScale }, { easing: "quintOut" })
            .start();
    }

    moveOppCardToTable(): void {
        this.hideOverlay();
        this.simpleOpen();
        cc.tween(this.node)
            .to(0.6, { x: this.playerX, y: this.playerY, angle: this.playerAngle, scale: this.playerScale }, { easing: "quintOut" })
            .start();
        cc.tween(this.node)
            .to(0.15, { scale: this.playerScale + 0.1 }, { easing: "backOut" })
            .call(() => {
                cc.tween(this.node)
                    .to(0.15, { scale: this.playerScale }, { easing: "backOut" })
                    .start();
            })
            .start();
    }

    /**
     * for current player only
     */

    moveToNewX(x: number, cb?: any): void {
        this.playerX = x;
        cc.tween(this.node)
            .to(0.8, { x: this.playerX }, { easing: "backOut" })
            .call(() => {
                if (cb)
                    cb();
            })
            .start();
    }

    moveToNewXYR(x: number, y: number, r: number, cb?: any): void {
        this.playerX = x;
        this.playerY = y;
        this.playerAngle = r;
        cc.tween(this.node)
            .to(0.8, { x: this.playerX, y: this.playerY, angle: this.playerAngle }, { easing: "backOut" })
            .call(() => {
                if (cb)
                    cb();
            })
            .start();
    }

    openCardToPosition(): Promise<void> {
        return new Promise((resolve) => {
            cc.tween(this.node)
                .to(0.7, { x: this.playerX, y: this.playerY, scale: this.playerScale }, { easing: "backOut" })
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    openCurrentPlayerCard(isOverlay?: boolean): void {
        if (isOverlay == true) {
            cc.tween(this.node)
                .to(0.1, { scaleX: 0, scaleY: this.playerScale })
                .call(() => {
                    this.simpleOpen();
                })
                .to(0.1, { scaleX: this.playerScale, scaleY: this.playerScale })
                .call(() => {
                    this.cardManager.gameScene.node.emit(cyberGame.event.GameEvent.ADD_CARD_FINISH, this);
                })
                .start();
        } else {

        }
    }

    simpleOpen(): void {
        this.changeSpriteFrame(this.cardSF);
    }

    simpleClose(): void {
        this.changeSpriteFrame(this.cardManager.cardBackSF);
    }

    changeSpriteFrame(sf: cc.SpriteFrame): void {
        this.node.getComponent(cc.Sprite).spriteFrame = sf;
    }

    addOverlay(): void {
        this.disableCardClick();
        if (!this.overlay) {
            this.overlay = new cc.Node("overlay");
            this.overlay.setScale(0.94)
            this.overlay.addComponent(cc.Sprite).spriteFrame = this.overlaySF;
            this.overlay.opacity = 150;
            this.overlay.parent = this.node;
        } else {
            this.overlay.parent = this.node;
            this.overlay.active = true;
        }
    }

    hideOverlay(): void {
        if (this.overlay && this.overlay.active == true) {
            this.overlay.removeFromParent(false);
            this.overlay.active = false;
        }
    }

    hide(): void {
        cc.tween(this.node)
            .to(0.3, { scale: 0, opacity: 0 }, { easing: "linear" })
            .call(() => {
                this.resetCard();
            })
            .start();
    }

    resetCard(): void {
        if (this.distributed) {
            this.choosed = false;
            this.distributed = false;
            this.id = -1;
            this.playerPos = -1;
            this.simpleClose();
            this.disableCardClick();
            this.setCardSF(null);
            this.tweening = false;
            this.hideOverlay();
            this.node.active = false;
            this.node.opacity = 255;
            this.node.zIndex = 0;
            this.node.removeFromParent(false);
        }
    }

    tutEnableCardClick(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.tutOnHandlerTouchStartCard, this);
    }

    tutOnHandlerTouchStartCard(evt: cc.Event.EventTouch): void {
        let touch = evt.touch;
        this.beginX = this.node.x;
        this.beginY = this.node.y;
        this.draggingCircle = this.node;
        if (this.draggingCircle) {
            this.draggingDistanceX = touch.getLocation().x - this.node.x;
            this.draggingDistanceY = touch.getLocation().y - this.node.y;
            this.draggingCircle.on(cc.Node.EventType.TOUCH_MOVE, this.tutOnHandlerTouchMoveCard, this);
            this.draggingCircle.on(cc.Node.EventType.TOUCH_END, this.tutOnHandlerTouchEndCard, this);
            this.draggingCircle.on(cc.Node.EventType.TOUCH_CANCEL, this.tutOnHandlerTouchEndCard, this);
        }
    }

    tutOnHandlerTouchMoveCard(evt: cc.Event.EventTouch): void {
        let touch = evt.touch;
        let newPosX = touch.getLocation().x - this.draggingDistanceX;
        let newPosY = touch.getLocation().y - this.draggingDistanceY;

        if (newPosX < -460) {
            newPosX = -460;
        } else if (newPosX > 460) {
            newPosX = 460;
        }
        if (newPosY < -260) {
            newPosY = -260;
        } else if (newPosY > 0) {
            newPosY = 0;
        }
        this.draggingCircle.setPosition(newPosX, newPosY);
    }

    tutOnHandlerTouchEndCard(evt: cc.Event.EventTouch): void {
        this.node.x = this.beginX;
        this.node.y = this.beginY;
        this.cardManager.gameScene.node.emit(cyberGame.event.GameEvent.CARD_CLICK, this);
        if (this.draggingCircle) {
            this.draggingCircle.off(cc.Node.EventType.TOUCH_MOVE, this.tutOnHandlerTouchMoveCard, this);
            this.draggingCircle.off(cc.Node.EventType.TOUCH_END, this.tutOnHandlerTouchEndCard, this);
            this.draggingCircle.off(cc.Node.EventType.TOUCH_CANCEL, this.tutOnHandlerTouchEndCard, this);
            this.draggingCircle = null;
        }
    }
}