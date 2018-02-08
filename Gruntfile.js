module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    babel: {
       options: {
         sourceMap: true,
         presets: ['env']
       },
       dist: {
         files: {
           'dist/renderer.js': 'src/renderer.js'
         }
       }
   }

  })

  grunt.loadNpmTasks('grunt-babel');
  grunt.registerTask('default', ['babel']);

};
