// ES6-shim 0.16.0 (c) 2013-2014 Paul Miller (http://paulmillr.com)
// ES6-shim may be freely distributed under the MIT license.
// For more details and documentation:
// https://github.com/paulmillr/es6-shim/

(function(undefined) {
  'use strict';

  /*jshint evil: true */
  var getGlobal = new Function('return this;');
  /*jshint evil: false */

  var main = function() {
    var globals = getGlobal();
    var Object = globals.Object;

    // NOTE:  This versions needs object ownership
    //        beacuse every promoted object needs to be reassigned
    //        otherwise uncompatible browsers cannot work as expected
    //
    // NOTE:  This might need es5-shim or polyfills upfront
    //        because it's based on ES5 API.
    //        (probably just an IE <= 8 problem)
    //
    // NOTE:  nodejs is fine in version 0.8, 0.10 and future versions.
    if (!Object.setPrototypeOf) (function () {
      /*jshint proto: true */
      // @author    Andrea Giammarchi - @WebReflection
      var
        // define into target descriptors from source
        copyDescriptors = function (target, source) {
          getOwnPropertyNames(source).forEach(function (key) {
            defineProperty(
              target,
              key,
              getOwnPropertyDescriptor(source, key)
            );
          });
          return target;
        },
        // used as fallback when no promotion is possible
        createAndCopy = function (origin, proto) {
          return copyDescriptors(create(proto), origin);
        },
        create = Object.create,
        defineProperty = Object.defineProperty,
        getPrototypeOf = Object.getPrototypeOf,
        getOwnPropertyNames = Object.getOwnPropertyNames,
        getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
        proto = Object.prototype,
        set, setPrototypeOf
      ;
      try {
        // this might fail for various reasons
        // ignore if Chrome cought it at runtime
        set = getOwnPropertyDescriptor(proto, '__proto__').set;
        set.call({}, null);
        // setter not poisoned, it can promote
        // Firefox, Chrome
        setPrototypeOf = function (origin, proto) {
          set.call(origin, proto);
          return origin;
        };
      } catch(e) {
        // do one or more feature detections
        set = {__proto__: null};
        // if proto does not work, needs to fallback
        // some Opera, Rhino, ducktape
        if (set instanceof Object) {
          setPrototypeOf = createAndCopy;
        } else {
          // verify if null objects are buggy
          set.__proto__ = proto;
          // if null objects are buggy
          // nodejs 0.8 to 0.10
          if (set instanceof Object) {
            setPrototypeOf = function (origin, proto) {
              // use such bug to promote
              origin.__proto__ = proto;
              return origin;
            };
          } else {
            // try to use proto or fallback
            // Safari, old Firefox, many others
            setPrototypeOf = function (origin, proto) {
              // if proto is not null
              return getPrototypeOf(origin) ?
                // use __proto__ to promote
                ((origin.__proto__ = proto), origin) :
                // otherwise unable to promote: fallback
                createAndCopy(origin, proto);
            };
          }
        }
      }
      Object.setPrototypeOf = setPrototypeOf;
    }());

  };

  if (typeof define === 'function' && define.amd) {
    define(main); // RequireJS
  } else {
    main(); // CommonJS and <script>
  }
})();
