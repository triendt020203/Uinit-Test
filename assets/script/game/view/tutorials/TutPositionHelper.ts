import { GameInfo } from "../../constants/GameInfo";
import { CardSize } from "../card/CardSize";
import TutCardControl from "./TutCardControl";

export interface CardPosition {
    x: number,
    y: number,
    rotation: number,
    isUsed: boolean
}

export default class TutPositionHelper {
    public static createCardPositions(cardControl: TutCardControl): void {
        if (cardControl.index == 0)
            this.createCurrentPosition(cardControl.positions);
        else if (cardControl.index === 1)
            this.createLeftPosition(cardControl.seat.node, cardControl.positions);
        else if (cardControl.index === 2)
            this.createTopPosition(cardControl.seat.node, cardControl.positions);
        else if (cardControl.index === 3)
            this.createRightPosition(cardControl.seat.node, cardControl.positions);
    }

    private static createCurrentPosition(positions: any[]) {
        const cardH = CardSize.PLAYER_HEIGHT;
        const radius = 300;
        const angleOffset = Math.PI / 2.75;
        const totalCards = GameInfo.TOTAL_CARDS_FOR_EACH_PLAYER;

        const angleStep = (Math.PI - angleOffset * 2) / (totalCards - 1);

        for (let i = 0; i < totalCards; i++) {
            const angle = angleOffset + i * angleStep;
            positions[i] = {
                x: 0,
                y: radius * Math.sin(angle) - cardH / 2 - 392,
                rotation: 12 - 2 * i,
                isUsed: false,
            }
        }
    }

    private static createLeftPosition(node: cc.Node, positions: any[]) {
        for (let i = 0; i < GameInfo.TOTAL_CARDS_FOR_EACH_PLAYER; i++) {
            positions[i] = {
                x: node.x,
                y: node.y + 84,
                rotation: 90,
                isUsed: false
            }
        }
    }

    private static createRightPosition(node: cc.Node, positions: any) {
        for (let i = 0; i < GameInfo.TOTAL_CARDS_FOR_EACH_PLAYER; i++) {
            positions[i] = {
                x: node.x,
                y: node.y + 84,
                rotation: 90,
                isUsed: false
            }
        }
    }

    private static createTopPosition(node: cc.Node, positions: CardPosition[]) {
        for (let i = 0; i <= GameInfo.TOTAL_CARDS_FOR_EACH_PLAYER; i++) {
            positions[i] = {
                x: node.x,
                y: node.y + 84,
                rotation: 90,
                isUsed: false
            }
        }
    }

    public static getDumpPosition(idx: number, size?: number): any {
        switch (idx) {
            case 0:
                return this.getDumpPosition0(size);
            case 1:
                return this.getDumpPosition1(size);
            case 2:
                return this.getDumpPosition2(size);
            case 3:
                return this.getDumpPosition3(size);
        }
        return null;
    }

    private static getDumpPosition0(size: number): any {
        let angles = [];
        if (size == 1) {
            angles.push({
                x: 0, y: 30, a: -5
            });
        } else if (size == 2) {
            angles.push({
                x: 3, y: 0, a: 6
            });
            angles.push({
                x: 0, y: 0, a: -3
            });
        } else if (size == 3) {
            angles.push({
                x: 8, y: 4, a: 13
            });
            angles.push({
                x: 0, y: 5, a: 3
            });
            angles.push({
                x: -6, y: 0, a: -11
            });
        } else if (size == 4) {
            angles.push({
                x: 14, y: 0, a: 11
            });
            angles.push({
                x: 6, y: 3, a: 6
            });
            angles.push({
                x: -2, y: 1, a: -2
            });
            angles.push({
                x: -12, y: -4, a: -13
            });
        }
        return angles;
    }

    private static getDumpPosition1(size: number): any {
        const SPACE_X = 115;
        const cardW = CardSize.TABLE_WIDTH;
        let angles = [];
        let extraX = 0;
        if (size == 1) {
            angles.push({
                x: 0, y: 0, a: 85
            });
        } else if (size == 2) {
            extraX = cardW / 2 - 10;//ed
            angles.push({
                x: 10, y: 0, a: 8
            });
            angles.push({
                x: 0, y: 0, a: -11
            });
        } else if (size == 3) {
            extraX = cardW - 16;
            angles.push({
                x: 22, y: 4, a: 13
            });
            angles.push({
                x: 10, y: 5, a: 3
            });
            angles.push({
                x: 0, y: 0, a: -11
            });
        } else if (size == 4) {
            extraX = cardW + cardW / 2 - 22;
            angles.push({
                x: 26, y: 4, a: 13
            });
            angles.push({
                x: 18, y: 7, a: 6
            });
            angles.push({
                x: 10, y: 5, a: -2
            });
            angles.push({
                x: 0, y: 0, a: -13
            });
        }
        return {
            x: -SPACE_X / 2 - extraX - 30,
            y: 160,
            angles: angles
        }
    }

    private static getDumpPosition2(size: number): any {
        const cardW = CardSize.TABLE_WIDTH;
        const cardH = CardSize.TABLE_HEIGHT;
        let angles = [];
        let extraX = 0;
        if (size == 1) {
            angles.push({
                x: 0, y: 0, a: -5
            });
        } else if (size == 2) {
            extraX = cardW / 2 - 10;//edit
            angles.push({
                x: 10, y: 0, a: 8
            });
            angles.push({
                x: 0, y: 0, a: -11
            });
        } else if (size == 3) {
            extraX = cardW - 16;
            angles.push({
                x: 22, y: 4, a: 13
            });
            angles.push({
                x: 10, y: 5, a: 3
            });
            angles.push({
                x: 0, y: 0, a: -11
            });
        } else if (size == 4) {
            extraX = cardW + cardW / 2 - 22;
            angles.push({
                x: 26, y: 4, a: 13
            });
            angles.push({
                x: 18, y: 7, a: 6
            });
            angles.push({
                x: 10, y: 5, a: -2
            });
            angles.push({
                x: 0, y: 0, a: -13
            });
        }
        return {
            x: 0,
            y: 160 + cardH - 30,
            angles: angles
        }
    }

    private static getDumpPosition3(size: number): any {
        const SPACE_X = 115;
        const cardW = CardSize.TABLE_WIDTH;
        let angles = [];
        let extraX = 0;
        if (size == 1) {
            angles.push({
                x: 0, y: 0, a: -95
            });
        } else if (size == 2) {
            extraX = cardW / 2 - 20;
            angles.push({
                x: 10, y: 0, a: 8
            });
            angles.push({
                x: 0, y: 0, a: -11
            });
        } else if (size == 3) {
            extraX = cardW - 36;
            angles.push({
                x: 22, y: 4, a: 13
            });
            angles.push({
                x: 10, y: 5, a: 3
            });
            angles.push({
                x: 0, y: 0, a: -11
            });
        } else if (size == 4) {
            extraX = cardW + cardW / 2 - 51;
            angles.push({
                x: 26, y: 4, a: 13
            });
            angles.push({
                x: 18, y: 7, a: 6
            });
            angles.push({
                x: 10, y: 5, a: -2
            });
            angles.push({
                x: 0, y: 0, a: -13
            });
        }
        return {
            x: SPACE_X / 2 + extraX + 30,
            y: 160,
            angles: angles
        }
    }
}
