// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/components/Button';
import { FluentTheme } from '@uifabric/fluent-theme';
import { Stack } from 'office-ui-fabric-react/lib/components/Stack';
import { ITextField, TextField } from 'office-ui-fabric-react/lib/components/TextField';
import cloneDeep from 'lodash/cloneDeep';
import formatMessage from 'format-message';

import { dispatcherState, rootBotProjectIdSelector, settingsState } from '../../../recoilModel';
import { mergePropertiesManagedByRootBot } from '../../../recoilModel/dispatchers/utils/project';
import { addNewButton, tableColumnHeader } from '../styles';

const Input = styled(TextField)({
  width: '100%',
  position: 'relative',
  '& .ms-TextField-fieldGroup:focus::after': {
    content: '""',
    position: 'absolute',
    left: -1,
    top: -1,
    right: -1,
    bottom: -1,
    pointerEvents: 'none',
    borderRadius: 2,
    border: `2px solid ${FluentTheme.palette.themePrimary}`,
    zIndex: 1,
  },
});

const textFieldStyles = {
  fieldGroup: {
    borderColor: 'transparent',
    transition: 'border-color 0.1s linear',
    selectors: {
      ':hover': {
        borderColor: FluentTheme.palette.neutralLight,
      },
    },
  },
};

const ItemContainer = styled.div({
  borderTop: `1px solid ${FluentTheme.palette.neutralLight}`,
  marginTop: '4px',
});

const Row = styled(Stack)({
  borderBottom: `1px solid ${FluentTheme.palette.neutralLight}`,
  padding: '8px 0 8px 4px',
  '& .ms-Button:not(:focus) i': {
    visibility: 'hidden',
  },
  '&:hover .ms-Button i': {
    visibility: 'visible',
  },
});

type ItemProps = {
  value: string;
  onBlur: () => void;
  onChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void;
  onRemove: () => void;
};

const Item = React.memo(({ value, onBlur, onChange, onRemove }: ItemProps) => {
  const itemRef = React.useRef<ITextField | null>(null);
  const didMount = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (!value && !didMount.current) {
      itemRef.current?.focus();
    }
    didMount.current = true;
  }, []);

  return (
    <Row horizontal>
      <Input
        componentRef={(ref) => (itemRef.current = ref)}
        styles={textFieldStyles}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
      />
      <IconButton aria-label={formatMessage('Remove item')} iconProps={{ iconName: 'Trash' }} onClick={onRemove} />
    </Row>
  );
});

type Props = {
  projectId: string;
};

export const AllowedCallers: React.FC<Props> = ({ projectId }) => {
  const { setSettings } = useRecoilValue(dispatcherState);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const settings = useRecoilValue(settingsState(projectId));
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
  const { skillConfiguration } = mergedSettings;

  const updateAllowedCallers = React.useCallback(
    (allowedCallers: string[] = []) => {
      const updatedSetting = {
        ...cloneDeep(mergedSettings),
        skillConfiguration: { ...skillConfiguration, allowedCallers },
      };
      setSettings(projectId, updatedSetting);
    },
    [mergedSettings, projectId, skillConfiguration]
  );

  const onBlur = React.useCallback(() => {
    updateAllowedCallers(skillConfiguration?.allowedCallers?.filter(Boolean));
  }, [skillConfiguration?.allowedCallers, updateAllowedCallers]);

  const onChange = React.useCallback(
    (index: number) => (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue = '') => {
      const updatedAllowedCallers = [...(skillConfiguration?.allowedCallers || [])];
      updatedAllowedCallers[index] = newValue;
      updateAllowedCallers(updatedAllowedCallers);
    },
    [skillConfiguration?.allowedCallers, updateAllowedCallers]
  );

  const onRemove = React.useCallback(
    (index: number) => () => {
      const updatedAllowedCallers = skillConfiguration?.allowedCallers?.filter((_, itemIndex) => itemIndex !== index);
      updateAllowedCallers(updatedAllowedCallers);
    },
    [skillConfiguration?.allowedCallers, updateAllowedCallers]
  );

  const onAddNewAllowedCaller = React.useCallback(() => {
    updateAllowedCallers([...skillConfiguration?.allowedCallers, '']);
  }, [skillConfiguration?.allowedCallers, updateAllowedCallers]);

  return (
    <React.Fragment>
      <div css={tableColumnHeader()}>{formatMessage('Allowed callers')} </div>
      <ItemContainer>
        {skillConfiguration?.allowedCallers?.map((caller, index) => {
          return (
            <Item key={index} value={caller} onBlur={onBlur} onChange={onChange(index)} onRemove={onRemove(index)} />
          );
        })}
      </ItemContainer>
      <ActionButton data-testid={'addNewAllowedCaller'} styles={addNewButton} onClick={onAddNewAllowedCaller}>
        {formatMessage('Add new')}
      </ActionButton>
    </React.Fragment>
  );
};
