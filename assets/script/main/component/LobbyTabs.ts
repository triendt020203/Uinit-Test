import { cyberGame } from "../CyberGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LobbyTabs extends cc.Component {

    private currentTab: string = "beginner";

    @property({ type: [cc.Node] })
    tabs: cc.Node[] = [];

    start(): void {
        if (cyberGame.lang.code == "en") {
            let totalWidth = 0;
            for (let i = 0; i < this.tabs.length; i++) {
                let tab = this.tabs[i];
                let txtNode = tab.getChildByName("txt");
                tab.setContentSize(txtNode.width + 60, 88);
                totalWidth += tab.width;
            }
            this.node.setContentSize(totalWidth, 88);
        }
    }

    setActiveTab(tab: string): void {
        this.currentTab = tab;
        this.node.getChildByName(tab).getChildByName("activeTab").active = true;
        this.node.getChildByName(tab).getChildByName("txt").active = false;
    }

    onTabClick(event: any, tab: string): void {
        if (this.currentTab != tab) {
            cyberGame.audio.playButton();

            this.node.getChildByName(this.currentTab).getChildByName("txt").active = true;
            this.node.getChildByName(this.currentTab).getChildByName("activeTab").active = false;

            this.setActiveTab(tab);
            this.node.emit(cyberGame.event.ON_LOBBY_TAB_CHANGE, tab);
        }
    }
}