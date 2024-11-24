import { cyberGame } from "../../../main/CyberGame";
import TextManager from "./TextManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MoneyEntry extends cc.Component {

    @property(TextManager)
    textManager: TextManager = null;

    chars = [];
    startY: number = 0;

    showLose(coin: number): void {
        this.hide();
        let width: number = 0;
        let moneyText: string = cyberGame.utils.shortenLargeNumber(coin, 2) + "";
        moneyText = moneyText.toLowerCase();
        for (let i = 0; i < moneyText.length; i++) {
            let c = moneyText.charAt(i);
            let sf: cc.SpriteFrame = null;
            let node = this.textManager.getCharNode();
            node.setPosition(0, 0);
            if (c == ".") {
                node.y = -9;
                sf = this.textManager.arrOfLoseTextSF[10];
            } else if (c == "-") {
                sf = this.textManager.arrOfLoseTextSF[13];
            } else if (c == "k") {
                sf = this.textManager.arrOfLoseTextSF[11];
            } else if (c == "m") {
                sf = this.textManager.arrOfLoseTextSF[12];
            } else {
                sf = this.textManager.arrOfLoseTextSF[parseInt(c)];
            }
            width += sf.getRect().width;
            node.getComponent(cc.Sprite).spriteFrame = sf;

            this.node.addChild(node);
            this.chars.push(node);
        }
        this.node.setContentSize(width, 25);
        this.node.active = true;
    }

    showWin(coin: number): void {
        this.hide();
        let width: number = 0;
        let moneyText: string = "+" + cyberGame.utils.shortenLargeNumber(coin, 2);
        moneyText = moneyText.toLowerCase();
        for (let i = 0; i < moneyText.length; i++) {
            let c = moneyText.charAt(i);
            let sf: cc.SpriteFrame = null;
            let node = this.textManager.getCharNode();
            node.setPosition(0, 0);
            if (c == ".") {
                node.y = -9;
                sf = this.textManager.arrOfWinTextSF[10];
            } else if (c == "+") {
                sf = this.textManager.arrOfWinTextSF[13];
            } else if (c == "k") {
                sf = this.textManager.arrOfWinTextSF[11];
            } else if (c == "m") {
                sf = this.textManager.arrOfWinTextSF[12];
            } else {
                sf = this.textManager.arrOfWinTextSF[parseInt(c)];
            }
            width += sf.getRect().width;
            node.getComponent(cc.Sprite).spriteFrame = sf;

            this.node.addChild(node);
            this.chars.push(node);
        }
        this.node.setContentSize(width, 27);
        this.node.active = true;
    }

    hide(): void {
        if (this.chars.length > 0) {
            for (let i = 0; i < this.chars.length; i++)
                this.textManager.charPool.put(this.chars[i]);
            this.chars.length = 0;
        }
        this.node.active = false;
    }
}