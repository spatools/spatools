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
                }
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-typescript');


    // Build Steps
    grunt.registerTask("build_base", ["typescript:base", "uglify:base"]);
    grunt.registerTask("build_modules", ["typescript:modules", "copy:modules"]);
    grunt.registerTask("build_samples", ["typescript:samples", "copy:samples"]);
    grunt.registerTask("build_assets", ["copy:assets"])
    grunt.registerTask("build_ui", ["typescript:ui", "less"]);


    // Buildset Tasks
    grunt.registerTask("default", ["build_base", "build_modules", "build_samples", "build_assets", "build_ui"]);
};