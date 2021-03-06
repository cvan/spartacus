// Dev-only config.
var config = require('./config');
// App Settings. Also used client-side.
var settings = require('./public/js/settings/settings.js');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: __dirname + '/.jshintrc'
      },
      files: [
        'config/**/*.js',
        'public/js/**/*.js',
        '!public/js/templates.js',
        'Gruntfile.js',
      ],
    },
    stylus: {
      options: {
        'compress': false,
        'banner': '/* Generated content - do not edit - <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        'include css': true,
        'resolve url': true,
        'paths': [
          'public/images',
          'public/lib/css/',
          'public/stylus/inc',
          'public/stylus/lib',
        ],
        'urlfunc': 'embedurl',
        'import': [
          'normalize-css/normalize.css',
          'inc/vars',
          'inc/mixins',
          'inc/global',
        ]
      },
      compile: {
        expand: true,
        cwd: 'public/stylus',
        src: ['*.styl', '!_*.styl'],
        dest: 'public/css/',
        ext: '.css',
      }
    },

    express: {
      dev: {
        options: {
          script: 'server/index.js',
          background: true,
          port: config.port,
          debug: false
        }
      }
    },


    // Development only static server.
    // Keeps running by virtue of running 'watch' afterwards.
    // See 'server' task below.
    connect: {
      tests: {
        options: {
          base: ['tests', 'public'],
          directory: 'tests',
          hostname: '*',
          port: config.testsPort,
        }
      }
    },
    watch: {
      stylus: {
        files: ['public/**/*.styl', 'public/images/'],
        tasks: 'stylus',
      },
      css: {
        files: ['public/css/*.css'],
        options: {
          livereload: config.liveReloadPort
        }
      },
      html: {
        files: ['public/**/*.html'],
        options: {
          livereload: config.liveReloadPort
        }
      },
      js: {
        files: ['public/**/*.js'],
        options: {
          livereload: config.liveReloadPort
        }
      },
      jshint: {
        files: ['<%= jshint.files %>'],
        tasks: 'jshint',
      },
      nunjucks: {
        files: 'templates/*',
        tasks: ['nunjucks']
      }
    },
    bower: {
      install: {
        options: {
          targetDir: 'public/lib',
          layout: 'byType',
          install: true,
          bowerOptions: {
            // Do not install project devDependencies
            production: true,
          }
        }
      }
    },
    nunjucks: {
      options: {
        env: require('./public/js/nunjucks-env'),
        name: function(filename) {
          return filename.replace(/^templates\//, '');
        }
      },
      precompile: {
        src: 'templates/*',
        dest: 'public/js/templates.js',
      }
    },
    shell: {
      rununittests: {
        command: 'mocha-phantomjs http://localhost:' + config.testsPort,
        options: {
          stderr: true,
          stdout: true,
          failOnError: true,
        }
      }
    },

    abideCreate: {
      default: { // Target name.
        options: {
          template: 'locale/templates/LC_MESSAGES/messages.pot', // (default: 'locale/templates/LC_MESSAGES/messages.pot')
          languages: settings.supportedLanguages,
          localeDir: 'locale',
        }
      }
    },
    abideExtract: {
      js: {
        src: 'public/**/*.js',
        dest: 'locale/templates/LC_MESSAGES/messages.pot',
        options: {
          language: 'JavaScript',
        }
      },
      html: {
        src: 'templates/payments/*.html',
        dest: 'locale/templates/LC_MESSAGES/messages.pot',
        options: {
          language: 'Jinja',
        }
      },
    },
    abideMerge: {
      default: { // Target name.
        options: {
          template: 'locale/templates/LC_MESSAGES/messages.pot', // (default: 'locale/templates/LC_MESSAGES/messages.pot')
          localeDir: 'locale',
        }
      }
    },
    abideCompile: {
      json: {
        dest: 'public/i18n',
        options: {
          type: 'json',
          jsVar: '_i18nAbide'
        },
      },
    },
  });

  // Always show stack traces when Grunt prints out an uncaught exception.
  grunt.option('stack', true);

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nunjucks');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-i18n-abide');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('default', ['jshint', 'stylus']);
  //grunt.registerTask('server', ['jshint', 'stylus', 'nunjucks', 'connect:devel', 'watch']);
  grunt.registerTask('server', ['jshint', 'stylus', 'nunjucks', 'express:dev', 'watch']);
  grunt.registerTask('testserver', ['jshint', 'stylus', 'nunjucks', 'connect:tests:keepalive']);
  grunt.registerTask('test', ['jshint', 'stylus', 'nunjucks', 'connect:tests', 'shell:rununittests']);
};
