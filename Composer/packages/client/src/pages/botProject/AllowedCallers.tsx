// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/react';
import React, { Fragment } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { ActionButton } from '@fluentui/react/lib/components/Button';
import { FluentTheme } from '@fluentui/theme';
import { Stack } from '@fluentui/react/lib/components/Stack';
import { ITextField, TextField } from '@fluentui/react/lib/components/TextField';
import cloneDeep from 'lodash/cloneDeep';
import formatMessage from 'format-message';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Link } from '@fluentui/react/lib/Link';
import { useArrayItems } from '@bfc/adaptive-form';

import { dispatcherState, rootBotProjectIdSelector, settingsState } from '../../recoilModel';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';

import { actionButton, subtext } from './styles';
import { SettingTitle } from './shared/SettingTitle';

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
  index: number;
  value: string;
  onBlur: () => void;
  onChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void;
  onRemove: () => void;
};

const Item = React.memo(({ index, value, onBlur, onChange, onRemove }: ItemProps) => {
  const itemRef = React.useRef<ITextField | null>(null);
  const didMount = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (!value && !didMount.current) {
      itemRef.current?.focus();
    }
    didMount.current = true;
  }, []);

  return (
    <Stack horizontal role="listitem" verticalAlign={'center'}>
      <Input
        ariaLabel={formatMessage('Item {index}: Allowed caller bot App ID', { index })}
        componentRef={(ref) => (itemRef.current = ref)}
        data-testid="addCallerInputField"
        styles={textFieldStyles}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
      />
      <ActionButton
        ariaLabel={formatMessage('Remove item {index}', { index })}
        data-testid="addCallerRemoveBtn"
        styles={actionButton}
        onClick={onRemove}
      >
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

  const { arrayItems: allowedCallers = [], addItem, handleChange, handleResetCache } = useArrayItems(
    runtimeSettings?.skills?.allowedCallers || [],
    updateAllowedCallers
  );

  // Reset array cache when user switches between project settings
  const didMount = React.useRef(false);
  React.useEffect(() => {
    if (didMount.current) {
      handleResetCache(runtimeSettings?.skills?.allowedCallers || []);
    }
    didMount.current = true;
  }, [projectId]);

  const onAddNewAllowedCaller = React.useCallback(() => {
    addItem('');
  }, [addItem]);

  const onRemove = React.useCallback(
    (index: number) => () => {
      const updatedAllowedCallers = allowedCallers.slice();
      updatedAllowedCallers.splice(index, 1);
      handleChange(updatedAllowedCallers);
    },
    [allowedCallers, handleChange]
  );

  const onChange = React.useCallback(
    (index: number) => (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue = '') => {
      const updatedAllowedCallers = allowedCallers.slice();
      updatedAllowedCallers[index].value = newValue;
      handleChange(updatedAllowedCallers);
    },
    [allowedCallers, handleChange]
  );

  const onBlur = React.useCallback(() => {
    handleChange(allowedCallers.filter(({ value }) => !!value));
  }, [allowedCallers, handleChange]);

  return (
    <Fragment>
      <SettingTitle>{formatMessage('Allowed Callers')}</SettingTitle>
      <div css={subtext}>
        {formatMessage.rich(
          'Skills can be “called” by external bots. Allow other bots to call your skill by adding their App IDs to the list below. <a>Learn more</a>',
          {
            a: ({ children }) => (
              <Link
                key="allowed-callers-settings-page"
                aria-label={formatMessage('Learn more about skills')}
                href={'https://aka.ms/composer-skills-learnmore'}
                target="_blank"
              >
                {children}
              </Link>
            ),
          }
        )}
      </div>
      <ItemContainer role="list">
        {allowedCallers.map(({ value, id }, index) => {
          return (
            <Item
              key={id}
              index={index + 1}
              value={value}
              onBlur={onBlur}
              onChange={onChange(index)}
              onRemove={onRemove(index)}
            />
          );
        })}
      </ItemContainer>
      {!allowedCallers.length && (
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
