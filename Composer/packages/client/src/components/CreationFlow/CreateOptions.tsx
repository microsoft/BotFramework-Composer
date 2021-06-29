// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment, useEffect } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Link } from 'office-ui-fabric-react/lib/Link';
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

import { DialogCreationCopy } from '../../constants';
import { getAliasFromPayload, isElectron } from '../../utils/electronUtil';
import { creationFlowTypeState, userHasNodeInstalledState } from '../../recoilModel';
import { InstallDepModal } from '../InstallDepModal';
import TelemetryClient from '../../telemetry/TelemetryClient';

import { CreateBot } from './CreateBot';

// -------------------- CreateOptions -------------------- //
type CreateOptionsProps = {
  templates: BotTemplate[];
  localTemplatePath: string;
  onUpdateLocalTemplatePath: (path: string) => void;
  onDismiss: () => void;
  onNext: (templateName: string, templateLanguage: string, urlData?: string) => void;
  onJumpToOpenModal: (search?: string) => void;
  fetchReadMe: (moduleName: string) => {};
} & RouteComponentProps<{}>;

export function CreateOptions(props: CreateOptionsProps) {
  const [isOpenOptionsModal, setIsOpenOptionsModal] = useState(true);
  const [option, setOption] = useState('Create');
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
  const {
    templates,
    onDismiss,
    onNext,
    onJumpToOpenModal,
    fetchReadMe,
    onUpdateLocalTemplatePath,
    localTemplatePath,
  } = props;
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

  useEffect(() => {
    if (!userHasNode) {
      setShowNodeModal(true);
    }
  }, [userHasNode]);

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
          <Stack>
            <Stack.Item>
              <Link href="http://aka.ms/composer-abs-quickstart" target="_blank">
                {formatMessage('Learn more')}
              </Link>
            </Stack.Item>
            <Stack.Item>
              <Stack horizontal>
                <PrimaryButton data-testid="NextStepButton" text={formatMessage('Next')} onClick={handleJumpToNext} />
                <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
              </Stack>
            </Stack.Item>
          </Stack>
        </DialogFooter>
      </DialogWrapper>
      <CreateBot
        fetchReadMe={fetchReadMe}
        isOpen={isOpenCreateModal}
        localTemplatePath={localTemplatePath}
        location={props.location}
        templates={templates}
        onDismiss={onDismiss}
        onNext={onNext}
        onUpdateLocalTemplatePath={onUpdateLocalTemplatePath}
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
