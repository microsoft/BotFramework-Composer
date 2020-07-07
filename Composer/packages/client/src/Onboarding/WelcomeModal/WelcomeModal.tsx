// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext } from 'react';
import { Modal } from 'office-ui-fabric-react/lib/Modal';

import OnboardingContext from '../OnboardingContext';

import CollapsedWelcomeModal from './Collapsed/CollapsedWelcomeModal';
import ExpandedWelcomeModal from './Expanded/ExpandedWelcomeModal';
import { collapsedStyles, expandedStyles } from './style';

const WelcomeModal = () => {
  const {
    actions: { exit },
    state: { complete, hideModal, minimized },
  } = useContext(OnboardingContext);

  return !(complete || hideModal) ? (
    <Modal
      isOpen
      overlay={{ style: { background: 'transparent' } }}
      styles={minimized ? collapsedStyles : expandedStyles}
      onDismiss={exit}
    >
      {minimized ? <CollapsedWelcomeModal /> : <ExpandedWelcomeModal />}
    </Modal>
  ) : null;
};

export default WelcomeModal;
