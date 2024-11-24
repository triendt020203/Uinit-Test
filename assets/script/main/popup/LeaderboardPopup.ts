import { cyberGame } from "../CyberGame";
import OverlayLoader from "../component/OverlayLoader";

const { ccclass, property } = cc._decorator;

enum TabType {
    INCOME = "income",
    RANK = "rank"
}

const LIMIT = 50;

let data = null;
let lastRequestTopWin = 0;
let lastRequestTopIncome = 0;
let entriesRequesting = false;

@ccclass
export default class LeaderboardPopup extends cc.Component {

    @property(cc.ScrollView)
    private listView: cc.ScrollView = null;

    @property(cc.Prefab)
    private entryPrefab: cc.Prefab = null;

    @property(cc.Button)
    private incomeButton: cc.Button = null;

    @property(cc.Button)
    private rankButton: cc.Button = null;

    @property(cc.SpriteFrame)
    private r1SF: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    private r2SF: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    private r3SF: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    private coinSF: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    private winSF: cc.SpriteFrame = null;

    private currentTab: string = TabType.INCOME;

    private overlayLoader = null;

    start() {
        if (data == null) {
            data = new Map();
            data.set(TabType.INCOME, []);
            data.set(TabType.RANK, [])
        } else {
            if (lastRequestTopIncome > 0 && this.isRequestingNewEntriesAllowed(lastRequestTopIncome))
                data.get(TabType.INCOME).length = 0;
            if (lastRequestTopWin > 0 && this.isRequestingNewEntriesAllowed(lastRequestTopWin))
                data.get(TabType.RANK).length = 0;
        }
        entriesRequesting = false;
        this.showOverlayLoader();
        this.getLeaderboardAsync(this.currentTab, true);

        if (cyberGame.lang.code == "th") {
            let title = this.node.getChildByName("leaderboard_popup_bg").getChildByName("title");
            title.y = title.y + 15;
        }
    }

