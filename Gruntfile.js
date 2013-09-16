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
                declaration: true,
                comments: false,
                disallowbool: true,
                disallowimportmodule: true
            },
            base: {
                src: "base/*.ts",
                dest: "<%= paths.output %>/spatools.js",
                options: {
                    module: "commonjs"
                }
            },
            modules: {
                src: "spa/**/*.ts",
                dest: "<%= paths.output %>/",
                options: {
                    declaration: false
                }
            },
            data: {
                src: "spa/data/**/*.ts",
                dest: "<%= paths.output %>/",
                options: {
                    declaration: false
                }
            },
            ui: {
                src: "spa/ui/**/*.ts",
                dest: "<%= paths.output %>/",
                options: {
                    declaration: false
                }
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

        uglify: {
            base: {
                src: "<%= typescript.base.dest %>",
                dest: "<%= paths.output %>/spatools.min.js"
            }
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


    // Build Steps
    grunt.registerTask("build_base", ["typescript:base", "uglify:base"]);
    grunt.registerTask("build_modules", ["typescript:modules", "copy:modules"]);
    grunt.registerTask("build_samples", ["typescript:samples", "copy:samples"]);
    grunt.registerTask("build_assets", ["copy:assets"]);
    grunt.registerTask("build_ui", ["typescript:ui", "less"]);
    grunt.registerTask("build_data", ["typescript:data"]);
    grunt.registerTask("build_tests", ["typescript:tests", "copy:tests"]);
    grunt.registerTask("run_tests", ["qunit:tests"]);


    // Buildset Tasks
    grunt.registerTask("tests", ["build_tests", "run_tests"]);
    grunt.registerTask("default", ["tslint", "build_modules", "jshint", "build_samples", "build_assets", "less", "tests"]);
    grunt.registerTask("publish", ["nugetpack", "nugetpush"]);
};