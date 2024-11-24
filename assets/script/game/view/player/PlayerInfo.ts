import { cyberGame } from "../../../main/CyberGame";
import Player from "../../entities/Player";
import MoneyEntry from "../component/MoneyEntry";
import ProgressBar from "../component/ProgressBar";
import Avatar from "./Avatar";
import CardControl from "../card/CardControl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerInfo extends cc.Component {

    @property()
    readonly index: number = 0;

    @property(cc.Node)
    readonly coin: cc.Node = null;

    @property(cc.Label)
    readonly playerName: cc.Label = null;

    @property(cc.Label)
    readonly playerCoin: cc.Label = null;

    @property(Avatar)
    readonly avatar: Avatar = null;

    @property(cc.Node)
    readonly chat: cc.Node = null;

    @property(cc.Node)
    bid: cc.Node = null;

    lights: cc.Node[] = [];

    targetBid: number = 0;

    hasBet: boolean = false;

    public cardControl: CardControl;

    /**
     * Contains user properties from server(id, coin, name, avatar,....)    
     */
    user: Player = null;

    start(): void {
        this.cardControl = new CardControl(this);
        this.updateData(null);
    }

    reconnectBid(made: number, bid: number): void {
        this.playerName.node.active = false;
        this.playerCoin.node.active = false;
        this.coin.active = false;
        this.bid.active = true;
        this.bid.getChildByName("Bidding").active = false;
        this.bid.getChildByName("Bid").active = true;
        this.bid.getChildByName("Bid").getComponent(cc.Label).string = made + "/" + bid;
        this.targetBid = bid;
    }

    updateData(user: Player): void {
        this.user = user;
        if (user != null) {
            this.enablePlayerNodes();
            this.updateCoin(user.coin);
            this.updateDisplayName(user.displayName);
            this.unHighLight();

            if (user.avatar != null)
                this.avatar.loadAvatar(user.avatar);
            if (this.index != 0)
                this.hideInviteButton();
            if (user.bid > -1) {
                this.reconnectBid(user.made, user.bid);
            }

        } else {
            this.playerName.node.active = false;
            this.playerCoin.node.active = false;
            this.coin.active = false;
            this.avatar.hide();
            this.node.children.forEach((node: cc.Node) => {
                node.active = false;
            })
            if (this.index != 0) {
                this.showInviteButton();
                this.highLight();
            }
        }
    }

    hideNameAndCoin(): void {
        this.playerCoin.node.active = false;
        this.playerName.node.active = false;
        this.coin.active = false;
    }

    startTimer(delay: number): void {
        this.node.getChildByName("ProgressBar").getComponent(ProgressBar).play(delay);
    }

    hideTimer(): void {
        this.node.getChildByName("ProgressBar").getComponent(ProgressBar).stop();
    }

    updateCoin(coin: number): void {
        this.playerCoin.string = String(cyberGame.utils.shortenLargeNumber(coin, 2));
    }

    // updateDisplayName(displayName: string): void {
    //     this.playerName.string = cyberGame.utils.formatName(displayName, 12, false);
    // }
    updateDisplayName(displayName: string): void {
        const limitedDisplayName = displayName.length > 8 ? displayName.slice(0, 8) : displayName;
        this.playerName.string = cyberGame.utils.formatName(limitedDisplayName, 12, false);
    }

    unHighLight(): void {
        this.node.opacity = 128;
        this.avatar.node.opacity = 128;
        this.playerName.node.opacity = 128;
        this.playerCoin.node.opacity = 128;
    }

    highLight(): void {
        this.node.opacity = 255;
        this.avatar.node.opacity = 255;
        this.playerName.node.opacity = 255;
        this.playerCoin.node.opacity = 255;
    }

    showLose(): void {
        let node = this.node.getChildByName(PlayerChildName.ACITON_LOSE);
        node.active = true;
        node.scale = 1;
        this.tweenLoseDec();
    }

    hideLose(): void {
        this.node.getChildByName(PlayerChildName.ACITON_LOSE).active = false;
    }

    private tweenLoseDec(): void {
        let node = this.node.getChildByName(PlayerChildName.ACITON_LOSE);
        if (node.active == true) {
            cc.tween(node)
                .to(1, { scale: 0.85 })
                .call(() => {
                    this.tweenLoseInc();
                })
                .start()
        }
    }

    private tweenLoseInc(): void {
        let node = this.node.getChildByName(PlayerChildName.ACITON_LOSE);
        if (node.active == true) {
            cc.tween(node)
                .to(1, { scale: 1 })
                .call(() => {
                    this.tweenLoseDec();
                })
                .start()
        }
    }

    showDealer(): void {
        this.node.getChildByName(PlayerChildName.DEALER_ICON).active = true;
    }

    hideDealer(): void {
        this.node.getChildByName(PlayerChildName.DEALER_ICON).active = false;
    }

    showInviteButton(): void {
        let node = this.node.getChildByName(PlayerChildName.INVITE_BUTTON);
        if (node)
            node.active = true;
    }

    hideInviteButton(): void {
        let node = this.node.getChildByName(PlayerChildName.INVITE_BUTTON);
        if (node)
            node.active = false;
    }

    showChat(text: string): void {
        this.hideChat();
        this.unschedule(this.hideChat);
        let txt = this.chat.getChildByName("chatBubble").getChildByName("txt");
        txt.getComponent(cc.Label).string = text;
        this.chat.active = true;
        this.scheduleOnce(this.hideChat, 3);
    }

    hideChat(): void {
        this.chat.active = false;
    }

    private enablePlayerNodes(): void {
        this.avatar.show();
        // this.node.getChildByName("line").active = true;
        this.playerName.node.active = true;
        this.playerCoin.node.active = true;
        this.coin.active = true;
        this.node.getChildByName(PlayerChildName.NAME_CONTAINER).active = true;
        this.node.getChildByName(PlayerChildName.AVATAR_BORDER).active = true;
    }

    get cards() {
        return this.cardControl.cards;
    }

    biding(): void {
        this.playerName.node.active = false;
        this.playerCoin.node.active = false;
        this.coin.active = false;

        if (!this.user.hasBet) {
            this.user.hasBet = true;
            this.bid.active = true;
            const biddingNode = this.bid.getChildByName("Bidding");
            biddingNode.active = true;
            this.bid.getChildByName("Bid").active = false;

            cc.tween(biddingNode)
                .repeatForever(
                    cc.tween()
                        .to(0.5, { opacity: 0 })
                        .to(0.5, { opacity: 255 })
                )
                .start();
        }
    }

    resetRound(): void {
        this.bid.getChildByName("Bidding").active = false;
        this.bid.getChildByName("Bid").active = false;
        this.playerName.node.active = true;
        this.playerCoin.node.active = true;
        this.coin.active = true;
        this.user.seeCards = false;
    }

    updateNewBid(): void {
        this.user.made++;
        this.bid.getChildByName("Bid").getComponent(cc.Label).string = this.user.made.toString() + "/" + this.user.bid.toString();
    }

    updateBid(): void {
        this.bid.getChildByName("Bidding").active = false;
        this.bid.getChildByName("Bid").active = true;
        this.bid.getChildByName("Bid").getComponent(cc.Label).string = this.user.made.toString() + "/" + this.user.bid.toString();
    }

    reset(): void {
        this.hideLose();
        this.hideDealer();
        this.hideInviteButton();
        this.cardControl.reset();
    }
}

export enum PlayerChildName {
    INVITE_BUTTON = "icon_invite",
    AVATAR_BORDER = "avatar_back",
    NAME_CONTAINER = "name_container",
    DEALER_ICON = "dealer_icon",
    ACITON_LOSE = "avatar_lose"
}