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
            }
        },

        uglify: {
            base: {
                src: "<%= typescript.base.dest %>",
                dest: "<%= paths.output %>/spatools.min.js"
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-typescript');


    // Build Steps
    grunt.registerTask("build_base", ["typescript:base", "uglify:base"]);
    grunt.registerTask("build_modules", ["typescript:modules"]);


    // Buildset Tasks
    grunt.registerTask("default", ["build_base", "build_modules"]);
};