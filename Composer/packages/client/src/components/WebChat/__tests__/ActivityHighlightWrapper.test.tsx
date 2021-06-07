// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { ActivityHighlightWrapper } from '../ActivityHighlightWrapper';
import { renderWithRecoil } from '../../../../__tests__/testUtils';
import {
  webChatInspectionDataState,
  currentProjectIdState,
  botProjectIdsState,
  projectMetaDataState,
  botProjectFileState,
} from '../../../recoilModel';

describe('<ActivityHighlightWrapper />', () => {
  const projectId = '1234.5678';
  const selectedActivityId = 'activity1';

  it('should apply a selected class if the item is selected', () => {
    const { getByTestId } = renderWithRecoil(
      <ActivityHighlightWrapper activityId={selectedActivityId} />,
      ({ set }) => {
        set(currentProjectIdState, projectId);
        set(botProjectIdsState, [projectId]);
        set(projectMetaDataState(projectId), { isRootBot: true, isRemote: false });
        set(botProjectFileState(projectId), { foo: 'bar' } as any);
        set(webChatInspectionDataState(projectId), {
          item: {
            activity: {
              id: selectedActivityId,
              type: 'message',
            } as any,
            id: 'outerId1',
            timestamp: Date.now(),
            trafficType: 'activity',
          },
        });
      }
    );
    getByTestId('composer-wc-activity-selected');
  });

  it('should not apply a selected class if the item is not selected', () => {
    const { getByTestId } = renderWithRecoil(
      <ActivityHighlightWrapper activityId={'someOtherActivity'} />,
      ({ set }) => {
        set(currentProjectIdState, projectId);
        set(botProjectIdsState, [projectId]);
        set(projectMetaDataState(projectId), { isRootBot: true, isRemote: false });
        set(botProjectFileState(projectId), { foo: 'bar' } as any);
        set(webChatInspectionDataState(projectId), {
          item: {
            activity: {
              id: selectedActivityId,
              type: 'message',
            } as any,
            id: 'outerId1',
            timestamp: Date.now(),
            trafficType: 'activity',
          },
        });
      }
    );
    getByTestId('composer-wc-activity');
  });
});
