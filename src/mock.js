var jasmine = require('jasmine-node');

var mock = function (clazz) {
  var instance = Object.create(clazz.prototype);
  for(var prop in instance) {
    instance[prop] = jasmine.createSpy(prop);
  }

  return instance;
};

var whenMatcher = function (args, value) {
  return {
    matches: function (matchArgs) {
      return args === matchArgs;
    },
    returnValue: value
  };
};

var when = function (spy) {
  return {
    isCalledWith: function (args) {
      return {
        thenReturn: function (value) {
          if (!spy.jasmine_mock__installedMatchers) {
            spy.jasmine_mock__installedMatchers = [];
            spy.andCallFake(function (spyArgs) {
              var matchers = spy.jasmine_mock__installedMatchers;
              for (var i = 0, l = matchers.length; i < l; ++i) {
                var matcher = matchers[i];
                if (matcher.matches(spyArgs)) {
                  return matcher.returnValue;
                }
              }

              return undefined;
            });
          }

          spy.jasmine_mock__installedMatchers.push(
            whenMatcher(args, value)
          );
        }
      };
    }
  };
};

module.exports = {
  mock: mock,
  when: when
};

