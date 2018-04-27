
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
  start: function(_router){ _router.resolve(); },
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

// var start = function(_router){ _router.resolve(); }

(function ($) {

  app.loadResources = function() {
    return $.when(
      $.getJSON(app.filePath + 'people.json'),
      $.getJSON(app.filePath + 'locations.json'),
      $.getJSON(app.filePath + 'story.json')
    ).then(function(_people, _locations, _story) {
      app.story = _story[0];
      app.locations = _locations[0];
      app.people = _people[0];
    });
  };

  app.utils.getCharacter = function(_name) {
    let _ret = app.people.filter(function(_x) {
      return (_x.name == _name);
    });
    return (_ret && _ret.length) > 0 ? _ret[0] : null;
  };

  app.utils.getChapter = function(_year, _chapter) {
    let _ret = app.story.filter(function(_x) {
      return (_x.year == _year && _x.chapter == _chapter);
    });
    return (_ret && _ret.length) > 0 ? _ret[0] : null;
  };

  {
    /* <meta property="og:title" content="European Travel Destinations">
<meta property="og:description" content="Offering tour packages for individuals or groups.">
<meta property="og:image" content="http://euro-travel-example.com/thumbnail.jpg">
<meta property="og:url" content="http://euro-travel-example.com/index.htm">
<meta name="twitter:card" content="summary_large_image">


<!--  Non-Essential, But Recommended -->

<meta property="og:site_name" content="European Travel, Inc.">
<meta name="twitter:image:alt" content="Alt text for image"> */
}

  app.utils.setMetaData = function(content, type) {
    let title = 'Darkfin of Duquesa Bay';
    if (type === 'chapter') {
      title = $(content).find('.chapter-title').text();
    }
    $('meta[property="og:title"]').attr('content', title);
    $('meta[property="og:description"]').attr('content', 'lorem ipsom dolor');
    // $('meta[property="og:image"]').attr('content', 'Darkfin of Duquesa Bay');
    $('meta[property="og:url"]').attr('content', document.location);
    $('meta[property="og:site_name"]').attr('content', 'Darkfin of Duquesa Bay');
    // <meta name="twitter:card" content="summary_large_image">
    // $('meta[name="twitter:card"]').attr('content', 'Darkfin of Duquesa Bay');
    $('meta[name="twitter:image:alt"]').attr('content', 'Darkfin of Duquesa Bay');
  };

  app.render = function(content) {
    let $main = $('#main');
    $('#navbarMain, #navbarShare').removeClass('show');
    app.utils.setMetaData(content, app.page);
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
  app.loadPage = function(file, callback) {
    // fade out
    $.get({
      url: file,
      dataType: 'html'
    }).then(function(res) {
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
      'story/year/:year/chapter/:chapter': function(params) {
        app.page = 'chapter';
        params.chapter = ('0' + params.chapter).slice(-2);
        var fileName = params.year === 'v' ? 'v' + params.chapter + '.html' : 'y' + params.year + 'c' + params.chapter + '.html';
        app.loadPage(app.storyPath + fileName, app.pages.story);
      },
      'people': function () {
        app.page = 'people';
        app.loadPage(app.pagesPath + 'people.html');
      },
      'about': function () {
        app.page = 'about';
        app.loadPage(app.pagesPath + 'about.html');
      },
      'story': function () {
        app.page = 'story';
        app.loadPage(app.pagesPath + 'story.html');
      },
      'prolog': function () {
        app.page = 'prolog';
        app.loadPage(app.pagesPath + 'prolog.html');
      },
      'gallery': function () {
        app.page = 'gallery';
        app.loadPage(app.pagesPath + 'gallery.html');
      },
      'location': function () {
        app.page = 'location';
        app.loadPage(app.pagesPath + 'location.html');
      },
      '*': function () {
        app.page = 'landing';
        app.loadPage(app.pagesPath + 'landing.html');
      }

    }
  );

  app.utils.expandImage = function(img) {
    let $baseImg = $(img);
    let $img = $('<img>').attr('src', img.src).css({
      position: 'absolute',
      top: '-10000px',
      left: '-10000px',
      height: 'auto',
      weight: 'auto'
    });
    $('body').prepend($img);
    let ret = $img.height() * 0.98 > $baseImg.height() || $img.width() * 0.98 > $baseImg.width();
    $img.remove();
    return ret;
  };
  $('#main').on('click', '.add-modal', function (evt) {
    if (app.utils.expandImage(evt.target)) {
      $('.modal-image').find('.modal-content img').attr('src', evt.target.src);
      $('.modal-image').modal();  
    }
  });
  
  app.pages.story = function()  {
    // $('.line .actor').each(function() {
    //   var actor = $(this).text();
    //   var char = app.people.filter(function(p){
    //     return p.name.toLowerCase().indexOf(actor.toLowerCase()) > -1;
    //   });
    //   if (char.length === 1) {
    //     var content = $('<div>');
    //     content.append($('<h5>').text(char[0].name));
    //     content.append($('<p>').html(char[0].bio));
    //     $(this).addClass('show-character').text('').append($('<a href="javascript:void();">').text(actor).popover({
    //       content: content,
    //       html: true,
    //       placement: 'top',
    //       trigger: 'focus'
    //     }));
    //   }
    // });
  };


  $(document).ready(app.loadResources().then(function() {
    app.start(app.router);
  }));

}(jQuery));


