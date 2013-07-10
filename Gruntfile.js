module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-wrap');
  grunt.file.setBase('src');
  grunt.initConfig({
    pkg: grunt.file.readJSON('../package.json'),
      wrap: {
        dist: {
          src: ['jasmine-mocks.js'],
          dest: '../dist/',
      	  wrapper: [
            'var jasmine = require(\'jasmine-node\');\n',
            '\nmodule.exports = {' +
            '\n  mock: mock,' +
            '\n  when: when,' +
            '\n  argThat: argThat' +
            '\n};'
          ]
        }
      }
  });
}
