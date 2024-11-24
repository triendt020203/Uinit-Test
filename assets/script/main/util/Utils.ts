export namespace utils {

    export function formatCoinWithCommas(coin: number): string {
        return String(coin).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    export function formatName(text: string, lent: number, suffix: boolean): string {
        if (text.length > lent) {
            var fName = text.substring(0, lent);
            if (suffix === false)
                return fName;
            return fName.trim();
        }
        return text;
    }

    export function shortenLargeNumber(num: number, digits: number): any {
        var units = ['K', 'M'],
            decimal: number;
        for (var i = units.length - 1; i >= 0; i--) {
            decimal = Math.pow(1000, i + 1);
            if (num <= -decimal || num >= decimal)
                return +(num / decimal).toFixed(digits) + units[i];
        }
        return num;
    }

    export function randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    export function timezoneOffset(): number {
        let offset = new Date().getTimezoneOffset();
        let sign = offset < 0 ? '+' : '-';
        offset = Math.abs(offset);
        let result = offset / 60 | 0;
        return sign == '+' ? result : -result;
    }

    export function formatTime(t: number): string {
        var cd = 24 * 60 * 60 * 1000,
            ch = 60 * 60 * 1000,
            d = Math.floor(t / cd),
            h = Math.floor((t - d * cd) / ch),
            m = Math.round((t - d * cd - h * ch) / 60000);
        if (m === 60) {
            h++;
            m = 0;
        }
        if (h === 24) {
            d++;
            h = 0;
        }
        var str;
        if (d > 0) {
            str = d + " ";
            if (h > 0)
                str += " " + h + " ";
            else if (m > 0)
                str += " " + m + " ";
        } else {
            if (h > 0) {
                str = h;
                if (m > 0)
                    str += " : " + m;
            } else
                str = m + " ";
        }
        return str;
    }

    export function formatTimeV2(distance: number): string {
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)) + "";
        var seconds = Math.floor((distance % (1000 * 60)) / 1000) + "";
        if (minutes.length == 1) minutes = "0" + minutes;
        if (seconds.length == 1) seconds = "0" + seconds;
        if (days == 0)
            if (hours > 0)
                return hours + ":" + minutes + ":" + seconds;
            else
                return minutes + ":" + seconds;
        else
            return days + "d " + hours + ":" + minutes + ":" + seconds;
    }

}