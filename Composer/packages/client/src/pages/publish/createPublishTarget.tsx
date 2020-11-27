// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Fragment, useState, useMemo, useEffect } from 'react';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { JsonEditor } from '@bfc/code-editor';
import { useRecoilValue } from 'recoil';
import { PublishTarget } from '@bfc/shared';
import { Separator } from 'office-ui-fabric-react/lib/Separator';

import { PublishProfileDialog } from '../../constants';
import { PublishType } from '../../recoilModel/types';
import { userSettingsState, currentProjectIdState, currentUserState } from '../../recoilModel';
import { PluginAPI } from '../../plugins/api';
import { PluginHost } from '../../components/PluginHost/PluginHost';
import { dispatcherState } from '../../recoilModel';

import { label, separator, defaultPublishSurface, pvaPublishSurface, azurePublishSurface } from './styles';

interface CreatePublishTargetProps {
  closeDialog: () => void;
  current: { index: number; item: PublishTarget } | null;
  targets: PublishTarget[];
  types: PublishType[];
  setDialogProps: (value) => void;
  updateSettings: (name: string, type: string, configuration: string, editTarget: any) => Promise<void>;
}

const PageTypes = {
  AddProfile: 'add',
  EditProfile: 'edit',
  ConfigProvision: 'config',
};

