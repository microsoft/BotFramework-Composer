import * as React from 'react';
import formatMessage from 'format-message';
import { useState, useEffect, useMemo } from 'react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react';
import { PageTypes } from '../../types/types';

type Props = {
  page: string;
  creationType: string;
  isNextRegistryConfigDisabled: boolean;
  isNextImageConfigDisabled: boolean;
  isNextRegistryTypeDisabled: boolean;
  isNextACRConfigDisabled: boolean;
  isNextDockerHubConfigDisabled: boolean;

  onNext: (page: string) => void;
  onBack: () => void;
  setTitle: (value: any) => void;
  closeDialog: () => void;
  onSave: () => void;
};

export const Footer = ({
  page: controlledPage,
  creationType: controlledCreationType,
  isNextRegistryConfigDisabled: controlledIsNextRegistryConfigDisabled,
  isNextImageConfigDisabled: controlledIsNextImageConfigDisabled,
  isNextRegistryTypeDisabled: controlledIsNextRegistryTypeDisabled,
  isNextACRConfigDisabled: controlledIsNextACRConfigDisabled,
  isNextDockerHubConfigDisabled: controlledIsNextDockerHubConfigDisabled,

  onNext,
  onBack,
  setTitle,
  closeDialog,
  onSave,
}: Props) => {
  const [page, setPage] = useState<string>(controlledPage || PageTypes.RegistryType);
  const [creationType, setCreationType] = useState(controlledCreationType);
  const [isNextRegistryConfigDisabled, setIsNextRegistryConfigDisabled] = useState(
    controlledIsNextRegistryConfigDisabled
  );
  const [isNextImageConfigDisabled, setIsNextImageConfigDisabled] = useState(controlledIsNextImageConfigDisabled);
  const [isNextRegistryTypeDisabled, setIsNextRegistryTypeDisabled] = useState(controlledIsNextRegistryTypeDisabled);
  const [isNextACRConfigDisabled, setIsNextACRConfigDisabled] = useState(controlledIsNextACRConfigDisabled);
  const [isNextDockerHubConfigDisabled, setIsNextDockerHubConfigDisabled] = useState(
    controlledIsNextDockerHubConfigDisabled
  );

  useEffect(() => setPage(controlledPage), [controlledPage]);
  useEffect(() => setCreationType(controlledCreationType), [controlledCreationType]);
  useEffect(() => setIsNextRegistryConfigDisabled(controlledIsNextRegistryConfigDisabled), [
    controlledIsNextRegistryConfigDisabled,
  ]);
  useEffect(() => setIsNextImageConfigDisabled(controlledIsNextImageConfigDisabled), [
    controlledIsNextImageConfigDisabled,
  ]);
  useEffect(() => setIsNextRegistryTypeDisabled(controlledIsNextRegistryTypeDisabled), [
    controlledIsNextRegistryTypeDisabled,
  ]);
  useEffect(() => setIsNextACRConfigDisabled(controlledIsNextACRConfigDisabled), [controlledIsNextACRConfigDisabled]);
  useEffect(() => setIsNextDockerHubConfigDisabled(controlledIsNextDockerHubConfigDisabled), [
    controlledIsNextDockerHubConfigDisabled,
  ]);

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
  const setPageAndTitle = (page: string) => {
    setPage(page);
    onNext(page);
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

  const isDefaultFooterNextButtonDisabled = useMemo(() => {
    switch (page) {
      case PageTypes.RegistryConfig:
        return isNextRegistryConfigDisabled;

      case PageTypes.ACRConfig:
        return isNextACRConfigDisabled;

      case PageTypes.DockerHubConfig:
        return isNextDockerHubConfigDisabled;
    }
  }, [page, isNextRegistryConfigDisabled, isNextACRConfigDisabled, isNextDockerHubConfigDisabled]);

  const RegistryTypeFooter = (
    <>
      <DefaultButton
        style={{ margin: '0 4px' }}
        text={formatMessage('Back')}
        onClick={() => {
          onBack();
        }}
      />
      <PrimaryButton
        disabled={isNextRegistryTypeDisabled}
        style={{ margin: '0 4px' }}
        text={formatMessage('Next')}
        onClick={() => {
          if (creationType === 'local') {
            setPageAndTitle(PageTypes.Image);
          } else if (creationType === 'acr') {
            setPageAndTitle(PageTypes.ACRConfig);
          } else if (creationType === 'dockerhub') {
            setPageAndTitle(PageTypes.DockerHubConfig);
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

  const ImageFooter = (
    <>
      <DefaultButton
        style={{ margin: '0 4px' }}
        text={formatMessage('Back')}
        onClick={() => {
          if (creationType === 'local') {
            setPageAndTitle(PageTypes.RegistryType);
          } else if (creationType === 'acr') {
            setPageAndTitle(PageTypes.ACRConfig);
          } else if (creationType === 'dockerhub') {
            setPageAndTitle(PageTypes.DockerHubConfig);
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

  const ReviewFooter = (
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

  const RegistryConfigFooter = (
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
        disabled={isDefaultFooterNextButtonDisabled}
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
  return (
    <>
      {page === PageTypes.RegistryType && RegistryTypeFooter}

      {(page === PageTypes.RegistryConfig || page === PageTypes.ACRConfig || page === PageTypes.DockerHubConfig) &&
        RegistryConfigFooter}

      {page === PageTypes.Image && ImageFooter}
      {page === PageTypes.Review && ReviewFooter}
    </>
  );
};
