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

  $.fn.hpModal = function (action, options) {
    // Sets default options
    var settings = $.extend({
      entrance: 'fade',
      startPlacement: 'top',
      speed: 'fast'
    }, options);


    switch (action) {
      case 'open':
        /*
         * Function: Slides in modal
         *
         * @params (jQuery object) modal
         */
        function slideModal(modal){
          if (open) {
            var modalEntrance = {};
            modalEntrance[settings.startPlacement] = '0px';
            $('.hp-metrics-modal__background', modal.toggle()).fadeIn('fast', function(){
              //resolveInnerModalPosition($('.hp-metrics-modal__inner', modal), settings.startPlacement);
              var inner = $('.hp-metrics-modal__inner', modal).toggle();
              inner.css(resolveInnerModalPosition(inner, settings.startPlacement))
              .animate(modalEntrance, settings.speed);
            });
          } else {
            var inner = $('.hp-metrics-modal__inner', modal);
            inner.animate(resolveInnerModalPosition(inner, settings.startPlacement), settings.speed, function(){
              $('.hp-metrics-modal__background', modal).fadeOut('fast');
            });
          }
        }

        /*
         * Function: Fades in modal
         *
         * @params (jQuery object) modal
         */
        function fadeModal(modal){
          if (open) {
            $('.hp-metrics-modal__background', modal).toggle();
            modal.fadeIn('fast', function(){
              $('.hp-metrics-modal__inner', modal).fadeIn(settings.speed);
            });
          } else {
            modal.fadeOut('fast', function(){
              $('.hp-metrics-modal__inner', modal).fadeOut(settings.speed);
              $('.hp-metrics-modal__background', modal).toggle();
            });
          }
        }

        var entranceMethod = {
          fade: fadeModal,
          slide: slideModal
        };


        entranceMethod[settings.entrance](this);
        // Break case
        break;

      case 'replaceContent':
        var inner = $('.hp-metrics-modal__inner');
        inner.html(settings.content);
        break;
    }
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
    window.mx = modal;
    // -------End Initialize

    // Open modal when button us clicked
    $('[data-hp-metrics]').on('click', function(){
      modal.hpModal('open', settings);
    });

    $('.hp-metrics-modal__background').on('click', function(){
      modal.hpModal('replaceContent', {content: createZipContent()})
    });
  };

  // Creates modal
  function createModal() {
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

    var contents = createInitialContent();

    inner.appendChild(contents);
    modal.appendChild(inner);

    // Put modal in DOM
    $('body').append(modal);

    return $(modal);
  }


  /*
   * Function: Creates and returns TML for intial modal
   *
   */
  function createInitialContent() {
    var content = makeElement('div', 'hp-metrics-modal__initial');

    var contentHeader = makeElement('h2', 'modal-header', 'Processing Request!');
    content.appendChild(contentHeader);

    var contentLoading = makeElement('div', 'initial-loader');

    var loadingText = makeElement('div', 'loading-text', 'Loading');
    contentLoading.appendChild(loadingText);

    for (var _i = 1; _i <= 3; _i++){
      var loadingBar = makeElement('div', 'loader');
      loadingBar.classList.add('l' + _i);
      contentLoading.appendChild(loadingBar);
    }

    content.appendChild(contentLoading);

    return content;
  }

  function createZipContent() {
    var content = makeElement('div', 'hp-metrics-modal__zip')

    var contentHeader = makeElement('h2', 'modal-header', 'Please Enter Your Zip.')
    content.appendChild(contentHeader);

    var contentZip = makeElement('div', 'zip-content');

    var zipField = makeElement('input', 'zip');
    zipField.setAttribute('name', 'zip');
    zipField.setAttribute('type', 'text');
    zipField.setAttribute('placeholder', 'Zip Code');
    contentZip.appendChild(zipField);

    var zipButton = makeElement('button', 'zip-submit', 'Submit');
    contentZip.appendChild(zipButton);

    content.appendChild(contentZip);

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

    var offset = {};
    switch(placement){
    case 'top':
      offset['top'] = -(windowHeight/2 + modalHeight) + 'px';
      break;

    case 'left':
      offset['left'] = -(windowWidth/2 + modalWidth) + 'px';
      break;

    case 'right':
      offset['right'] = -(windowWidth/2 + modalWidth) + 'px';
      break;

    case 'bottom':
      offset['bottom'] = -(windowHeight/2 + modalHeight) + 'px';
      break;
    }

    return offset;
  }

  // Function: Includes stylesheet in <head> to access modal
  function includeCSS(){
    $('head').append('<link rel="stylesheet" href="../src/hp-metrics.css" type="text/css"</link>');
  }

  function makeElement(elType, elClass, content){
    var el = document.createElement(elType);
    el.classList.add(elClass);
    if (content) {
      el.innerHTML = content;
    }
    return el;
  }


}(jQuery));
