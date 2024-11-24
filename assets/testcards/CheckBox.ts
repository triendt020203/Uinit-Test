import TestCard from "./TestCard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CheckBox extends cc.Component {

    @property(cc.Node)
    checkNode: cc.Node = null;

    @property()
    readonly index: number = 0;

    testCard: TestCard;

    onClick() {
        if (this.checkNode.active == false) {
            this.checkNode.active = true;
        } else {
            this.checkNode.active = false;
        }
    }

    isCheck() {
        return this.checkNode.active == true;
    }
}