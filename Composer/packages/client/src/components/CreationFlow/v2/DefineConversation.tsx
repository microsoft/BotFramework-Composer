// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

//TODO: Remove Path module
import Path from 'path';

import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import React, { Fragment, useEffect, useCallback, useMemo, useState } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { RouteComponentProps } from '@reach/router';
import querystring from 'query-string';
import { FontWeights } from '@uifabric/styling';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { useRecoilValue } from 'recoil';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { QnABotTemplateId } from '@bfc/shared';

import {
  DialogCreationCopy,
  nameRegexV2,
  invalidNameCharRegex,
  mockLanguageOptions,
  runtimeOptions,
  defaultPrimaryLanguage,
  defaultRuntime,
} from '../../../constants';
import { FieldConfig, useForm } from '../../../hooks/useForm';
import { StorageFolder } from '../../../recoilModel/types';
import { createNotification } from '../../../recoilModel/dispatchers/notification';
import { ImportSuccessNotificationWrapper } from '../../ImportModal/ImportSuccessNotification';
import { dispatcherState } from '../../../recoilModel';
import { LocationSelectContent } from '../LocationSelectContent';

// -------------------- Styles -------------------- //

const textFieldlabel = {
  label: {
    root: [
      {
        fontWeight: FontWeights.semibold,
      },
    ],
  },
};

const name = {
  subComponentStyles: textFieldlabel,
};

const description = {
  subComponentStyles: textFieldlabel,
};

const halfstack = {
  root: [
    {
      flexBasis: '50%',
    },
  ],
};

const stackinput = {
  root: [
    {
      marginBottom: '1rem',
    },
  ],
};

// -------------------- DefineConversation -------------------- //

const MAXTRYTIMES = 10000;

type DefineConversationFormData = {
  name: string;
  description: string;
  schemaUrl: string;
  primaryLanguage: string;
  runtimeChoice: string;
  location?: string;
  templateVersion?: string;

  pvaData?: {
    templateDir?: string; // location of the imported template
    eTag?: string; // e tag used for content sync between composer and imported bot content
    urlSuffix?: string; // url to deep link to after creation
    alias?: string; // identifier that is used to track bots between imports
    preserveRoot?: boolean; // identifier that is used to determine ay project file renames upon creation
  };
};

type DefineConversationProps = {
  createFolder: (path: string, name: string) => void;
  updateFolder: (path: string, oldName: string, newName: string) => void;
  onSubmit: (formData: DefineConversationFormData, templateId: string) => void;
  onDismiss: () => void;
  onCurrentPathUpdate: (newPath?: string, storageId?: string) => void;
  onGetErrorMessage?: (text: string) => void;
  focusedStorageFolder: StorageFolder;
} & RouteComponentProps<{
  templateId: string;
  location: string;
}>;