const CreatePublishTarget: React.FC<CreatePublishTargetProps> = (props) => {
  const { current, setDialogProps } = props;
  const [targetType, setTargetType] = useState<string>(current?.item.type || '');
  const [name, setName] = useState(current ? current.item.name : '');
  const [config, setConfig] = useState(current ? JSON.parse(current.item.configuration) : undefined);
  const [errorMessage, setErrorMsg] = useState('');
  const [pluginConfigIsValid, setPluginConfigIsValid] = useState(false);
  const [page, setPage] = useState(current ? PageTypes.EditProfile : PageTypes.AddProfile);

  const userSettings = useRecoilValue(userSettingsState);
  const currentUser = useRecoilValue(currentUserState);
  // const graphToken = useRecoilValue(grahpTokenState);
  const projectId = useRecoilValue(currentProjectIdState);
  const { provisionToTarget } = useRecoilValue(dispatcherState);

  const targetTypes = useMemo(() => {
    return props.types.map((t) => ({ key: t.name, text: t.description }));
  }, [props.types]);

  const updateType = (_e, option?: IDropdownOption) => {
    const type = props.types.find((t) => t.name === option?.key);

    if (type) {
      setTargetType(type.name);
    }
  };

  const isNameValid = (newName) => {
    if (!newName || newName.trim() === '') {
      setErrorMsg(formatMessage('Must have a name'));
    } else {
      const exists = !!props.targets?.find((t) => t.name.toLowerCase() === newName?.toLowerCase());

      if (exists) {
        setErrorMsg(formatMessage('A profile with that name already exists.'));
      } else {
        setErrorMsg('');
      }
    }
  };

  const selectedType = useMemo(() => {
    return props.types.find((t) => t.name === targetType);
  }, [props.types, targetType]);

  const updateName = (e, newName) => {
    setName(newName);
    isNameValid(newName);
  };

  const saveDisabled = useMemo(() => {
    return !targetType || !name || !!errorMessage;
  }, [errorMessage, name, targetType]);

  const nextDisabled = useMemo(() => {
    if (page === PageTypes.AddProfile) {
      return saveDisabled;
    } else if (page !== PageTypes.EditProfile) {
      return !pluginConfigIsValid;
    }
  }, [saveDisabled, pluginConfigIsValid]);
  // setup plugin APIs
  useEffect(() => {
    PluginAPI.publish.setPublishConfig = (config) => setConfig(config);
    PluginAPI.publish.setConfigIsValid = (valid) => setPluginConfigIsValid(valid);
    PluginAPI.publish.useConfigBeingEdited = () => [current ? JSON.parse(current.item.configuration) : undefined];
    PluginAPI.publish.closeDialog = props.closeDialog;
    PluginAPI.publish.onBack = () => {
      setPage(PageTypes.AddProfile);
      setDialogProps(PublishProfileDialog.ADD_PROFILE);
    };
  }, [current]);

  // setup plugin APIs so that the provisioning plugin can initiate the process from inside the iframe
  useEffect(() => {
    PluginAPI.publish.startProvision = async (config) => {
      console.log('BEGIN A PROVISION FOR PROJECT ', projectId, 'USING CONFIG', config);
      const fullConfig = { ...config, name: name, type: targetType };
      console.log(fullConfig);
      provisionToTarget(fullConfig, config.type, projectId);
    };
    PluginAPI.publish.currentProjectId = () => {
      return projectId;
    };
    PluginAPI.publish.getSchema = () => {
      return props.types.find((t) => t.name === targetType)?.schema;
    };
    PluginAPI.publish.getType = () => {
      return targetType;
    };
    PluginAPI.publish.savePublishConfig = (config) => {
      console.log(config);
      props.updateSettings(name, targetType, JSON.stringify(config) || '{}', current);
    };
  }, [projectId, name, targetType]);

  const submit = useMemo(
    () => (_e) => {
      if (targetType) {
        console.log(config);
        props.updateSettings(name, targetType, JSON.stringify(config) || '{}', current);
        props.closeDialog();
      }
    },
    [targetType, config, name, current]
  );

  const FormInPage = useMemo(() => {
    return (
      <form>
        <TextField
          defaultValue={name}
          errorMessage={errorMessage}
          label={formatMessage('Create profile name')}
          placeholder={formatMessage('My Staging Environment')}
          readOnly={props.current ? true : false}
          onChange={updateName}
        />
        <Dropdown
          defaultSelectedKey={targetType}
          label={formatMessage('Select your publish target')}
          options={targetTypes}
          placeholder={formatMessage('Choose One')}
          onChange={updateType}
        />
      </form>
    );
  }, [name, targetType, targetTypes, errorMessage]);

  const PageEditProfile = useMemo(() => {
    return (
      <div style={{ width: '60%' }}>
        {FormInPage}
        <Fragment>
          {selectedType?.instructions && <p>{selectedType.instructions}</p>}
          <div css={label}>{formatMessage('Publish Configuration')}</div>
          <JsonEditor
            key={targetType}
            editorSettings={userSettings.codeEditor}
            height={200}
            schema={selectedType?.schema}
            value={config}
            onChange={setConfig}
          />
        </Fragment>
      </div>
    );
  }, [targetType, selectedType, userSettings, FormInPage, config]);

  const PageContent = useMemo(() => {
    switch (page) {
      case PageTypes.AddProfile:
        return (
          <Fragment>
            <div style={{ width: '60%', minHeight: '300px' }}>{FormInPage}</div>
            <Separator css={separator} />
            <DialogFooter>
              <DefaultButton text={formatMessage('Cancel')} onClick={props.closeDialog} />
              <PrimaryButton
                disabled={nextDisabled}
                text={formatMessage('Next')}
                onClick={async () => {
                  setPage(PageTypes.ConfigProvision);
                }}
              />
            </DialogFooter>
          </Fragment>
        );
      case PageTypes.EditProfile:
        return (
          <Fragment>
            {PageEditProfile}
            <Separator css={separator} />
            <DialogFooter>
              <DefaultButton text={formatMessage('Cancel')} onClick={props.closeDialog} />
              <PrimaryButton disabled={saveDisabled} text={formatMessage('Save')} onClick={submit} />
            </DialogFooter>
          </Fragment>
        );
      case PageTypes.ConfigProvision:
        if (selectedType?.bundleId) {
          // render custom plugin view
          let publishSurfaceStyles;
          switch (selectedType.extensionId) {
            case 'pva-publish-composer':
              publishSurfaceStyles = pvaPublishSurface;
              break;
            case 'azurePublish':
              publishSurfaceStyles = azurePublishSurface;
              break;
            default:
              publishSurfaceStyles = defaultPublishSurface;
              break;
          }
          return (
            <div css={publishSurfaceStyles}>
              <PluginHost bundleId={selectedType.bundleId} pluginName={selectedType.extensionId} pluginType="publish" />
            </div>
          );
        }
    }
    return null;
  }, [currentUser, config, page, FormInPage, PageEditProfile, nextDisabled, saveDisabled, selectedType, submit]);

  return PageContent;
};

export { CreatePublishTarget };
