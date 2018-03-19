
var filePath = '/~bchugg/df/files/';
var ROUTER;
var story = [];
var people = [];

(function ($) {
  $.getJSON(filePath + 'story.json').then((res) => {
    story = res;
  });
  $.getJSON(filePath + 'people.json').then((res) => {
    people = res;
  });
  ROUTER = new Navigo(null, true);
  ROUTER.on(
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
  ROUTER.resolve();



}(jQuery));
