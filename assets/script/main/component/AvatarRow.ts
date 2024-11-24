import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AvatarRow extends cc.Component {

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    start() {

    }

    createAvatarBox() {
        let node = cc.instantiate(this.itemPrefab);
        node.parent = this.node;
        return node;
    }
}