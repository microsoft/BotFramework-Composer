/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Fragment } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { PropTypes } from 'prop-types';

import { container, body } from './styles';

function toggleModal(props) {
  props.setPanelStatus(!props.panelStatus);
}

export const OpenFileModal = props => (
  <Fragment>
    <div>
      <Panel
        isOpen={props.panelStatus}
        onDismiss={() => toggleModal(props)}
        type={PanelType.customNear}
        css={container}
        headerText="Open Bot"
        isModeless={true}
        isBlocking={false}
      >
        <div css={body}>
          <p>Please select the bot.</p>
          <DefaultButton onClick={() => toggleModal(props)} text="Close" />
        </div>
      </Panel>
    </div>
  </Fragment>
);

OpenFileModal.propTypes = {
  panelStatus: PropTypes.boolean,
  setPanelStatus: PropTypes.func,
};
