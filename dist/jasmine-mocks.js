var jasmine = require('jasmine-node');
/**
 * Create mock instance.  All properties of the first argument's prototype
 * are added as spies to the instance.
 *
 * The mock instance will have its prototype set to an optional second argument.
 * This can be used to create mocks that have special event behavior.
 *
 * Examples:
 *
 *   mock(Clazz);
 *   mock(Clazz, EventEmitter);
 *
 * @public
 * @param {Function} clazz
 * @param {Function=} opt_base
 * @return {Object}
 */
var mock = function (clazz, opt_base) {
  var base = opt_base ? opt_base.prototype : {};
  var instance = Object.create(base);

  var clazzToMock = Object.create(clazz.prototype);
  for(var prop in clazzToMock) {
    if (instance[prop]) {
      // This property has been already defined on the base class.
      continue;
    }

    if (typeof(clazzToMock[prop]) === "function") {
      instance[prop] = jasmine.createSpy(prop);
    }
    else {
      // Non-function property.
      instance[prop] = clazzToMock[prop];
    }
  }

  return instance;
};

/**
 * Helper function for when.
 * @private
 */
var whenMatcher = function (args, value) {
  return {
    functionCallMatches: function (matchArgs) {
      for(var i = 0, l = args.length; i < l; ++i) {
        if (typeof args[i].matches === "function") {
          if (!args[i].matches(matchArgs[i])) {
            return false;
          }
        }
        else if (matchArgs[i] !== args[i]) {
          return false;
        }
      }
      return true;
    },
    returnValue: value
  };
};

/**
 * Define behavior of a mock function based on the arguments that are passed in.
 *
 * Examples:
 *
 *   when(money.getAmount).isCalledWith().thenReturn(5)
 *   when(mockInstance.sayHello).isCalledWith('Dave').thenReturn('Hello Dave')
 *
 * @public
 * @param {Function} spy Mock function to define behavior on.
 */
var when = function (spy) {
  return {
    /**
     * @public
     * @param {...*} var_args Arguments that are used to determine if a function
     *   call matches.  These can be values or objects that contain a 'matches'
     *   function.
     */
    isCalledWith: function (var_args) {
      var args = Array.prototype.slice.apply(arguments);

      return {
        /**
         * @public
         * @param {Object} value Object to return when the function call matches
         *   the arguments.
         */
        thenReturn: function (value) {
          if (!spy.jasmine_mock__whenMatchers) {
            spy.jasmine_mock__whenMatchers = [];
            spy.andCallFake(function () {
              var matchArgs = Array.prototype.slice.apply(arguments);

              var whenMatchers = spy.jasmine_mock__whenMatchers;
              for (var i = 0, l = whenMatchers.length; i < l; ++i) {
                var whenMatcher = whenMatchers[i];
                if (whenMatcher.functionCallMatches(matchArgs)) {
                  return whenMatcher.returnValue;
                }
              }

              return undefined;
            });
          }

          spy.jasmine_mock__whenMatchers.push(whenMatcher(args, value));
        }
      };
    }
  };
};

/**
 * Returns a matcher that determines if an argument at this position matches.
 * Primarily for use in a when() definition.
 *
 * Examples:
 *
 *   argThat(function (n) { return n % 2 === 0; })
 *   argThat(function (str) { return str.indexOf('hello') != -1; })
 *
 * @public
 * @param {function (Object, boolean)} matchFunction
 * @return {{matches: function(Object, boolean)}}
 *
 */
var argThat = function (matchFunction) {
  return {
    matches: function (arg) {
      return !!matchFunction.call(null, arg);
    }
  };
};


module.exports = {
  mock: mock,
  when: when,
  argThat: argThat
};