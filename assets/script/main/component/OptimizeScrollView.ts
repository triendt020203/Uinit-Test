const { ccclass, property } = cc._decorator;

@ccclass
export default class OptimizeScrollView extends cc.Component {
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    protected start(): void {
        this.event_update_opacity();
    }

    onDisable(): void {
        this.scrollView.content.off(cc.Node.EventType.CHILD_REMOVED, this.event_update_opacity, this);
        this.scrollView.content.off(cc.Node.EventType.CHILD_REORDER, this.event_update_opacity, this);
    }

    onEnable(): void {
        this.scrollView.content.on(cc.Node.EventType.CHILD_REMOVED, this.event_update_opacity, this);
        this.scrollView.content.on(cc.Node.EventType.CHILD_REORDER, this.event_update_opacity, this);
    }

    handleScrollEvent(): void {
        this.event_update_opacity();
    }

    private _get_bounding_box_to_world(node_o_: any): cc.Rect {
        let w_n: number = node_o_._contentSize.width;
        let h_n: number = node_o_._contentSize.height;
        let rect_o = cc.rect(
            -node_o_._anchorPoint.x * w_n,
            -node_o_._anchorPoint.y * h_n,
            w_n,
            h_n
        );
        node_o_._calculWorldMatrix();
        rect_o.transformMat4(rect_o, node_o_._worldMatrix);
        return rect_o;
    }

    private _check_collision(node_o_: cc.Node): boolean {
        let rect1_o = this._get_bounding_box_to_world(this.scrollView.content.parent);
        let rect2_o = this._get_bounding_box_to_world(node_o_);
        // ------------------Insurance coverage
        rect1_o.width += rect1_o.width * 0.5;
        rect1_o.height += rect1_o.height * 0.5;
        rect1_o.x -= rect1_o.width * 0.25;
        rect1_o.y -= rect1_o.height * 0.25;
        return rect1_o.intersects(rect2_o);
    }

    public event_update_opacity(): void {
        this.scrollView.content.children.forEach(v1_o => {
            v1_o.opacity = this._check_collision(v1_o) ? 255 : 0;
        });
    }
}
