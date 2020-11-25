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

import { PublishType } from '../../recoilModel/types';
import { userSettingsState } from '../../recoilModel';
import { PluginHost } from '../../components/PluginHost/PluginHost';
import { PluginAPI } from '../../plugins/api';

import { label, defaultPublishSurface, pvaPublishSurface } from './styles';

interface CreatePublishTargetProps {
  closeDialog: () => void;
  current: PublishTarget | null;
  targets: PublishTarget[];
  types: PublishType[];
  updateSettings: (name: string, type: string, configuration: string) => Promise<void>;
}

const CreatePublishTarget: React.FC<CreatePublishTargetProps> = (props) => {
  const { current } = props;
  const [targetType, setTargetType] = useState<string | undefined>(current?.type);
  const [name, setName] = useState(current ? current.name : '');
  const [config, setConfig] = useState(current ? JSON.parse(current.configuration) : undefined);
  const [errorMessage, setErrorMsg] = useState('');
  const [pluginConfigIsValid, setPluginConfigIsValid] = useState(false);
  const userSettings = useRecoilValue(userSettingsState);

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
      }
    }
  };

  const selectedTarget = useMemo(() => {
    return props.types.find((t) => t.name === targetType);
  }, [props.targets, targetType]);

  const targetBundleId = useMemo(() => {
    return targetType ? props.types.find((t) => t.name === targetType)?.bundleId : undefined;
  }, [props.targets, targetType]);

  const updateName = (e, newName) => {
    setErrorMsg('');
    setName(newName);
    isNameValid(newName);
  };

  const saveDisabled = useMemo(() => {
    const disabled = !targetType || !name || !!errorMessage;
    if (targetBundleId) {
      // plugin config must also be valid
      return disabled || !pluginConfigIsValid;
    }
    return disabled;
  }, [errorMessage, name, pluginConfigIsValid, targetType]);

  // setup plugin APIs
  useEffect(() => {
    PluginAPI.publish.setPublishConfig = (config) => updateConfig(config);
    PluginAPI.publish.setConfigIsValid = (valid) => setPluginConfigIsValid(valid);
    PluginAPI.publish.useConfigBeingEdited = () => [current ? JSON.parse(current.configuration) : undefined];
  }, [current, targetType, name]);

  const submit = async (_e) => {
    if (targetType) {
      await props.updateSettings(name, targetType, JSON.stringify(config) || '{}');
      props.closeDialog();
    }
  };

  const publishTargetContent = useMemo(() => {
    if (selectedTarget?.bundleId) {
      let publishSurfaceStyles;
      switch (selectedTarget.extensionId) {
        case 'pva-publish-composer':
          publishSurfaceStyles = pvaPublishSurface;
          break;

        default:
          publishSurfaceStyles = defaultPublishSurface;
          break;
      }

      // render custom plugin view
      return (
        <div css={publishSurfaceStyles}>
          <PluginHost bundleId={selectedTarget.bundleId} pluginName={selectedTarget.extensionId} pluginType="publish" />
        </div>
      );
    }
    // render default instruction / schema editor view
    return (
      <Fragment>
        {selectedTarget?.instructions && <p>{selectedTarget?.instructions}</p>}
        <div css={label}>{formatMessage('Publish Configuration')}</div>
        <JsonEditor
          key={targetType}
          editorSettings={userSettings.codeEditor}
          height={200}
          schema={selectedTarget?.schema}
          value={config}
          onChange={updateConfig}
        />
        <button hidden disabled={saveDisabled} type="submit" />
      </Fragment>
    );
  }, [selectedTarget, targetType, saveDisabled]);

  return (
    <Fragment>
      <form onSubmit={submit}>
        <TextField
          defaultValue={props.current ? props.current.name : ''}
          disabled={props.current ? true : false}
          errorMessage={errorMessage}
          label={formatMessage('Name')}
          placeholder={formatMessage('My Publish Profile')}
          onChange={updateName}
        />
        <Dropdown
          defaultSelectedKey={props.current ? props.current.type : null}
          label={formatMessage('Publish Destination Type')}
          options={targetTypes}
          placeholder={formatMessage('Choose One')}
          onChange={updateType}
        />
        {publishTargetContent}
      </form>
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={props.closeDialog} />
        <PrimaryButton disabled={saveDisabled} text={formatMessage('Save')} onClick={submit} />
      </DialogFooter>
    </Fragment>
  );
};

export { CreatePublishTarget };
