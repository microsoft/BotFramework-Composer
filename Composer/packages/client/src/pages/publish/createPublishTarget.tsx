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
import { userSettingsState } from '../../recoilModel';
import { PluginAPI } from '../../plugins/api';
import { PluginHost } from '../../components/PluginHost/PluginHost';
import { dispatcherState } from '../../recoilModel';

import { label, separator, customPublishUISurface } from './styles';
interface CreatePublishTargetProps {
  projectId: string;
  closeDialog: () => void;
  current: { index: number; item: PublishTarget } | null;
  targets: PublishTarget[];
  types: PublishType[];
  updateSettings: (name: string, type: string, configuration: string, editTarget: any) => Promise<void>;
  setDialogProps: (value: any) => void;
}

const CreatePublishTarget: React.FC<CreatePublishTargetProps> = (props) => {
  const { current, projectId } = props;
  const [targetType, setTargetType] = useState<string>(current?.item.type || '');
  const [name, setName] = useState(current ? current.item.name : '');
  const [config, setConfig] = useState(current ? JSON.parse(current.item.configuration) : undefined);
  const [errorMessage, setErrorMsg] = useState('');
  const [pluginConfigIsValid, setPluginConfigIsValid] = useState(false);
  const [page, setPage] = useState(1);

  const userSettings = useRecoilValue(userSettingsState);
  const { provisionToTarget, getProvisionStatus } = useRecoilValue(dispatcherState);

  const targetTypes = useMemo(() => {
    return props.types.map((t) => ({ key: t.name, text: t.description }));
  }, [props.targets]);

  const updateType = (_e, option?: IDropdownOption) => {
    const type = props.types.find((t) => t.name === option?.key);

    if (type) {
      setTargetType(type.name);
    }
  };

  const updateConfig = (newConfig) => {
    setConfig(newConfig);
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
    if (page === 1) {
      return saveDisabled;
    } else if (page > 1) {
      return !pluginConfigIsValid;
    }
  }, [saveDisabled, pluginConfigIsValid]);
  // setup plugin APIs
  useEffect(() => {
    PluginAPI.publish.setPublishConfig = (config) => updateConfig(config);
    PluginAPI.publish.setConfigIsValid = (valid) => setPluginConfigIsValid(valid);
    PluginAPI.publish.useConfigBeingEdited = () => [current ? JSON.parse(current.item.configuration) : undefined];
    PluginAPI.publish.closeDialog = props.closeDialog;
  }, [current]);

  // setup plugin APIs so that the provisioning plugin can initiate the process from inside the iframe
  useEffect(() => {
    PluginAPI.publish.startProvision = async (config) => {
      console.log('BEGIN A PROVISION FOR PROJECT ', projectId, 'USING CONFIG', config);
      const fullConfig = { ...config, name: name, type: targetType };
      console.log(fullConfig);
      provisionToTarget(fullConfig, config.type, projectId);
      getProvisionStatus(projectId, fullConfig);
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

  const PageOne = useMemo(() => {
    return (
      <div style={{ width: '60%' }}>
        <form>
          <TextField
            defaultValue={props.current ? props.current.item.name : ''}
            errorMessage={errorMessage}
            label={formatMessage('Create profile name')}
            placeholder={formatMessage('My Staging Environment')}
            readOnly={props.current ? true : false}
            onChange={updateName}
          />
          <Dropdown
            defaultSelectedKey={props.current ? props.current.item.type : null}
            label={formatMessage('Select your publish target')}
            options={targetTypes}
            placeholder={formatMessage('Choose One')}
            onChange={updateType}
          />
        </form>
        {props.current && (
          <Fragment>
            {instructions && <p>{instructions}</p>}
            <div css={label}>{formatMessage('Publish Configuration')}</div>
            <JsonEditor
              key={targetType}
              editorSettings={userSettings.codeEditor}
              height={200}
              schema={schema}
              value={config}
              onChange={updateConfig}
            />
          </Fragment>
        )}
      </div>
    );
  }, [targetTypes, errorMessage, instructions, schema, userSettings]);

  const publishTargetContent = useMemo(() => {
    if (page === 1) {
      return (
        <Fragment>
          {PageOne}
          <Separator css={separator} />
          <DialogFooter>
            {/* <Persona {...examplePersona} size={PersonaSize.size24} /> */}
            <DefaultButton text={formatMessage('Cancel')} onClick={props.closeDialog} />
            {current ? (
              <PrimaryButton disabled={saveDisabled} text={formatMessage('Save')} onClick={submit} />
            ) : (
              <PrimaryButton
                disabled={nextDisabled}
                text={formatMessage('Next')}
                onClick={() => {
                  setPage(page + 1);
                }}
              />
            )}
          </DialogFooter>
        </Fragment>
      );
    } else {
      return (
        <PluginHost
          bundleId={targetBundleId}
          extraIframeStyles={[customPublishUISurface]}
          pluginName={targetType}
          pluginType="publish"
        ></PluginHost>
      );
    }
  }, [page, targetType, PageOne]);

  // const examplePersona: IPersonaSharedProps = {
  //   text: 'Somebody',
  //   secondaryText: 'Software Engineer',
  //   tertiaryText: 'In a meeting',
  //   optionalText: 'Available at 4:00pm',
  // };

  return <Fragment>{publishTargetContent}</Fragment>;
};

export { CreatePublishTarget };
