// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { ActionButton } from 'office-ui-fabric-react/lib/components/Button';
import { FluentTheme } from '@uifabric/fluent-theme';
import { Stack } from 'office-ui-fabric-react/lib/components/Stack';
import { ITextField, TextField } from 'office-ui-fabric-react/lib/components/TextField';
import cloneDeep from 'lodash/cloneDeep';
import formatMessage from 'format-message';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { dispatcherState, rootBotProjectIdSelector, settingsState } from '../../recoilModel';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';

import { actionButton, subtext, title } from './styles';

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
    <Stack horizontal verticalAlign={'center'}>
      <Input
        componentRef={(ref) => (itemRef.current = ref)}
        styles={textFieldStyles}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
      />
      <ActionButton aria-label={formatMessage('Remove item')} styles={actionButton} onClick={onRemove}>
        {formatMessage('Remove')}
      </ActionButton>
    </Stack>
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
  const { runtimeSettings } = mergedSettings;

  const updateAllowedCallers = React.useCallback(
    (allowedCallers: string[] = []) => {
      const updatedSetting = {
        ...cloneDeep(mergedSettings),
        runtimeSettings: { ...runtimeSettings, skills: { ...runtimeSettings?.skills, allowedCallers } },
      };
      setSettings(projectId, updatedSetting);
    },
    [mergedSettings, projectId, runtimeSettings?.skills]
  );

  const onBlur = React.useCallback(() => {
    updateAllowedCallers(runtimeSettings?.skills?.allowedCallers?.filter(Boolean));
  }, [runtimeSettings?.skills?.allowedCallers, updateAllowedCallers]);

  const onChange = React.useCallback(
    (index: number) => (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue = '') => {
      const updatedAllowedCallers = [...(runtimeSettings?.skills?.allowedCallers || [])];
      updatedAllowedCallers[index] = newValue;
      updateAllowedCallers(updatedAllowedCallers);
    },
    [runtimeSettings?.skills?.allowedCallers, updateAllowedCallers]
  );

  const onRemove = React.useCallback(
    (index: number) => () => {
      const updatedAllowedCallers = runtimeSettings?.skills?.allowedCallers?.filter(
        (_, itemIndex) => itemIndex !== index
      );
      updateAllowedCallers(updatedAllowedCallers);
    },
    [runtimeSettings?.skills?.allowedCallers, updateAllowedCallers]
  );

  const onAddNewAllowedCaller = React.useCallback(() => {
    runtimeSettings?.skills?.allowedCallers
      ? updateAllowedCallers([...runtimeSettings?.skills?.allowedCallers, ''])
      : updateAllowedCallers(['']);
  }, [runtimeSettings?.skills?.allowedCallers, updateAllowedCallers]);

  return (
    <Fragment>
      <div css={title}>{formatMessage('Allowed Callers')}</div>
      <div css={subtext}>
        {formatMessage.rich(
          'Skills can be “called” by external bots. Allow other bots to call your skill by adding their App IDs to the list below. <a>Learn more.</a>',
          {
            a: ({ children }) => (
              <Link href={''} target="_blank">
                {children}
              </Link>
            ),
          }
        )}
      </div>
      <ItemContainer>
        {runtimeSettings?.skills?.allowedCallers?.map((caller, index) => {
          return (
            <Item key={index} value={caller} onBlur={onBlur} onChange={onChange(index)} onRemove={onRemove(index)} />
          );
        })}
      </ItemContainer>
      {!runtimeSettings?.skills?.allowedCallers?.length && (
        <MessageBar messageBarType={MessageBarType.warning}>
          {formatMessage('This bot cannot be called as a skill since the allowed caller list is empty')}
        </MessageBar>
      )}
      <ActionButton data-testid={'addNewAllowedCaller'} styles={actionButton} onClick={onAddNewAllowedCaller}>
        {formatMessage('Add new caller')}
      </ActionButton>
    </Fragment>
  );
};
