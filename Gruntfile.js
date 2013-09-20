module.exports = function (grunt) {
    // Parse Options from CLI
    var outputDirectory = grunt.option("outputDirectory") || "build",
        paths = {
            output: outputDirectory,
            base: outputDirectory + "/spa",
            ui: outputDirectory + "/spa/ui"
        };

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        paths: paths,

        typescript: {
            options: {
                target: "es3",
                module: "amd",
                sourcemap: false,
                declaration: false,
                comments: false,
                disallowbool: true,
                disallowimportmodule: true
            },
            base: {
                src: "spa/main.ts",
                dest: "<%= paths.output %>/",
                //options: {
                //    module: "commonjs",
                //    declaration: true
                //}
            },
            modules: {
                src: "spa/**/*.ts",
                dest: "<%= paths.output %>/"
            },
            data: {
                src: "spa/data/**/*.ts",
                dest: "<%= paths.output %>/"
            },
            math: {
                src: [
                    "spa/math/**/*.ts",
                    "spa/math.ts"
                ],
                dest: "<%= paths.output %>/"
            },
            ui: {
                src: [
                    "spa/ui/**/*.ts",
                    "spa/ui.ts"
                ],
                dest: "<%= paths.output %>/"
            },
            samples: {
                src: "samples/**/*.ts",
                dest: "<%= paths.output %>/",
                options: {
                    declaration: false
                }
            },
            tests: {
                src: "tests/**/*.ts",
                dest: "<%= paths.output %>/",
                options: {
                    declaration: false
                }
            }
        },
        uglify: {
            base: {
                src: "<%= typescript.base.dest %>",
                dest: "<%= paths.output %>/spatools.min.js"
            }
        },

        copy: {
            modules: {
                src: "spa/**/*.html",
                dest: "<%= paths.output %>/"
            },
            samples: {
                src: "samples/**/*.html",
                dest: "<%= paths.output %>/"
            },
            tests: {
                src: "tests/**/*.html",
                dest: "<%= paths.output %>/"
            },
            assets: {
                src: "assets/**/*.*",
                dest: "<%= paths.output %>/"
            },
        },

        less: {
            debug: {
                files: {
                    "css/ui-contextmenu.css": "css/ui-contextmenu.less",
                    "css/ui-editor.css": "css/ui-editor.less",
                    "css/ui-ribbon.css": "css/ui-ribbon.less",
                    "css/ui-tree.css": "css/ui-tree.less",
                    "css/ui-slider.css": "css/ui-slider.less",
                }
            },

            production: {
                options: {
                    yuicompress: true
                },
                files: {
                    "<%= paths.output %>/css/ui-contextmenu.css": "css/ui-contextmenu.less",
                    "<%= paths.output %>/css/ui-editor.css": "css/ui-editor.less",
                    "<%= paths.output %>/css/ui-ribbon.css": "css/ui-ribbon.less",
                    "<%= paths.output %>/css/ui-tree.css": "css/ui-tree.less",
                    "<%= paths.output %>/css/ui-slider.css": "css/ui-slider.less",
                }
            }
        },

        tslint: {
            options: {
                configuration: grunt.file.readJSON("tslint.json")
            },
            all: ["spa/**/*.ts"]
        },
        jshint: {
            options: {
                '-W004': true,
                '-W030': true,
                '-W069': true,
                '-W093': true
            },
            all: ["<%= paths.output %>/spa/**/*.js"]
        },

        qunit: {
            tests: ["<%= paths.output %>/tests/all.html"]
        },

        nugetdeps: {
            options: {
                'SPATools.Base': "<%= pkg.version %>",
                'SPATools.Advanced': "<%= pkg.version %>",
                'SPATools.Interactions': "<%= pkg.version %>",
                'SPATools.Data': "<%= pkg.version %>",
                'SPATools.Math': "<%= pkg.version %>",
                'SPATools.UI.Base': "<%= pkg.version %>",
                'SPATools.UI.ContextMenu': "<%= pkg.version %>",
                'SPATools.UI.Draggable': "<%= pkg.version %>",
                'SPATools.UI.Editor': "<%= pkg.version %>",
                'SPATools.UI.Ribbon': "<%= pkg.version %>",
                'SPATools.UI.Slider': "<%= pkg.version %>",
                'SPATools.UI.Tree': "<%= pkg.version %>"
            },
            all: "nuget/**/*.nuspec"
        },
        nugetpack: {
            all: {
                src: "nuget/**/*.nuspec",
                dest: "nuget/",

                options: {
                    version: "<%= pkg.version %>"
                }
            }
        },
        nugetpush: {
            all: {
                src: "nuget/**/*.<%= pkg.version %>.nupkg"
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-tslint');
    grunt.loadNpmTasks('grunt-nuget');

    grunt.registerMultiTask('nugetdeps', 'NuGet Dependencies - Upgrade dependencies version', function () {
        var params = this.options(),
            depRegexGlobal = /<dependency[^>]*\/>/g,
            depRegex = /<dependency\s+id="([^"]+)"\s+version="([^"]+)"\s+\/>/;

        this.files.forEach(function(file) {
            file.src.forEach(function (src) {
                var content = grunt.file.read(src);

                content = content.replace(depRegexGlobal, function (dependency) {
                    var match = dependency.match(depRegex),
                        id = match[1],
                        version = match[2];

                    if (params[id]) {
                        version = params[id];
                    }

                    return '<dependency id="' + id + '" version="' + version + '" />';
                });

                //grunt.log.write(content);
                grunt.file.write(src, content);
                grunt.log.ok("Dependencies updated on :" + src);
            });
        });
    });

    // Build Steps
    grunt.registerTask("files", ["copy:assets"]);
    grunt.registerTask("build_ui", ["typescript:ui", "less"]);
    grunt.registerTask("build_data", ["typescript:data"]);
    grunt.registerTask("build_math", ["typescript:math"]);

    var buildTasks = grunt.option("nohint") ? ["typescript:modules", "copy:modules"] : ["tslint", "typescript:modules", "copy:modules", "jshint"],
        defaultTask = [];

    grunt.option("nobuild") || defaultTask.push("build");
    grunt.option("nosamples") || defaultTask.push("samples");
    grunt.option("nofiles") || defaultTask.push("files");
    grunt.option("nostyles") || defaultTask.push("less");
    grunt.option("notest") || defaultTask.push("test");

    // Buildset Tasks
    grunt.registerTask("build", buildTasks);
    grunt.registerTask("samples", ["typescript:samples", "copy:samples"]);
    grunt.registerTask("test", ["typescript:tests", "copy:tests", "qunit:tests"]);
    grunt.registerTask("default", defaultTask);
    grunt.registerTask("publish", ["nugetdeps", "nugetpack", "nugetpush"]);
};