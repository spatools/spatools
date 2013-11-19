/// <reference path="../_references.d.ts" />
/// <reference path="../scripts/typings/qunit/qunit.d.ts" />

import commands = require("../spa/commands");

var commandData = "this is the result of command";

export function run() {
    module("Commands Tests");

    test("command.execution", () => {
        expect(6);

        var _canExecute = ko.observable(false),
            _hasBeenExecuted = ko.observable(false),
            _result = null;

        var command = new commands.Command({
            canExecute: () => _canExecute(),
            execute: data => {
                _hasBeenExecuted(true);
                _result = data;
            }
        });

        var cCanExecute = command.canExecute();
        equal(cCanExecute, false, "The can execute callback return value of _canExecute() which is false so can't execute");

        command.execute(commandData);
        equal(_hasBeenExecuted(), false, "canExecute is equal to false so can't execute so _hasBeenExecuted must be false");
        equal(_result, null, "canExecute is equal to false so can't execute so no result");

        _canExecute(true);
        cCanExecute = command.canExecute();
        equal(cCanExecute, true, "The can execute callback return value of _canExecute() which has been changed to true so can execute");

        command.execute(commandData);
        equal(_hasBeenExecuted(), true, "After execution _hasBeenExecuted must be true");
        equal(_result, commandData, "After execution _result must be equal to 'this is the result of command'");
    });

    asyncTest("asyncCommand.execution", () => {
        expect(7);

        var _canExecute = ko.observable(false),
            _hasBeenExecuted = ko.observable(false),
            _result = null;

        var command = new commands.AsyncCommand({
            canExecute: isExecuting => !isExecuting && _canExecute(),
            execute: (data, complete) => {
                setTimeout(() => {
                    _hasBeenExecuted(true);
                    _result = data;
                    complete();
                }, 10);
            }
        });

        var cCanExecute = command.canExecute();
        equal(cCanExecute, false, "The can execute callback return value of _canExecute() which is false so can't execute");

        command.execute(commandData);

        setTimeout(() => {
            equal(_hasBeenExecuted(), false, "canExecute is equal to false so can't execute so _hasBeenExecuted must be false");
            equal(_result, null, "canExecute is equal to false so can't execute so no result");
            
            _canExecute(true);
            cCanExecute = command.canExecute();
            equal(cCanExecute, true, "The can execute callback return value of _canExecute() which has been changed to true so can execute");

            command.execute(commandData);

            cCanExecute = command.canExecute();
            equal(cCanExecute, false, "The command can't execute while is already executing");

            setTimeout(() => {
                equal(_hasBeenExecuted(), true, "After execution _hasBeenExecuted must be true");
                equal(_result, commandData, "After execution _result must be equal to 'this is the result of command'");

                start();
            }, 20);
        }, 20);
    });
}