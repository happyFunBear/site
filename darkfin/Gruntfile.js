
module.exports = function (grunt) {
  var header = `<html><head><style>
  .stage { background-color: #ddd; margin: 10px 30px; }
  .actor { background-color: #cee; }
  .line { background-color: #eec; }
  .actor:after { content: ":"; }
  </style>
  </head>
  <body>
  `;

  // ../files/y3c22.html

  var footer = `</body></html>`;
  var imagePath = '../assets/images/';
  var allFiles = [];
  grunt.initConfig({
    post: {
      run: {}
    },
    copy: {
      main: {
        src: '../files/*.html',
        dest: './src/out/',
        options: {
          process: function (content, srcpath) {
            var fileName = srcpath.split('/files/')[1].split('.html')[0], year, chapter, num, title = '', foot = '', nextFile, prevFile;
            var h2 = /<h2>\s*?(.*?)\s*?<\/h2>/gm.exec(content);
            if (fileName.indexOf('y') === 0 && fileName.indexOf('c') === 2) {
              year = +fileName[1];
              chapter = +fileName.substr(3, 2);
              title = '<h1>Year ' + year + ', Chapter ' + chapter + '</h1>';
              nextFile = 'y' + year + 'c' + (chapter + 1 < 10 ? '0' + (chapter + 1) : chapter + 1) + '.html';
              prevFile = 'y' + year + 'c' + (chapter - 1 < 10 ? '0' + (chapter - 1) : chapter - 1) + '.html';
              if (grunt.file.isFile('../files/' + prevFile)) {
                foot += '<div>prev file = ' + prevFile + '</div>';
              }
              if (grunt.file.isFile('../files/' + nextFile)) {
                foot += '<div>next file = ' + nextFile + '</div>';
              }
              allFiles.push({
                year: year,
                chapter: chapter,
                fileName: fileName + '.html',
                title: h2 && h2[1] ? h2[1].replace(/&quot;/gm, '') : ''
              });
            } else if (fileName.indexOf('v') === 0) {
              chapter = +fileName.substr(1, 2);
              title = '<h1>Vignette ' + chapter + '</h1>';
              nextFile = 'v' + (chapter + 1 < 10 ? '0' + (chapter + 1) : chapter + 1) + '.html';
              prevFile = 'v' + (chapter - 1 < 10 ? '0' + (chapter - 1) : chapter - 1) + '.html';
              if (grunt.file.isFile('../files/' + prevFile)) {
                foot += '<div>prev file = ' + prevFile + '</div>';
              }
              if (grunt.file.isFile('../files/' + nextFile)) {
                foot += '<div>next file = ' + nextFile + '</div>';
              }
              allFiles.push({
                year: 'v',
                chapter: chapter,
                fileName: fileName + '.html',
                title: h2 && h2[1] ? h2[1].replace(/&quot;/gm, '') : ''
              });
            }
            console.log(fileName, h2 ? h2[1] : '--');

            return header +
              title +
              content
                .replace(/<stage>/g, '<div class="stage">')
                .replace(/<\/stage>/g, '</div>')
                .replace(/<line>/g, '<p class="line">')
                .replace(/<\/line>/g, '</p>')
                .replace(/<actor.*?>/g, '<span class="actor">')
                .replace(/<\/actor>/g, '</span>')
                .replace(/\.\.\/graphics\//g, imagePath) +
              foot +
              footer;
          },
        },
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['copy:main', 'post:run']);

  grunt.task.registerMultiTask('post', 'post', () => {
    // console.log(allFiles);
  });

};