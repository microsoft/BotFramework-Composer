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

import React, { Component } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight as _highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

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
    return React.createElement(Editor, {
      value: this.state.data.content,
      onValueChange: this.onChange,
      highlight: function highlight(code) {
        return _highlight(code, languages.js);
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
})(Component);

export default JsonEditor;
