var jasmine = require('jasmine-node');

var mock = function (clazz) {
  var instance = Object.create(clazz.prototype);
  for(var prop in instance) {
    if (typeof(instance[prop]) === "function") {
      instance[prop] = jasmine.createSpy(prop);
    }
  }

  return instance;
};

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

var when = function (spy) {
  return {
    isCalledWith: function () {
      var args = Array.prototype.slice.apply(arguments);

      return {
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