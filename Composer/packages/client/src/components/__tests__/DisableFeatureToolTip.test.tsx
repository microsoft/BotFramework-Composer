// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil } from '../../../__tests__/testUtils/renderWithRecoil';
import { DisableFeatureToolTip } from '../DisableFeatureToolTip';
import { schemasState } from '../../recoilModel';

describe('<DisableFeatureToolTip />', () => {
  const projectId = '123a.324';

  it('should wrap the element with a tooltip for PVA bot', async () => {
    const { container } = renderWithRecoil(
      <DisableFeatureToolTip isPVABot>
        <span>Test element</span>
      </DisableFeatureToolTip>,
      ({ set }) => {
        set(schemasState(projectId), {
          sdk: {
            content: {
              definitions: {
                'Microsoft.VirtualAgents.Recognizer': true,
              },
            },
          },
        });
      }
    );
    const tooltipElement = container.querySelector('#pva-disable-tooltip0');
    expect(tooltipElement).toBeDefined();
  });

  it('should not wrap the element with a tooltip for non PVA bot', async () => {
    const { container } = renderWithRecoil(
      <DisableFeatureToolTip isPVABot={false}>
        <span>Test element</span>
      </DisableFeatureToolTip>,
      ({ set }) => {
        set(schemasState(projectId), {
          sdk: {
            content: {
              definitions: {
                'Microsoft.VirtualAgents.OrchestratorRecognizer': true,
              },
            },
          },
        });
      }
    );
    const tooltipElement = container.querySelector('#pva-disable-tooltip0');
    expect(tooltipElement).toBeNull();
  });
});
