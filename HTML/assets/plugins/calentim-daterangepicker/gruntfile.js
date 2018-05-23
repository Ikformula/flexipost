module.exports = function ( grunt ) {
    // Project configuration.
    grunt.initConfig( {
        pkg: grunt.file.readJSON( 'package.json' ),
        uglify: {
            options: {
                sourceMap: true
            },
            build: {
                src: [ 'js/calentim.js', 'js/jquery.hammer.js' ],
                dest: 'build/js/calentim.min.js'
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'build/css/calentim.min.css': 'css/calentim.scss'
                }
            }
        },
        autoprefixer:{
            dist:{
                files:{
                    'build/css/calentim.min.css':'build/css/calentim.min.css'
                }
            }
        },
        watch: {
            scripts: {
                files: [ 'js/calentim.js' ],
                tasks: [ 'uglify', 'jsObfuscate' ]
            },
            styles: {
                files: [ 'css/*.scss' ],
                tasks: 'sass'
            },
            docs: {
                files: [ 'readme.md', 'docs/includes/template.html' ],
                tasks: 'markdown'
            },
            test: {
                files: [ 'tests/*.test.js' ],
                tasks: 'jasmine'
            }
        },
        markdown: {
            all: {
                files: [ {
                    expand: true,
                    src: 'readme.md',
                    dest: 'docs/',
                    ext: '.html'
                } ],
                options: {
                    template: 'docs/includes/template.html',
                    autoTemplate: true,
                    autoTemplateFormat: 'html'
                }
            }
        },
        jsObfuscate: {
            default: {
                files: {
                    'build/js/calentim.obf.js': 'build/js/calentim.min.js'
                }
            }
        },
        compress: {
            main: {
                options: {
                    archive: 'output/calentim.zip'
                },
                files: [ {
                    src: [ 'css/**' ],
                    dest: '/',
                }, {
                    src: [ 'build/**' ],
                    dest: '/'
                }, {
                    src: [ 'js/**' ],
                    dest: '/'
                }, {
                    src: [ 'docs/**' ],
                    dest: '/'
                }, {
                    src: [ 'gruntfile.js', '.gitignore', '.jshintrc', 'package.json', 'readme.md', 'CHANGELOG' ],
                    dest: '/'
                }, ]
            },
            screenshots: {
                options: {
                    archive: 'output/screenshots.zip'
                },
                files: [ {
                    expand: true,
                    cwd: 'toolbox/screenshots/',
                    src: [ '*.png', '!inline.png', '!thumbnail.png' ],
                    dest: '/'
                } ]
            },
        },
        copy: {
            main: {
                expand: true,
                cwd: 'toolbox',
                src: [ 'inline.png', 'thumbnail.png' ],
                dest: 'output/',
            },
        },
        browserSync: {
            dev: {
                bsFiles: {
                    src: [
                        'build/css/*.min.css',
                        'build/js/*.min.js'
                    ]
                },
                options: {
                    watchTask: true,
                    server: {
                        baseDir: "./"
                    },
                    startPath: "docs/single-test.html"
                }
            },
            docs: {
                bsFiles: {
                    src: [
                        'build/css/*.min.css',
                        'build/js/*.min.js',
                        'docs/**/*'
                    ]
                },
                options: {
                    watchTask: true,
                    server: {
                        baseDir: "./"
                    },
                    startPath: "docs/readme.html"
                }
            },
            test: {
              bsFiles: {
                    src: [
                        'tests/*.test.js',
                        'tests/output/calentim.html'
                    ]
                },
                options: {
                    watchTask: true,
                    online: false,
                    browser: ["chrome", "firefox", "internet explorer"],
                    server: {
                        baseDir: "./"
                    },
                    startPath: "tests/output/calentim.html"
                }
            }
        },
        jasmine: {
            desktop: {
                src: [ 'js/calentim.js' ],
                options: {
                    vendor: [ 'build/js/jquery.min.js', 'build/js/moment.min.js', 'js/jquery.hammer.js'],
                    specs: ['tests/calentim.test.js', 'tests/calentim.inline.test.js'],
                    keepRunner: true,
                    templateOptions: {
                        templates: 'tests/jasmine.tmpl'
                    },
                    outfile: 'tests/output/calentim.html',
                    styles: [ 'build/css/calentim.min.css', 'http://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css' ]
                }
            },
            mobile: {
                src: [ 'js/calentim.js' ],
                options: {
                    vendor: [ 'build/js/jquery.min.js', 'build/js/moment.min.js', 'js/jquery.hammer.js'],
                    specs: ['tests/calentim.test.js', 'tests/calentim.inline.test.js'],
                    keepRunner: true,
                    templateOptions: {
                        templates: 'tests/jasmine.tmpl'
                    },
                    outfile: 'tests/output/calentim.html',
                    styles: [ 'build/css/calentim.min.css', 'http://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css' ],
                    page: {
                        viewportSize: {
                            width: 414,
                            height: 736
                        },
                        settings: {
                            userAgent: "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"
                        }
                    }
                }
            }
        }
    } );

    grunt.loadNpmTasks( 'grunt-autoprefixer' );
    grunt.loadNpmTasks( 'grunt-browser-sync' );
    grunt.loadNpmTasks( 'grunt-contrib-compress' );
    grunt.loadNpmTasks( 'grunt-contrib-copy' );
    grunt.loadNpmTasks( 'grunt-contrib-jasmine' );
    grunt.loadNpmTasks( 'grunt-contrib-sass' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-markdown' );
    grunt.loadNpmTasks( 'js-obfuscator' );

    grunt.registerTask( 'min', [ 'uglify', 'jsObfuscate', 'sass', 'autoprefixer', 'markdown', 'compress', 'copy' ] );
    grunt.registerTask( 'default', [ 'uglify', 'jsObfuscate', 'sass', 'autoprefixer', 'markdown', 'compress', 'copy', 'jasmine' ] );
    grunt.registerTask( 'watcher', [ 'browserSync:dev', 'watch' ] );
    grunt.registerTask( 'watchdocs', [ 'browserSync:docs', 'watch' ] );
    grunt.registerTask( 'test', ['browserSync:test', 'watch:test'] );
};