// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import formatMessage from 'format-message';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes } from '@uifabric/fluent-theme';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { DialogFooter, IDialogContentStyles } from 'office-ui-fabric-react/lib/Dialog';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { RouteComponentProps } from '@reach/router';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { DialogCreationCopy } from '../../constants';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  onJumpToOpenModal: (search?: string) => void;
  onToggleCreateModal: (boolean) => void;
} & RouteComponentProps<{}>;

const dialogWrapperProps = DialogCreationCopy.CREATE_OPTIONS;

const dialogStyle: { dialog: Partial<IDialogContentStyles>; modal: {} } = {
  dialog: {
    title: {
      fontWeight: FontWeights.bold,
      fontSize: FontSizes.size20,
      paddingTop: '14px',
      paddingBottom: '11px',
    },
    subText: {
      fontSize: FontSizes.size14,
      marginBottom: '8px',
    },
    button: {
      marginTop: 0,
    },
  },
  modal: {
    main: {
      maxWidth: '80% !important',
      width: '480px !important',
    },
  },
};

export const AzureBotDialog = (props: Props) => {
  const [option, setOption] = useState<'Create' | 'Connect'>('Create');

  const { isOpen, onDismiss, onJumpToOpenModal, onToggleCreateModal: setIsOpenCreateModal } = props;

  const options: IChoiceGroupOption[] = [
    { key: 'Create', text: formatMessage('Create a new bot project') },
    { key: 'Connect', text: formatMessage('Use an existing bot project') },
  ];

  const handleChange = (e, option) => {
    setOption(option.key);
  };

  const handleJumpToNext = () => {
    if (option === 'Create') {
      TelemetryClient.track('NewBotDialogOpened', {
        isSkillBot: false,
        fromAbsHandoff: true,
      });
      setIsOpenCreateModal(true);
    } else {
      onJumpToOpenModal(props.location?.search);
    }
  };

  return (
    <DialogWrapper
      isOpen={isOpen}
      {...dialogWrapperProps}
      customerStyle={dialogStyle}
      dialogType={DialogTypes.Customer}
      onDismiss={onDismiss}
    >
      <Link href="http://aka.ms/composer-abs-quickstart" target="_blank">
        {formatMessage('Learn more.')}
      </Link>
      <ChoiceGroup
        required
        defaultSelectedKey="Create"
        options={options}
        styles={{
          applicationRole: {
            marginTop: '24px',
          },
        }}
        onChange={handleChange}
      />
      <DialogFooter>
        <PrimaryButton data-testid="ABSNextStepButton" text={formatMessage('Next')} onClick={handleJumpToNext} />
        <DefaultButton data-testid="ABSCancelButton" text={formatMessage('Cancel')} onClick={onDismiss} />
      </DialogFooter>
    </DialogWrapper>
  );
};
