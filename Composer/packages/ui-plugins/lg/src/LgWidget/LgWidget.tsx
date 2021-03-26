// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WidgetContainerProps } from '@bfc/extension-client';
import styled from '@emotion/styled';
import get from 'lodash/get';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import React from 'react';

import { useLgTemplate } from './useLgTemplate';

const getResponseTypeDisplayText = (responseType: string) => {
  switch (responseType) {
    default:
    case 'Attachments':
    case 'Text':
      return responseType;
    case 'Speak':
      return 'Speech';
    case 'SuggestedActions':
      return 'Sug. Actions';
  }
};

const Root = styled(Stack)({
  lineHeight: '16px',
});

const rootTokens = { childrenGap: 4 };
const rowTokens = { childrenGap: 8 };

const GrayText = styled(Text)({
  color: '#838383',
});

const OneLinerText = styled(Stack)({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  flex: 1,
  '& span': {
    overflowX: 'hidden',
  },
});

const MoreCountText = styled(GrayText)({
  width: 20,
});

const StructuredResponseRow = React.memo(
  ({ keyText, valueText, moreCount }: { keyText: string; valueText: string; moreCount?: number }) => {
    return (
      <Stack horizontal tokens={rowTokens} verticalAlign="center">
        <GrayText variant="small">{keyText}</GrayText>
        <OneLinerText horizontal title={valueText} tokens={rootTokens}>
          <Stack styles={{ root: { overflow: 'hidden', maxWidth: `calc(100% - ${moreCount ? '24px' : '0px'})` } }}>
            <Text variant="small">{valueText}</Text>
          </Stack>
          {moreCount && <MoreCountText variant="small">{`+${moreCount}`}</MoreCountText>}
        </OneLinerText>
      </Stack>
    );
  }
);

export interface LgWidgetProps extends WidgetContainerProps {
  /** indicates which field contains lg activity. ('activity', 'prompt', 'invalidPrompt'...) */
  field: string;
  defaultContent?: string;
}

export const LgWidget: React.FC<LgWidgetProps> = ({ data, field, defaultContent = '' }) => {
  const activityTemplate = get(data, field, '') as string;

  const templateTextData = useLgTemplate(activityTemplate) ?? defaultContent;

  // If the template has structured response, show rich text
  if (typeof templateTextData === 'object') {
    const data = templateTextData as Record<string, { value: string; moreCount?: number }>;
    return (
      <Root tokens={rootTokens}>
        {Object.keys(data).map((k) => (
          <StructuredResponseRow
            key={k}
            keyText={getResponseTypeDisplayText(k)}
            moreCount={data[k].moreCount}
            valueText={data[k].value}
          />
        ))}
      </Root>
    );
  }
  // otherwise show full text
  return <>{templateTextData}</>;
};
