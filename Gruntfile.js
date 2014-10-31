var ViewService = require('./services/ViewService.js');
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),  
         // Remove unused CSS across multiple files, compressing the final output
         uncss: {
          dist: {
            options: {
              // ignore       : [/expanded/,/js/,/wp-/,/align/,/admin-bar/],
              stylesheets  : ['http://rcwilley.com/styles/style.css'],
              // ignoreSheets : [/fonts.googleapis/],
              timeout: 5000,
              urls:['http://rcwilley.com','http://www.rcwilley.com/Furniture/Dining-Room/Dining-Sets/3324915/-5-Piece-Counter-Height-Dining-Set-View.jsp','http://rcwilley.com/Furniture/Search.jsp'], //Overwritten in load_sitemap_and_uncss task
          },
          files: {
              'css/app.clean.css': ['**/*.php']
          }
      }
  },
  sass: {
    dev: {
        options: {
            style: 'expanded',
            precision: 8
        },
        files: [{
            expand: true,
            src: ['/www/views/steve/public/scss/*.scss'],
            rename: function(dest, src) {
               console.log(src.replace(/^(.*?)\/scss\/([^.]*).*/gi,'$1/css/$2.css'));
               return src.replace(/^(.*?)\/scss\/([^.]*).*/gi,'$1/css/$2.css');
           }
       }]
   },
   dist: {
    options: {
        style: 'compressed',
        precision: 8
    },
    files: [{
        expand: true,
        src: ['/www/views/steve/public/scss/*.scss'],
        rename: function(dest, src) {
           return src.replace(/^(.*?)\/scss\/([^.]*).*/gi,'$1/css/min/$2.css');
       }
   }]
}
},
open: {
    reload : {
      path: 'http://wiseguyscomedy:3000/admin/reload',
      app: 'Google Chrome'
  }
},        
closurecompiler: {

},
watch: {
            // css: {
            //     files: '**/*.scss',
            //     tasks: ['sass']
            // },
            views: {
                files: '**/*.html',
                tasks: ['open:reload']
            }
        }
    });
grunt.loadNpmTasks('grunt-contrib-sass');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-open');
grunt.loadNpmTasks('grunt-uncss');
grunt.registerTask('default', ['watch']);
grunt.registerTask('closurecompiler', 'Compiles site javascript with Google Closure Compiler', function(arg1, arg2) {
  var googleapi = require('./services/GoogleService.js');
  googleapi.closurecompiler.compile({src: 'http://sethtippetts.com/js/critical.js', dest: '/www/public/js/min/critical.js'});
});

};


