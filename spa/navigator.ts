//"Opera/12.80 (Windows NT 5.1; U; en) Presto/2.10.289 Version/12.02"
//"Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)";
//"Mozilla/6.0 (Windows NT 6.2; WOW64; rv:16.0.1) Gecko/20121011 Firefox/16.0.1";
//"Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.1.0.346 Mobile Safari/534.11+";
//"Mozilla/5.0 (iPad; CPU OS 5_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko ) Version/5.1 Mobile/9B176 Safari/7534.48.3";
//"Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30";

/// <reference path="_definitions.d.ts" />

var app: string, appVersion: string, system: string,
    engine: string, engineVersion: string, os: {  name: string; alt: string[]; x64: boolean; text: string },
    sub: string, subVersion: string,
    name: string, version: string, versionNumber: number,
    webkit: boolean, prefix: string, mobile: boolean,
    ua: string = navigator.userAgent;

var reg = /(\w+)\/([0-9.]+) \(([^)]+)\)( (\w+)\/([0-9.+rca]+) \(([^)]+)\))?( ([a-zA-Z ]+)\/([0-9.+rca]+))?( ([a-zA-Z ]+)\/([0-9.+a-zA-Z]+))?( ([a-zA-Z ]+)\/([0-9.+rca]+))?/;
if (reg.test(ua)) {
    var matches = ua.match(reg);

    app = matches[1]; appVersion = matches[2];
    system = matches[3];
    engine = matches[5]; engineVersion = matches[6];

    if (matches[8]) {
        name = matches[9];
        version = matches[10];
    }

    if (matches[11]) {
        if (name === "Version" || matches[12] === "Firefox") { //Mobile Safari
            if (matches[14]) { // iPad
                name = matches[15];
                version = matches[16];
            }
            else {
                name = matches[12];
                version = matches[13];
            }

            sub = matches[9];
            subVersion = matches[10];
        }
        else {
            sub = matches[12];
            subVersion = matches[13];
        }
    }

    if (!name) { //IE
        var regIe = /MSIE ([0-9.]+)/,
            regIE11 = /rv:([0-9.]+)\)\s+like\s+Gecko/,
            regEng = /Trident\/([0-9.]+)/;

        if (regIe.test(ua)) {
            name = "Internet Explorer";
            version = ua.match(regIe)[1];
        }
        else if (regIE11.test(ua)) {
          name = "Internet Explorer";
          version = ua.match(regIE11)[1];
        }

        if (regEng.test(ua)) {
            engine = "Trident";
            engineVersion = ua.match(regEng)[1];
        }
    }

    if (app === "Opera") {
        var tmp = name;
        name = app;
        app = tmp;

        tmp = version;
        version = appVersion;
        appVersion = tmp;
    }

    versionNumber = parseInt(version, 10);

    var regOs = /(Android|BlackBerry|Windows Phone|Windows CE|SymbOS|iPhone|iPad|J2ME\/MIDP|Series|Windows Mobile|Windows|Linux|Intel Mac OS X|Macintosh)/gi,
        regMobile = /(Android|BlackBerry|Windows Phone|Windows CE|SymbOS|iPhone|iPad|Series|Windows Mobile)/gi,
        reg64 = /(WOW64|x64|amd64|win64|x86_64)/i,
        names = system.match(regOs);

    os = {
        name: names.pop(),
        alt: names,
        x64: reg64.test(system),
        text: system
    };

    mobile = regMobile.test(system);
    webkit = (/webkit/i).test(ua);

    switch (name) {
        case "Internet Explorer":
            if (versionNumber >= 8) prefix = "ms";
            break;

        case "Opera":
            prefix = "o";
            break;

        case "Firefox":
            prefix = "moz";
            break;

        default:
            if (webkit === true) prefix = "webkit";
            break;
    }
}

var nav = {
    /** Current navigator's name */
    name: name,
    /** Current navigator's version string */
    version: version,
    /** Current navigator's main version number */
    versionNumber: versionNumber,
    /** Current navigator's engine */
    engine: {
        /** Current navigator's engine name */
        name: engine,
        /** Current navigator's engine version */
        version: engineVersion
    },
    /** Current navigator's application */
    application: {
        /** Current navigator's application name */
        name: app,
        /** Current navigator's application version */
        version: appVersion
    },
    /** Current navigator's sub engine */
    sub: {
        /** Current navigator's sub engine name */
        name: sub,
        /** Current navigator's sub engine version */
        version: subVersion
    },
    /** Current navigator is webkit */
    webkit: webkit,
    /** Current navigator is mobile */
    mobile: mobile,
    /** Current navigator's vendor prefix */
    prefix: prefix,
    /** Current navigator's OS */
    os: os
};

export = nav;
