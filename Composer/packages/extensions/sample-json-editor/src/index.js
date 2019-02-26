import React, {Component} from 'react'
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

class JsonEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: props.data
    }
  }

  onChange = (newValue) => {
    this.props.onChange(newValue);
    this.setState({
      data: newValue
    });
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      data: newProps.data
    });
  }

  render() {

    return (
      <Editor
        value={this.state.data}
        onValueChange={this.onChange}
        highlight={code => highlight(code, languages.js)}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 16,
          height: "100%",
          minHeight: "500px"
        }}
        />
    );
  }
}

export default JsonEditor;