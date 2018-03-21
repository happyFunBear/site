
module.exports = function (grunt) {
  var _ = require('lodash');

  var yearTitle = {
    1: 'Duquesa Bay',
    2: 'Chaparral Heights',
    3: 'Quartz Lake',
    4: 'Santa Conchita'
  };


  var copyList = [

  ];
  
  var resourcePath = '../working-files/resources/';
  var storyPath = '../working-files/story/';
  var baseHtml = grunt.file.read(resourcePath + 'chapter-template.html');

  var outPath = 'src/files/';

  var timestamp = (new Date()).getTime();
  var imagePath = 'assets/images/';

  var synopsis = grunt.file.readJSON(resourcePath + 'synopses-working.json');

  var getSynopsis = (year, chapter) => {
    let v = synopsis.filter(x => (parseInt(x.chapter) == parseInt(chapter) && parseInt(x.year) == parseInt(year)));
    return v[0] ? v[0].synopsis : '';
  };

  grunt.initConfig({
    post: {
      run: {}
    },
    clean: [outPath],
    watch: {
      files: ['../working-files/**/*.*', 'Gruntfile.js'],
      tasks: ['make']
    },
    copy: {
      favicon: {
        files: [{
          src: [resourcePath + '*.png'],
          dest: outPath,
        }]
  
      }
    },
    sass: {
      main: {
        files: {
          'src/files/main.css': resourcePath + 'main.scss'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('makecss', ['sass:main']);
  grunt.registerTask('default', ['post:run']);
  grunt.registerTask('make', ['clean', 'makecss', 'default']);

  grunt.task.registerMultiTask('post', 'post', () => {
    let structure = [];
    let files = grunt.file.expand(storyPath + '*.html');
    const setTimes = function(content) {
      return content.replace(/%%year%%/g, (new Date()).getFullYear()).replace(/%%time%%/g, timestamp);
    };
    files.forEach(path => {
      let fileOut = baseHtml;
      let fileInfo = {};
      let file = grunt.file.read(path);
      let h = (/<chapter-title>([\s\S]*?)<\/chapter-title>/gm).exec(file);
      fileInfo.fileName = path.replace(storyPath, '');
      fileInfo.title = h ? h[1] : 'Not Found';
      fileInfo.type = fileInfo.fileName[0]; // y or v
      fileInfo.year = fileInfo.type === 'y' ? fileInfo.fileName[1] : null;
      fileInfo.yearTitle = fileInfo.type === 'y' ? yearTitle[fileInfo.year] : null;
      fileInfo.chapter = fileInfo.type === 'y' ? +fileInfo.fileName.substr(3, 2) : fileInfo.type === 'v' ? +fileInfo.fileName.substr(1, 2) : null;
 
      let nextFile = fileInfo.type +
        (fileInfo.year ? (fileInfo.year) : '') +
        (fileInfo.type === 'y' ? 'c' : '') +
        ('0' + (fileInfo.chapter + 1)).slice(-2) + '.html';

      let nextHash = `#/story/year/${fileInfo.year || fileInfo.type}/chapter/${fileInfo.chapter + 1}`;
      let prevFile = fileInfo.type +
        (fileInfo.year ? (fileInfo.year) : '') +
        (fileInfo.type === 'y' ? 'c' : '') +
        ('0' + (fileInfo.chapter - 1)).slice(-2) + '.html';
        
      let prevHash = `#/story/year/${fileInfo.year || fileInfo.type}/chapter/${fileInfo.chapter - 1}`;

      fileInfo.prevFile = grunt.file.isFile(storyPath + prevFile) && prevFile;
      fileInfo.nextFile = grunt.file.isFile(storyPath + nextFile) && nextFile;
      structure.push(fileInfo);

      file = file
        .replace(/<chapter-title>([\s\S]*?)<\/chapter-title>/, '')
        .replace(/<bar><\/bar>/g, '<hr>')
        .replace(/<stage>/g, '<div class="stage">')
        .replace(/<\/stage>/g, '</div>')
        .replace(/<line>/g, '<p class="line">')
        .replace(/<\/line>/g, '</p>')
        .replace(/<actor.*?>/g, '<span class="actor">')
        .replace(/<\/actor>/g, '</span>')
        .replace(/<image/g, '<img')
        .replace(/\.\.\/graphics\//g, imagePath);


      fileOut = fileOut
        .replace(/%%title%%/g, fileInfo.title)
        .replace(/%%chapter%%/g, fileInfo.type === 'y' ? `Year ${fileInfo.year}, Chapter ${fileInfo.chapter}` : fileInfo.type === 'v' ? `Vignette ${fileInfo.chapter}` : '')
        .replace(/%%synopsis%%/g, getSynopsis(fileInfo.year, fileInfo.chapter))
        .replace(/%%body%%/g, file)
        .replace(/%%prev%%/g, fileInfo.prevFile ? `<a href="${prevHash}"><i class="fa fa-chevron-left"></i>Prev</a>` : '')
        .replace(/%%next%%/g, fileInfo.nextFile ? `<a href="${nextHash}">Next<i class="fa fa-chevron-right"></i></a>` : '');
       
      fileOut = setTimes(fileOut);
      grunt.file.write(outPath + fileInfo.fileName, fileOut);

    });

    var storiesFile = grunt.file.read(resourcePath + 'story.html');
    storiesFile = setTimes(storiesFile);

    grunt.file.write(outPath + 'story.html', storiesFile);
    grunt.file.write(outPath + 'story.json', JSON.stringify(structure));
    grunt.file.write(outPath + 'people.json', grunt.file.read(resourcePath + 'people.json'));
    grunt.file.write(outPath + 'people.html', grunt.file.read(resourcePath + 'people.html'));
    grunt.file.write(outPath + 'about.html', grunt.file.read(resourcePath + 'about.html'));
    grunt.file.write(outPath + 'landing.html', grunt.file.read(resourcePath + 'landing.html'));
    grunt.file.write(outPath + 'location.html', grunt.file.read(resourcePath + 'location.html'));
    grunt.file.write(outPath + 'gallery.html', grunt.file.read(resourcePath + 'gallery.html'));

    grunt.file.copy(resourcePath + 'df-favicon.png', outPath + 'df-favicon.png', { encoding: null } );

  });

};