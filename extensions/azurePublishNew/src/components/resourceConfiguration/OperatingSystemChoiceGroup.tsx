// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ChoiceGroup, IChoiceGroupOption, IChoiceGroupProps } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { usePreferredAppServiceOS } from '../../hooks/usePreferredAppServiceOS';

type Props = Omit<IChoiceGroupProps, 'options'>;

export const OperatingSystemChoiceGroup = (props: Props) => {
  const preferredOS = usePreferredAppServiceOS();

  const getAppServiceOSOptions = React.useCallback((): IChoiceGroupOption[] => {
    return [
      {
        key: 'windows',
        text: preferredOS === 'windows' ? formatMessage('Windows (Recommended)') : formatMessage('Windows'),
        styles: {
          root: { marginTop: '4px' },
        },
      },
      {
        key: 'linux',
        text: preferredOS === 'linux' ? formatMessage('Linux (Recommended)') : formatMessage('Linux'),
        styles: {
          root: { marginTop: '4px', marginLeft: '8px' },
        },
      },
    ];
  }, [preferredOS]);

  return <ChoiceGroup options={getAppServiceOSOptions()} {...props} />;
};
