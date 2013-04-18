
/* vim: set expandtab tabstop=2 shiftwidth=2 softtabstop=2 cc=76; */

/**
 * Gruntfile.
 *
 * @package     omeka
 * @subpackage  neatline-SIMILE
 * @copyright   2012 Rector and Board of Visitors, University of Virginia
 * @license     http://www.apache.org/licenses/LICENSE-2.0.html
 */

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-symbolic-link');
  grunt.loadNpmTasks('grunt-shell');

  var nlCfg = grunt.file.readJSON('../Neatline/config.json');
  var cfg = grunt.file.readJSON('./config.json');

  grunt.initConfig({

    shell: {

      options: {
        stdout: true
      },

      phpunit: {
        command: 'phpunit --color',
        options: {
          execOptions: {
            cwd: './tests/phpunit'
          }
        }
      },

      bower_cache_clean: {
        command: 'rm -rf ~/.bower && bower cache-clean'
      },

      bower_install: {
        command: 'bower install'
      }

    },

    symlink: {
      neatline: {
        link: './Neatline',
        target: '../Neatline',
        options: {
          overwrite: true
        }
      }
    },

    connect: {
      server: {
        options: {
          keepalive: true,
          port: 1337
        }
      }
    },

    clean: {
      payloads: [
        cfg.payloads.shared.js,
        cfg.payloads.shared.css
      ]
    },

    concat: {

      tray_public: {
        src: cfg.src.shared+'/public/*.js',
        dest: cfg.payloads.shared.js+'/tray-public.js'
      },

      tray_editor: {
        src: [
          cfg.vendor.js.html5sortable,
          cfg.src.shared+'/public/*.js',
          cfg.src.shared+'/editor/*.js'
        ],
        dest: cfg.payloads.shared.js+'/tray-editor.js'
      },

      tray_editor_css: {
        src: [
          cfg.payloads.shared.css+'/tray-public.css',
          cfg.payloads.shared.css+'/tray-editor.css',
        ],
        dest: cfg.payloads.shared.css+'/tray-editor.css'
      }

    },

    uglify: {

      tray_public: {
        src: '<%= concat.tray_public.src %>',
        dest: cfg.payloads.shared.js+'/tray-public.js'
      },

      tray_editor: {
        src: '<%= concat.tray_editor.src %>',
        dest: cfg.payloads.shared.js+'/tray-editor.js'
      }

    },

    stylus: {
      compile: {
        files: {
          './views/shared/css/payloads/tray-public.css':
            cfg.stylus.shared+'/public/*.styl',
          './views/shared/css/payloads/tray-editor.css':
            cfg.stylus.shared+'/editor/*.styl'
        }
      }
    },

    watch: {
      payload: {
        files: [
          '<%= concat.tray_public.src %>',
          '<%= concat.tray_editor.src %>',
          cfg.stylus.shared+'/**/*.styl'
        ],
        tasks: ['compile']
      }
    },

    jasmine: {

      options: {
        helpers: [
          './Neatline/'+nlCfg.vendor.js.jasmine_jquery,
          './Neatline/'+nlCfg.vendor.js.sinon,
          './Neatline/'+nlCfg.jasmine+'/helpers/*.js',
          './Neatline/'+nlCfg.jasmine+'/assertions/*.js',
          cfg.jasmine+'/helpers/*.js'
        ]
      },

      neatline: {
        src: [
          './Neatline/'+nlCfg.payloads.shared.js+'/neatline.js',
          cfg.payloads.shared.js+'/tray-public.js'
        ],
        options: {
          specs: cfg.jasmine+'/suites/public/**/*.spec.js'
        }
      },

      editor: {
        src: [
          './Neatline/'+nlCfg.payloads.shared.js+'/editor.js',
          cfg.payloads.shared.js+'/tray-editor.js'
        ],
        options: {
          specs: cfg.jasmine+'/suites/editor/**/*.spec.js'
        }
      }

    }

  });

  // Run tests.
  grunt.registerTask('default', 'test');

  // Build the application.
  grunt.registerTask('build', [
    'clean',
    'symlink',
    'shell:bower_cache_clean', 
    'shell:bower_install' 
  ]);

  // Assemble static assets.
  grunt.registerTask('compile', [
    'concat:tray_public',
    'concat:tray_editor',
    'stylus',
    'concat:tray_editor_css'
  ]);

  // Assemble/min static assets.
  grunt.registerTask('compile:min', [
    'uglify:tray_public',
    'uglify:tray_editor',
    'stylus',
    'concat:tray_editor_css'
  ]);

  // Run all tests.
  grunt.registerTask('test', [
    'shell:phpunit',
    'jasmine'
  ]);

  // Run PHPUnit.
  grunt.registerTask('phpunit', 'shell:phpunit');

  // Mount public Jasmine suite.
  grunt.registerTask('jasmine:neatline:server', [
    'jasmine:neatline:build',
    'connect'
  ]);

  // Mount editor Jasmine suite.
  grunt.registerTask('jasmine:editor:server', [
    'jasmine:editor:build',
    'connect'
  ]);

};
