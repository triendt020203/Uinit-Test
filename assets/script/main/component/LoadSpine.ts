import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadSpine extends cc.Component {

    @property(cc.Node)
    spineNode: cc.Node = null;

    @property(cc.Node)
    imgNode: cc.Node = null;

    @property
    spinePath: string = '';

    @property
    animName: string = '';

    start(): void {
        if (cyberGame.lang.code == "th") {
            cc.resources.load(this.spinePath, sp.SkeletonData, (err, res: sp.SkeletonData) => {
                if (!err) {
                    if (cc.isValid(this.node)) {
                        this.spineNode.active = true;
                        let spine = this.spineNode.getComponent('sp.Skeleton');
                        spine.skeletonData = res;
                        spine.setAnimation(0, this.animName, true);
                        this.imgNode.destroy();
                    }
                } else {
                    console.log(err);
                }
            });
        }
    }
}
