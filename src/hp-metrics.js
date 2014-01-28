/*
 * hp_metrics
 *
 *
 * Copyright (c) 2014 Cole Voss
 * Licensed under the MIT license.
 */

(function ($) {
  var sendAnalytics;

  /*
    Sends Analytic information to Hopo database.

    @private
    @type {Function}
    @params {Object} data - What is sent for Analytic Tracking
   */

  sendAnalytics = function(data){
    $.ajax({
      type: "POST",
      url: "http://hopo.dev/cors/analytic",
      data: data,
      crossDomain: true,
      success: function(data){
        window.console.log(data);
      },
      error: function(err, erra, errb){
        window.console.log(err, erra, errb);
      }
    });
  };

  $.fn.hpModal = function (options) {

    // Sets default options
    var settings = $.extend({
    }, options);


    /*
     * Funtcion: Slides in modal
     *
     * @params (jQuery object) modal
     */
    function slideModal(modal){
      var modalEntrance = {};
      modalEntrance[settings.startPlacement] = '0px';
      $('.hp-metrics-modal__background', modal.toggle()).fadeIn('fast', function(){
        resolveInnerModalPosition($('.hp-metrics-modal__inner', modal), settings.start)
        .animate(modalEntrance, settings.speed);
      });
    }

    /*
     * Function: Fades in modal
     *
     * @params (jQuery object) modal
     */
    function fadeModal(modal){
      $('.hp-metrics-modal__background', modal).toggle();
      modal.fadeIn('fast', function(){
        $('.hp-metrics-modal__inner', modal).fadeIn(settings.speed);
      });
    }

    var entranceMethod = {
      fade: fadeModal,
      slide: slideModal
    };


    entranceMethod[settings.entrance](this);
    return this;
  };

  $.hpMetrics = function(options){
    // ------- Initialize
    includeCSS();

    // Set default Options
    var settings = $.extend({
        entrance: 'fade',
        startPlacement: 'top',
        speed: 'fast'
    }, options);

    var modal = createModal('initial');

    // -------End Initialize

    // Open modal when button us clicked
    $('[data-hp-metrics]').on('click', function(){
      modal.hpModal(settings);
    });

  };

  // Creates modal
  function createModal(step) {
    // Modal
    var modal = document.createElement('div');
    modal.classList.add('hp-metrics-modal');

    // Modal background
    var background = document.createElement('div');
    background.classList.add('hp-metrics-modal__background');
    modal.appendChild(background);

    // Modal inner div
    var inner = document.createElement('div');
    inner.classList.add('hp-metrics-modal__inner');

    var contents;
    switch (step){
    case 'initial':
      contents = createInitialContent();
    }

    inner.appendChild(contents);
    modal.appendChild(inner);

    // Put modal in DOM
    $('body').append(modal);

    return $(modal);
  }

  function createInitialContent() {
    var content = document.createElement('div');
    content.classList.add('hp-metrics-modal__initial');

    var contentHeader = document.createElement('h2');
    contentHeader.classList.add('initial-header');
    contentHeader.innerHTML = 'Processing Request. Please Wait!';
    content.appendChild(contentHeader);

    var contentLoading = document.createElement('div');
    contentLoading.classList.add('initial-loader');

    var loadingText = document.createElement('div');
    loadingText.classList.add('loading-text');
    loadingText.innerHTML = 'Loading';
    contentLoading.appendChild(loadingText);

    for (var _i = 1; _i <= 3; _i++){
      var loadingBar = document.createElement('div');
      loadingBar.classList.add('loader');
      loadingBar.classList.add('l' + _i);
      contentLoading.appendChild(loadingBar);
    }


    content.appendChild(contentLoading);

    return content;
  }

  /* Functin: Places modal > inner the correct amount off the screen to optimize
   *          slide in. When placement is established its made visible.
   *
   * @params (jQuery object) inner
   * @params (String) placement
   *
   * Returns: inner jQuery Element
   */
  function resolveInnerModalPosition(inner, placement) {
    inner = $(inner);
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;
    var modalHeight = inner.height();
    var modalWidth = inner.width();

    var offset;
    switch(placement){
    case 'top':
      offset = -(windowHeight/2 + modalHeight);
      inner.css('top', offset + 'px');
      break;

    case 'left':
      offset = -(windowWidth/2 + modalWidth);
      inner.css('left', offset + 'px');
      break;

    case 'right':
      offset = -(windowWidth/2 + modalWidth);
      inner.css('right', offset + 'px');
      break;

    case 'bottom':
      offset = -(windowHeight/2 + modalHeight);
      inner.css('bottom', offset + 'px');
      break;
    }

    return inner.toggle();
  }

  // Function: Includes stylesheet in <head> to access modal
  function includeCSS(){
    $('head').append('<link rel="stylesheet" href="../src/hp-metrics.css" type="text/css"</link>');
  }


}(jQuery));
