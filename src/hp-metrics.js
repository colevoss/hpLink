/*
 * hp_metrics
 * 
 *
 * Copyright (c) 2014 Cole Voss
 * Licensed under the MIT license.
 */

(function ($) {

  // Collection method.
  $.fn.hpMetrics = function (options) {
    window.console.log(this);
    this.on('click', function(){
      this.innerHTML = this.innerHTML + ' clicked';
    });

    return this;
  };

  $.hpMetricsModal = function(){
    
  };

  // Setting default options
  var settings = $.extend({
    //defatul1: 'default'
  }, options);

  // Static method.
  $.hpMetrics = function (options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.hpMetrics.options, options);
    // Return something awesome.
    return 'awesome' + options.punctuation;
  };

  // Static method default options.
  $.hpMetrics.options = {
    punctuation: '.'
  };


}(jQuery));
