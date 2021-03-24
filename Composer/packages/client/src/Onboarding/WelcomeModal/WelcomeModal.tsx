// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { FluentTheme } from '@uifabric/fluent-theme';
import { IModalStyles } from 'office-ui-fabric-react/lib/Modal';

import { useOnboardingContext } from '../OnboardingContext';

import CollapsedWelcomeModal from './Collapsed/CollapsedWelcomeModal';
import ExpandedWelcomeModal from './Expanded/ExpandedWelcomeModal';

const collapsedStyles: Partial<IModalStyles> = {
  main: {
    backgroundColor: FluentTheme.palette.themePrimary,
    bottom: '30px',
    minHeight: '55px',
    color: 'white',
    paddingLeft: '15px',
    position: 'absolute',
    right: '20px',
  },
};

const expandedStyles: Partial<IModalStyles> = {
  main: {
    bottom: '30px',
    padding: '15px',
    position: 'absolute',
    right: '30px',
  },
};

const WelcomeModal = () => {
  const {
    actions: { exit },
    state: { complete, hideModal, minimized },
  } = useOnboardingContext();

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
