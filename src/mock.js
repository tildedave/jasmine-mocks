var jasmine = require('jasmine-node');

var mock = function (clazz) {
  var instance = Object.create(clazz.prototype);
  for(var prop in instance) {
    instance[prop] = jasmine.createSpy(prop);
  }

  return instance;
};

module.exports = {
  mock: mock
};

