import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';

import './DialogFlowEditor.css';
import { PAYLOAD_KEY } from '../../utils/constant';

const nodeStyle = {
  width: 150,
  height: 150,
  fontSize: '20px',
  cursor: 'pointer',
  overflow: 'hidden',
  backgroundColor: '#f6f6f6',
  borderRadius: '1.15427px',
  boxShadow: '0px 0.692561px 2.07768px rgba(0, 0, 0, 0.108), 0px 3.69366px 8.31073px rgba(0, 0, 0, 0.132)',
};

export class DialogNode extends Component {
  getLabel = payload => {
    if (payload.$type.indexOf('Intent') !== -1) return '';
    if (payload.dialog) {
      if (payload.dialog.$type) {
        return payload.dialog.$type.split('Microsoft.')[1];
      }
    }
    return payload.$type.split('.')[1];
  };

  getSubLabel = payload => {
    if (payload.dialog && payload.dialog.$id) {
      return payload.$id;
    }

    if (payload.activity) {
      return payload.activity;
    }

    if (payload.intent) {
      return payload.intent;
    }

    if (payload.property) {
      return payload.property;
    }

    return payload.$id;
  };

  getHeader = payload => {
    if (payload.$type.indexOf('Intent') !== -1) {
      return 'Decision';
    }

    if (payload.$type.indexOf('Welcome') !== -1) {
      return 'Entry';
    }
  };

  getHeaderColor = payload => {
    if (payload.$type.indexOf('Intent') !== -1) {
      return '#0078D4';
    }

    if (payload.$type.indexOf('Welcome') !== -1) {
      return '#3C3C3C';
    }

    return '#00B294';
  };

  isBranch = payload => {
    // todo: for all recognizers and conditional dialogs, use a branch node
    return payload.$type.indexOf('Recognizer') !== -1;
  };
  render() {
    const { data } = this.props;
    const dialogPayload = data[PAYLOAD_KEY] || {};
    const onClickContent = () => data.onClick({ id: data.id, payload: dialogPayload });

    // todo: this logic to configure the UI for these nodes should be via a function like below:
    // const { header, color, label, subLabel } = this.getNodeOptions(dialogPayload);

    return (
      <Fragment>
        {!this.isBranch(dialogPayload) ? (
          <div style={nodeStyle} onClick={onClickContent}>
            <div
              style={{
                height: '30px',
                width: '100%',
                backgroundColor: this.getHeaderColor(dialogPayload),
                color: '#ffffff',
                fontWeight: '700',
                paddingLeft: '8px',
                paddingBottom: '8px',
              }}
            >
              {this.getHeader(dialogPayload)}
            </div>
            <div style={{ fontWeight: '400', paddingLeft: '5px', marginTop: '5px' }}>
              {this.getLabel(dialogPayload)}
            </div>
            <div style={{ fontWeight: '300', paddingLeft: '5px', marginTop: '5px' }}>
              {this.getSubLabel(dialogPayload)}
            </div>
          </div>
        ) : (
          <div
            style={{
              width: '150px',
              height: '20px',
              backgroundColor: '#ffffff',
            }}
            onClick={onClickContent}
          >
            <svg
              style={{ marginLeft: '48px' }}
              width="50"
              height="20"
              viewBox="0 0 50 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M25 0L50 10L25 20L-2.7865e-06 10L25 0Z" fill="#979797" />
            </svg>
          </div>
        )}
      </Fragment>
    );
  }
}

DialogNode.defaultProps = {
  data: {},
};

DialogNode.propTypes = {
  data: PropTypes.object,
};
