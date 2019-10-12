'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactSimpleCodeEditor = require('react-simple-code-editor');

var _reactSimpleCodeEditor2 = _interopRequireDefault(_reactSimpleCodeEditor);

var _prismCore = require('prismjs/components/prism-core');

require('prismjs/components/prism-json');

require('prismjs/components/prism-clike');

require('prismjs/components/prism-javascript');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: { value: subClass, enumerable: false, writable: true, configurable: true },
  });
  if (superClass)
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
}

var JsonEditor = (function(_Component) {
  _inherits(JsonEditor, _Component);

  function JsonEditor(props) {
    _classCallCheck(this, JsonEditor);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.onChange = function(newContent) {
      var newData = {
        name: _this.state.data.name,
        content: newContent,
      };

      _this.setState({
        data: newData,
      });

      _this.props.onChange(newData);
    };

    _this.state = {
      data: props.data,
    };
    return _this;
  }

  JsonEditor.prototype.componentWillReceiveProps = function componentWillReceiveProps(newProps) {
    this.setState({
      data: newProps.data,
    });
  };

  JsonEditor.prototype.render = function render() {
    return _react2.default.createElement(_reactSimpleCodeEditor2.default, {
      value: this.state.data.content,
      onValueChange: this.onChange,
      highlight: function highlight(code) {
        return (0, _prismCore.highlight)(code, _prismCore.languages.js);
      },
      padding: 10,
      style: {
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 16,
        height: '100%',
        minHeight: '500px',
      },
    });
  };

  return JsonEditor;
})(_react.Component);

exports.default = JsonEditor;
module.exports = exports['default'];
