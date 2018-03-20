
var app = {
  filePath: '/~bchugg/df/files/',
  story: [],
  people: [],
  utils: {},
  pages: {},
  router: new Navigo(null, true),
  start: (_router) => _router.resolve()
};

var filePath = '/~bchugg/df/files/';
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

  app.router.on(
    {
      'main': function () {
        console.log('main');
      },
      'story/year/:year/chapter/:chapter': (params) => {
        params.chapter = ('0' + params.chapter).slice(-2);
        var fileName = params.year === 'v' ? `v${params.chapter}.html` : `y${params.year}c${params.chapter}.html`;
        $.get({
          url: filePath + fileName,
          dataType: 'html'
        }).then(res => {
          $('#main').html(res);
        });
      },
      'people': () => {
        $.get({
          url: filePath + 'people.html',
          dataType: 'html'
        }).then(res => {
          $('#main').html(res);
        });
      },
      'about': () => {
        $.get({
          url: filePath + 'about.html',
          dataType: 'html'
        }).then(res => {
          $('#main').html(res);
        });
      },
      'story': () => {
        $.get({
          url: filePath + 'story.html',
          dataType: 'html'
        }).then(res => {
          $('#main').html(res);
        });
      },
      '*': () => {
        console.log('default');
      }

    }
  );

  app.pages.story = () => {

  };


    $(document).ready(app.loadResources().then(() => {
      app.start(app.router);
    }));
  
}(jQuery));


