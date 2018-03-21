
var app = {
  filePath: 'files/',
  story: [],
  people: [],
  utils: {},
  pages: {},
  router: new Navigo(null, true),
  start: (_router) => _router.resolve()
};

var filePath = 'files/';
var ROUTER;
var story = [];
var people = [];

var utils = {
};
var start = (_router) => _router.resolve();


(function ($) {

  app.loadResources = function() {
    return $.when(
      $.getJSON(filePath + 'people.json'),
      $.getJSON(filePath + 'story.json')
    ).then((_people, _story) => {
      this.story = _story[0];
      this.people = _people[0];
    });
  };
  app.utils.getCharacter = (_name) => {
    let _ret = this.people.filter(_x => (_x.name == _name));
    return (_ret && _ret.length) > 0 ? _ret[0] : null;
  };
  app.utils.getChapter = (_year, _chapter) => {
    let _ret = this.story.filter((_x) => (_x.year == _year && _x.chapter == _chapter));
    return (_ret && _ret.length) > 0 ? _ret[0] : null;
  };
  app.render = (content) => {
    $('#main').html(content);
    $('#navbarMain, #navbarShare').collapse('hide');
    $(window).scrollTop(0);
    $('nav .nav-item').removeClass('active');
    $('nav .nav-item .nav-link').each(function() {
      if ($(this).attr('href') && document.location.hash.indexOf($(this).attr('href')) === 0) {
        $(this).closest('.nav-item').addClass('active');
      }
    });
  };
  app.loadPage = (file, callback) => {
    $.get({
      url: file,
      dataType: 'html'
    }).then(res => {
      app.render(res);
      if (callback) { callback(); }
    });
  };
  app.router.on(
    {
      'main': function () {
        app.loadPage(filePath + 'landing.html');
      },
      'story/year/:year/chapter/:chapter': (params) => {
        params.chapter = ('0' + params.chapter).slice(-2);
        var fileName = params.year === 'v' ? `v${params.chapter}.html` : `y${params.year}c${params.chapter}.html`;
        app.loadPage(filePath + fileName);
      },
      'people': () => {
        app.loadPage(filePath + 'people.html');
      },
      'about': () => {
        app.loadPage(filePath + 'about.html');
      },
      'story': () => {
        app.loadPage(filePath + 'story.html');
      },
      'gallery': () => {
        app.loadPage(filePath + 'gallery.html');
      },
      'location': () => {
        app.loadPage(filePath + 'location.html');
      },
      '*': () => {
        app.loadPage(filePath + 'landing.html');
      }

    }
  );

  app.pages.story = () => {

  };


    $(document).ready(app.loadResources().then(() => {
      app.start(app.router);
    }));
  
}(jQuery));


