/// <reference path="../_references.d.ts" />
/// <reference path="../build/spatools.d.ts" />
/// <reference path="../Scripts/typings/qunit/qunit.d.ts" />

import path = require("../spa/path");

var dirName = "mysiteweb",
    rootPath = "/var/www/" + dirName,
    ext = "ext",
    filename = "myfile." + ext,
    filePath = rootPath + "/" + filename;

export function run() {
    module("Path Tests");

    test("path.getFileName", () => {
        expect(1);

        var result = path.getFileName(filePath);
        equal(result, filename, "The filename of the path '" + filePath +"' is '" + filename + "'");
    });

    test("path.getExtension", () => {
        expect(1);

        var result = path.getExtension(filePath);
        equal(result, ext, "The extension of the path '" + filePath +"' is '" + ext + "'");
    });

    test("path.getMimeType", () => {
        expect(2);

        var _path = rootPath + "myfile.jpg";

        var result = path.getMimeType(_path);
        equal(result, "image/jpeg", "The mimetype of the path '" + _path +"' is 'image/jpeg'");

        result = path.getMimeTypeByExtension("png");
        equal(result, "image/png", "The mimetype of the extension 'png' is 'image/png'");
    });

    test("path.directory", () => {
        expect(2);

        var result = path.getDirectory(filePath);
        equal(result, rootPath, "The directory of the path '" + filePath +"' is '" + rootPath + "'");

        result = path.getDirectoryName(filePath);
        equal(result, dirName, "The directory name of the path '" + filePath +"' is '" + dirName + "'");
    });

    test("path.combine", () => {
        expect(2);

        var result = path.combine(rootPath, filename);
        equal(result, filePath, "The combinaison of paths '" + rootPath +"' and '" + filename + "' is '" + filePath + "'");

        result = path.combine("/var", "www", dirName, filename);
        equal(result, filePath, "The combinaison of paths '/var', 'www', '" + dirName +"' and '" + filename + "' is '" + filePath + "'");
    });
}