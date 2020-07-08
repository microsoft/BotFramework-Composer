// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act } from '@bfc/test-utils/lib/hooks';

import { navigationDispatcher } from '../navigation';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { focusPathState, breadcrumbState, designPageLocationState, projectIdState } from '../../atoms/botState';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { navigateTo, checkUrl, updateBreadcrumb, getUrlSearch, BreadcrumbUpdateType } from '../../../utils/navigation';
import { getSelected } from '../../../utils/dialogUtil';
import { BreadcrumbItem } from '../../../recoilModel/types';

jest.mock('../../../utils/navigation');
jest.mock('../../../utils/dialogUtil');

const mockCheckUrl = checkUrl as jest.Mock<boolean>;
const mockNavigateTo = navigateTo as jest.Mock<void>;
const mockGetSelected = getSelected as jest.Mock<string>;
const mockUpdateBreadcrumb = updateBreadcrumb as jest.Mock<BreadcrumbItem[]>;
const mockGetUrlSearch = getUrlSearch as jest.Mock<string>;

const PROJECT_ID = '12345.678';

function expectNavTo(location: string, state: {} | null = null) {
  expect(mockNavigateTo).toHaveBeenLastCalledWith(location, state == null ? expect.anything() : state);
}

describe('navigation dispatcher', () => {
  let renderedComponent, dispatcher;
  beforeEach(() => {
    mockCheckUrl.mockClear();
    mockNavigateTo.mockClear();
    mockUpdateBreadcrumb.mockReturnValue([]);

    mockCheckUrl.mockReturnValue(false);

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
            projectId: PROJECT_ID,
            dialogId: 'dialogId',
            selected: 'a',
            focused: 'b',
          },
        },
        { recoilState: projectIdState, initialValue: PROJECT_ID },
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

  describe('navTo', () => {
    it('navigates to a destination', async () => {
      await act(async () => {
        await dispatcher.navTo('dialogId', []);
      });
      expectNavTo(`/bot/${PROJECT_ID}/dialogs/dialogId`);
    });

    it("doesn't navigate to a destination where we already are", async () => {
      mockCheckUrl.mockReturnValue(true);
      await act(async () => {
        await dispatcher.navTo('dialogId', []);
      });
      expect(mockNavigateTo).not.toBeCalled();
    });
  });

  describe('selectTo', () => {
    it("doesn't go anywhere without a selection", async () => {
      await act(async () => {
        await dispatcher.selectTo('');
      });
      expect(mockNavigateTo).not.toBeCalled();
    });

    it('navigates to a default URL with selected path', async () => {
      await act(async () => {
        await dispatcher.selectTo('selection');
      });
      expectNavTo(`/bot/${PROJECT_ID}/dialogs/dialogId?selected=selection`);
    });

    it("doesn't go anywhere if we're already there", async () => {
      mockCheckUrl.mockReturnValue(true);
      await act(async () => {
        await dispatcher.selectTo('selection');
      });
      expect(mockNavigateTo).not.toBeCalled();
    });
  });

  describe('focusTo', () => {
    it('goes to the same page with no arguments', async () => {
      await act(async () => {
        await dispatcher.focusTo();
      });
      expectNavTo(`/bot/${PROJECT_ID}/dialogs/dialogId?selected=a`);
    });

    it('goes to a focused page', async () => {
      mockGetSelected.mockReturnValueOnce('select');
      await act(async () => {
        await dispatcher.focusTo('focus');
      });
      expectNavTo(`/bot/${PROJECT_ID}/dialogs/dialogId?selected=select&focused=focus`);
      expect(mockUpdateBreadcrumb).toHaveBeenCalledWith(expect.anything(), BreadcrumbUpdateType.Selected);
      expect(mockUpdateBreadcrumb).toHaveBeenCalledWith(expect.anything(), BreadcrumbUpdateType.Focused);
    });

    it('goes to a focused page with fragment', async () => {
      mockGetSelected.mockReturnValueOnce('select');
      await act(async () => {
        await dispatcher.focusTo('focus', 'fragment');
      });
      expectNavTo(`/bot/${PROJECT_ID}/dialogs/dialogId?selected=select&focused=focus#fragment`);
      expect(mockUpdateBreadcrumb).toHaveBeenCalledWith(expect.anything(), BreadcrumbUpdateType.Selected);
      expect(mockUpdateBreadcrumb).toHaveBeenCalledWith(expect.anything(), BreadcrumbUpdateType.Focused);
    });

    it('stays on the same page but updates breadcrumbs with a checked URL', async () => {
      mockCheckUrl.mockReturnValue(true);
      mockGetSelected.mockReturnValueOnce('select');
      await act(async () => {
        await dispatcher.focusTo('focus', 'fragment');
      });
      expect(mockNavigateTo).not.toBeCalled();
      expect(mockUpdateBreadcrumb).toHaveBeenCalledWith(expect.anything(), BreadcrumbUpdateType.Selected);
      expect(mockUpdateBreadcrumb).toHaveBeenCalledWith(expect.anything(), BreadcrumbUpdateType.Focused);
    });
  });

  describe('selectAndFocus', () => {
    it('sets selection and focus with a valud search', async () => {
      mockGetUrlSearch.mockReturnValue('?foo=bar&baz=quux');
      await act(async () => {
        await dispatcher.selectAndFocus('dialogId', 'select', 'focus');
      });
      expectNavTo(`/bot/${PROJECT_ID}/dialogs/dialogId?foo=bar&baz=quux`);
    });

    it("doesn't go anywhere if we're already there", async () => {
      mockCheckUrl.mockReturnValue(true);
      await act(async () => {
        await dispatcher.selectAndFocus('dialogId', 'select', 'focus');
      });
      expect(mockNavigateTo).not.toBeCalled();
    });
  });
});
