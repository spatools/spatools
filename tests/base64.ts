/// <reference path="../_references.d.ts" />
/// <reference path="../Scripts/typings/qunit/qunit.d.ts" />

import base64 = require("../spa/base64");

var baseText = "this is a test for spa tools base64 encoder",
    expectedResult = "dGhpcyBpcyBhIHRlc3QgZm9yIHNwYSB0b29scyBiYXNlNjQgZW5jb2Rlcg==";

export function run() {
    module("Base 64 Tests");

    test("base64.encode", () => {
        expect(1);

        var result = base64.encode(baseText);
        equal(result, expectedResult, "The encoding of the message 'this is a test for spa tools base64 encoder' must result in 'dGhpcyBpcyBhIHRlc3QgZm9yIHNwYSB0b29scyBiYXNlNjQgZW5jb2Rlcg=='");
    });

    test("base64.decode", () => {
        expect(1);

        var result = base64.decode(expectedResult);
        equal(result, baseText, "The decoding of the message 'dGhpcyBpcyBhIHRlc3QgZm9yIHNwYSB0b29scyBiYXNlNjQgZW5jb2Rlcg==' must result in 'this is a test for spa tools base64 encoder'");
    });

    test("base64.createDataURI", () => {
        expect(1);

        var result = base64.createDataURL("text/plain", expectedResult);
        equal(result, "data:text/plain;base64,dGhpcyBpcyBhIHRlc3QgZm9yIHNwYSB0b29scyBiYXNlNjQgZW5jb2Rlcg==");
    });


    test("base64.encodeDataURI", () => {
        expect(1);

        var result = base64.encodeDataURL("text/plain", baseText);
        equal(result, "data:text/plain;base64,dGhpcyBpcyBhIHRlc3QgZm9yIHNwYSB0b29scyBiYXNlNjQgZW5jb2Rlcg==");
    });
}