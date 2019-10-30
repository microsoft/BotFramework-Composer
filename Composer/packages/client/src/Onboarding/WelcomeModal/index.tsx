// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext } from 'react';
import { Modal } from 'office-ui-fabric-react';

import OnboardingContext from '../context';

import CollapsedWelcomeModal from './Collapsed';
import ExpandedWelcomeModal from './Expanded';
import { collapsedStyles, expandedStyles } from './style';

const WelcomeModal = () => {
  const {
    actions: { exit },
    state: { complete, hideModal, minimized },
  } = useContext(OnboardingContext);

  return !(complete || hideModal) ? (
    <Modal
      isOpen={true}
      onDismiss={exit}
      overlay={{ style: { background: 'transparent' } }}
      styles={minimized ? collapsedStyles : expandedStyles}
    >
      {minimized ? <CollapsedWelcomeModal /> : <ExpandedWelcomeModal />}
    </Modal>
  ) : null;
};

export default WelcomeModal;
