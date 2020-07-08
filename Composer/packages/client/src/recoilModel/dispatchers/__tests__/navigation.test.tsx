// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';

import { navigationDispatcher } from '../navigation';
import { renderRecoilHook, act } from '../../../../__tests__/testUtils';
import { focusPathState, breadcrumbState, designPageLocationState, projectIdState } from '../../atoms/botState';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';

describe('navigation dispatcher', () => {
  let renderedComponent, dispatcher;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const focusPath = useRecoilValue(focusPathState);
      const breadcrumb = useRecoilValue(breadcrumbState);
      const designPageLocation = useRecoilValue(designPageLocationState);
      const projectId = useRecoilValue(projectIdState);
      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        focusPath,
        breadcrumb,
        designPageLocation,
        projectId,
        currentDispatcher,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: focusPathState, initialValue: 'path' },
        { recoilState: breadcrumbState, initialValue: [{ dialogId: '100', selected: 'a', focused: 'b' }] },
        {
          recoilState: designPageLocationState,
          initialValue: {
            projectId: '12345',
            dialogId: 'dialogId',
            selected: 'a',
            focused: 'b',
          },
        },
        { recoilState: projectIdState, initialValue: '12345' },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          navigationDispatcher,
        },
      },
    });

    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  describe('sets the design page location', () => {
    it('with no focus or selection', async () => {
      await act(async () => {
        await dispatcher.setDesignPageLocation({
          projectId: 'projectId',
          dialogId: 'dialogId',
          breadcrumb: [],
        });
      });
      expect(renderedComponent.current.focusPath).toEqual('dialogId#');
      expect(renderedComponent.current.breadcrumb).toHaveLength(1);
      expect(renderedComponent.current.breadcrumb[0]).toEqual({
        dialogId: 'dialogId',
        focused: '',
        selected: '',
      });
      expect(renderedComponent.current.designPageLocation).toEqual({
        projectId: 'projectId',
        dialogId: 'dialogId',
        promptTab: undefined,
        focused: '',
        selected: '',
      });
    });

    it('with selection', async () => {
      await act(async () => {
        await dispatcher.setDesignPageLocation({
          projectId: 'projectId',
          dialogId: 'dialogId',
          breadcrumb: [],
          selected: 'select',
        });
      });
      expect(renderedComponent.current.focusPath).toEqual('dialogId#.select');
      expect(renderedComponent.current.breadcrumb).toHaveLength(1);
      expect(renderedComponent.current.breadcrumb[0]).toEqual({
        dialogId: 'dialogId',
        focused: '',
        selected: 'select',
      });
      expect(renderedComponent.current.designPageLocation).toEqual({
        projectId: 'projectId',
        dialogId: 'dialogId',
        promptTab: undefined,
        focused: '',
        selected: 'select',
      });
    });

    it('with focus overriding selection', async () => {
      await act(async () => {
        await dispatcher.setDesignPageLocation({
          projectId: 'projectId',
          dialogId: 'dialogId',
          breadcrumb: [],
          focused: 'focus',
          selected: 'select',
        });
      });
      expect(renderedComponent.current.focusPath).toEqual('dialogId#.focus');
      expect(renderedComponent.current.breadcrumb).toHaveLength(1);
      expect(renderedComponent.current.breadcrumb[0]).toEqual({
        dialogId: 'dialogId',
        focused: 'focus',
        selected: 'select',
      });
      expect(renderedComponent.current.designPageLocation).toEqual({
        projectId: 'projectId',
        dialogId: 'dialogId',
        promptTab: undefined,
        focused: 'focus',
        selected: 'select',
      });
    });
  });

  it('navigates to a destination', async () => {});

  it('navigates to a selected part of a destination', async () => {});

  it('navigates to a focused part of a destination', async () => {});

  it('sets selection and focus', async () => {});
});
