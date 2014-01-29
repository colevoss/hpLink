/*
 * hp_metrics
 *
 *
 * Copyright (c) 2014 Cole Voss
 * Licensed under the MIT license.
 */

;(function ($) {

  $.fn.hpModal = function (action, options, cb) {
    // Sets default options
    var settings = $.extend({
      entrance: 'fade',
      startPlacement: 'top',
      speed: 'fast',
      removeBackground: false
    }, options);


    var entranceMethod = {
      /*
       * Function: Slides in modal
       *
       * @params (jQuery object) modal
       */
      slide: function(modal){
        var modalEntrance = {};
        //var start = settings.startPlacement === 'right' ? 'left' : settings.startPlacement;
        var start;
        switch (settings.startPlacement){
        case 'right':
          start = 'left';
          break;
        case 'bottom':
          start = 'top';
          break;
        default:
          start = settings.startPlacement;
        }
        modalEntrance[start] = '50%';
        $('.hp-metrics-modal__background', modal.toggle()).fadeIn('fast', function(){
          var inner = $('.hp-metrics-modal__inner', modal).toggle();

          inner.css(resolveInnerModalPosition(inner, settings.startPlacement))
          .animate(
            modalEntrance,
            settings.speed,
            cb()
          );
        });
      },

      /*
       * Fades in modal
       *
       * @params (jQuery object) modal
       */
      fade: function(modal){
        $('.hp-metrics-modal__background', modal).toggle();
        modal.fadeIn('fast', function(){
          $('.hp-metrics-modal__inner', modal).fadeIn(settings.speed, cb());
        });
      }
    };

    var exitMethod = {
      /*
       * Slides modal out
       */
      slide: function(modal){
        var inner = $('.hp-metrics-modal__inner', modal);
        inner.animate(resolveInnerModalPosition(inner, settings.startPlacement), settings.speed, cb());
        if (settings.removeBackground !== false){
          $('.hp-metrics-modal__background', modal).fadeOut('fast');
        }
      },

      /*
       * Fades modal out
       */
      fade: function(modal){
        modal.fadeOut('fast', function(){
          $('.hp-metrics-modal__inner', modal).fadeOut(settings.speed, cb());
          if (settings.removeBackground !== false){
            $('.hp-metrics-modal__background', modal).fadeOut('fast');
          }
        });
      }
    };

    switch (action) {
      case 'open':
        entranceMethod[settings.entrance](this);
        break; // Break Case

      case 'replaceContent':
        var inner = $('.hp-metrics-modal__inner');
        inner.html(settings.content);
        break; // Break Case

      case 'close':
        exitMethod[settings.entrance](this);
        break; // Break Case
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
      speed: 'fast',
      removeBackground: false
    }, options);

    var _this = this;

    /*
     * Sends Analytic information to Hopo database.
     *
     * @private
     * @type {Function}
     * @params {Object} data - What is sent for Analytic Tracking
     *
     * TODO: Break response types into different functions.
     *
     */
    this.sendAnalytics = function(data){
      $.ajax({
        type: "POST",
        //url: "http://honestpolicy.com/cors/analytic", //Production
        url: "http://hopo.dev/cors/analytic", //Development
        data: data,
        crossDomain: true,
        success: function(data){
          if (data.response === 'zip_required') {
            setTimeout(function(){
              modal.hpModal('replaceContent', {content: _this.createZipContent()});
            }, 1000);
          } else if (data.response === 'no_zip'){
            setTimeout(function(){
              modal.hpModal('replaceContent', {content: _this.createOutroContent()});
            }, 1000);
            setTimeout(function(){
              modal.hpModal('close', settings, function(){
                _this.redirectPage('http://google.com');
              });
            }, 1500);
          }
        },
        error: function(err, erra, errb){
          window.console.log(err, erra, errb);
        }
      });
    };


    /*
     * Redirects page to new url with formatted params if provided
     * 
     * @params (String) url
     * @params (Object) params
     */
    this.redirectPage = function(url, params) {
      var redirectTo = url;
      if (params) {
        redirectTo = redirectTo + "?";
        for (var _k in params) {
          redirectTo = redirectTo + _k + "=" + params[_k] + "&";
        }
        redirectTo = redirectTo.replace(/&$/, '');
      }
      window.location.assign(redirectTo);
    };


    /*
     * Creates modal background, and inner modal and also fills it with the initial modal.
     *
     * Returns modal as a jQuery object.
     */
    this.createModal = function(){
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

      var contents = this.createInitialContent();

      inner.appendChild(contents);
      modal.appendChild(inner);

      // Put modal in DOM
      $('body').append(modal);

      return $(modal);
    };


    this.createCloseButton = function(){
      var button = makeElement('a', 'hp-metrics-modal__close', 'Close');
      button.setAttribute('href', '');
      return button;
    };


    /*
     * Validates that zip is 5 integers.
     *
     * Replaces modal with outro if zip is valid.
     *
     * Redirects to appropriate URL.
     *
     */
    this.submitZip = function(){
      var zip = $('.hp-metrics-modal__zip-field').val();
      if (/^\d{5}$/.test(zip)){
        $('.hp-metrics-modal__error').text('');
        modal.hpModal('replaceContent', {content: _this.createOutroContent()});
        setTimeout(function(){
          modal.hpModal('close', $.extend({removeBackground: false}, settings), function(){
            _this.redirectPage('http://google.com', {zip: zip});
          });
        }, 1500);
      } else {
        $('.hp-metrics-modal__error').text('Invalid Zip Code.');
      }
    };


    /*
     * Creates and returns HTML for intial modal including loading animation
     *
     */
    this.createInitialContent = function() {
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
      content.appendChild(this.createCloseButton());

      return content;
    };


    /*
     * Creates and returns HTML for zip form modal.
     *
     */
    this.createZipContent = function() {
      var content = makeElement('div', 'hp-metrics-modal__zip');

      var contentHeader = makeElement('h2', 'modal-header', 'Please Enter Your Zip.');
      content.appendChild(contentHeader);

      var contentZip = makeElement('div', 'zip-content');

      var zipField = makeElement('input', 'hp-metrics-modal__zip-field');
      zipField.setAttribute('name', 'zip');
      zipField.setAttribute('type', 'text');
      zipField.setAttribute('placeholder', 'Zip Code');
      contentZip.appendChild(zipField);


      var zipButton = makeElement('button', 'hp-metrics-modal__zip-submit', 'Submit');
      contentZip.appendChild(zipButton);

      var contentError = makeElement('div', 'hp-metrics-modal__error');
      contentZip.appendChild(contentError);

      content.appendChild(contentZip);
      content.appendChild(this.createCloseButton());

      return content;
    };


    /*
     * Creates and returns HTML for outro modal.
     *
     */
    this.createOutroContent = function(){
      var content = makeElement('div', 'hp-metrics-modal__outro');

      var contentHeader = makeElement('h2', 'modal-header', 'Thankyou!');
      content.appendChild(contentHeader);

      var contentOutro = makeElement('div', 'outro-content');
      var outroText = makeElement('div', 'outro-text', 'Redirecting to Somewhere!');
      contentOutro.appendChild(outroText);
      content.appendChild(contentOutro);
      content.appendChild(this.createCloseButton());

      return content;
    };

    // -------End Initialize
    var modal = this.createModal();

    // Open modal when button us clicked
    $('[data-hp-metrics]').on('click', function(){
      modal.hpModal('open', settings, function(){
        _this.sendAnalytics({
          test: 'asdf'
        });
      });
    });

    // run submitZip when submit button is clicked.
    $(document).on('click','.hp-metrics-modal__zip-submit', function() {
      _this.submitZip();
    });

    $(document).on('click', '.hp-metrics-modal a.hp-metrics-modal__close', function(e){
      e.preventDefault();
      window.console.log('clicked');
      settings.removeBackground = true;
      modal.hpModal('close', settings, function(){
        modal = undefined;
      });
    });

  };

  /*
   * Places modal > inner the correct amount off the screen to optimize
   * slide in. When placement is established its made visible.
   *
   * @params (jQuery object) inner
   * @params (String) placement
   *
   * Returns: (Object) offset = {left: '-856px'}
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
      offset['left'] = '50%';
      break;

    case 'left':
      offset['left'] = -(windowWidth/2 + modalWidth) + 'px';
      offset['top'] = '50%';
      break;

    case 'right':
      offset['left'] = (windowWidth/2 + (modalWidth * 1.5)) + 'px';
      offset['top'] = '50%';
      break;

    case 'bottom':
      offset['top'] = (windowHeight + (modalHeight * 2)) + 'px';
      offset['left'] = '50%';
      break;
    }

    return offset;
  }


  // Function: Includes stylesheet in <head> to access modal
  function includeCSS(){
    $('head').append('<link rel="stylesheet" href="../src/hp-metrics.css" type="text/css"</link>');
  }


  /*
   * Creates element, assigns class, and sets innerHTML (optional)
   *
   * @params (String) elType = 'div'
   * @params (String) elClass = 'example-class-for-object'
   * @params (String) content = 'Example text for object'
   */
  function makeElement(elType, elClass, content){
    var el = document.createElement(elType);
    el.classList.add(elClass);
    if (content) {
      el.innerHTML = content;
    }
    return el;
  }

}(jQuery));
