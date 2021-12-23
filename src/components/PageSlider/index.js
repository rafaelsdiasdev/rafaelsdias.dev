function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

var React = _interopDefault(require('react'));

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') {
    return;
  }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css =
  'body,\nhtml {\n  height: 100%;\n}\n\nbody {\n  margin: 0;\n  padding: 0;\n  overflow: hidden;\n}\n\n.slider__container {\n  position: fixed;\n  display: block;\n  height: 100%;\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  -webkit-transform: translate3d(0, 0, 0);\n  transform: translate3d(0, 0, 0);\n  -webkit-transition: -webkit-transform 500ms ease-in-out;\n  transition: -webkit-transform 500ms ease-in-out;\n  -o-transition: transform 500ms ease-in-out;\n  transition: transform 500ms ease-in-out;\n}\n\n.slider__page {\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n\n.slider__indicators {\n  position: fixed;\n  left: 18px;\n  top: 50%;\n  z-index: 2;\n  margin: 0;\n  padding: 0;\n  -webkit-transform: translateY(-50%);\n  -ms-transform: translateY(-50%);\n  transform: translateY(-50%);\n}\n\n.slider__indicator {\n  display: block;\n  width: 10px;\n  height: 10px;\n  margin: 10px 0;\n  border-radius: 100px;\n  background-color: #fff;\n  cursor: default;\n}\n\n.slider__indicator--active {\n  opacity: 0.3;\n}\n\nsection > div {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  font-size: 7vw;\n  font-family: sans-serif;\n  text-transform: uppercase;\n  color: #fff;\n}\n';
styleInject(css);

var keyUp = {
  38: 1,
  33: 1,
};
var keyDown = {
  40: 1,
  34: 1,
};

var SliderPage =
  /*#__PURE__*/
  (function (_React$Component) {
    _inheritsLoose(SliderPage, _React$Component);

    function SliderPage(_props) {
      var _this;

      _this = _React$Component.call(this, _props) || this;

      _this.onTransition = function () {
        if (_this.isChanging) {
          setTimeout(function () {
            _this.isChanging = false;
            window.location.hash = document.querySelector(
              '[data-slider-index="' + _this.state.currentSlide + '"]',
            ).id;
          }, 400);
        }
      };

      _this.detectChangeEnd = function () {
        var transition;
        var e = document.createElement('foobar');
        var transitions = {
          transition: 'transitionend',
          OTransition: 'oTransitionEnd',
          MozTransition: 'transitionend',
          WebkitTransition: 'webkitTransitionEnd',
        };

        for (transition in transitions) {
          if (e.style[transition] !== undefined) {
            return transitions[transition];
          }
        }

        return true;
      };

      _this.onKeyDown = function (e) {
        if (keyUp[e.keyCode]) {
          _this.changeSlide(-1);
        } else if (keyDown[e.keyCode]) {
          _this.changeSlide(1);
        }
      };

      _this.onMouseWheel = function (e) {
        var direction = e.wheelDelta || e.deltaY;

        if (direction > 0) {
          _this.changeSlide(-1);
        } else {
          _this.changeSlide(1);
        }
      };

      _this.onTouchStart = function (e) {
        e.preventDefault();

        if (
          e.type === 'touchstart' ||
          e.type === 'touchmove' ||
          e.type === 'touchend' ||
          e.type === 'touchcancel'
        ) {
          var touch = e.touches[0] || e.changedTouches[0];
          _this.touchStartPos = touch.pageY;
        }
      };

      _this.onTouchEnd = function (e) {
        e.preventDefault();

        if (
          e.type === 'touchstart' ||
          e.type === 'touchmove' ||
          e.type === 'touchend' ||
          e.type === 'touchcancel'
        ) {
          var touch = e.touches[0] || e.changedTouches[0];
          _this.touchStopPos = touch.pageY;
        }

        if (_this.touchStartPos + _this.touchMinLength < _this.touchStopPos) {
          _this.changeSlide(-1);
        } else if (
          _this.touchStartPos >
          _this.touchStopPos + _this.touchMinLength
        ) {
          _this.changeSlide(1);
        }
      };

      _this.modifyChildren = function (child, index) {
        var className =
          (child.props.className ? child.props.className + ' ' : '') +
          'slider__page';
        var props = {
          className: className,
          'data-slider-index': index + 1,
        };
        return React.cloneElement(child, props);
      };

      _this.changeSlide = function (direction) {
        // already doing it or last/first page, staph plz
        if (
          _this.isChanging ||
          (direction === 1 &&
            _this.state.currentSlide === _this.props.children.length) ||
          (direction === -1 && _this.state.currentSlide === 1)
        ) {
          return;
        } // change page

        _this.setState({
          currentSlide: _this.state.currentSlide + direction,
        });

        _this.isChanging = true;
      };

      _this.state = {
        currentSlide: 1,
      };
      _this.sliderRef = React.createRef();
      _this.touchStartPos = 0;
      _this.touchStopPos = 0;
      _this.touchMinLength = 50;
      return _this;
    }

    var _proto = SliderPage.prototype;

    _proto.componentDidMount = function componentDidMount() {
      this.detectChangeEnd() &&
        this.sliderRef.current.addEventListener(
          this.detectChangeEnd(),
          this.onTransition,
        );
      window.addEventListener('keydown', this.onKeyDown);
    };

    _proto.componentWillUnmount = function componentWillUnmount() {
      this.sliderRef.current.removeEventListener(
        this.detectChangeEnd(),
        this.onTransition,
      );
      window.removeEventListener('keydown', this.onKeyDown);
    };

    _proto.render = function render() {
      var _this2 = this;

      var sliderIndicators = React.createElement(
        'div',
        {
          className: 'slider__indicators',
        },
        this.props.children.map(function (_, index) {
          return React.createElement('div', {
            key: index,
            className:
              'slider__indicator' +
              (_this2.state.currentSlide === index + 1
                ? ' slider__indicator--active'
                : ''),
            'data-slider-target-index': index + 1,
          });
        }),
      );
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'div',
          {
            ref: this.sliderRef,
            className: 'slides slider__container',
            style: {
              transform:
                'translate3d(0, ' +
                -(this.state.currentSlide - 1) * 100 +
                '%, 0)',
            },
            onTouchStart: this.onTouchStart,
            onTouchEnd: this.onTouchEnd,
            onWheel: this.onMouseWheel,
          },
          React.Children.map(this.props.children, function (child, index) {
            return _this2.modifyChildren(child, index);
          }),
        ),
        sliderIndicators,
      );
    };

    return SliderPage;
  })(React.Component);

module.exports = SliderPage;