const DefineConversationV2: React.FC<DefineConversationProps> = (props) => {
  const {
    onSubmit,
    onDismiss,
    onCurrentPathUpdate,
    templateId,
    focusedStorageFolder,
    createFolder,
    updateFolder,
  } = props;
  const files = focusedStorageFolder?.children ?? [];
  const writable = focusedStorageFolder.writable;

  // template ID is populated by npm package name which needs to be formatted
  const normalizeTemplateId = (templateId?: string) => {
    if (templateId) {
      return templateId.replace(invalidNameCharRegex, '_');
    }
  };

  const getDefaultName = () => {
    let i = -1;
    const bot = normalizeTemplateId(templateId);
    let defaultName = '';
    do {
      i++;
      defaultName = `${bot}_${i}`;
    } while (
      files.some((file) => {
        return file.name.toLowerCase() === defaultName.toLowerCase();
      }) &&
      i < MAXTRYTIMES
    );
    return defaultName;
  };
  const { addNotification } = useRecoilValue(dispatcherState);

  const formConfig: FieldConfig<DefineConversationFormData> = {
    name: {
      required: true,
      validate: (value) => {
        if (!value || !nameRegexV2.test(`${value}`)) {
          // botName is used as used when generating runtime namespaces which cannot start with a number
          if (value && !isNaN(+value.toString().charAt(0))) {
            return formatMessage('Bot name cannot not start with a number');
          } else {
            return formatMessage('Spaces and special characters are not allowed. Use letters, numbers, or _.');
          }
        }

        const newBotPath =
          focusedStorageFolder !== null && Object.keys(focusedStorageFolder as Record<string, any>).length
            ? Path.join(focusedStorageFolder.parent, focusedStorageFolder.name, `${value}`)
            : '';
        if (
          files.some((bot) => {
            return bot.path.toLowerCase() === newBotPath.toLowerCase();
          })
        ) {
          return formatMessage('Duplicate name');
        }
      },
    },
    description: {
      required: false,
    },
    primaryLanguage: {
      required: false,
    },
    runtimeChoice: {
      required: false,
    },
    schemaUrl: {
      required: false,
    },
    location: {
      required: true,
      defaultValue:
        focusedStorageFolder !== null && Object.keys(focusedStorageFolder as Record<string, any>).length
          ? Path.join(focusedStorageFolder.parent, focusedStorageFolder.name)
          : '',
    },
  };
  const { formData, formErrors, hasErrors, updateField, updateForm, validateForm } = useForm(formConfig);
  const [isImported, setIsImported] = useState<boolean>(false);

  useEffect(() => {
    if (props.location?.state) {
      const { imported } = props.location.state;
      setIsImported(imported);
    }
  }, [props.location?.state]);

  useEffect(() => {
    const formData: DefineConversationFormData = {
      name: getDefaultName(),
      primaryLanguage: defaultPrimaryLanguage,
      runtimeChoice: defaultRuntime,
      description: '',
      schemaUrl: '',
      location:
        focusedStorageFolder !== null && Object.keys(focusedStorageFolder as Record<string, any>).length
          ? Path.join(focusedStorageFolder.parent, focusedStorageFolder.name)
          : '',
    };
    if (props.location?.search) {
      const decoded = decodeURIComponent(props.location.search);
      const { name, description, schemaUrl } = querystring.parse(decoded);
      if (description) {
        formData.description = description as string;
      }

      if (schemaUrl) {
        formData.schemaUrl = schemaUrl as string;
      }

      if (name) {
        formData.name = name as string;
      } else {
        formData.name = getDefaultName();
      }
    }
    updateForm(formData);
  }, [templateId]);

  useEffect(() => {
    validateForm();
  }, [focusedStorageFolder]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (hasErrors) {
        return;
      }

      // handle extra properties in the case of an imported bot project
      const dataToSubmit = {
        ...formData,
      };
      if (props.location?.state) {
        const { alias, eTag, imported, templateDir, urlSuffix } = props.location.state;

        if (imported) {
          dataToSubmit.pvaData = {
            templateDir: templateDir,
            eTag: eTag,
            urlSuffix: urlSuffix,
            alias: alias,
            preserveRoot: true,
          };

          // create a notification to indicate import success
          const notification = createNotification({
            type: 'success',
            title: '',
            onRenderCardContent: ImportSuccessNotificationWrapper({
              importedToExisting: false,
            }),
          });
          addNotification(notification);
        }
      }

      onSubmit({ ...dataToSubmit }, templateId || '');
    },
    [hasErrors, formData]
  );

  const onCurrentPathUpdateWrap = (newPath: string, storageId?: string) => {
    onCurrentPathUpdate(newPath, storageId);
    updateField('location', newPath);
  };

  useEffect(() => {
    const location =
      focusedStorageFolder !== null && Object.keys(focusedStorageFolder as Record<string, any>).length
        ? Path.join(focusedStorageFolder.parent, focusedStorageFolder.name)
        : '';
    updateField('location', location);
  }, [focusedStorageFolder]);

  const locationSelectContent = useMemo(() => {
    return (
      <LocationSelectContent
        createFolder={createFolder}
        focusedStorageFolder={focusedStorageFolder}
        operationMode={{ read: true, write: true }}
        updateFolder={updateFolder}
        onCurrentPathUpdate={onCurrentPathUpdateWrap}
      />
    );
  }, [focusedStorageFolder]);
  const dialogCopy = isImported ? DialogCreationCopy.IMPORT_BOT_PROJECT : DialogCreationCopy.DEFINE_BOT_PROJECT;

  return (
    <Fragment>
      <DialogWrapper isOpen {...dialogCopy} dialogType={DialogTypes.CreateFlow} onDismiss={onDismiss}>
        <form onSubmit={handleSubmit}>
          <input style={{ display: 'none' }} type="submit" />
          <Stack horizontal styles={stackinput} tokens={{ childrenGap: '2rem' }}>
            <StackItem grow={0} styles={halfstack}>
              <TextField
                autoFocus
                required
                data-testid="NewDialogName"
                errorMessage={formErrors.name}
                label={formatMessage('Name')}
                styles={name}
                value={formData.name}
                onChange={(_e, val) => updateField('name', val)}
              />
            </StackItem>
            <StackItem grow={0} styles={halfstack}>
              <TextField
                multiline
                label={formatMessage('Description')}
                resizable={false}
                styles={description}
                value={formData.description}
                onChange={(_e, val) => updateField('description', val)}
              />
            </StackItem>
          </Stack>
          <Stack horizontal styles={stackinput} tokens={{ childrenGap: '2rem' }}>
            <StackItem grow={0} styles={halfstack}>
              <Dropdown
                data-testid="NewDialogPrimaryLanguage"
                label={formatMessage('Primary Language')}
                options={mockLanguageOptions}
                selectedKey={formData.primaryLanguage}
                onChange={(_e, option) => updateField('primaryLanguage', option?.key.toString())}
              />
            </StackItem>
            <StackItem grow={0} styles={halfstack}>
              <Dropdown
                data-testid="NewDialogRuntimeType"
                label={formatMessage('Runtime type')}
                options={runtimeOptions}
                selectedKey={formData.runtimeChoice}
                onChange={(_e, option) => updateField('runtimeChoice', option?.key.toString())}
              />
            </StackItem>
          </Stack>
          {locationSelectContent}
          <DialogFooter>
            <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
            <PrimaryButton
              data-testid="SubmitNewBotBtn"
              disabled={hasErrors || !writable}
              text={templateId === QnABotTemplateId ? formatMessage('Next') : formatMessage('OK')}
              onClick={handleSubmit}
            />
          </DialogFooter>
        </form>
      </DialogWrapper>
    </Fragment>
  );
};

export default DefineConversationV2;
