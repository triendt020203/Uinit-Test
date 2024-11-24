export class CardSize {

    static get CARD_WIDTH() {
        return 127;
    }

    static get CARD_HEIGHT() {
        return 174;
    }

    static get DEAL_SCALE() {
        return 0.4;
    }
    static get DEAL_SCALEY() {
        return 0.3;
    }

    static get TABLE_SCALE() {
        return 0.6;
    }

    static get ENDGAME_SCALE() {
        return 0.45;
    }

    static get WHITE_WIN_SCALE() {
        return 0.4;
    }

    // for current player
    static get PLAYER_SCALE() {
        return 0.95;
    }

    // for other players
    static get OPP_SCALE() {
        return 0.3;
    }

    static get PLAYER_WIDTH() {
        return Math.floor(CardSize.CARD_WIDTH * CardSize.PLAYER_SCALE);
    }

    static get PLAYER_HEIGHT() {
        return Math.floor(CardSize.CARD_HEIGHT * CardSize.PLAYER_SCALE);
    }

    static get TABLE_WIDTH() {
        return Math.floor(CardSize.CARD_WIDTH * CardSize.TABLE_SCALE);
    }

    static get TABLE_HEIGHT() {
        return Math.floor(CardSize.CARD_HEIGHT * CardSize.TABLE_SCALE);
    }

    static get OPP_WIDTH() {
        return Math.floor(CardSize.CARD_WIDTH * CardSize.OPP_SCALE);
    }

    static get OPP_HEIGHT() {
        return Math.floor(CardSize.CARD_HEIGHT * CardSize.OPP_SCALE);
    }

    static get WHITE_WIN_WIDTH() {
        return Math.floor(CardSize.CARD_WIDTH * CardSize.WHITE_WIN_SCALE);
    }
}