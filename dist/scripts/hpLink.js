/**
 * hpLink 
 * @version v0.1.1 
 * @link https://github.com/colevoss/hpLink 
 * @license  
 */ 

;(function ($, _) {

  $.fn.hpModal = function (action, options, cb) {
    // Sets default options
    var entranceMethod = {},
        exitMethod = {};

    var settings = $.extend({
      entrance: 'fade',
      startPlacement: 'top',
      speed: 'fast',
      removeBackground: false
    }, options);


    entranceMethod = {
      /*
       * Function: Slides in modal
       *
       * @params (jQuery object) modal
       */
      slide: function(modal) {
        var modalEntrance = {};
        var start;

        switch (settings.startPlacement) {
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
        $('.hp-link-modal__background', modal.toggle()).fadeIn('fast', function() {
          $('.hp-link-modal__inner', modal).toggle(true)
            .css(resolveInnerModalPosition(inner, settings.startPlacement))
            .animate(modalEntrance, settings.speed, cb());
        });
      },

      /*
       * Fades in modal
       *
       * @params (jQuery object) modal
       */
      fade: function(modal) {
        $('.hp-link-modal__background', modal).toggle();
        modal.fadeIn('fast', function() {
          $('.hp-link-modal__inner', modal).fadeIn(settings.speed, cb());
        });
      }
    };

    exitMethod = {
      /*
       * Slides modal out
       */
      slide: function(modal) {
        $('.hp-link-modal__inner', modal)
          .animate(resolveInnerModalPosition(inner, settings.startPlacement), settings.speed, cb())
          .toggle(false);
        if (settings.removeBackground !== false){
          $('.hp-link-modal__background', modal).fadeOut('fast', function() {
            $('.hp-link-modal').toggle();
          });
        }
      },

      /*
       * Fades modal out
       */
      fade: function(modal) {
        modal.fadeOut('fast', function() {
          $('.hp-link-modal__inner', modal).fadeOut(settings.speed, cb());
          if (settings.removeBackground !== false){
            $('.hp-link-modal__background', modal).fadeOut('fast');
          }
        });
      }
    };

    switch (action) {
      case 'open':
        entranceMethod[settings.entrance](this);
        break; // Break Case

      case 'replaceContent':
        var inner = $('.hp-link-modal__inner');
        inner.html(settings.content);
        if (typeof(cb) !== 'undefined'){
          cb();
        }
        break; // Break Case

      case 'close':
        exitMethod[settings.entrance](this);
        break; // Break Case
    }
    return this;
  };

  $.hpLink = function(options) {
    /* ---------------------------------------------------- */
    /* -------------------- INITIALIZE -------------------- */
    /* ---------------------------------------------------- */

    var modal; // Local variable set to createModal() below

    var settings = $.extend({  // Set default Options
      entrance: 'fade',
      startPlacement: 'top',
      speed: 'fast',
      removeBackground: false
    }, options);


    /* ---------------------------------------------------- */
    /* ------------------ END INITIALIZE ------------------ */
    /* ---------------------------------------------------- */



    /* ------------------------------------------------------------ */
    /* ------------------ DEFINE PRIVATE METHODS ------------------ */
    /* ------------------------------------------------------------ */

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
    _.sendAnalytics = function(data, route) {
      $.ajax({
        type: "POST",
        //url: "http://honestpolicy.com/cors/analytic", //Production
        url: "http://hopo.dev/cors/" + route, // Development
        data: data,
        crossDomain: true,
        success: function(data) {
          _.analyticsCallBacks[data.callback](data);
        },
        error: function(err, erra, errb) {
          window.
          _.resolveWarning('An error has occured. Please try again later.');
        }
      });
    };


    _.analyticsCallBacks = {
      zipRequired: function(data) {
        _.redirectURL = data.redirect_to;
        modal.hpModal('replaceContent', {content: _.createZipContent()});
      },

      zipNotRequired: function(data) {
        modal.hpModal('replaceContent', {content: _.createOutroContent()});
        modal.hpModal('close', settings, function() {
          _.redirectPage(data.redirect_to);
        });
      },

      zipValidate: function(data) {
        if (data.zip) {
          var domain = _.redirectURL.match(/^.+\:\/\/.+\.\w{3}/)[0];
          var params = _.redirectURL.match(/\?.+$/);
          _.redirectURL = domain + '?zip=' + data.zip;
          if (params) {
           _.redirectURL = _.redirectURL + params[0].replace(/^\?/, '&');
          }
          _.redirectPage(_.redirectURL);
        } else {
          _.resolveWarning('Invalid Zip Code.');
        }
      }
    };


    /*
     * Redirects page to new url with formatted params if provided
     * 
     * @params (String) url
     * @params (Object) params
     */
    _.redirectPage = function(url, params) {
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
    _.createModal = function() {
      var background,  // Modal Background
          content,  // Contents of inner modal
          inner;  // Interactive portion of modal
      var modal = document.createElement('div');  // Modal container
      modal.classList.add('hp-link-modal');

      background = document.createElement('div'); // Modal Background
      background.classList.add('hp-link-modal__background');
      modal.appendChild(background);

      inner = document.createElement('div');  // Modal inner div
      inner.classList.add('hp-link-modal__inner');

      contents = _.createInitialContent();

      inner.appendChild(contents);
      modal.appendChild(inner);

      $('body').append(modal);  // Put modal in DOM

      return $(modal);
    };


    /*
     * Creates close button
     */
    _.createCloseButton = function() {
      var button;
      button = makeElement('a', 'hp-link-modal__close', 'Close');
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
    _.submitZip = function() {
      var zip = $('.hp-link-modal__zip-field').val();
      if (/^\d{5}$/.test(zip)){
        _.sendAnalytics({zip: zip}, 'validate_zip');
      } else {
        _.resolveWarning('Invalid Zip Code.');
      }
    };

    _.resolveWarning = function(text) {
      if (typeof(text) === 'undefined') {
        text = '';
        $('.hp-link-modal__zip-field').attr('data-hp-link__error', 'false');
      } else {
        $('.hp-link-modal__zip-field').attr('data-hp-link__error', 'true');
      }
      $('.hp-link-modal__error').text(text);
    };


    /*
     * Creates and returns HTML for intial modal including loading animation
     *
     */
    _.createInitialContent = function(text) {
      var content,  // Container of initial content
          contentError,
          contentHeader,  // header..."Processing Request!"
          contentLoading,  // Container of loading elements
          loadingText;

      content = makeElement('div', 'hp-link-modal__initial');

      contentHeader = makeElement('h2', 'modal-header', 'Processing Request!');
      content.appendChild(contentHeader);

      contentLoading = makeElement('div', 'initial-loader');

      loadingText = makeElement('div', 'loading-text', 'Loading...');
      contentLoading.appendChild(loadingText);

      content.appendChild(contentLoading);

      contentError = makeElement('div', 'hp-link-modal__error');
      contentLoading.appendChild(contentError);

      content.appendChild(_.createCloseButton());

      return content;
    };


    /*
     * Creates and returns HTML for zip form modal.
     *
     */
    _.createZipContent = function() {
      var content,  // Container of zip form content
          contentError,
          contentHeader,
          zipField,
          zipButton;

      content = makeElement('div', 'hp-link-modal__zip');

      contentHeader = makeElement('h2', 'modal-header', 'Please Enter Your Zip.');
      content.appendChild(contentHeader);

      contentZip = makeElement('div', 'zip-content');

      zipField = makeElement('input', 'hp-link-modal__zip-field');
      zipField.setAttribute('name', 'zip');
      zipField.setAttribute('type', 'text');
      zipField.setAttribute('placeholder', 'Zip Code');
      contentZip.appendChild(zipField);


      zipButton = makeElement('button', 'hp-link-modal__zip-submit', 'Submit');
      contentZip.appendChild(zipButton);

      contentError = makeElement('div', 'hp-link-modal__error');
      contentZip.appendChild(contentError);

      content.appendChild(contentZip);
      content.appendChild(_.createCloseButton());

      return content;
    };


    /*
     * Creates and returns HTML for outro modal.
     *
     */
    _.createOutroContent = function() {
      var content,  // Container for outro elements
          contentHeader,
          outroText;

      content = makeElement('div', 'hp-link-modal__outro');

      contentHeader = makeElement('h2', 'modal-header', 'Processing Request!');
      content.appendChild(contentHeader);

      contentOutro = makeElement('div', 'outro-content');
      outroText = makeElement('div', 'outro-text', 'Thank You!');
      contentOutro.appendChild(outroText);
      content.appendChild(contentOutro);
      content.appendChild(_.createCloseButton());

      return content;
    };


    /*
     * Resets the modal to blank initial modal.
     * Should beused when closing modal without redirecting.
     */
    _.resetModal = function() {
      modal.hpModal('replaceContent', {content: _.createInitialContent()});
    };

    /* ------------------------------------------------------------ */
    /* ---------------- END DEFINE PRIVATE METHODS ---------------- */
    /* ------------------------------------------------------------ */


    modal = _.createModal();  // Lets get this thing rollin!!

    /* ----------------------------------------------------------- */
    /* ----------------------- BIND EVENTS ----------------------- */
    /* ----------------------------------------------------------- */

    // Open modal when button us clicked
    $('[data-hp-link]').on('click', function() {
      _.urlData = $(this).data('hp-link');
      var sendData = _.urlData !== "" ? {urlData: _.urlData} : {};
      modal.hpModal('open', settings, function() {
        _.sendAnalytics(sendData, 'analytic');
      });
    });

    $(document).on('click','.hp-link-modal__zip-submit', function() {  // run submitZip when submit button is clicked.
      _.submitZip();
    });

    $(document).on('click', '.hp-link-modal a.hp-link-modal__close', function(e) {
      e.preventDefault();
      settings.removeBackground = true;
      modal.hpModal('close', settings, function() {
        _.resetModal();
      });
    });

    $(document).on('focus', '.hp-link-modal input[data-hp-link__error="true"]', function() {
      _.resolveWarning();
    });

    /* ----------------------------------------------------------- */
    /* --------------------- END BIND EVENTS --------------------- */
    /* ----------------------------------------------------------- */

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

    switch (placement) {
    case 'top':
      offset.top = -(windowHeight/2 + modalHeight) + 'px';
      offset.left = '50%';
      break;

    case 'left':
      offset.left = -(windowWidth/2 + modalWidth) + 'px';
      offset.top = '50%';
      break;

    case 'right':
      offset.left = (windowWidth/2 + (modalWidth * 1.5)) + 'px';
      offset.top = '50%';
      break;

    case 'bottom':
      offset.top = (windowHeight + (modalHeight * 2)) + 'px';
      offset.left = '50%';
      break;
    }

    return offset;
  }


  /*
   * Creates element, assigns class, and sets innerHTML (optional)
   *
   * @params (String) elType = 'div'
   * @params (String) elClass = 'example-class-for-object'
   * @params (String) content = 'Example text for object'
   */
  function makeElement(elType, elClass, content) {
    var el = document.createElement(elType);
    el.classList.add(elClass);
    if (content) {
      el.innerHTML = content;
    }
    return el;
  }

}(jQuery, {}));
