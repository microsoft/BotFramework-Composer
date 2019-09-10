import React from 'react';
import { createStore, createStyleSet } from 'botframework-webchat';

import WebChat from './WebChat';

import './fabric-icons-inline.css';
import './MinimizableWebchat.css';

const RpcPrefix = 'composer-rpc://';

const runRpcCommand = command => {
  try {
    eval(command);
  } catch (e) {
    console.error(e.message);
    window.alert(activity.value);
  }
};

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.handleFetchToken = this.handleFetchToken.bind(this);
    this.handleMaximizeButtonClick = this.handleMaximizeButtonClick.bind(this);
    this.handleMinimizeButtonClick = this.handleMinimizeButtonClick.bind(this);
    this.handleSwitchButtonClick = this.handleSwitchButtonClick.bind(this);

    window.startWizard = () => {
      this.handleMaximizeButtonClick();
      introJs().start();
    };

    window.insertStepAt =
      window.insertStepAt ||
      (() => {
        console.log('Cannot find API insertStepAt');
      });
    window.insertTypeAt =
      window.insertTypeAt ||
      (() => {
        console.log('Cannot find API insertStepAt');
      });

    const store = createStore({}, ({ dispatch }) => next => action => {
      if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
        setTimeout(() => {
          dispatch({
            type: 'WEB_CHAT/SEND_EVENT',
            payload: {
              name: 'webchat/join',
              value: {
                language: window.navigator.language,
              },
            },
          });
        }, 1000);
      } else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
        if (action.payload.activity.from.role === 'bot') {
          this.setState(() => ({ newMessage: true }));
        }

        // composer-rpc
        if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          const activity = action.payload.activity;

          if (activity.type === 'event' && activity.name === 'composer-rpc') {
            // trigger RPC call by firing RPC event
            console.log('composer-rpc event received', activity);

            const cmd = activity.value;
            runRpcCommand(cmd);
            return;
          } else if (activity.type === 'message' && activity.text.indexOf(RpcPrefix) === 0) {
            // trigger RPC call by string protocol
            console.log('composer-rpc text protocol', activity);

            const cmd = activity.text.replace(RpcPrefix, '');
            runRpcCommand(cmd);
            return;
          }
        }
      }

      return next(action);
    });

    this.state = {
      minimized: true,
      newMessage: false,
      side: 'right',
      store,
      styleSet: createStyleSet({
        backgroundColor: 'Transparent',
      }),
      token: props.token,
    };
  }

  async handleFetchToken() {
    if (!this.state.token) {
      const url = 'https://directline.botframework.com/v3/directline/tokens/generate';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: this.props.bearer,
        },
      });
      const { token } = await res.json();

      this.setState(() => ({ token }));
    }
  }

  handleMaximizeButtonClick() {
    this.setState(() => ({
      minimized: false,
      newMessage: false,
    }));
  }

  handleMinimizeButtonClick() {
    this.setState(() => ({
      minimized: true,
      newMessage: false,
    }));
  }

  handleSwitchButtonClick() {
    this.setState(({ side }) => ({
      side: side === 'left' ? 'right' : 'left',
    }));
  }

  render() {
    const {
      state: { minimized, newMessage, side, store, styleSet, token },
    } = this;

    return (
      <div className="minimizable-web-chat">
        {minimized ? (
          <button className="maximize" onClick={this.handleMaximizeButtonClick}>
            <img
              src="https://raw.githubusercontent.com/microsoft/AI/master/docs/assets/images/va-icon.png"
              width="40"
              height="40"
              style={{ width: '100%', height: '100%' }}
            />
            {newMessage && <span className="ms-Icon ms-Icon--CircleShapeSolid red-dot" />}
          </button>
        ) : (
          <div className={side === 'left' ? 'chat-box left' : 'chat-box right'}>
            <header>
              <div className="filler" />
              <button className="switch" onClick={this.handleSwitchButtonClick}>
                <span className="ms-Icon ms-Icon--Switch" />
              </button>
              <button className="minimize" onClick={this.handleMinimizeButtonClick}>
                <span className="ms-Icon ms-Icon--ChromeMinimize" />
              </button>
            </header>
            <WebChat
              className="react-web-chat"
              onFetchToken={this.handleFetchToken}
              store={store}
              styleSet={styleSet}
              token={token}
            />
          </div>
        )}
      </div>
    );
  }
}
