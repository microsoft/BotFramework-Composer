import React from 'react';
import ReactWebChat, { createDirectLine, createStyleSet } from 'botframework-webchat';

import './WebChat.css';

export default class WebchatBase extends React.Component {
  directline;

  constructor(props) {
    super(props);
    this.directline = createDirectLine({ token: props.token });
    this.state = {
      styleSet: createStyleSet({
        backgroundColor: 'Transparent',
      }),
    };
  }

  render() {
    const {
      props: { className, store },
      state: { styleSet },
    } = this;

    return (
      <ReactWebChat
        className={`${className || ''} web-chat`}
        directLine={this.directline}
        store={store}
        styleSet={styleSet}
      />
    );
  }
}
