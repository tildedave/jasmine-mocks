var mock = require('../src/jasmine-mocks.js').mock;
var EventEmitter = require('events').EventEmitter;

describe('mock', function () {

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

  it('does not add spies for non-function members', function () {
    Clazz.prototype.initialProperty = null;

    var mockInstance = mock(Clazz);

    expect(mockInstance.initialProperty).toBe(null);
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

  it('inherits from an optional second argument', function () {
    var emitted = false;
    var mockInstance = mock(Clazz, EventEmitter);

    mockInstance.on('event', function () {
      emitted = true;
    });

    mockInstance.emit('event');

    expect(emitted).toBe(true);
  });

  it('gives the optional second argument precedence', function () {
    var emitted = false;
    Clazz.prototype = Object.create(EventEmitter.prototype);
    Clazz.prototype.foo = function () {};

    var mockInstance = mock(Clazz, EventEmitter);

    mockInstance.on('event', function () {
      emitted = true;
    });

    mockInstance.emit('event');

    expect(emitted).toBe(true);
  });
});

var when = require('../src/jasmine-mocks.js').when;

describe('when', function () {

  var Clazz;

  beforeEach(function () {
    Clazz = function () { };
    Clazz.prototype.foo = function () { };
  });

  it('defines behavior based on a matcher', function () {
    var instance = mock(Clazz);
    when(instance.foo).isCalledWith(5).thenReturn("zebra");

    expect(instance.foo(5)).toBe("zebra");
  });

  it('installs multiple behaviors', function () {
    var instance = mock(Clazz);

    when(instance.foo).isCalledWith(3).thenReturn("dog");
    when(instance.foo).isCalledWith(4).thenReturn("cat");

    expect(instance.foo(4)).toBe("cat");
    expect(instance.foo(3)).toBe("dog");
  });

  it('handles multiple arguments (positive)', function () {
    var instance = mock(Clazz);

    when(instance.foo).isCalledWith("one", "two").thenReturn("three");

    expect(instance.foo("one", "two")).toBe("three");
  });

  it('handles multiple arguments (negative)', function () {
    var instance = mock(Clazz);

    when(instance.foo).isCalledWith("one", "two").thenReturn("three");

    expect(instance.foo("one", "three")).toBeUndefined();
  });

  it('rewrite the return value if the same arguments are used', function () {
   var instance = mock(Clazz);

   when(instance.foo).isCalledWith("monkey").thenReturn("apple");
   when(instance.foo).isCalledWith("monkey").thenReturn("pear");

   expect(instance.foo("monkey")).toBe("pear");
  });
});

var argThat = require('../src/jasmine-mocks.js').argThat;

describe('argThat', function () {

  var Clazz;

  beforeEach(function () {
    Clazz = function () { };
    Clazz.prototype.foo = function () { };
  });

  it("handles argThat matchers", function () {
    var instance = mock(Clazz);

    when(instance.foo).isCalledWith(argThat(function (arg) {
      return arg % 2 === 0;
    })).thenReturn("woo");

    expect(instance.foo(4)).toBe("woo");
    expect(instance.foo(3)).toBe(undefined);
  });
});






