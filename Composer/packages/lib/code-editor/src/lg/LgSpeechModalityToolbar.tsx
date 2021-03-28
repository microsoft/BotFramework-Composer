// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FluentTheme } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import {
  ContextualMenuItemType,
  IContextualMenuItemProps,
  IContextualMenuItemRenderFunctions,
} from 'office-ui-fabric-react/lib/ContextualMenu';
import { Link } from 'office-ui-fabric-react/lib/Link';
import * as React from 'react';

import { ItemWithTooltip } from '../components/ItemWithTooltip';
import { FieldToolbar, FieldToolbarProps } from '../components/toolbar/FieldToolbar';

import { jsLgToolbarMenuClassName } from './constants';

const menuItemStyles = {
  fontSize: FluentTheme.fonts.small.fontSize,
};

const ssmlHeaderHelpUrl =
  'https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup';
const ssmlHeaderTooltipProps = { calloutProps: { layerProps: { className: jsLgToolbarMenuClassName } } };

export type SSMLTagType = 'break' | 'prosody' | 'audio';

type Props = Omit<FieldToolbarProps, 'moreMenuItems'> & {
  onInsertSSMLTag: (tagType: SSMLTagType) => void;
};

export const LgSpeechModalityToolbar = React.memo((props: Props) => {
  const { onInsertSSMLTag, ...restProps } = props;

  const renderHeaderContent = React.useCallback(
    (itemProps: IContextualMenuItemProps, defaultRenders: IContextualMenuItemRenderFunctions) => (
      <ItemWithTooltip
        itemText={defaultRenders.renderItemName(itemProps)}
        tooltipId="ssml-menu-header"
        tooltipProps={ssmlHeaderTooltipProps}
        tooltipText={formatMessage.rich('To learn more about SSML Tags, <a>visit this document</a>.', {
          a: ({ children }) => (
            <Link key="ssml-menu-header-link" href={ssmlHeaderHelpUrl} target="_blank">
              {children}
            </Link>
          ),
        })}
      />
    ),
    []
  );

  const subMenuProps = React.useMemo(
    () => ({
      items: [
        {
          key: 'header',
          text: formatMessage('Insert SSML tag'),
          itemType: ContextualMenuItemType.Header,
          onRenderContent: renderHeaderContent,
        },
        { text: 'break', key: 'break', onClick: () => onInsertSSMLTag('break'), style: menuItemStyles },
        { text: 'prosody', key: 'prosody', onClick: () => onInsertSSMLTag('prosody'), style: menuItemStyles },
        { text: 'audio', key: 'audio', onClick: () => onInsertSSMLTag('audio'), style: menuItemStyles },
      ],
    }),
    [renderHeaderContent, onInsertSSMLTag]
  );

  const moreToolbarItems = React.useMemo(() => [{ key: 'ssmlTag', text: formatMessage('SSML tag'), subMenuProps }], [
    subMenuProps,
  ]);

  return <FieldToolbar {...restProps} moreToolbarItems={moreToolbarItems} />;
});
