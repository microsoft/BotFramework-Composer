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
import { csharpFeedKey, functionsRuntimeKey, nodeFeedKey, QnABotTemplateId } from '@bfc/shared';
import { RuntimeType, webAppRuntimeKey } from '@bfc/shared';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { DialogCreationCopy, nameRegexV2 } from '../../../constants';
import { FieldConfig, useForm } from '../../../hooks/useForm';
import { StorageFolder } from '../../../recoilModel/types';
import { createNotification } from '../../../recoilModel/dispatchers/notification';
import { ImportSuccessNotificationWrapper } from '../../ImportModal/ImportSuccessNotification';
import { dispatcherState, templateProjectsState } from '../../../recoilModel';
import { LocationSelectContent } from '../LocationSelectContent';
import { getAliasFromPayload, Profile } from '../../../utils/electronUtil';

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
  runtimeLanguage: string;
  runtimeType: RuntimeType;
  location?: string;
  templateVersion?: string;
  profile?: Profile; // abs payload to create bot
  source?: string; // where the payload come from
  alias?: string; // identifier that is used to track bots between imports

  pvaData?: {
    templateDir?: string; // location of the imported template
    eTag?: string; // e tag used for content sync between composer and imported bot content
    urlSuffix?: string; // url to deep link to after creation
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
  runtimeLanguage: string;
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
  const runtimeLanguage = props.runtimeLanguage ? props.runtimeLanguage : csharpFeedKey;
  const templateProjects = useRecoilValue(templateProjectsState);

  // template ID is populated by npm package name which needs to be formatted
  const normalizeTemplateId = (templateId?: string) => {
    if (templateId) {
      // use almost the same patterns as in assetManager.ts
      return templateId
        .replace(/^@microsoft\/generator-bot-/, '') // clean up our complex package names
        .replace(/^generator-/, '') // clean up other package names too
        .trim()
        .replace(/-/, '_')
        .toLocaleLowerCase();
    }
  };

  const getDefaultName = () => {
    let i = 0;
    const bot = normalizeTemplateId(templateId);
    let defaultName = `${bot}`;
    while (
      files.some((file) => {
        return file.name.toLowerCase() === defaultName.toLowerCase();
      }) &&
      i < MAXTRYTIMES
    ) {
      i++;
      defaultName = `${bot}_${i}`;
    }
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
    runtimeLanguage: {
      required: false,
    },
    runtimeType: {
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
      runtimeLanguage: runtimeLanguage,
      runtimeType: webAppRuntimeKey,
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
    async (e) => {
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
            preserveRoot: true,
          };
          dataToSubmit.alias = alias;

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

      if (props.location?.search) {
        const decoded = decodeURIComponent(props.location.search);
        const { source, payload } = querystring.parse(decoded);
        if (payload && typeof payload === 'string' && typeof source === 'string') {
          dataToSubmit.profile = JSON.parse(payload);
          dataToSubmit.source = source;
          dataToSubmit.alias = await getAliasFromPayload(source, payload);
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

  const getSupportedRuntimesForTemplate = (): IDropdownOption[] => {
    const result: IDropdownOption[] = [];
    const currentTemplate = templateProjects.find((t) => {
      if (t?.id) {
        return t.id === templateId;
      }
    });

    if (currentTemplate) {
      if (runtimeLanguage === csharpFeedKey) {
        currentTemplate.dotnetSupport?.functionsSupported &&
          result.push({ key: functionsRuntimeKey, text: formatMessage('Azure Functions') });
        currentTemplate.dotnetSupport?.webAppSupported &&
          result.push({ key: webAppRuntimeKey, text: formatMessage('Azure Web App') });
      } else if (runtimeLanguage === nodeFeedKey) {
        currentTemplate.nodeSupport?.functionsSupported &&
          result.push({ key: functionsRuntimeKey, text: formatMessage('Azure Functions') });
        currentTemplate.nodeSupport?.webAppSupported &&
          result.push({ key: webAppRuntimeKey, text: formatMessage('Azure Web App') });
      }
    }
    return result;
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
    // TODO remove runtime language drop down prior to merging as that data is indicated by the tab chosen
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
                data-testid="NewDialogRuntimeType"
                label={formatMessage('Runtime type')}
                options={getSupportedRuntimesForTemplate()}
                selectedKey={formData.runtimeType}
                onChange={(_e, option) => updateField('runtimeType', option?.key.toString())}
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
