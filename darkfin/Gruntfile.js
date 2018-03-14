
module.exports = function (grunt) {
  var _ = require('lodash');
  var header = `<!DOCTYPE html> 
  <html>
  <head>
    <title>Darkfin</title>
    <link rel="stylesheet" href="style.css">
    <link rel="icon" href="df-favicon.png" type="image/x-icon">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div class="wrapper">
  `;

  var yearTitle = {
    1: 'Duquesa Bay',
    2: 'Chaparral Heights',
    3: 'Quartz Lake',
    4: 'Santa Conchita'
  }
  var storyFilePath = '/files/';

  var resourcePath = '../working-files/resources/';
  var storyPath = '../working-files/story/';
  var baseHtml = grunt.file.read(resourcePath + 'template.html');
  var cssFileName = 'main.css';
  var outPath = 'src/files/';
  var h2regex = /<h2>([\s\S]*?)<\/h2>/gm;

  var timestamp = (new Date()).getTime();
  var footer = `</div></body></html>`;
  var imagePath = '../assets/images/';
  var allFiles = [];
  grunt.initConfig({
    post: {
      run: {}
    },
    watch: {
      files: ['../working-files/**/*.*'],
      tasks: ['sass:main', 'post:run']
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
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.registerTask('makecss', ['sass:main']);
  grunt.registerTask('default', ['post:run']);

  grunt.task.registerMultiTask('post', 'post', () => {
    let structure = [];
    let files = grunt.file.expand(storyPath + '*.html');

    files.forEach(path => {
      let fileOut = baseHtml;
      let fileInfo = {};
      let file = grunt.file.read(path);
      let h = (/<h2>([\s\S]*?)<\/h2>/gm).exec(file);
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

      let prevFile = fileInfo.type +
        (fileInfo.year ? (fileInfo.year) : '') +
        (fileInfo.type === 'y' ? 'c' : '') +
        ('0' + (fileInfo.chapter - 1)).slice(-2) + '.html';

      fileInfo.prevFile = grunt.file.isFile(storyPath + prevFile) && prevFile;
      fileInfo.nextFile = grunt.file.isFile(storyPath + nextFile) && nextFile;
      structure.push(fileInfo);

      file = file
        .replace(/<h2>([\s\S]*?)<\/h2>/, '')
        .replace(/<bar><\/bar>/g, '<hr>')
        .replace(/<stage>/g, '<div class="stage">')
        .replace(/<\/stage>/g, '</div>')
        .replace(/<line>/g, '<p class="line">')
        .replace(/<\/line>/g, '</p>')
        .replace(/<actor.*?>/g, '<span class="actor">')
        .replace(/<\/actor>/g, '</span>')
        .replace(/\.\.\/graphics\//g, imagePath);


      fileOut = fileOut
        .replace(/%%time%%/g, timestamp)
        .replace(/%%title%%/g, fileInfo.title)
        .replace(/%%chapter%%/g, fileInfo.type === 'y' ? `Year ${fileInfo.year}, Chapter ${fileInfo.chapter}` : fileInfo.type === 'v' ? `Vignette ${fileInfo.chapter}` : '')
        .replace(/%%body%%/g, file)
        .replace(/%%prev%%/g, fileInfo.prevFile ? `<a href="${fileInfo.prevFile}"><i class="fa fa-chevron-left"></i>Prev</a>` : '')
        .replace(/%%next%%/g, fileInfo.nextFile ? `<a href="${fileInfo.nextFile}">Next<i class="fa fa-chevron-right"></i></a>` : '');

      grunt.file.write(outPath + fileInfo.fileName, fileOut);

    });


    // grunt.file.write(outPath + cssFileName, grunt.file.read(resourcePath + cssFileName));
    // grunt.file.write(outPath + 'story-main.css', grunt.file.read(resourcePath + 'story-main.css'));

    grunt.file.write(outPath + 'story.html', grunt.file.read(resourcePath + 'story.html'));
    grunt.file.write(outPath + 'story.json', JSON.stringify(structure));

  });

};