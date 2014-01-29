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
      removeBackground: true
    }, options);


    switch (action) {
      case 'open':
        /*
         * Function: Slides in modal
         *
         * @params (jQuery object) modal
         */
        function slideModal(modal){
          var modalEntrance = {};
          modalEntrance[settings.startPlacement] = '0px';
          $('.hp-metrics-modal__background', modal.toggle()).fadeIn('fast', function(){
            var inner = $('.hp-metrics-modal__inner', modal).toggle();

            inner.css(resolveInnerModalPosition(inner, settings.startPlacement))
            .animate(
              modalEntrance,
              settings.speed,
              cb()
            );
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
            $('.hp-metrics-modal__inner', modal).fadeIn(settings.speed, cb());
          });
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
        break; // Break case

      case 'close':
        function slideModalOut(modal){
          var inner = $('.hp-metrics-modal__inner', modal);
          inner.animate(resolveInnerModalPosition(inner, settings.startPlacement), settings.speed, cb());
          if (settings.removeBackground !== false){
            $('.hp-metrics-modal__background', modal).fadeOut('fast');
          }
        }

        function fadeModalOut(modal){
          modal.fadeOut('fast', function(){
            $('.hp-metrics-modal__inner', modal).fadeOut(settings.speed, cb());
            if (settings.removeBackground !== false){
              $('.hp-metrics-modal__background', modal).fadeOut('fast');
            }
          });
        }

        var exitMethod = {
          fade: fadeModalOut,
          slide: slideModalOut
        };


        exitMethod[settings.entrance](this);

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

    var _this = this;

    /*
      Sends Analytic information to Hopo database.

      @private
      @type {Function}
      @params {Object} data - What is sent for Analytic Tracking
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
              modal.hpModal('close', {}, function(){
                window.location.assign('http://google.com');
              });
            }, 1500);
          }
        },
        error: function(err, erra, errb){
          window.console.log(err, erra, errb);
        }
      });
    };

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

    this.submitZip = function(){
      var zip = $('.hp-metrics-modal__zip-field').val();
      if (/^\d{5}$/.test(zip)){
        $('.hp-metrics-modal__error').text('');
        modal.hpModal('replaceContent', {content: _this.createOutroContent()});
        setTimeout(function(){
          modal.hpModal('close', $.extend({removeBackground: false}, settings), function(){
            window.location.replace('http://google.com?zip=' + zip);
          });
        }, 1500);
      } else {
        $('.hp-metrics-modal__error').text('Invalid Zip Code.');
      }
    };

    /*
     * Function: Creates and returns TML for intial modal
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

      return content;
    };

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

      return content;
    };

    this.createOutroContent = function(){
      var content = makeElement('div', 'hp-metrics-modal__outro');

      var contentHeader = makeElement('h2', 'modal-header', 'Thankyou!');
      content.appendChild(contentHeader);

      var contentOutro = makeElement('div', 'outro-content');
      var outroText = makeElement('div', 'outro-text', 'Redirecting to Somewhere!');
      contentOutro.appendChild(outroText);
      content.appendChild(contentOutro);

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

    $(document).on('click','.hp-metrics-modal__zip-submit', function() {
      _this.submitZip();
    });



  };


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
