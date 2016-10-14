module.exports = function(grunt) {
	grunt.initConfig({
	  concat: {
	    options: {
	      separator: ';',
	    },
	    dist: {
	      src: ['provider/spotlight.js', 'directive/*.js', 'spotlightOverlay.js'],
	      dest: 'dist/built.js',
	    },
	  },
	});
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.registerTask('default', ['concat']);
}
