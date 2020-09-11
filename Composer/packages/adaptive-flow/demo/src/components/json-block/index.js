import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

// A simple zero-dependency json editor supports both controlled mode and uncontrolled mode.
export class JsonBlock extends Component {
  state = {
    defaultValue: {},
    displayedText: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      defaultValue: props.defaultValue,
      displayedText: JSON.stringify(props.defaultValue, null, '\t'),
    };
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

    this.setState({
      displayedText: text,
    });
  }

  onSubmit() {
    this.props.onSubmit(this.tryParseJson(this.state.displayedText));
  }

  onReset() {
    this.setState({
      displayedText: JSON.stringify(this.state.defaultValue, null, '\t'),
    });
  }

  render() {
    return (
      <Fragment>
        <textarea
          style={{ ...this.props.styles, font: 'initial', fontSize: '20px' }}
          value={this.state.displayedText}
          onChange={this.onEditText.bind(this)}
        />
        <div>
          <button onClick={this.onSubmit.bind(this)}>Submit</button>
          <button onClick={this.onReset.bind(this)}>Reset</button>
        </div>
      </Fragment>
    );
  }
}

JsonBlock.defaultProps = {
  defaultValue: {},
  styles: {},
};

JsonBlock.propTypes = {
  defaultValue: PropTypes.object,
  onSubmit: PropTypes.func,
  styles: PropTypes.object,
};
