/// <reference path="../../_references.d.ts" />
/// <reference path="../../Scripts/typings/qunit/qunit.d.ts" />

import guid = require("../../spa/data/guid");
var formatRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function run() {
    module("Data Guid Tests");

    test("data.guid.generate", () => {
        expect(10);
        var value, i;

        for (i = 0; i < 10; i++) {
            value = guid.generate();
            ok(formatRegex.test(value), value + " is not a valid GUID.");
        }
    });
    
    test("data.guid.generateTemp", () => {
        expect(10);
        var value, i, tmp, lastTempVal;

        for (i = 0; i < 10; i++) {
            value = guid.generateTemp();
            ok(formatRegex.test(value), "A valid GUID must be formatted like 01ABCDEF-0000-0000-0000-000000000000");
        }
    });
    
    test("data.guid.isGuid", () => {
        expect(3);
        var validGuid = "01234567-89AB-CDEF-0123-456789abcdef",
            invalidGuid1 = "abcdefgh-ijkl-mnop-qrst-uvwxyzabcdefg",
            invalidGuid2 = "012345-6789AB-CDEF-0123-456789ABCDEF";

        ok(guid.isGuid(validGuid), "'01234567-89AB-CDEF-0123-456789abcdef' is a valid guid containing all allowed characters");
        ok(!guid.isGuid(invalidGuid1), "'abcdefgh-ijkl-mnop-qrst-uvwxyzabcdefg' is not valid since it contains not allowed characters");
        ok(!guid.isGuid(invalidGuid2), "'012345-6789ab-cdef-0123-456789abcdef' is not valid since it is misformatted");
    });

    test("data.guid.isTemp", () => {
        expect(3);
        var validGuid = "00000000-0000-0000-0000-123456789012",
            invalidGuid1 = "00000000-0000-0000-0000-uvwxyzabcdefg",
            invalidGuid2 = "00000000-0000-0000-1111-123456789012";

        ok(guid.isTemp(validGuid), "'00000000-0000-0000-0000-123456789012' is a valid temp guid containing all allowed characters");
        ok(!guid.isTemp(invalidGuid1), "'00000000-0000-0000-0000-uvwxyzabcdefg' is not valid since it contains not allowed characters");
        ok(!guid.isTemp(invalidGuid2), "'00000000-0000-0000-1111-456789abcdef' is not valid since it is misformatted");
    });
}