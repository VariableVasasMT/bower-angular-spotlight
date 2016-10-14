module.exports = function(grunt) {
	grunt.initConfig({
	  concat: {
	    options: {
	      separator: ';',
	    },
	    dist: {
	      src: ['spotlightOverlay.js', 'provider/spotlight.js', 'directive/*.js'],
	      dest: 'dist/built.js',
	    },
	  },
	});
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.registerTask('default', ['concat']);
}
