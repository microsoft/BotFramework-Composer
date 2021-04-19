// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil } from '../../../__tests__/testUtils/renderWithRecoil';
import { PVADisableFeature } from '../PVADisableFeature';
import { schemasState } from '../../recoilModel';

describe('<PVADisableFeature />', () => {
  const projectId = '123a.324';

  it('should wrap the element with a tooltip for PVA bot', async () => {
    const { container } = renderWithRecoil(
      <PVADisableFeature projectId={projectId}>
        <span>Test element</span>
      </PVADisableFeature>,
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
      <PVADisableFeature projectId={projectId}>
        <span>Test element</span>
      </PVADisableFeature>,
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