    onEnable() {
        cyberGame.socket.addEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse, this);
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, true);

        /*let node = this.node.getChildByName("leaderboard_popup_bg");
        node.setScale(0.8);
        cc.tween(node)
            .to(0.8, { scale: 1 }, { easing: 'elasticOut' })
            .start();*/
    }

    onDisable() {
        cyberGame.socket.removeEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse);
        cc.game.emit(cyberGame.event.ON_POPUP_VISIBILITY_CHANGE, false);
    }

    isRequestingNewEntriesAllowed(lastRequest: number) {
        let elapsed = Date.now() - lastRequest;
        if (elapsed >= 120000)
            return true;
        else
            return false;
    }

    getLeaderboardAsync(name: string, forced: boolean) {
        let entries: [] = data.get(name);
        if (entries.length == 0 || !forced) {
            if (!entriesRequesting && entries.length < LIMIT) {
                entriesRequesting = true;
                let params = new SFS2X.SFSObject();
                //params.putInt("idx", entries.length);
                if (name == TabType.RANK)
                    cyberGame.socket.send(new SFS2X.ExtensionRequest("leaderboard.getTopWinner", params));
                else if (name == TabType.INCOME)
                    cyberGame.socket.send(new SFS2X.ExtensionRequest("leaderboard.getTopIncome", params));
            }
        } else {
            this.hideOverlayLoader();
            this.showEntries(0);
        }
    }

    onExtensionResponse(event: any) {
        if (event.params.containsKey("entries")) {
            let sfsArray = event.params.getSFSArray("entries");
            if (sfsArray.size() > 0) {
                let name = (event.cmd == "leaderboard.getTopIncome") ? TabType.INCOME : TabType.RANK;
                let lent = data.get(name).length;
                for (let i = 0; i < sfsArray.size(); i++) {
                    let obj = sfsArray.getSFSObject(i);
                    data.get(name).push({
                        guserid: obj.getLong("guserid"),
                        name: obj.getUtfString("name"),
                        avatar: obj.containsKey("avatar") ? obj.getUtfString("avatar") : null,
                        rank: lent + i + 1,
                        score: obj.containsKey("game_win") ? obj.getInt("game_win") : obj.getLong("coin_win")
                    });
                }

                if (name == this.currentTab)
                    this.showEntries(lent);

                if (event.cmd == "leaderboard.getTopWinner")
                    lastRequestTopWin = Date.now();
                else if (event.cmd == "leaderboard.getTopIncome")
                    lastRequestTopIncome = Date.now();

                entriesRequesting = false;
            }
            this.hideOverlayLoader();
        }
    }

    showEntries(idx?: number) {
        let entries: [] = data.get(this.currentTab);
        if (entries.length == 0) return;
        let yStart = 0;
        for (let i = 0; i < entries.length; i++) {
            let obj: any = entries[i];

            // create node
            let node = cc.instantiate(this.entryPrefab);
            node.setPosition(0, yStart);

            // update rank
            this.setRank(node, obj.rank);

            // name and avatar
            this.setNameAndAvatar(node, obj.name, obj.avatar);

            // set score            
            this.setEntryScore(node, obj.score);

            // add node to scrollview
            this.listView.content.addChild(node);

            yStart -= 66;
        }
        yStart = - yStart;
        this.listView.content.setContentSize(706, yStart);
    }

    setEntryScore(node: cc.Node, val: number) {
        let icon: cc.Node = node.getChildByName("iconVal");
        icon.getComponent(cc.Sprite).spriteFrame = (this.currentTab == TabType.INCOME) ? this.coinSF : this.winSF;

        let txt: string = (this.currentTab == TabType.INCOME) ? cyberGame.utils.shortenLargeNumber(val, 0) : String(val);
        let text: cc.Node = node.getChildByName("textVal");
        text.getComponent(cc.Label).string = txt;
    }

    setNameAndAvatar(node: cc.Node, name: string, avatar: string) {
        try {
            if (name) {
                node.getChildByName("playerName").active = true;
                node.getChildByName("playerName").getComponent(cc.Label).string = name;
            }
            cyberGame.loadAvatar(avatar, node.getChildByName("avatar"), 54);
        } catch (error) {
            console.log(error);
        }
    }

    setRank(node: cc.Node, rank: number) {
        if (rank < 4) {
            node.getChildByName("icon").active = true;
            let sf = null;
            if (rank == 1)
                sf = this.r1SF;
            else if (rank == 2)
                sf = this.r2SF;
            else if (rank == 3)
                sf = this.r3SF;
            node.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = sf;
        } else {
            node.getChildByName("rank").active = true;
            node.getChildByName("rank").getComponent(cc.Label).string = String(rank);
        }
    }

    onTabClick(event: any, tabType: string) {
        cyberGame.audio.playButton();
        if (tabType != this.currentTab) {
            this.currentTab = tabType;
            if (tabType == TabType.INCOME) {
                this.incomeButton.node.getChildByName("income_button").active = true;
                this.incomeButton.node.getChildByName("income_button_inactive").active = false;
                this.rankButton.node.getChildByName("topwin_button").active = false;
                this.rankButton.node.getChildByName("topwin_button_inactive").active = true;
            } else if (tabType == TabType.RANK) {
                this.incomeButton.node.getChildByName("income_button").active = false;
                this.incomeButton.node.getChildByName("income_button_inactive").active = true;
                this.rankButton.node.getChildByName("topwin_button").active = true;
                this.rankButton.node.getChildByName("topwin_button_inactive").active = false;
            }
            this.listView.content.removeAllChildren();
            this.showOverlayLoader();
            this.scheduleOnce(() => {
                if (entriesRequesting)
                    entriesRequesting = false;
                this.getLeaderboardAsync(this.currentTab, true);
            }, 0.3);
        }
    }

    showOverlayLoader() {
        if (!this.overlayLoader) {
            this.overlayLoader = cyberGame.createOverlay();
            this.node.addChild(this.overlayLoader);
        }
    }

    hideOverlayLoader() {
        if (this.overlayLoader) {
            this.overlayLoader.getComponent(OverlayLoader).close();
            this.overlayLoader = null;
        }
    }

    closePopup() {
        cyberGame.audio.playButton();
        this.node.destroy();
    }

}