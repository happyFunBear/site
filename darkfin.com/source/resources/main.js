
var app = {
  filePath: 'files/',
  storyPath: 'story/',
  pagesPath: 'pages/',
  story: [],
  people: [],
  utils: {},
  pages: {},
  router: new Navigo(null, true),
  start: (_router) => _router.resolve(),
  fadeIn: 250,
  fadeOut: 250
};

var filePath = 'files/';
var ROUTER;
var story = [];
var people = [];

var utils = {
};
var start = (_router) => _router.resolve();

$('#main').on('click', '.add-modal', function(evt) {
  console.log(evt);
});

(function ($) {

  app.loadResources = function () {
    return $.when(
      $.getJSON(app.filePath + 'people.json'),
      $.getJSON(app.filePath + 'story.json')
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
    let $main = $('#main');
    $('#navbarMain, #navbarShare').removeClass('show');
    if ($main.html().length === 0) {
      $main.css('opacity', 0);
      $(window).scrollTop(0);
      $(main).html(content);
      $main.animate(
        { opacity: 1 },
        {
          duration: 333,
          complete: function () {
          }
        }
      );
    } else {
      $main.animate(
        { opacity: 0 },
        {
          duration: 250,
          complete: function () {
            $(window).scrollTop(0);
            $(main).html(content);
          }
        })
        .animate({ opacity: 1 }, 500);
    }
    $('nav .nav-item').removeClass('active');
    $('nav .nav-item .nav-link').each(function () {
      if ($(this).attr('href') && document.location.hash.indexOf($(this).attr('href')) === 0) {
        $(this).closest('.nav-item').addClass('active');
      }
    });
  };
  app.loadPage = (file, callback) => {
    // fade out
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
        app.loadPage(app.storyPath + fileName);
      },
      'people': () => {
        app.loadPage(app.pagesPath + 'people.html');
      },
      'about': () => {
        app.loadPage(app.pagesPath + 'about.html');
      },
      'story': () => {
        app.loadPage(app.pagesPath + 'story.html');
      },
      'gallery': () => {
        app.loadPage(app.pagesPath + 'gallery.html');
      },
      'location': () => {
        app.loadPage(app.pagesPath + 'location.html');
      },
      '*': () => {
        app.loadPage(app.pagesPath + 'landing.html');
      }

    }
  );
  $('.modal-image').on('show.bs.modal', function (event) {
    let $target = $(event.relatedTarget);
    let img = $target.data('src');
    $(this).find('.modal-content').html(`<img src="${img}" />`);
  });
  // app.modal = {
  //   show: (content) => {
  //     $('.bd-example-modal-lg').modal('show');
  //     $('#modal').find('#modal-content').html(content);
  //   },
  //   hide: () => {

  //   }
  // };
  app.pages.story = () => {

  };


  $(document).ready(app.loadResources().then(() => {
    app.start(app.router);
  }));

}(jQuery));


