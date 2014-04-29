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
      slide: function(modal, cb) {
        $('.hp-link-modal__inner', modal)
          .animate(resolveInnerModalPosition(inner, settings.startPlacement), settings.speed, function(){
            $(this).toggle(false);
            cb();
          });
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
        $('.hp-link-modal__inner', modal).fadeOut(settings.speed, function(){
          if (settings.removeBackground !== false){
            $('.hp-link-modal__background', modal).fadeOut('fast');
          }
          cb();
          modal.toggle(false);
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
        exitMethod[settings.entrance](this, cb);
        break; // Break Case
    }
    return this;
  };

  $.hpLink = function(options) {
    /* ---------------------------------------------------- */
    /* -------------------- INITIALIZE -------------------- */
    /* ---------------------------------------------------- */

    // Data to be sent to the integral API
    // This object will have other information added
    // to it when sent to
    _.apiData = {
      application: 'jQuery',
      line: options.line,
      key: options.key,
      monetizer: 'SureHits', // This is to specify a specific monetizer for test purposes only
      data: null,
      soure_url: window.location.href,
      uuid: false
    };

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
     * Sends Analytic information to Integral database.
     *
     * @private
     * @type {Function}
     * @params {Object} data - What is sent for Analytic Tracking
     *
     * TODO: Break response types into different functions.
     *
     */
    _.sendAnalytics = function(data, route) {
      if (_.xhr  === true){
        return false;
      } else {
        _.xhr = true;
      }
      $.ajax({
        type: "POST",
        //url: "https://honestpolicy.com/cors/" + route, // Production
        url: "http://integral.dev/cors/" + route, // Production
        //url: "http://hopo.dev/cors/" + route, // Development
        //data: data,
        data: _.combineData(data),
        crossDomain: true,
        success: function(data) {
          _.xhr = false;
          //if (!_.metricsUUID){
          if (!_.apiData.uuid){
            //_.metricsUUID = data.uuid;
            _.apiData.uuid = data.uuid;
          }
          if (data.callback) {
            _.analyticsCallBacks[data.callback](data);
          }
        },
        error: function(err, erra, errb) {
          _.xhr = false;
          _.resolveWarning('An error has occured. Please try again later.');
        }
      });
    };


    /*
     * The functions in this hash are to be called when the server responds.
     * The name of each function is returned by the server and then called
     * by finding it in this hash.
     *
     * @params (Object) data
     */
    _.analyticsCallBacks = {
      /*
       * Replaces the content of the modal with a field asking
       * for a zipcode and sets the redirectURL var global to the plugin.
       */
      zipRequired: function(data) {
        _.redirectURL = data.redirect_to;
        modal.hpModal('replaceContent', {content: _.createZipContent()});
      },

      /*
       * Replaces content of the modal with a thank you outro and
       * redirects the page to the redirect url.
       */
      zipNotRequired: function(data) {
        modal.hpModal('replaceContent', {content: _.createOutroContent()});
        modal.hpModal('close', settings, function() {
          _.redirectPage(data.redirect_to);
        });
      },

      /*
       * This locally validates that the zip is 5 digits
       * and then validates the zip code at the server to make
       * sure its a legit zip.
       */
      zipValidate: function(data) {
        if (data.zip) {
          var domain = _.redirectURL.match(/^.+\:\/\/.+\.\w{3}/)[0];
          var params = _.redirectURL.match(/\?.+$/);
          _.redirectURL = domain + '?zip=' + data.zip;

          if (params) {
           _.redirectURL = _.redirectURL + params[0].replace(/^\?/, '&');
          }
          // _.redirectPage(_.redirectURL);
          modal.hpModal('replaceContent', {content: _.createSureHitsIframe(data.url)});

        } else {
          modal.hpModal('replaceContent', {content: _.createZipContent()}, function(){
            _.resolveWarning('Invalid Zip Code.');
          });
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

    _.createSureHitsIframe = function(url) {
      var content, contentHeader, iframe;

      content = makeElement('div', 'iframe-content');
      contentHeader = makeElement('h2', 'modal-header', 'Carriers in your area!');
      content.appendChild(contentHeader);

      iframe = makeElement('iframe', 'sure-hits-iframe');
      iframe.setAttribute('src', url);


      content.appendChild(iframe);

      content.appendChild(_.createCloseButton());

      return content;
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
    _.submitZip = function(zip_button) {
      var zip = $('.hp-link-modal__zip-field').val();
      if (/^\d{5}$/.test(zip)) {
        var sendData = {zip: zip};
        sendData.event = 'zipcode_lookup';
        modal.hpModal('replaceContent', {content: _.createOutroContent()}, function(){
          _.sendAnalytics(sendData, 'validate_zip');
        });
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


    /*
     * Creates hash including metrics data to be passed to server
     *
     * @params (HTMLDom) button
     */
    _.metricsData = function(button) {
      var metrics;
      var buttonName = "";
      var buttonID, buttonClass, buttonText;
      if (button.id) {
        buttonName = button.id;
      } else if (button.className) {
        buttonName = button.className;
      } else {
        if (button.tagName === 'INPUT' && button.getAttribute('type') === 'submit'){
          buttonName = button.getAttribute('value');
        } else {
         buttonName = button.innerText;
        }
      }

      metrics = {
        url: window.location.href,
        //uuid: _.metricsUUID,
        button_name: buttonName,
      };

      return metrics;
    };

    _.combineData = function(data) {
      return $.extend(_.apiData, data);
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
      var sendData = _.urlData !== "" ? {data: _.urlData} : {};
      //sendData.metrics = _.metricsData(this);
      sendData.event = 'create_lead';
      modal.hpModal('open', settings, function() {
        _.sendAnalytics(sendData, 'submit_lead');
      });
    });

    $(document).on('click','.hp-link-modal__zip-submit', function() {  // run submitZip when submit button is clicked.
      _.submitZip(this);
    });

    $(document).on('click', '.hp-link-modal a.hp-link-modal__close', function(e) {
      e.preventDefault();
      settings.removeBackground = true;
      modal.hpModal('close', settings, function() {
        closedWindow = $('.hp-link-modal__inner').children().attr('class');
        sendData = {event: 'close_window', data: {closed_window: closedWindow}};
        _.sendAnalytics(sendData, 'close_click');
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
