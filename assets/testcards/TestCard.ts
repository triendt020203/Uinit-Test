import { cyberGame } from "../script/main/CyberGame";
import CardNode from "./CardNode";
import CheckBox from "./CheckBox";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestCard extends cc.Component {

    @property(cc.SpriteAtlas)
    cardAtlas: cc.SpriteAtlas = null;

    cardList: CardNode[] = [];

    @property({ type: [cc.Node] })
    players: cc.Node[] = [];

    @property({ type: [cc.Node] })
    checkboxes: cc.Node[] = [];

    board: cc.Node;


    onSend() {
        let boardIds = [];
        for (let i = 0; i < this.board.children.length; i++)
            boardIds.push(this.board.children[i].getComponent(CardNode).id);

        let array = new SFS2X.SFSArray();

        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
             let ids = [];
            for (let i = 0; i < player.children.length; i++)
                ids.push(player.children[i].getComponent(CardNode).id);
            array.addIntArray(ids);
        }

        let params = new SFS2X.SFSObject();
        params.putSFSArray("players", array);

        console.log(params.getDump());
        cyberGame.socket.send(new SFS2X.ExtensionRequest("setCards", params, cyberGame.socket.lastJoinedRoom));
        this.onClose();
    }

    onTip() {
        let boardIds: number[] = [];
        for (let i = 0; i < this.board.children.length; i++) {
            boardIds.push(this.board.children[i].getComponent(CardNode).id);
        }
        cc.game.emit("onTip", boardIds);
        
        this.onClose();
    }

    start() {
        this.node.on("testCardClick", this.onCardClick, this);

        this.board = this.node.getChildByName("bg").getChildByName("board");

        for (let i = 0; i < this.checkboxes.length; i++) {
            this.checkboxes[i].getComponent(CheckBox).testCard = this;
            //if (i > 0)
            //this.checkboxes[i].getComponent(CheckBox).uncheck();
        }

        for (let i = 0; i < 52; i++) {
            // create card node
            let cardNode = new cc.Node("Card_" + i);
            cardNode.x = 0;
            cardNode.y = 0;

            cardNode.setScale(0.4);
            cardNode.parent = this.node.getChildByName("bg").getChildByName("cards");

            let card = cardNode.addComponent(CardNode);
            card.id = i;
            card.testCard = this;
            cardNode.addComponent(cc.Sprite).spriteFrame = this.cardAtlas.getSpriteFrame("Card_" + i);
            card.enableCardClick()
            this.cardList.push(card);
        }
    }

    onCardClick(card: CardNode) {
        if (!card.distributed) {
            // && this.players.length == 2
            if (this.checkboxes[0].getComponent(CheckBox).isCheck() && this.board.childrenCount < 6 && this.players.length < 3) {
                card.node.x = 0;
                card.node.y = 0;
                card.node.parent = this.board;
                card.distributed = true;
            } else {
                for (let i = 0; i < this.players.length; i++) {
                    let player = this.players[i];
                    if (player.childrenCount < 13 && this.checkboxes[i + 1].getComponent(CheckBox).isCheck()) {
                        card.node.x = 0;
                        card.node.y = 0;
                        card.node.parent = player;
                        card.distributed = true;
                        break;
                    }
                }
            }
        } else {
            card.node.x = 0;
            card.node.y = 0;
            card.node.parent = this.node.getChildByName("bg").getChildByName("cards");
            card.distributed = false;
        }
    }

    onClose() {
        let params = new SFS2X.SFSObject();
        //params.putInt("size", 4);
        //cyberGame.socket.send(new SFS2X.ExtensionRequest("enableNpc", params, cyberGame.socket.lastJoinedRoom));
        //cyberGame.socket.send(new SFS2X.ExtensionRequest("disableReconnect", null, cyberGame.socket.lastJoinedRoom));
        //cyberGame.socket.send(new SFS2X.ExtensionRequest("disableGameTask", null, cyberGame.socket.lastJoinedRoom));
        this.node.destroy();
    }

    /*onCheck(node: CheckBox) {
        for (let i = 0; i < this.checkboxes.length; i++) {
            if (this.checkboxes[i].getComponent(CheckBox).index != node.index)
                this.checkboxes[i].getComponent(CheckBox).uncheck();
        }
    }*/
}
