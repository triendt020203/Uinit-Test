import StartCountDown from "../prefab/StartCountDown";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DeskLayer extends cc.Component {

    @property(cc.Prefab)
    countDownPrefab: cc.Prefab = null;

    countDownNode: cc.Node = null;

    showStartEffect(cb: any): void {
        cb();
    }

    showStartCountDown(delay: number): void {
        if (delay > 1000 && !this.countDownNode) {
            this.countDownNode = cc.instantiate(this.countDownPrefab);
            this.countDownNode.getComponent(StartCountDown).delay = delay;
            this.node.addChild(this.countDownNode);
        }
    }

    hideStartCountDown(): void {
        if (this.countDownNode) {
            try {
                if (cc.isValid(this.countDownNode))
                    this.countDownNode.getComponent(StartCountDown).stopCounter();
            } catch (error) {
                console.log(error);
            }
            this.countDownNode = null;
        }
    }

    isCountDownRunning(): boolean {
        try {
            if (this.countDownNode)
                return this.countDownNode.getComponent(StartCountDown).running;
        } catch (error) {
            return false;
        }
        return false;
    }

    showWatingPlayerText(): void {
        this.node.getChildByName("waiting_bg").active = true;
    }

    hideWatingPlayerText(): void {
        this.node.getChildByName("waiting_bg").active = false;
    }

}
