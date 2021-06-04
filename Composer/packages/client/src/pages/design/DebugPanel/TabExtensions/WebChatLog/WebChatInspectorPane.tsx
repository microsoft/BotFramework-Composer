// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { JsonEditor } from '@bfc/code-editor';
import { css, jsx } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { useCallback } from 'react';
import { Resizable } from 're-resizable';

import { WebChatInspectionData } from '../../../../../recoilModel/types';
import { getDefaultFontSettings } from '../../../../../recoilModel/utils/fontUtil';

const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();

const editorStyles = css`
  border: none;
`;

const pivotStyles = css`
  margin-bottom: 8px;
`;

type WebChatInspectorPaneProps = {
  inspectionData?: WebChatInspectionData;
  onSetInspectionData: (data: WebChatInspectionData) => void;
};

const getUserFriendlyActivityType = (type: string | undefined) => {
  switch (type) {
    case 'conversationUpdate':
      return 'Conversation update';

    case 'message':
      return 'Message';

    case 'trace':
      return 'Trace';

    default:
      return type || 'Unknown';
  }
};

export const WebChatInspectorPane: React.FC<WebChatInspectorPaneProps> = (props) => {
  const { inspectionData, onSetInspectionData } = props;
  const handleInspectorTabClick = useCallback(
    (item: PivotItem | undefined) => {
      if (item && inspectionData) {
        if (item.props.itemKey === 'networkReq') {
          onSetInspectionData({ ...inspectionData, mode: 'request' });
        } else if (item.props.itemKey === 'networkRes') {
          onSetInspectionData({ ...inspectionData, mode: 'response' });
        }
      }
    },
    [inspectionData, onSetInspectionData]
  );
  const renderHeader = useCallback(
    (inspectionData: WebChatInspectionData) => {
      switch (inspectionData.item.trafficType) {
        case 'network': {
          const selectedKey = inspectionData.mode === 'request' ? 'networkReq' : 'networkRes';
          return (
            <Pivot headersOnly css={pivotStyles} selectedKey={selectedKey} onLinkClick={handleInspectorTabClick}>
              <PivotItem headerText={inspectionData.item.request.method} itemKey={'networkReq'} />
              <PivotItem headerText={inspectionData.item.response.statusCode.toString()} itemKey={'networkRes'} />
            </Pivot>
          );
        }

        case 'activity':
          return (
            <Pivot headersOnly css={pivotStyles}>
              <PivotItem headerText={getUserFriendlyActivityType(inspectionData.item.activity.type)} />
            </Pivot>
          );

        default:
          return null;
      }
    },
    [handleInspectorTabClick]
  );

  const getInspectedData = (inspectionData: WebChatInspectionData) => {
    switch (inspectionData.mode) {
      case 'request':
        if (inspectionData.item.trafficType === 'network') {
          return inspectionData.item.request.payload;
        }
        break;

      case 'response':
        if (inspectionData.item.trafficType === 'network') {
          return inspectionData.item.response.payload;
        }
        break;

      default:
        break;
    }
    // hide the 'trafficType' property from the view
    const shownData = { ...inspectionData.item, trafficType: undefined };
    delete shownData.trafficType;
    return shownData;
  };

  if (inspectionData) {
    return (
      <Resizable
        css={{
          height: '100%',
          width: '50%',
          borderLeft: `1px solid ${colors.gray(30)}`,
          display: 'flex',
          overflow: 'auto',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
        defaultSize={{
          height: '100%',
          width: '50%',
        }}
        enable={{
          top: false,
          right: false,
          bottom: false,
          left: true,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
      >
        {renderHeader(inspectionData)}
        <JsonEditor
          editorSettings={{
            fadedWhenReadOnly: false,
            fontSettings: { fontFamily: DEFAULT_FONT_SETTINGS.fontFamily, fontSize: '12px', fontWeight: 'normal' },
          }}
          options={{
            folding: true,
            minimap: { enabled: false, showSlider: 'mouseover' },
            showFoldingControls: 'always',
            readOnly: true,
            lineHeight: 16,
          }}
          styleOverrides={[editorStyles]}
          value={getInspectedData(inspectionData)}
          onChange={(_d) => null}
        />
      </Resizable>
    );
  } else {
    return null;
  }
};
