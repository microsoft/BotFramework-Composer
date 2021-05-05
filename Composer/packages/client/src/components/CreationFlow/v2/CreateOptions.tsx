// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment, useEffect } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes } from '@uifabric/fluent-theme';
import { BotTemplate } from '@bfc/shared';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { navigate, RouteComponentProps } from '@reach/router';
import querystring from 'query-string';
import axios from 'axios';
import { useRecoilValue } from 'recoil';

import { DialogCreationCopy } from '../../../constants';
import { getAliasFromPayload, isElectron } from '../../../utils/electronUtil';
import { creationFlowTypeState, userHasNodeInstalledState } from '../../../recoilModel';
import { InstallDepModal } from '../../InstallDepModal';
import TelemetryClient from '../../../telemetry/TelemetryClient';

import { CreateBotV2 } from './CreateBot';

// -------------------- CreateOptions -------------------- //
type CreateOptionsProps = {
  templates: BotTemplate[];
  onDismiss: () => void;
  onNext: (templateName: string, templateLanguage: string, urlData?: string) => void;
  onJumpToOpenModal: (search?: string) => void;
  fetchReadMe: (moduleName: string) => {};
} & RouteComponentProps<{}>;

export function CreateOptionsV2(props: CreateOptionsProps) {
  const [isOpenOptionsModal, setIsOpenOptionsModal] = useState(false);
  const [option, setOption] = useState('Create');
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
  const { templates, onDismiss, onNext, onJumpToOpenModal, fetchReadMe } = props;
  const [showNodeModal, setShowNodeModal] = useState(false);
  const userHasNode = useRecoilValue(userHasNodeInstalledState);
  const creationFlowType = useRecoilValue(creationFlowTypeState);

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
    TelemetryClient.track('NewBotDialogOpened', {
      isSkillBot: creationFlowType === 'Skill',
      fromAbsHandoff: false,
    });
    setIsOpenCreateModal(true);
  }, [props.location?.search]);
  const dialogWrapperProps = DialogCreationCopy.CREATE_OPTIONS;

  const customerStyle = {
    dialog: {
      title: {
        fontWeight: FontWeights.bold,
        fontSize: FontSizes.size20,
        paddingTop: '14px',
        paddingBottom: '11px',
      },
      subText: {
        fontSize: FontSizes.size14,
      },
    },
    modal: {
      main: {
        maxWidth: '80% !important',
        width: '480px !important',
      },
    },
  };

  const options: IChoiceGroupOption[] = [
    { key: 'Create', text: formatMessage('Create a new bot') },
    { key: 'Connect', text: formatMessage('Connect to an existing bot') },
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

  useEffect(() => {
    if (!userHasNode) {
      setShowNodeModal(true);
    }
  }, [userHasNode]);

  const dialogWrapperProps =
    creationFlowType === 'Skill' ? DialogCreationCopy.CREATE_NEW_SKILLBOT : DialogCreationCopy.CREATE_NEW_BOT_V2;

  return (
    <Fragment>
      <DialogWrapper
        isOpen={isOpenOptionsModal}
        {...dialogWrapperProps}
        customerStyle={customerStyle}
        dialogType={DialogTypes.Customer}
        onDismiss={onDismiss}
      >
        <ChoiceGroup required defaultSelectedKey="Create" options={options} onChange={handleChange} />
        <DialogFooter>
          <PrimaryButton data-testid="NextStepButton" text={formatMessage('Open')} onClick={handleJumpToNext} />
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        </DialogFooter>
      </DialogWrapper>
      <CreateBotV2
        fetchReadMe={fetchReadMe}
        isOpen={isOpenCreateModal}
        location={props.location}
        templates={templates}
        onDismiss={onDismiss}
        onNext={onNext}
      />
      {isElectron() && showNodeModal && (
        <InstallDepModal
          downloadLink={'https://nodejs.org/en/download/'}
          downloadLinkText={formatMessage('Install Node.js')}
          text={formatMessage(
            'Bot Framework Composer requires Node.js in order to create and run a new bot. Click “Install Node.js” to install the latest version. You will need to restart Composer after installing Node.'
          )}
          title={formatMessage('Node.js required')}
          onDismiss={() => setShowNodeModal(false)}
        />
      )}
    </Fragment>
  );
}
