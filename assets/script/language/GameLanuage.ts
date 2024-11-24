import en_US from "./en_US";
import th_US from "./th_TH";

export interface LangInterface<T> {
    readonly PAYMENT_SUCCESS: T;
    readonly WATCH_VIDEO_SUCCESS: T;
    readonly INV_POPUP_DESC: T;
    readonly MUSIC: T;
    readonly SOUND: T;
    readonly GIFT_CODE: T;
    readonly LANGUAGE: T;
}

export type LanguageKey = "PAYMENT_SUCCESS" | "WATCH_VIDEO_SUCCESS" | "INV_POPUP_DESC" | string;

export class GameLanguage {

    private _locale: string = "en_US";
    private _code: string = "en";

    private langInstance: LangInterface<string> = null;

    get code(): string {
        return this._code;
    }

    get locale(): string {
        return this._locale;
    }

    set locale(val: string) {
        this._locale = val;
        this._code = val.substring(0, 2);
        if (val == "th_TH")
            this.langInstance = new th_US();
        else
            this.langInstance = new en_US();
    }

    text(key: LanguageKey, ...params: string[]): string {
        let str = this.langInstance[key];
        if (params) {
            params.forEach(element => {
                str = str.replace('%s', element);
            });
        }
        return str;
    }

}

