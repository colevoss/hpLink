(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  module('jQuery.hpMetrics', {
    // This will run before each test in this module.
    setup: function() {
      this.head = $('head');
      this.elems = $('<button>Click Me!</button>');
      this.body = $('body');
      $.hpMetrics();
    },

    teardown: function() {
    }
  });


  test('includes css file', function(){
    expect(1);
    var links = this.head.find('link[href="../src/hp-metrics.css"]');
    ok(links.length, 'Stylesheet included');
  });


  test('creates modal', function(){
    expect(1);
    var modal = this.body.find('div.hp-metrics-modal');
    ok(modal.length, 'Modal created');
  });




}(jQuery));
