/*!
 * 1DS JS SDK Analytics Web, 3.0.1
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(
        exports,
        require('@microsoft/applicationinsights-shims'),
        require('@ms/1ds-core-js'),
        require('@ms/1ds-properties-js'),
        require('@ms/1ds-post-js'),
        require('@ms/1ds-wa-js')
      )
    : typeof define === 'function' && define.amd
    ? define([
        'exports',
        '@microsoft/applicationinsights-shims',
        '@ms/1ds-core-js',
        '@ms/1ds-properties-js',
        '@ms/1ds-post-js',
        '@ms/1ds-wa-js',
      ], factory)
    : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self),
      factory(
        (global.oneDS = global.oneDS || {}),
        null,
        global._1dsCoreJs,
        global._1dsPropertiesJs,
        global._1dsPostJs,
        global._1dsWaJs
      ));
})(this, function (exports, applicationinsightsShims, _1dsCoreJs, _1dsPropertiesJs, _1dsPostJs, _1dsWaJs) {
  'use strict';

  /**
   * ApplicationInsights.ts
   * @author Abhilash Panwar (abpanwar) and Hector Hernandez (hectorh)
   * @copyright Microsoft 2018
   * Main class containing all the APIs.
   */
  var ApplicationInsights = /** @class */ (function (_super) {
    __extends(ApplicationInsights, _super);
    function ApplicationInsights() {
      var _this = _super.call(this) || this;
      // Initialize plugins
      _this._postChannel = new _1dsPostJs.PostChannel();
      _this._propertyManager = new _1dsPropertiesJs.PropertiesPlugin();
      _this._webAnalytics = new _1dsWaJs.ApplicationInsights();
      return _this;
    }
    /**
     * Initialize the SKU.
     * @param config        - SKU configuration.
     * @param extensions          - An array of extensions that are to be used by the core.
     */
    ApplicationInsights.prototype.initialize = function (config, extensions) {
      var _this = this;
      var _self = this;
      _1dsCoreJs.doPerf(
        _self,
        function () {
          return 'ApplicationInsights:initialize';
        },
        function () {
          var plugins = [_self._propertyManager, _self._webAnalytics];
          if (extensions) {
            plugins = plugins.concat(extensions);
          }
          if (config.channels && config.channels.length > 0) {
            // Add post channel to first fork if not available
            var postFound = false;
            for (var j = 0; j < config.channels[0].length; j++) {
              if (config.channels[0][j].identifier === _self._postChannel.identifier) {
                postFound = true;
                break;
              }
            }
            if (!postFound) {
              config.channels[0].push(_self._postChannel);
            }
          } else {
            config.channels = [[_self._postChannel]];
          }
          // Add configurations
          var extConfig = (config.extensionConfig = config.extensionConfig || []);
          extConfig[_self._postChannel.identifier] = config ? config.channelConfiguration : {};
          extConfig[_self._propertyManager.identifier] = config ? config.propertyConfiguration : {};
          extConfig[_self._webAnalytics.identifier] = config ? config.webAnalyticsConfiguration : {};
          try {
            _super.prototype.initialize.call(_this, config, plugins);
          } catch (error) {
            _self.logger.throwInternal(
              _1dsCoreJs.LoggingSeverity.CRITICAL,
              _1dsCoreJs._ExtendedInternalMessageId.FailedToInitializeSDK,
              'Failed to initialize SDK.' + error
            );
          }
        },
        function () {
          return { config: config, extensions: extensions };
        }
      );
    };
    /**
     * Gets the property manager to set custom properties and system properties (part A), that should be applied
     * to all events or events with a specific instrumentation key.
     * @returns {PropertiesPlugin} The property manager object.
     */
    ApplicationInsights.prototype.getPropertyManager = function () {
      return this._propertyManager;
    };
    /**
     * Gets the post channel to configure and set the transmission profiles.
     * @returns {PostChannel} The post channel object.
     */
    ApplicationInsights.prototype.getPostChannel = function () {
      return this._postChannel;
    };
    /**
     * Gets the Web Analytics extension.
     * @returns {WebAnalytics} The Web Analytics extension.
     */
    ApplicationInsights.prototype.getWebAnalyticsExtension = function () {
      return this._webAnalytics;
    };
    /**
     * Telemetry initializers are used to modify the contents of collected telemetry before being sent from the user's browser.
     * They can also be used to prevent certain telemetry from being sent, by returning false.
     * @param telemetryInitializer - Telemetry Initializer
     */
    ApplicationInsights.prototype.addTelemetryInitializer = function (telemetryInitializer) {
      this._webAnalytics.addTelemetryInitializer(telemetryInitializer);
    };
    /**
     * API to send custom event
     * @param event - Custom event
     * @param properties - Custom event properties (part C)
     */
    ApplicationInsights.prototype.trackEvent = function (event, customProperties) {
      this._webAnalytics.trackEvent(event, customProperties);
    };
    /**
     * API to send pageView event
     * @param pageViewEvent - PageView event
     * @param properties - PageView properties (part C)
     */
    ApplicationInsights.prototype.trackPageView = function (pageViewEvent, pageViewProperties) {
      this._webAnalytics.trackPageView(pageViewEvent, pageViewProperties);
    };
    /**
     * API to send pageAction event
     * @param pageActionEvent - PageAction event
     * @param properties - PageAction properties(Part C)
     */
    ApplicationInsights.prototype.trackPageAction = function (pageActionEvent, pageActionProperties) {
      this._webAnalytics.trackPageAction(pageActionEvent, pageActionProperties);
    };
    /**
     * API to send ContentUpdate event
     * @param contentUpdateEvent - ContentUpdate event
     * @param properties - ContentUpdate properties(Part C)
     */
    ApplicationInsights.prototype.trackContentUpdate = function (contentUpdateEvent, properties) {
      this._webAnalytics.trackContentUpdate(contentUpdateEvent, properties);
    };
    /**
     * API to send PageUnload event
     * @param pageUnloadEvent - PageUnload event
     * @param properties - PageUnload properties(Part C)
     */
    ApplicationInsights.prototype.trackPageUnload = function (pageUnloadEvent, properties) {
      this._webAnalytics.trackPageUnload(pageUnloadEvent, properties);
    };
    /**
     * API to send Exception event
     * @param exception - Exception event
     * @param customProperties - Exception properties (part C)
     */
    ApplicationInsights.prototype.trackException = function (exception, customProperties) {
      this._webAnalytics.trackException(exception, customProperties);
    };
    /**
     * API to send PageViewPerformance event
     * @param pageViewPerformance - PageViewPerformance event
     * @param customProperties - PageViewPerformance properties (part C)
     */
    ApplicationInsights.prototype.trackPageViewPerformance = function (pageViewPerformance, customProperties) {
      this._webAnalytics.trackPageViewPerformance(pageViewPerformance, customProperties);
    };
    /**
     * API to create and send a populated PageView event
     * @param overrideValues - Override values
     * @param customProperties - Custom properties(Part C)
     */
    ApplicationInsights.prototype.capturePageView = function (overrideValues, customProperties) {
      this._webAnalytics.capturePageView(overrideValues, customProperties);
    };
    /**
     * API to create and send a populated PageViewPerformance event
     * @param pageViewPerformance - PageViewPerformance event
     * @param customProperties - Custom properties(Part C)
     */
    ApplicationInsights.prototype.capturePageViewPerformance = function (overrideValues, customProperties) {
      this._webAnalytics.capturePageViewPerformance(overrideValues, customProperties);
    };
    /**
     * API to create and send a populated PageAction event
     * @param element - DOM element
     * @param overrideValues - PageAction overrides
     * @param customProperties - Custom properties(Part C)
     * @param isRightClick - Flag for mouse right clicks
     */
    ApplicationInsights.prototype.capturePageAction = function (
      element,
      overrideValues,
      customProperties,
      isRightClick
    ) {
      this._webAnalytics.capturePageAction(element, overrideValues, customProperties, isRightClick);
    };
    /**
     * API to create and send a populated ContentUpdate event
     * @param overrideValues - ContentUpdate overrides
     * @param customProperties - Custom properties(Part C)
     */
    ApplicationInsights.prototype.captureContentUpdate = function (overrideValues, customProperties) {
      this._webAnalytics.captureContentUpdate(overrideValues, customProperties);
    };
    /**
     * API to create and send a populated PageUnload event
     * @param overrideValues - PageUnload overrides
     * @param customProperties - Custom properties(Part C)
     */
    ApplicationInsights.prototype.capturePageUnload = function (overrideValues, customProperties) {
      this._webAnalytics.capturePageUnload(overrideValues, customProperties);
    };
    /**
     * @description Custom error handler for Application Insights Analytics
     * @param exception
     */
    ApplicationInsights.prototype._onerror = function (exception) {
      this._webAnalytics._onerror(exception);
    };
    /**
     * Call any functions that were queued before the main script was loaded
     * @param snippet
     */
    ApplicationInsights.prototype.emptySnippetQueue = function (snippet) {
      // call functions that were queued before the main script was loaded
      try {
        if (_1dsCoreJs.Utils.isArray(snippet.queue)) {
          // note: do not check length in the for-loop conditional in case something goes wrong and the stub methods are not overridden.
          var length = snippet.queue.length;
          for (var i = 0; i < length; i++) {
            var call = snippet.queue[i];
            call();
          }
          snippet.queue = undefined;
          delete snippet.queue;
        }
      } catch (exception) {
        var properties = {};
        if (exception && _1dsCoreJs.isFunction(exception.toString)) {
          properties.exception = exception.toString();
        }
      }
    };
    /**
     * Overwrite the lazy loaded fields of global window snippet to contain the
     * actual initialized API methods
     * @param snippet
     */
    ApplicationInsights.prototype.updateSnippetDefinitions = function (snippet) {
      // apply full appInsights to the global instance
      // Note: This must be called before loadAppInsights is called
      _1dsCoreJs.objForEachKey(this, function (field, value) {
        if (_1dsCoreJs.isString(field)) {
          snippet[field] = value;
        }
      });
    };
    return ApplicationInsights;
  })(_1dsCoreJs.AppInsightsCore);

  /**
   * Index.ts
   * @author Abhilash Panwar (abpanwar) and Hector Hernandez (hectorh)
   * @copyright Microsoft 2018
   * File to export public classes, interfaces and enums.
   */
  (function () {
    // should be global function that should load as soon as SDK loads
    try {
      // E2E sku on load initializes core and pipeline using snippet as input for configuration
      var aiName;
      var global = _1dsCoreJs.getGlobal();
      if (global && typeof JSON !== 'undefined') {
        // get snippet or initialize to an empty object
        aiName = global['onedsSDK'] || 'oneDSWeb';
        if (global[aiName] !== undefined) {
          var snippet = global[aiName];
          var ai = new ApplicationInsights();
          ai.updateSnippetDefinitions(snippet);
          ai.initialize(snippet.config, snippet.extensions);
          // Update global instance
          global[aiName] = ai;
          ai.emptySnippetQueue(snippet);
        }
      }
    } catch (e) {
      if (console) {
        // tslint:disable-next-line: no-console
        console.warn('Failed to initialize AppInsights JS SDK for instance ' + aiName + e.message);
      }
    }
  })();

  exports.CoreUtils = _1dsCoreJs.CoreUtils;
  exports.DiagnosticLogger = _1dsCoreJs.DiagnosticLogger;
  exports.EventLatency = _1dsCoreJs.EventLatency;
  exports.EventPersistence = _1dsCoreJs.EventPersistence;
  exports.EventsDiscardedReason = _1dsCoreJs.EventsDiscardedReason;
  exports.MinChannelPriorty = _1dsCoreJs.MinChannelPriorty;
  exports.NotificationManager = _1dsCoreJs.NotificationManager;
  exports.TraceLevel = _1dsCoreJs.TraceLevel;
  exports.Utils = _1dsCoreJs.Utils;
  exports.ValueKind = _1dsCoreJs.ValueKind;
  exports.PropertiesPlugin = _1dsPropertiesJs.PropertiesPlugin;
  exports.BE_PROFILE = _1dsPostJs.BE_PROFILE;
  exports.NRT_PROFILE = _1dsPostJs.NRT_PROFILE;
  exports.PostChannel = _1dsPostJs.PostChannel;
  exports.RT_PROFILE = _1dsPostJs.RT_PROFILE;
  exports.ActionType = _1dsWaJs.ActionType;
  exports.Behavior = _1dsWaJs.Behavior;
  exports.ApplicationInsights = ApplicationInsights;

  (function (obj, prop, descriptor) {
    /* ai_es3_polyfil defineProperty */ var func = Object['defineProperty'];
    if (func) {
      try {
        return func(obj, prop, descriptor);
      } catch (e) {
        /* IE8 defines defineProperty, but will throw */
      }
    }
    if (descriptor && typeof descriptor.value !== undefined) {
      obj[prop] = descriptor.value;
    }
    return obj;
  })(exports, '__esModule', { value: true });
});
//# sourceMappingURL=ms.analytics-web.js.map
