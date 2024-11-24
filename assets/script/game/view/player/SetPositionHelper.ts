export default class SetPositionHelper {

    static getPosition(from: number, to: number) {
        let name = "pos" + from + to;
        return this[name];
    }

    static get pos10() {
        return { x: -119.041, y: 38.683, a: -55, min: true }
    }

    static get pos20() {
        return { x: -123.162, y: 200.688, a: -120, min: true }
    }

    static get pos30() {
        return { x: 117.698, y: 212.809, a: 130, min: true }
    }

    static get pos40() {
        return { x: 132.698, y: 54.925, a: 62, min: true }
    }

    static get pos01() {
        return { x: 2.251, y: 139.813, a: 125, min: true }
    }

    static get pos21() {
        return { x: -123.162, y: 209.688, a: 185, min: true }
    }

    static get pos31() {
        return { x: 113.698, y: 198.809, a: 210 }
    }

    static get pos41() {
        return { x: 133.248, y: 72.355, a: 182 }
    }

    static get pos02() {
        return { x: 12.251, y: 112.813, a: 60, min: true }
    }

    static get pos12() {
        return { x: -109.041, y: 46.683, a: 0, min: true }
    }

    static get pos32() {
        return { x: 137.698, y: 210.668, a: 185 }
    }

    static get pos42() {
        return { x: 113.248, y: 72.355, a: 152 }
    }


    static get pos03() {
        return { x: -5.749, y: 112.813, a: -60, min: true }
    }

    static get pos13() {
        return { x: -102.896, y: 55.492, a: 30 }
    }

    static get pos23() {
        return { x: -131.084, y: 189.597, a: 0 }
    }

    static get pos43() {
        return { x: 121.698, y: 48.925, a: 0, min: true }
    }


    static get pos04() {
        return { x: -5.749, y: 133.813, a: -120, min: true }
    }

    static get pos14() {
        return { x: -128.896, y: 55.492, a: 0 }
    }

    static get pos24() {
        return { x: -106.963, y: 189.597, a: -30 }
    }

    static get pos34() {
        return { x: 106.698, y: 206.668, a: -172, min: true }
    }

}