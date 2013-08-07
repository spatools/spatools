/// <reference path="_definitions.d.ts" />

var encode: (str: string) => string,
    decode: (str: string) => string;

if (window.btoa) {
    encode = function (text: string): string {
        return window.btoa(unescape(encodeURIComponent(text)));
    };
    decode = function (text: string): string {
        return decodeURIComponent(escape(window.atob(text)));
    };
}
else {
    var _codex = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        _utf8_encode = function (text: string): string {
            text = text.replace(/\r\n/g, "\n");
            var result = "";
            for (var n = 0; n < text.length; n++) {
                var c = text.charCodeAt(n);

                if (c < 128) {
                    result += String.fromCharCode(c);
                }
                else if ((c > 127) && (c < 2048)) {
                    result += String.fromCharCode((c >> 6) | 192);
                    result += String.fromCharCode((c & 63) | 128);
                }
                else {
                    result += String.fromCharCode((c >> 12) | 224);
                    result += String.fromCharCode(((c >> 6) & 63) | 128);
                    result += String.fromCharCode((c & 63) | 128);
                }
            }

            return result;
        },
        _utf8_decode = function (text: string): string {
            var result = "",
                i = 0,
                c, c1, c2, c3,
                c = c1 = c2 = 0;

            while (i < text.length) {
                c = text.charCodeAt(i);

                if (c < 128) {
                    result += String.fromCharCode(c);
                    i++;
                }
                else if ((c > 191) && (c < 224)) {
                    c2 = text.charCodeAt(i + 1);
                    result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = text.charCodeAt(i + 1);
                    c3 = text.charCodeAt(i + 2);
                    result += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }

            return result;
        };

    encode = function (text: string): string {
        var result = "",
            chr1, chr2, chr3, enc1, enc2, enc3, enc4,
            i = 0;

        text = _utf8_encode(text);

        while (i < text.length) {
            chr1 = text.charCodeAt(i++);
            chr2 = text.charCodeAt(i++);
            chr3 = text.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            result = result + _codex.charAt(enc1) + _codex.charAt(enc2) + _codex.charAt(enc3) + _codex.charAt(enc4);
        }

        return result;
    };
    decode = function (text: string): string {
        var result = "",
            chr1, chr2, chr3, enc1, enc2, enc3, enc4,
            i = 0;

        text = text.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < text.length) {
            enc1 = _codex.indexOf(text.charAt(i++));
            enc2 = _codex.indexOf(text.charAt(i++));
            enc3 = _codex.indexOf(text.charAt(i++));
            enc4 = _codex.indexOf(text.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            result = result + String.fromCharCode(chr1);

            if (enc3 !== 64) {
                result = result + String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                result = result + String.fromCharCode(chr3);
            }
        }

        result = _utf8_decode(result);

        return result;
    };
}

var createDataURL = function(mimeType: string, content: string): string {
    return "data:" + mimeType + ";base64," + encode(content);
}

var downloadFileAsDataURL = function(url: string) : JQueryDeferred<string> {
    return $.Deferred<string>(function (dfd) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';

        xhr.onload = function (e) {
            var reader = new FileReader();
            var text = reader.readAsDataURL(xhr.response);

            dfd.resolve(text);
        };
        xhr.onerror = dfd.fail;

        xhr.send();
    });
}

var result = {
    encode: encode,
    decode: decode,
    createDataURL: createDataURL,
    downloadFileAsDataURL: downloadFileAsDataURL
};

export = result;