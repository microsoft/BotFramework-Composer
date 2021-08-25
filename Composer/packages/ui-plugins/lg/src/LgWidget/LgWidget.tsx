// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WidgetContainerProps, useShellApi } from '@bfc/extension-client';
import styled from '@emotion/styled';
import get from 'lodash/get';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import React, { useRef } from 'react';
import debounce from 'lodash/debounce';

import { useLgTemplate } from './useLgTemplate';
import { FlowLgEditor } from './FlowLgEditor';

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

export const LgWidget: React.FC<LgWidgetProps> = ({ id, data, field, defaultContent = '' }) => {
  const { shellApi } = useShellApi();
  const activityTemplate = get(data, field, '') as string;

  const syncData = useRef(
    debounce((data: any, templateId: string) => {
      shellApi.saveData({ ...data, [field]: templateId }, id);
    })
  ).current;

  // const templateTextData = useLgTemplate(activityTemplate) ?? defaultContent;

  // // If the template has structured response, show rich text
  // if (typeof templateTextData === 'object') {
  //   const data = templateTextData as Record<string, { value: string; moreCount?: number }>;
  //   return (
  //     <Root tokens={rootTokens}>
  //       {Object.keys(data).map((k) => (
  //         <StructuredResponseRow
  //           key={k}
  //           keyText={getResponseTypeDisplayText(k)}
  //           moreCount={data[k].moreCount}
  //           valueText={data[k].value}
  //         />
  //       ))}
  //     </Root>
  //   );
  // }
  // need to prevent the flow from stealing focus
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onChange = (templateId) => {
    syncData(data, templateId);
  };

  // otherwise render editor
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div onClick={handleClick}>
      <FlowLgEditor
        $kind={get(data, '$kind')}
        activityTemplate={activityTemplate || defaultContent}
        designerId={get(data, '$designer.id')}
        name={field}
        onChange={onChange}
      />
    </div>
  );
};
