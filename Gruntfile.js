module.exports = function(grunt) {
	grunt.initConfig({
	  jshint: {
      		files: ['Gruntfile.js', 'spotlightOverlay.js', 'provider/*.js', 'directive/*.js'],
      		options: {
        		globals: {
          			jQuery: true
        		}
      		}
    	  },
	  concat: {
	    options: {
	    },
	    dist: {
	      src: ['spotlightOverlay.js', 'provider/spotlight.js', 'directive/*.js'],
	      dest: 'dist/built.js',
	    },
	  }
	});
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.registerTask('default', ['concat']);
}
