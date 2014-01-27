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

  module('jQuery#hpMetrics', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('<button>Click Me!</button>');
    }
  });


  test('returns button text when clicked', function(){
    expect(1);
    this.elems.hpMetrics();
    this.elems.on('click', function(){
      equal(this.innerHTML, 'Click Me! clicked' ,'button was clicked');
    });
    $(this.elems).trigger('click');
  });

  module('jQuery.hpMetrics');

  test('is awesome', function() {
    expect(2);
    strictEqual($.hpMetrics(), 'awesome.', 'should be awesome');
    strictEqual($.hpMetrics({punctuation: '!'}), 'awesome!', 'should be thoroughly awesome');
  });

}(jQuery));
