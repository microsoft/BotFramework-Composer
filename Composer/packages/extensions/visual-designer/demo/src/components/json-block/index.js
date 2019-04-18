import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

// A simple zero-dependency json editor supports both controlled mode and uncontrolled mode.
export class JsonBlock extends Component {
  state = {
    defaultValue: {},
    displayedText: '',
    mode: 'controlled',
  };

  constructor(props) {
    super(props);
    if (props.value === undefined && props.onSubmit) {
      // Uncontrolled component, use 'onSubmit' + 'defaultValue
      this.state = {
        defaultValue: props.defaultValue,
        displayedText: JSON.stringify(props.defaultValue, null, '\t'),
        mode: 'uncontrolled',
      };
    } else {
      // Controlled component, use 'onChange' + 'value'
      this.state = {
        displayedText: JSON.stringify(props.value, null, '\t'),
        mode: 'controlled',
      };
    }
  }

  tryParseJson(text) {
    try {
      return JSON.parse(text);
    } catch (_) {
      return undefined;
    }
  }

  onEditText(event) {
    const text = event.target.value;
    const json = this.tryParseJson(text);

    if (json && this.state.mode === 'controlled') {
      this.props.onChange(json);
    } else {
      this.setState({
        displayedText: text,
      });
    }
  }

  onSubmitJson() {
    if (this.state.mode !== 'uncontrolled') return;

    this.props.onSubmit(this.tryParseJson(this.state.displayedText));
  }

  onResetJson() {
    if (this.state.mode !== 'uncontrolled') return;

    this.setState({
      displayedText: JSON.stringify(this.state.defaultValue, null, '\t'),
    });
  }

  renderTextarea() {
    return (
      <textarea
        style={{ width: this.props.width, height: this.props.height, font: 'initial', fontSize: '20px' }}
        value={this.state.displayedText}
        onChange={this.onEditText.bind(this)}
      />
    );
  }

  renderControlled() {
    return <Fragment>{this.renderTextarea()}</Fragment>;
  }

  renderUncontrolled() {
    return (
      <Fragment>
        {this.renderTextarea()}
        <div>
          <button onClick={this.onSubmitJson.bind(this)}>Submit</button>
          <button onClick={this.onResetJson.bind(this)}>Reset</button>
        </div>
      </Fragment>
    );
  }

  render() {
    if (this.state.mode === 'controlled') {
      return this.renderControlled();
    } else if (this.state.mode === 'uncontrolled') {
      return this.renderUncontrolled();
    } else {
      return <div>{this.state.mode}</div>;
    }
  }
}

JsonBlock.defaultProps = {
  defaultValue: {},
  width: 400,
  height: 500,
};

JsonBlock.propTypes = {
  defaultValue: PropTypes.object,
  value: PropTypes.object,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number,
};
