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

type ActivityType = 'conversationUpdate' | 'message' | 'trace';

const editorStyles = css`
  border: none;
`;

const pivotStyles = css`
  margin-bottom: 8px;
`;

type WebChatInspectorPaneProps = {
  inspectionData?: WebChatInspectionData;
  setInspectionData: (data: WebChatInspectionData) => void;
};

const getUserFriendlyActivityType = (type: ActivityType | undefined) => {
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
  const { inspectionData, setInspectionData } = props;
  const handleInspectorTabClick = useCallback(
    (item: PivotItem | undefined) => {
      if (item && inspectionData) {
        if (item.props.itemKey === 'networkReq') {
          setInspectionData({ ...inspectionData, mode: 'request' });
        }
        if (item.props.itemKey === 'networkRes') {
          setInspectionData({ ...inspectionData, mode: 'response' });
        }
      }
    },
    [inspectionData, setInspectionData]
  );
  const renderHeader = (inspectionData: WebChatInspectionData) => {
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
  };

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
          borderLeft: `1px solid ${NeutralColors.gray30}`,
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
          editorSettings={{ fadedWhenReadOnly: false }}
          options={{
            folding: true,
            minimap: { enabled: false, showSlider: 'mouseover' },
            showFoldingControls: 'always',
            readOnly: true,
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
