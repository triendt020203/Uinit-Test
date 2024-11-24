export default class AdapterManager {

    private static _instance: AdapterManager = null;

    public static get inst() {
        if (this._instance == null) {
            this._instance = new AdapterManager();
            this._instance.visibleSize = cc.winSize;
            this._instance.ratio = cc.winSize.height / cc.winSize.width;
        }
        return this._instance;
    }

    private constructor() { }

    public visibleSize: cc.Size;
    public ratio: number;

    public autoFitCanvas(node: cc.Node) {
        let ratio = this.ratio;
        let oRation = 640 / 1136;
        if (ratio > oRation) {
            //console.log("update resolution please", ratio, oRation);
            if (ratio <= 0.65)
                this.adapatByType(AdaptaterType.FIT_WIDTH, node);
            else
                this.adapatByType(AdaptaterType.FIT_ALL, node);
        }
    }

    public adapatByType(type: AdaptaterType, node: cc.Node) {
        let canvas = node.getComponent(cc.Canvas);
        switch (type) {
            case AdaptaterType.FIT_WIDTH:
                canvas.fitWidth = true;
                canvas.fitHeight = false;
                break;
            case AdaptaterType.FIT_HEIGHT:
                canvas.fitWidth = false;
                canvas.fitHeight = true;
                break;
            case AdaptaterType.FIT_ALL:
                canvas.fitWidth = true;
                canvas.fitHeight = true;
                break;
            case AdaptaterType.SHOW_ALL:
                canvas.fitWidth = false;
                canvas.fitHeight = false;
                break;
        }
    }

    updateAllNodeWidget(rootNode: cc.Node) {
        let rootWidget = rootNode.getComponent(cc.Widget);
        if (rootWidget) rootWidget.updateAlignment();

        var widgets = rootNode.getComponentsInChildren(cc.Widget);
        for (let widget of widgets) {
            widget.updateAlignment();
        }
    }

    removeWidget(node: cc.Node) {
        if (node.getComponent(cc.Widget)) {
            node.removeComponent(cc.Widget);
        }
    }
}

export enum AdaptaterType {
    FIT_WIDTH = 0,
    FIT_HEIGHT = 1,
    FIT_ALL = 2,
    SHOW_ALL = 3
}