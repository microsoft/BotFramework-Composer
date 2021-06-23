// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

//TODO: Remove Path module
/** @jsx jsx */
import Path from 'path';

import { jsx } from '@emotion/core';
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
import { csharpFeedKey, FeedType, functionsRuntimeKey, nodeFeedKey, QnABotTemplateId } from '@bfc/shared';
import { RuntimeType, webAppRuntimeKey, localTemplateId } from '@bfc/shared';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import { FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { css } from '@emotion/core';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { SharedColors, NeutralColors } from '@uifabric/fluent-theme';
import { Label } from 'office-ui-fabric-react/lib/Label';

import { CreationFlowStatus, DialogCreationCopy, nameRegex, botNameRegex } from '../../constants';
import { FieldConfig, useForm } from '../../hooks/useForm';
import { StorageFolder } from '../../recoilModel/types';
import { createNotification } from '../../recoilModel/dispatchers/notification';
import { ImportSuccessNotificationWrapper } from '../ImportModal/ImportSuccessNotification';
import { creationFlowStatusState, dispatcherState, templateProjectsState } from '../../recoilModel';
import { getAliasFromPayload, Profile } from '../../utils/electronUtil';
import TelemetryClient from '../../telemetry/TelemetryClient';

import { LocationSelectContent } from './LocationSelectContent';

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
  root: {
    width: '420px',
  },
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
  runtimeType?: RuntimeType;
  location?: string;
  templateVersion?: string;
  profile?: Profile; // abs payload to create bot
  source?: string; // where the payload come from
  alias?: string; // identifier that is used to track bots between imports
  isLocalGenerator?: boolean;

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
  localTemplatePath?: string;
  focusedStorageFolder: StorageFolder;
} & RouteComponentProps<{
  templateId: string;
  defaultName: string;
  runtimeLanguage: string;
  location: string;
}>;

