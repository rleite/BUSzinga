module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        connect: {
            server: {
                options: {
                    port: 8000,
                    base: 'app',
                    livereload: 35729,
                    open: 'http://rleite.local:8000'
                }
            }
        },
        watch: {
            files: ['app/**/*'],
            options: {
                livereload: 35729
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('serve', ['connect:server', 'watch']);
};