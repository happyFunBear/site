var _ = require('lodash');

module.exports = function (grunt) {

  var config = grunt.file.readJSON('build.config.json');

  var baseHtml = grunt.file.read(config.pagesPath + 'chapter-template.html');

  var timestamp = (new Date()).getTime();

  var synopsis = grunt.file.readJSON(config.resourcePath + 'synopses.json');

  var getSynopsis = (year, chapter) => {
    let v = synopsis.filter(x => (parseInt(x.chapter) == parseInt(chapter) && parseInt(x.year) == parseInt(year)));
    return v[0] ? v[0].synopsis : '';
  };

  grunt.initConfig({
    post: {
      run: {}
    },
    checkImages: {
      run: {}
    },
    clean: {
      main: [config.outPath.dir],
      imgs: ['source/images/']
    },
    watch: {
      files: ['./source/**', 'Gruntfile.js', 'build.config.json'],
      tasks: ['make']
    },
    copy: {
      fonts: {
        files: [
          {
            src: ['./source/images/*', './source/resources/images/*'],
            dest: './app/assets/images/',
            flatten: true,
            expand: true
          },
          {
            src: ['./node_modules/font-awesome/fonts/*'],
            dest: './app/assets/fonts/',
            flatten: true,
            expand: true
          },
          {
            src: config.jsFiles,
            dest: config.outPath.scripts,
            flatten: true,
            expand: true
          }
        ]
      }
    },
    uglify: {
      move: {
        options: {
          compress: false,
          // mangle: false
        },
        files: {
          [config.outPath.scripts + 'build.js']: config.jsFiles
        }
      }
    },
    cssmin: {
      move: {
        options: {
          // level: 2
        },
        files: {
          [config.outPath.styles + 'build.css']: config.cssFiles
        }
      }
    },
    sass: {
      main: {
        files: {
          [config.outPath.styles + '/main.css']: config.resourcePath + 'main.scss'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('js', ['uglify:move']);
  grunt.registerTask('css', ['cssmin:move']);

  grunt.registerTask('makecss', ['sass:main']);
  grunt.registerTask('default', ['post:run']);
  grunt.registerTask('make', ['clean:main', 'makecss', 'js', 'css', 'copy:fonts', 'default']);

  grunt.registerTask('imageMake', ['clean:imgs', 'checkImages']);

  grunt.task.registerMultiTask('checkImages', 'checkImages', () => {
    let images = [];
    let files = grunt.file.expand(config.storyPath + '*.html');
    let chars = grunt.file.readJSON('./source/resources/people.json');
    let css = grunt.file.read(config.resourcePath + 'main.scss');
    let cssRegex = /url\(.*?\)/g;
    let regex = /src="(.*?)"/g;
    files.forEach(path => {
      let file = grunt.file.read(path);
      let names = file.match(regex);
      images = images.concat(names);
    });
    images = images.concat(_.map(chars, 'image'));
    images = images.map(path => {
      return path.split('graphics/')[1].replace('"', '');
    });
    images = images.concat(css.match(cssRegex).map(x => (x.split('images/')[1].replace(')', ''))));
    images = _.uniq(images);
    images.forEach(p => {
      grunt.file.copy('./images/' + p, './source/images/' + p, { encoding: null });
    });
  });

  grunt.task.registerMultiTask('post', 'post', () => {
    let structure = [];
    let files = grunt.file.expand(config.storyPath + '*.html');
    const setTimes = function (content) {
      return content.replace(/%%year%%/g, (new Date()).getFullYear()).replace(/%%time%%/g, timestamp);
    };
    files.forEach(path => {
      let fileOut = baseHtml;
      let fileInfo = {};
      let file = grunt.file.read(path);
      let h = (/<chapter-title>([\s\S]*?)<\/chapter-title>/gm).exec(file);
      fileInfo.fileName = path.replace(config.storyPath, '');
      fileInfo.title = h ? h[1] : 'Not Found';
      fileInfo.type = fileInfo.fileName[0]; // y or v
      fileInfo.year = fileInfo.type === 'y' ? fileInfo.fileName[1] : null;
      fileInfo.yearTitle = fileInfo.type === 'y' ? config.yearTitle[fileInfo.year] : null;
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

      fileInfo.prevFile = grunt.file.isFile(config.storyPath + prevFile) && prevFile;
      fileInfo.nextFile = grunt.file.isFile(config.storyPath + nextFile) && nextFile;
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
        .replace(/<image/g, '<img class="add-modal" ')
        .replace(/\.\.\/graphics\//g, config.imagePath);


      fileOut = fileOut
        .replace(/%%title%%/g, fileInfo.title)
        .replace(/%%chapter%%/g, fileInfo.type === 'y' ? `Year ${fileInfo.year}, Chapter ${fileInfo.chapter}` : fileInfo.type === 'v' ? `Vignette ${fileInfo.chapter}` : '')
        .replace(/%%synopsis%%/g, getSynopsis(fileInfo.year, fileInfo.chapter))
        .replace(/%%body%%/g, file)
        .replace(/%%prev%%/g, fileInfo.prevFile ? `<a href="${prevHash}"><i class="fa fa-chevron-left"></i>Prev</a>` : '')
        .replace(/%%next%%/g, fileInfo.nextFile ? `<a href="${nextHash}">Next<i class="fa fa-chevron-right"></i></a>` : '');

      grunt.file.write(config.outPath.story + fileInfo.fileName, fileOut);

    });

    var storiesFile = grunt.file.read(config.pagesPath + 'story.html');

    // grunt.file.write(config.outPath.pages + 'story.html', storiesFile);
    grunt.file.write(config.outPath.files + 'story.json', JSON.stringify(structure, null, 4));
    // grunt.file.copy(config.pagesPath + 'index.html', config.outPath.dir + 'index.html');

    // grunt.file.write(config.outPath.files + 'people.json', grunt.file.read(config.resourcePath + 'people.json'));

    // grunt.file.write(config.outPath.pages + 'people.html', grunt.file.read(config.pagesPath + 'people.html'));
    // grunt.file.write(config.outPath.pages + 'about.html', grunt.file.read(config.pagesPath + 'about.html'));
    // grunt.file.write(config.outPath.pages + 'landing.html', grunt.file.read(config.pagesPath + 'landing.html'));
    // grunt.file.write(config.outPath.pages + 'location.html', grunt.file.read(config.pagesPath + 'location.html'));
    
    grunt.file.write(config.outPath.dir + 'index.html', setTimes(grunt.file.read(config.pagesPath + 'index.html')));

    grunt.file.copy(config.resourcePath + 'people.json'  , config.outPath.files + 'people.json');
    grunt.file.copy(config.resourcePath + 'synopses.json', config.outPath.files + 'synopses.json');
    grunt.file.copy(config.resourcePath + 'locations.json', config.outPath.files + 'locations.json');

    grunt.file.copy(config.pagesPath + 'story.html'    , config.outPath.pages + 'story.html');
    grunt.file.copy(config.pagesPath + 'people.html'   , config.outPath.pages + 'people.html');
    grunt.file.copy(config.pagesPath + 'about.html'    , config.outPath.pages + 'about.html');
    grunt.file.copy(config.pagesPath + 'landing.html'  , config.outPath.pages + 'landing.html');
    grunt.file.copy(config.pagesPath + 'location.html' , config.outPath.pages + 'location.html');
    grunt.file.copy(config.pagesPath + 'gallery.html'  , config.outPath.pages + 'gallery.html');
    grunt.file.copy(config.pagesPath + 'prolog.html'  , config.outPath.pages + 'prolog.html');

    grunt.file.copy(config.resourcePath + 'main.js'    , config.outPath.scripts + 'main.js');

    // grunt.file.copy(config.resourcePath + 'images/' + 'df-favicon.png', config.outPath.images + 'df-favicon.png', { encoding: null });

  });

};