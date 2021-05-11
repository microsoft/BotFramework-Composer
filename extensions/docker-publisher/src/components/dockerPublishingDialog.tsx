import * as React from 'react';
import formatMessage from 'format-message';
import styled from '@emotion/styled';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import { useState, useMemo, Fragment, useCallback } from 'react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import {
  FontSizes,
  FontWeights,
  IStackItemStyles,
  IStackTokens,
  ScrollablePane,
  ScrollbarVisibility,
  Stack,
  Text,
  Label,
  TextField,
  TooltipHost,
  Icon,
} from 'office-ui-fabric-react';
import {
  logOut,
  usePublishApi,
  getTenants,
  getARMTokenForTenant,
  useLocalStorage,
  useTelemetryClient,
  TelemetryClient,
  useApplicationApi,
} from '@bfc/extension-client';

import { RegistryFormData, RegistryTypeOptions, PageTypes } from '../types/types';
import { ChooseRegistryAction } from './ChooseRegistryAction';

/// Styles
const ConfigureResourcesSectionDescription = styled(Text)`
  font-size: ${FluentTheme.fonts.medium.fontSize};
  line-height: ${FontSizes.size14};
  margin-bottom: 20px;
`;

const ConfigureResourcesSectionName = styled(Text)`
  font-size: ${FluentTheme.fonts.mediumPlus.fontSize};
  font-weight: ${FontWeights.semibold};
  margin-bottom: 4px;
`;

const configureResourcePropertyStackTokens: IStackTokens = { childrenGap: 5 };

const configureResourcePropertyLabelStackStyles: IStackItemStyles = {
  root: {
    width: '200px',
  },
};

const configureResourcesIconStyle = {
  root: {
    color: NeutralColors.gray160,
    userSelect: 'none',
  },
};

const configureResourceTextFieldStyles = { root: { paddingBottom: '4px', width: '300px' } };

const ConfigureResourcesPropertyLabel = styled(Label)`
  font-size: ${FluentTheme.fonts.medium.fontSize};
  font-weight: ${FontWeights.regular};
`;

/// End Styles

