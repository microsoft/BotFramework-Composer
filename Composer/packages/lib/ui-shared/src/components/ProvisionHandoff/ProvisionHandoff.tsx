// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { IconButton } from 'office-ui-fabric-react/lib/components/Button';
import { FontSizes, NeutralColors } from '@uifabric/fluent-theme/lib/fluent';
import { useRef } from 'react';
import { ITextField, TextField } from 'office-ui-fabric-react/lib/components/TextField';

import { DialogTypes, DialogWrapper } from '../DialogWrapper';

type ProvisionHandoffProps = {
  title: string;
  developerInstructions: string;
  handoffInstructions: string;
  hidden: boolean;
  onBack: () => void;
  onDismiss: () => void;
};

export const ProvisionHandoff = (props: ProvisionHandoffProps) => {
  const textFieldRef = useRef<ITextField>(null);

  const copyCodeToClipboard = () => {
    if (textFieldRef.current) {
      try {
        textFieldRef.current.select();
        document.execCommand('copy');
        textFieldRef.current.setSelectionRange(0, 0);
        textFieldRef.current.blur();
      } catch (e) {
        console.error('Something went wrong when trying to copy content to clipboard.', e);
      }
    }
  };

  return (
    <DialogWrapper
      dialogType={DialogTypes.ProvisionFlow}
      isOpen={!props.hidden}
      subText={props.developerInstructions}
      title={props.title}
      onDismiss={props.onDismiss}
    >
      <div>
        <Text style={{ fontWeight: 700 }}>{formatMessage('Instructions for your Azure admin:')}</Text>
        <IconButton
          ariaLabel={formatMessage('Copy Icon')}
          menuIconProps={{ iconName: 'Copy' }}
          styles={{
            root: {
              height: 'unset',
              float: 'right',
              marginRight: '10px',
            },
            menuIcon: {
              backgroundColor: NeutralColors.white,
              color: NeutralColors.gray130,
              fontSize: FontSizes.size16,
            },
            rootDisabled: {
              backgroundColor: NeutralColors.white,
            },
          }}
          onClick={() => {
            copyCodeToClipboard();
          }}
        />
      </div>
      <TextField
        autoAdjustHeight
        multiline
        componentRef={textFieldRef}
        styles={{ root: { marginTop: '10px' }, fieldGroup: { backgroundColor: '#f3f2f1' } }}
        value={props.handoffInstructions}
      />
      <DialogFooter>
        <PrimaryButton
          text={formatMessage('Back')}
          onClick={() => {
            props.onBack();
          }}
        />
        <PrimaryButton text={formatMessage('Okay')} onClick={props.onDismiss} />
      </DialogFooter>
    </DialogWrapper>
  );
};
