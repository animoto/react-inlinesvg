!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.ReactInlineSVG=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

},{}],2:[function(_dereq_,module,exports){
var PropTypes, React, Status, XHR, delay, isSupportedEnvironment, me, once, span, supportsInlineSVG,
  __slice = [].slice;

React = (window.React);

once = _dereq_('once');

PropTypes = React.PropTypes;

span = React.DOM.span;

supportsInlineSVG = once(function() {
  var div;
  if (!document) {
    return false;
  }
  div = document.createElement('div');
  div.innerHTML = '<svg />';
  return div.firstChild && div.firstChild.namespaceURI === 'http://www.w3.org/2000/svg';
});

XHR = (function() {
  if (!window) {
    return null;
  }
  if ((XHR = window.XMLHttpRequest) && 'withCredentials' in new XHR) {
    return XHR;
  }
  return window.XDomainRequest;
})();

delay = function(fn) {
  return function() {
    var args, newFunc;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    newFunc = function() {
      return fn.apply(null, args);
    };
    setTimeout(newFunc, 0);
  };
};

isSupportedEnvironment = once(function() {
  return XHR && supportsInlineSVG();
});

Status = {
  PENDING: 'pending',
  LOADING: 'loading',
  LOADED: 'loaded',
  FAILED: 'failed',
  UNSUPPORTED: 'unsupported'
};

module.exports = me = React.createClass({
  statics: {
    Status: Status
  },
  displayName: 'InlineSVG',
  propTypes: {
    wrapper: PropTypes.func,
    src: PropTypes.string.isRequired,
    className: PropTypes.string,
    preloader: PropTypes.func,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    supportTest: PropTypes.func
  },
  getDefaultProps: function() {
    return {
      wrapper: span,
      supportTest: isSupportedEnvironment
    };
  },
  getInitialState: function() {
    return {
      status: Status.PENDING
    };
  },
  componentDidMount: function() {
    if (this.state.status !== Status.PENDING) {
      return;
    }
    if (this.props.supportTest()) {
      if (this.props.src) {
        return this.setState({
          status: Status.LOADING
        }, this.load);
      } else {
        return delay((function(_this) {
          return function() {
            return _this.fail(new Error('Missing source'));
          };
        })(this))();
      }
    } else {
      return delay((function(_this) {
        return function() {
          return _this.fail(new Error('Unsupported Browser'), Status.UNSUPPORTED);
        };
      })(this))();
    }
  },
  fail: function(error, status) {
    if (status == null) {
      status = Status.FAILED;
    }
    return this.setState({
      status: status
    }, (function(_this) {
      return function() {
        var _base;
        return typeof (_base = _this.props).onError === "function" ? _base.onError(error) : void 0;
      };
    })(this));
  },
  handleResponse: function(txt) {
    return this.setState({
      loadedText: txt,
      status: Status.LOADED
    }, (function(_this) {
      return function() {
        var _base;
        return typeof (_base = _this.props).onLoad === "function" ? _base.onLoad() : void 0;
      };
    })(this));
  },
  load: function() {
    var done, xhr;
    xhr = new XHR();
    done = once(delay((function(_this) {
      return function(err) {
        xhr.onload = xhr.onerror = xhr.onreadystatechange = null;
        if (err) {
          return _this.fail(err);
        } else {
          return _this.handleResponse(xhr.responseText);
        }
      };
    })(this)));
    xhr.onreadystatechange = (function(_this) {
      return function() {
        if (xhr.readyState === 4) {
          switch (xhr.status.toString().slice(0, 1)) {
            case '2':
              return done();
            case '4':
              return done(new Error("" + xhr.status + " Client Error"));
            case '5':
              return done(new Error("" + xhr.status + " Server Error"));
            default:
              return done(new Error("" + xhr.status + " HTTP Error"));
          }
        }
      };
    })(this);
    xhr.onload = function() {
      return done();
    };
    xhr.onerror = function() {
      return done(new Error('Internal XHR error'));
    };
    xhr.open('GET', this.props.src);
    return xhr.send();
  },
  getClassName: function() {
    var className;
    className = "isvg " + this.state.status;
    if (this.props.className) {
      className += " " + this.props.className;
    }
    return className;
  },
  render: function() {
    return this.props.wrapper({
      className: this.getClassName(),
      dangerouslySetInnerHTML: this.state.loadedText ? {
        __html: this.state.loadedText
      } : void 0
    }, this.renderContents());
  },
  renderContents: function() {
    switch (this.state.status) {
      case Status.UNSUPPORTED:
        return this.props.children;
      case Status.PENDING:
      case Status.LOADING:
        if (this.props.preloader) {
          return new this.props.preloader;
        }
    }
  }
});

},{"once":1}]},{},[2])
(2)
});