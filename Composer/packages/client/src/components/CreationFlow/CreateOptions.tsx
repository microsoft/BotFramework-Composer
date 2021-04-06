// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment, useEffect } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { BotTemplate } from '@bfc/shared';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { RouteComponentProps, navigate } from '@reach/router';
import querystring from 'query-string';
import axios from 'axios';

import { DialogCreationCopy } from '../../constants';
import { getAliasFromPayload } from '../../utils/electronUtil';

import { CreateBot } from './CreateBot';

// -------------------- CreateOptions -------------------- //
type CreateOptionsProps = {
  templates: BotTemplate[];
  onDismiss: () => void;
  onJumpToOpenModal: (search?: string) => void;
  onNext: (data: string) => void;
} & RouteComponentProps<{}>;

export function CreateOptions(props: CreateOptionsProps) {
  const [isOpenOptionsModal, setIsOpenOptionsModal] = useState(false);
  const [option, setOption] = useState('Create');
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
  const { templates, onDismiss, onNext, onJumpToOpenModal } = props;
  useEffect(() => {
    navigate(`/v2/projects/create${props?.location?.search}`);
  });

  useEffect(() => {
    // open bot directly if alias exist.
    if (props.location?.search) {
      const decoded = decodeURIComponent(props.location.search);
      const { source, payload } = querystring.parse(decoded);
      if (typeof source === 'string' && typeof payload === 'string') {
        getAliasFromPayload(source, payload).then((alias) => {
          // check to see if Composer currently has a bot project corresponding to the alias
          axios
            .get<any>(`/api/projects/alias/${alias}`)
            .then((aliasRes) => {
              if (aliasRes.status === 200) {
                navigate(`/bot/${aliasRes.data.id}`);
                return;
              }
            })
            .catch((e) => {
              setIsOpenOptionsModal(true);
            });
        });
        return;
      }
    }
    setIsOpenCreateModal(true);
  }, [props.location?.search]);
  const dialogWrapperProps = DialogCreationCopy.CREATE_OPTIONS;

  const options: IChoiceGroupOption[] = [
    { key: 'Create', text: formatMessage('Create a new bot') },
    { key: 'Connect', text: formatMessage('Connect to an existing bot') },
  ];

  const handleChange = (e, option) => {
    setOption(option.key);
  };

  const handleJumpToNext = () => {
    if (option === 'Create') {
      setIsOpenCreateModal(true);
    } else {
      onJumpToOpenModal(props.location?.search);
    }
  };

  return (
    <Fragment>
      <DialogWrapper
        isOpen={isOpenOptionsModal}
        {...dialogWrapperProps}
        dialogType={DialogTypes.CreateFlow}
        onDismiss={onDismiss}
      >
        <ChoiceGroup required defaultSelectedKey="B" options={options} onChange={handleChange} />
        <DialogFooter>
          <PrimaryButton data-testid="NextStepButton" text={formatMessage('Open')} onClick={handleJumpToNext} />
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        </DialogFooter>
      </DialogWrapper>
      <CreateBot
        isOpen={isOpenCreateModal}
        location={props.location}
        templates={templates}
        onDismiss={onDismiss}
        onNext={onNext}
      />
    </Fragment>
  );
}
