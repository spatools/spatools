/// <reference path="../_references.d.ts" />
/// <reference path="../Scripts/typings/qunit/qunit.d.ts" />

import changeTracker = require("../spa/changeTracker");

function createNote() {
    return {
        title: ko.observable("Note #1"),
        date: ko.observable(Date.now()),
        content: ko.observable("This is the content of Note #1")
    };
}

export function run() {
    module("Change Tracker Tests");

    test("changeTracker.detection", () => {
        expect(2);

        var note = createNote(),
            tracker = new changeTracker(note);

        var hasChanges = tracker.hasChanges();
        equal(hasChanges, false, "Nothing has been changed in test note, hasChanges must be false");

        note.title("Note #2");
        hasChanges = tracker.hasChanges();

        equal(hasChanges, true, "The test note has been changed, hasChanges must be true");
    });
    
    test("changeTracker.reset", () => {
        expect(3);

        var note = createNote(),
            tracker = new changeTracker(note);

        var hasChanges = tracker.hasChanges();
        equal(hasChanges, false, "Nothing has been changed in test note, hasChanges must be false");

        note.title("Note #2");
        hasChanges = tracker.hasChanges();

        equal(hasChanges, true, "The test note has been changed, hasChanges must be true");

        tracker.reset();

        hasChanges = tracker.hasChanges();
        equal(hasChanges, false, "After reset, hasChanges must be false");
    });

    test("changeTracker.alreadyModified", () => {
        expect(2);
        
        var note = createNote(),
            tracker = new changeTracker(note, true);

        var hasChanges = tracker.hasChanges();
        equal(hasChanges, true, "Nothing has been changed in test note but isAlreadyModified has been specified, hasChanges must be true");

        tracker.reset();

        hasChanges = tracker.hasChanges();
        equal(hasChanges, false, "After reset, hasChanges must be false");
    });
}