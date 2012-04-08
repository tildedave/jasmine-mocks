var mock = require('../src/mock.js').mock;

describe('Mock', function () {

  var Clazz;
  
  beforeEach(function () {
    Clazz = function () { };
    Clazz.prototype.foo = function () { };
  });
  
  it('makes a mock out of a prototypical class', function () {
    var mockInstance = mock(Clazz);
    
    mockInstance.foo();

    expect(mockInstance.foo).toHaveBeenCalled();
  });

  it('gives a meaningful name to a spy', function () {
    var mockInstance = mock(Clazz);
    
    expect(mockInstance.foo.identity).toBe('foo');
  });

  it('does not invoke the constructor in creating a mock', function () {
    var invoked = false;
    Clazz = function () {
      invoked = true;
    };

    var mockInstance = mock(Clazz);

    expect(invoked).toBe(false);
  });
});