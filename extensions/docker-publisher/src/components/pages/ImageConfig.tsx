import * as React from 'react';
import formatMessage from 'format-message';
import { ScrollablePane, ScrollbarVisibility, Stack, TextField } from 'office-ui-fabric-react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { renderPropertyInfoIcon } from './utils';
import {
  ConfigureResourcesSectionName,
  ConfigureResourcesSectionDescription,
  configureResourcePropertyStackTokens,
  configureResourcePropertyLabelStackStyles,
  ConfigureResourcesPropertyLabel,
  configureResourceTextFieldStyles,
} from './styles';
import { OnChangeDelegate, OnChoiceDelegate } from '../../types';
import { IRepository } from '../../types/interfaces';

import { TagPicker } from '../TagPicker';
import { LoadingSpinner } from '@bfc/ui-shared';

type Props = {
  creationType: string;
  imageName: string;
  onImageNameChanged: OnChangeDelegate;
  imageTag: string;
  onImageTagChanged: OnChangeDelegate;
  repository: IRepository;
};

export const ImageConfig = ({
  creationType: controlledCreationType,
  imageName: controlledImageName,
  imageTag: controlledImageTag,
  repository: controlledRepository,
  onImageNameChanged,
  onImageTagChanged,
}: Props) => {
  const [creationType, setCreationType] = useState(controlledCreationType);
  const [imageName, setImageName] = useState(controlledImageName);
  const [imageTag, setImageTag] = useState(controlledImageTag);
  const [repository, setRepository] = useState(controlledRepository);

  const [imageTags, setImageTags] = useState<string[] | undefined>([]);
  const [tagsLoading, setTagsLoading] = useState<boolean>(false);
  const [isNewTagName, setIsNewTagName] = useState(!imageTag);

  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => setCreationType(controlledCreationType), [controlledCreationType]);
  useEffect(() => setImageName(controlledImageName), [controlledImageName]);
  useEffect(() => setImageTag(controlledImageTag), [controlledImageTag]);
  useEffect(() => setRepository(controlledRepository), [controlledRepository]);

  useEffect(() => setImageTags([]), [creationType]);

  const getImageTags = useCallback(
    (imageName: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (!repository) {
        return;
      }

      timerRef.current = setTimeout(() => {
        setTagsLoading(true);
        repository.getTags(imageName).then((data) => {
          if (Array.isArray(data)) {
            setImageTags(data as string[]);
          } else {
            // TODO: Erro messages
            setImageTags([]);
          }
          setTagsLoading(false);
        });
      }, 500);
    },
    [imageName]
  );

  const CustomTagPicker = (
    <TextField
      placeholder={formatMessage('Tag name')}
      styles={configureResourceTextFieldStyles}
      value={imageTag}
      onChange={(e, v) => onImageTagChanged(e, v)}
    />
  );

  const GeneralTagPicker = (
    <Stack horizontal>
      <TagPicker
        disabled={!imageName}
        newTagName={isNewTagName ? 'latest' : undefined}
        tagNames={imageTags}
        selectedTagName={isNewTagName ? undefined : imageTag}
        onChange={(choice) => {
          setIsNewTagName(choice.isNew);
          setImageTag(choice.name);
          onImageTagChanged(null, choice.name);
        }}
      />
      {tagsLoading && (
        <div style={{ marginLeft: '10px' }}>
          <LoadingSpinner />
        </div>
      )}
    </Stack>
  );

  return (
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
              value={imageName}
              onChange={(e, v) => {
                onImageNameChanged(e, v);

                if (v !== '') {
                  getImageTags(v);
                }
              }}
            />
          </Stack>

          <Stack horizontal tokens={configureResourcePropertyStackTokens} verticalAlign="start">
            <Stack horizontal styles={configureResourcePropertyLabelStackStyles} verticalAlign="center">
              <ConfigureResourcesPropertyLabel required>{formatMessage('Image Tag')}</ConfigureResourcesPropertyLabel>
              {renderPropertyInfoIcon(formatMessage('The tag for your image'))}
            </Stack>

            {creationType !== 'custom' && GeneralTagPicker}
            {creationType === 'custom' && CustomTagPicker}
          </Stack>
        </Stack>
      </form>
    </ScrollablePane>
  );
};