const DefineConversation: React.FC<DefineConversationProps> = (props) => {
  const {
    onSubmit,
    onDismiss,
    onCurrentPathUpdate,
    templateId,
    focusedStorageFolder,
    createFolder,
    updateFolder,
    localTemplatePath,
  } = props;
  const files = focusedStorageFolder?.children ?? [];
  const writable = focusedStorageFolder.writable;
  const runtimeLanguage = props.runtimeLanguage ? props.runtimeLanguage : csharpFeedKey;
  const templateProjects = useRecoilValue(templateProjectsState);
  const creationFlowStatus = useRecoilValue(creationFlowStatusState);

  const currentTemplate = templateProjects.find((t) => {
    if (t?.id) {
      return t.id === templateId;
    }
  });

  const inBotMigration = creationFlowStatus === CreationFlowStatus.MIGRATE;

  // template ID is populated by npm package name which needs to be formatted
  const normalizeTemplateId = () => {
    if (currentTemplate) {
      // use almost the same patterns as in assetManager.ts
      const camelCasedName = camelCase(
        currentTemplate.name
          .trim()
          .replace(/bot|maker/gi, '')
          .replace(/-/g, ' ')
      );
      return upperFirst(camelCasedName);
    } else if (templateId && inBotMigration) {
      return templateId.trim().replace(/[-\s]/g, '_').toLocaleLowerCase();
    } else {
      return templateId;
    }
  };

  const getDefaultName = () => {
    let i = 0;
    const bot = normalizeTemplateId();
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

  const [isImported, setIsImported] = useState<boolean>(false);

  useEffect(() => {
    if (props.location?.state) {
      const { imported } = props.location.state;
      setIsImported(imported);
    }
  }, [props.location?.state]);

  const formConfig: FieldConfig<DefineConversationFormData> = {
    name: {
      required: true,
      validate: (value) => {
        const isPvaBot = templateId === 'pva';
        const namePattern = isPvaBot ? nameRegex : botNameRegex;
        if (!value || !namePattern.test(`${value}`)) {
          // botName is used as used when generating runtime namespaces which cannot start with a number
          if (value && !isNaN(+value.toString().charAt(0))) {
            return formatMessage('Bot name cannot start with a number or space');
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
      required: !isImported,
      validate: (value) => {
        if (!isImported && !value) {
          return formatMessage('A runtime type must be selected.');
        }
      },
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

  useEffect(() => {
    const formData: DefineConversationFormData = {
      name: getDefaultName(),
      runtimeLanguage: runtimeLanguage,
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
      TelemetryClient.track('CreationExecuted', {
        runtimeChoice: dataToSubmit?.runtimeType || webAppRuntimeKey,
        runtimeLanguage: dataToSubmit?.runtimeLanguage as FeedType,
        isPva: isImported,
        isAbs: !!dataToSubmit?.source,
      });
      const isLocalGenerator = templateId === localTemplateId;
      const generatorName = isLocalGenerator ? localTemplatePath : templateId;
      dataToSubmit.isLocalGenerator = isLocalGenerator;
      onSubmit({ ...dataToSubmit }, generatorName || '');
    },
    [hasErrors, formData]
  );

  const onCurrentPathUpdateWrap = (newPath: string, storageId?: string) => {
    onCurrentPathUpdate(newPath, storageId);
    updateField('location', newPath);
  };

  const renderRuntimeDropdownOption = (props) => {
    return (
      <Stack>
        <Label>{props.text}</Label>
        <div>{props.data?.description}</div>
      </Stack>
    );
  };

  const webAppRuntimeOption = {
    key: webAppRuntimeKey,
    text: formatMessage('Azure Web App'),
    data: {
      description: formatMessage(
        'Fully managed compute platform that is optimized for hosting websites and web applications.'
      ),
    },
  };

  const functionsRuntimeOption = {
    key: functionsRuntimeKey,
    text: formatMessage('Azure Functions'),
    data: {
      description: formatMessage(
        'Azure Functions is a solution for easily running small pieces of code, or "functions," in the cloud. '
      ),
    },
  };

  const getSupportedRuntimesForTemplate = (): IDropdownOption[] => {
    const result: IDropdownOption[] = [];
    if (inBotMigration) {
      result.push(webAppRuntimeOption);
      result.push(functionsRuntimeOption);
    } else if (currentTemplate) {
      if (runtimeLanguage === csharpFeedKey) {
        currentTemplate.dotnetSupport?.functionsSupported && result.push(functionsRuntimeOption);
        currentTemplate.dotnetSupport?.webAppSupported && result.push(webAppRuntimeOption);
      } else if (runtimeLanguage === nodeFeedKey) {
        currentTemplate.nodeSupport?.functionsSupported && result.push(functionsRuntimeOption);
        currentTemplate.nodeSupport?.webAppSupported && result.push(webAppRuntimeOption);
      }
    }

    return result;
  };

  const getRuntimeLanguageOptions = (): IDropdownOption[] => {
    return [
      { key: csharpFeedKey, text: 'C#' },
      { key: nodeFeedKey, text: formatMessage('Node (Preview)') },
    ];
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
            {!isImported && (
              <StackItem grow={0} styles={halfstack}>
                <Stack horizontal styles={stackinput} tokens={{ childrenGap: '2rem' }}>
                  <StackItem grow={0}>
                    <Dropdown
                      data-testid="NewDialogRuntimeType"
                      label={formatMessage('Runtime type')}
                      options={getSupportedRuntimesForTemplate()}
                      placeholder={formatMessage('Select one')}
                      selectedKey={formData.runtimeType}
                      styles={{
                        root: { width: inBotMigration ? '200px' : '420px' },
                        dropdownItem: { height: '100px' },
                        dropdownItemSelected: { height: '100px' },
                      }}
                      onChange={(_e, option) => updateField('runtimeType', option?.key.toString())}
                      onRenderLabel={(props) => (
                        <Stack horizontal styles={{ root: { alignItems: 'center' } }}>
                          <Label required>{props?.label}</Label>
                          <TooltipHost
                            content={formatMessage(
                              'Azure offers a number of ways to host your application code. The runtime type refers to the hosting model for the computing resources that your application runs on. Learn more'
                            )}
                          >
                            <Icon
                              iconName="Unknown"
                              styles={{
                                root: {
                                  color: NeutralColors.gray160,
                                  userSelect: 'none',
                                },
                              }}
                            />
                          </TooltipHost>
                        </Stack>
                      )}
                      onRenderOption={renderRuntimeDropdownOption}
                    />
                  </StackItem>
                  {inBotMigration && (
                    <StackItem grow={0}>
                      <Dropdown
                        data-testid="NewDialogRuntimeLanguage"
                        label={formatMessage('Runtime Language')}
                        options={getRuntimeLanguageOptions()}
                        selectedKey={formData.runtimeLanguage}
                        styles={{ root: { width: '200px' } }}
                        onChange={(_e, option) => updateField('runtimeLanguage', option?.key.toString())}
                      />
                    </StackItem>
                  )}
                </Stack>
              </StackItem>
            )}
          </Stack>
          {locationSelectContent}
          <DialogFooter>
            <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
            <PrimaryButton
              data-testid="SubmitNewBotBtn"
              disabled={hasErrors || !writable}
              text={templateId === QnABotTemplateId ? formatMessage('Next') : formatMessage('Create')}
              onClick={handleSubmit}
            />
          </DialogFooter>
        </form>
      </DialogWrapper>
    </Fragment>
  );
};

export default DefineConversation;
