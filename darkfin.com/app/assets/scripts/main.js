
var app = {
  filePath: 'files/',
  storyPath: 'story/',
  pagesPath: 'pages/',
  story: [],
  people: [],
  locations: [],
  utils: {},
  pages: {},
  router: new Navigo(null, true),
  start: (_router) => _router.resolve(),
  fadeIn: 250,
  fadeOut: 250,
  page: '',
  pageTypes: [
    'landing',
    'story',
    'chapter',
    'about',
    'gallery',
    'people',
    'location'
  ]
};

var filePath = 'files/';
var ROUTER;
var story = [];
var people = [];

var utils = {
};
var start = (_router) => _router.resolve();

$('#main').on('click', '.add-modal', function(evt) {
  // console.log(evt);
});

(function ($) {

  app.loadResources = function () {
    return $.when(
      $.getJSON(app.filePath + 'people.json'),
      $.getJSON(app.filePath + 'locations.json'),
      $.getJSON(app.filePath + 'story.json')
    ).then((_people, _locations, _story) => {
      this.story = _story[0];
      this.locations = _locations[0];
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
      $('body').attr('page-type', app.page);
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
            $('body').attr('page-type', app.page);
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
        app.page = 'landing';
        app.loadPage(filePath + 'landing.html');
      },
      'story/year/:year/chapter/:chapter': (params) => {
        app.page = 'chapter';
        params.chapter = ('0' + params.chapter).slice(-2);
        var fileName = params.year === 'v' ? `v${params.chapter}.html` : `y${params.year}c${params.chapter}.html`;
        app.loadPage(app.storyPath + fileName);
      },
      'people': () => {
        app.page = 'people';
        app.loadPage(app.pagesPath + 'people.html');
      },
      'about': () => {
        app.page = 'about';
        app.loadPage(app.pagesPath + 'about.html');
      },
      'story': () => {
        app.page = 'story';
        app.loadPage(app.pagesPath + 'story.html');
      },
      'prolog': () => {
        app.page = 'prolog';
        app.loadPage(app.pagesPath + 'prolog.html');
      },
      'gallery': () => {
        app.page = 'gallery';
        app.loadPage(app.pagesPath + 'gallery.html');
      },
      'location': () => {
        app.page = 'location';
        app.loadPage(app.pagesPath + 'location.html');
      },
      '*': () => {
        app.page = 'landing';
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


