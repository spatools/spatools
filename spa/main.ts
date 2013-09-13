/// <reference path="_definitions.d.ts" />

import handlers = require("./handlers");
import extenders = require("./extenders");
import moment = require("./moment");
import underscore = require("./underscore");

underscore.addToObservableArrays();

if (window.moment)
    moment.init();
