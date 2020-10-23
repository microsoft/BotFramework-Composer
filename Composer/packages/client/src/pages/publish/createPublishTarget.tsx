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
// import { DialogType } from 'office-ui-fabric-react/lib/Dialog';
// import { IPersonaSharedProps, Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
// import { Link } from 'office-ui-fabric-react/lib/Link';

import { PublishType } from '../../recoilModel/types';
import { userSettingsState, currentProjectIdState } from '../../recoilModel';
import { PluginAPI } from '../../plugins/api';
import { PluginHost } from '../../components/PluginHost/PluginHost';
import { dispatcherState } from '../../recoilModel';

import { label, separator, customPublishUISurface } from './styles';
interface CreatePublishTargetProps {
  closeDialog: () => void;
  current: { index: number; item: PublishTarget } | null;
  targets: PublishTarget[];
  types: PublishType[];
  updateSettings: (name: string, type: string, configuration: string, editTarget: any) => Promise<void>;
  setDialogProps: (value: any) => void;
}

const PageTypes = {
  AddProfile: 'add',
  EditProfile: 'edit',
  ConfigProvision: 'config',
  ReviewResource: 'review',
};

const CreatePublishTarget: React.FC<CreatePublishTargetProps> = (props) => {
  const { current } = props;
  const [targetType, setTargetType] = useState<string>(current?.item.type || '');
  const [name, setName] = useState(current ? current.item.name : '');
  const [config, setConfig] = useState(current ? JSON.parse(current.item.configuration) : undefined);
  const [errorMessage, setErrorMsg] = useState('');
  const [pluginConfigIsValid, setPluginConfigIsValid] = useState(false);
  const [page, setPage] = useState(current ? PageTypes.EditProfile : PageTypes.AddProfile);

  const userSettings = useRecoilValue(userSettingsState);
  const projectId = useRecoilValue(currentProjectIdState);
  const { provisionToTarget } = useRecoilValue(dispatcherState);

  const targetTypes = useMemo(() => {
    return props.types.map((t) => ({ key: t.name, text: t.description }));
  }, [props.targets]);

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

  const instructions: string | undefined = useMemo((): string | undefined => {
    return targetType ? props.types.find((t) => t.name === targetType)?.instructions : '';
  }, [props.targets, targetType]);

  const schema = useMemo(() => {
    return targetType ? props.types.find((t) => t.name === targetType)?.schema : undefined;
  }, [props.targets, targetType]);

  const targetBundleId = useMemo(() => {
    return (targetType && props.types.find((t) => t.name === targetType)?.bundleId) || '';
  }, [props.targets, targetType]);

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
    PluginAPI.publish.onBack = () => setPage(PageTypes.AddProfile);
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
  }, [projectId, name, targetType]);

  const submit = async (_e) => {
    if (targetType) {
      await props.updateSettings(name, targetType, JSON.stringify(config) || '{}', current);
      props.closeDialog();
    }
  };

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
          {instructions && <p>{instructions}</p>}
          <div css={label}>{formatMessage('Publish Configuration')}</div>
          <JsonEditor
            key={targetType}
            editorSettings={userSettings.codeEditor}
            height={200}
            schema={schema}
            value={config}
            onChange={setConfig}
          />
        </Fragment>
      </div>
    );
  }, [instructions, schema, userSettings]);

  const PageContent = useMemo(() => {
    switch (page) {
      case PageTypes.AddProfile:
        return (
          <Fragment>
            <div style={{ width: '60%' }}>{FormInPage}</div>
            <Separator css={separator} />
            <DialogFooter>
              {/* <Persona {...examplePersona} size={PersonaSize.size24} /> */}
              <DefaultButton text={formatMessage('Cancel')} onClick={props.closeDialog} />
              <PrimaryButton
                disabled={nextDisabled}
                text={formatMessage('Next')}
                onClick={() => {
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
              {/* <Persona {...examplePersona} size={PersonaSize.size24} /> */}
              <DefaultButton text={formatMessage('Cancel')} onClick={props.closeDialog} />
              <PrimaryButton disabled={saveDisabled} text={formatMessage('Save')} onClick={submit} />
            </DialogFooter>
          </Fragment>
        );
      case PageTypes.ConfigProvision:
      case PageTypes.ReviewResource:
        return (
          <PluginHost
            bundleId={targetBundleId}
            extraIframeStyles={[customPublishUISurface]}
            pluginName={targetType}
            pluginType="publish"
          ></PluginHost>
        );
    }
  }, [page, nextDisabled, saveDisabled]);

  // const examplePersona: IPersonaSharedProps = {
  //   text: 'Somebody',
  //   secondaryText: 'Software Engineer',
  //   tertiaryText: 'In a meeting',
  //   optionalText: 'Available at 4:00pm',
  // };

  return PageContent;
};

export { CreatePublishTarget };