export const DockerPublishingDialog: React.FC = () => {
  const {
    currentProjectId,
    publishConfig,
    startProvision,
    closeDialog,
    onBack,
    savePublishConfig,
    setTitle,
    getSchema,
    getType,
    getName,
    getTokenFromCache,
    userShouldProvideTokens,
    getTenantIdFromCache,
    setTenantId,
  } = usePublishApi();

  const DialogTitle = {
    REGISTRY: {
      title: formatMessage('Configure Registry'),
      subText: formatMessage('Select your Docker Registry'),
    },
    REGISTRY_CONFIG: {
      title: formatMessage('Configure Registry'),
      subText: formatMessage('Configure your Docker Registry'),
    },
    IMAGE: {
      title: formatMessage('Configure Image'),
      subText: formatMessage('Enter the information regarding Docker Image'),
    },
    REVIEW: {
      title: formatMessage('Review'),
      subText: formatMessage('Review the image information.'),
    },
  };

  const getDefaultFormData = () => {
    return {
      creationType: 'local',
      url: '',
      anonymous: true,
      username: '',
      password: '',
      image: '',
      tag: 'latest',
    };
  };

  const [page, setPage] = useState<string>(PageTypes.RegistryType);
  const [formData, setFormData] = useState<RegistryFormData>(getDefaultFormData());

  const isNextRegistryConfigDisabled = useMemo(() => {
    return Boolean(!formData.url || (formData.anonymous == false ? !formData.username || !formData.password : false));
  }, [formData.url, formData.anonymous, formData.username, formData.password]);
  const isNextImageConfigDisabled = useMemo(() => {
    return Boolean(!formData.image || !formData.tag);
  }, [formData.image, formData.tag]);

  const setPageAndTitle = (page: string) => {
    setPage(page);
    switch (page) {
      case PageTypes.RegistryType:
        setTitle(DialogTitle.REGISTRY);
        break;
      case PageTypes.RegistryConfig:
        setTitle(DialogTitle.REGISTRY_CONFIG);
        break;
      case PageTypes.Image:
        setTitle(DialogTitle.IMAGE);
        break;
      case PageTypes.Review:
        setTitle(DialogTitle.REVIEW);
        break;
    }
  };

  function updateFormData<K extends keyof RegistryFormData>(field: K, value: RegistryFormData[K]) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  const onSave = useCallback(() => {
    savePublishConfig(formData);
    closeDialog();
  }, [formData]);

  const renderPropertyInfoIcon = (tooltip: string) => {
    return (
      <TooltipHost content={tooltip}>
        <Icon iconName="Unknown" styles={configureResourcesIconStyle} />
      </TooltipHost>
    );
  };

  /// Pages
  const PageRegistry = (
    <div style={{ height: 'calc(100vh - 65px)' }}>
      <ChooseRegistryAction
        choice={formData.creationType}
        onChoiceChanged={(choice) => {
          updateFormData('creationType', choice);
        }}
      />
    </div>
  );

  const PageRegistryConfig = (
    <ScrollablePane
      data-is-scrollable="true"
      scrollbarVisibility={ScrollbarVisibility.auto}
      style={{ height: 'calc(100vh - 65px)' }}
    >
      <form style={{ width: '100%' }}>
        <Stack>
          <ConfigureResourcesSectionName>{formatMessage('Registry Settings')}</ConfigureResourcesSectionName>
          <ConfigureResourcesSectionDescription>
            {formatMessage('Configure your Registry server and authentication.')}
          </ConfigureResourcesSectionDescription>

          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>
                {formatMessage('Registry URL')}
              </ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(
                formatMessage('The URL of your registry with port number and without http/https')
              )}
            </Stack>
            <TextField
              placeholder={formatMessage('Registry URL')}
              styles={configureResourceTextFieldStyles}
              value={formData.url}
              onChange={(e, v) => {
                updateFormData('url', v);
              }}
            />
          </Stack>

          <ConfigureResourcesSectionName>{formatMessage('Authentication')}</ConfigureResourcesSectionName>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>
                {formatMessage('Authentication required')}
              </ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('Configure whether authentication to Registry is required'))}
            </Stack>
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel>{formatMessage('Username')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('Registry Username'))}
            </Stack>
            <TextField
              placeholder={formatMessage('Username')}
              styles={configureResourceTextFieldStyles}
              value={formData.username}
              onChange={(e, v) => {
                updateFormData('username', v);
              }}
            />
          </Stack>
          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel>{formatMessage('Password')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('Registry Password'))}
            </Stack>
            <TextField
              styles={configureResourceTextFieldStyles}
              type="password"
              value={formData.password}
              onChange={(e, v) => {
                updateFormData('password', v);
              }}
            />
          </Stack>
        </Stack>
      </form>
    </ScrollablePane>
  );

  const PageImageConfig = (
    <ScrollablePane
      data-is-scrollable="true"
      scrollbarVisibility={ScrollbarVisibility.auto}
      style={{ height: 'calc(100vh - 65px)' }}
    >
      <form style={{ width: '100%' }}>
        <Stack>
          <ConfigureResourcesSectionName>{formatMessage('Image Settings')}</ConfigureResourcesSectionName>
          <ConfigureResourcesSectionDescription>
            {formatMessage('Configure your image information.')}
          </ConfigureResourcesSectionDescription>

          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{formatMessage('Image Name')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('The name of your image, without registry'))}
            </Stack>
            <TextField
              placeholder={formatMessage('Image name')}
              styles={configureResourceTextFieldStyles}
              value={formData.image}
              onChange={(e, v) => {
                updateFormData('image', v);
              }}
            />
          </Stack>

          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{formatMessage('Image Tag')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('The tag for your image'))}
            </Stack>
            <TextField
              placeholder={formatMessage('Image tag')}
              styles={configureResourceTextFieldStyles}
              value={formData.tag}
              onChange={(e, v) => {
                updateFormData('tag', v);
              }}
            />
          </Stack>
        </Stack>
      </form>
    </ScrollablePane>
  );

  const PageReview = useMemo(() => {
    return (
      <ScrollablePane
        data-is-scrollable="true"
        scrollbarVisibility={ScrollbarVisibility.auto}
        style={{ height: 'calc(100vh - 65px)' }}
      >
        <form style={{ width: '100%' }}>
          <Stack>
            <ConfigureResourcesSectionName>{formatMessage('Review')}</ConfigureResourcesSectionName>

            <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
              <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                <ConfigureResourcesPropertyLabel>{formatMessage('Registry Kind')}</ConfigureResourcesPropertyLabel>
              </Stack>
              <TextField
                readOnly={true}
                styles={configureResourceTextFieldStyles}
                value={RegistryTypeOptions.find((el) => el.key == formData.creationType).text}
              />
            </Stack>

            <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
              <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                <ConfigureResourcesPropertyLabel>{formatMessage('Registry:')}</ConfigureResourcesPropertyLabel>
              </Stack>
              <TextField readOnly={true} styles={configureResourceTextFieldStyles} value={formData.url} />
            </Stack>

            <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
              <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                <ConfigureResourcesPropertyLabel>{formatMessage('Username:')}</ConfigureResourcesPropertyLabel>
              </Stack>
              <TextField readOnly={true} styles={configureResourceTextFieldStyles} value={formData.username} />
            </Stack>

            <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
              <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                <ConfigureResourcesPropertyLabel>{formatMessage('Password:')}</ConfigureResourcesPropertyLabel>
              </Stack>
              <TextField
                type="password"
                readOnly={true}
                styles={configureResourceTextFieldStyles}
                value={formData.password}
              />
            </Stack>

            <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
              <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
                <ConfigureResourcesPropertyLabel>{formatMessage('Image:')}</ConfigureResourcesPropertyLabel>
              </Stack>
              <TextField
                readOnly={true}
                styles={configureResourceTextFieldStyles}
                value={`${formData.image}:${formData.tag}`}
              />
            </Stack>
          </Stack>
        </form>
      </ScrollablePane>
    );
  }, [page, formData.creationType]);

  const PageFooter = useMemo(() => {
    if (page === PageTypes.RegistryType) {
      return (
        <>
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Back')}
            onClick={() => {
              onBack();
            }}
          />
          <PrimaryButton
            disabled={!formData.creationType}
            style={{ margin: '0 4px' }}
            text={formatMessage('Next')}
            onClick={() => {
              if (formData.creationType === 'local') {
                setPageAndTitle(PageTypes.Image);
              } else {
                setPageAndTitle(PageTypes.RegistryConfig);
              }
            }}
          />
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Cancel')}
            onClick={() => {
              closeDialog();
            }}
          />
        </>
      );
    } else if (page === PageTypes.RegistryConfig) {
      return (
        <>
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Back')}
            onClick={() => {
              setPageAndTitle(PageTypes.RegistryType);
            }}
          />
          <PrimaryButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Next')}
            disabled={isNextRegistryConfigDisabled}
            onClick={() => {
              setPageAndTitle(PageTypes.Image);
            }}
          />
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Cancel')}
            onClick={() => {
              closeDialog();
            }}
          />
        </>
      );
    } else if (page === PageTypes.Image) {
      return (
        <>
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Back')}
            onClick={() => {
              if (formData.creationType === 'local') {
                setPageAndTitle(PageTypes.RegistryType);
              } else {
                setPageAndTitle(PageTypes.RegistryConfig);
              }
            }}
          />
          <PrimaryButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Next')}
            disabled={isNextImageConfigDisabled}
            onClick={() => {
              setPageAndTitle(PageTypes.Review);
            }}
          />
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Cancel')}
            onClick={() => {
              closeDialog();
            }}
          />
        </>
      );
    } else if (page === PageTypes.Review) {
      return (
        <>
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Back')}
            onClick={() => {
              setPageAndTitle(PageTypes.Image);
            }}
          />
          <PrimaryButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Create')}
            onClick={() => {
              onSave();
            }}
          />
          <DefaultButton
            style={{ margin: '0 4px' }}
            text={formatMessage('Cancel')}
            onClick={() => {
              closeDialog();
            }}
          />
        </>
      );
    }
  }, [page, formData]);

  /// End Pages

  return (
    <Fragment>
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1, minHeight: '230px' }}>
          {page === PageTypes.RegistryType && PageRegistry}
          {page === PageTypes.RegistryConfig && PageRegistryConfig}
          {page === PageTypes.Image && PageImageConfig}
          {page === PageTypes.Review && PageReview}
        </div>
        <div
          style={{
            flex: 'auto',
            flexGrow: 0,
            background: '#FFFFFF',
            borderTop: '1px solid #EDEBE9',
            width: '100%',
            textAlign: 'right',
            height: 'fit-content',
            padding: '24px 0px 0px',
          }}
        >
          {PageFooter}
        </div>
      </div>
    </Fragment>
  );
};
