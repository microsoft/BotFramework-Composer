// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act } from '@bfc/test-utils/lib/hooks';
import { SDKKinds } from '@bfc/shared';

import { navigationDispatcher } from '../navigation';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { focusPathState, breadcrumbState, designPageLocationState, dialogsState } from '../../atoms/botState';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '../../../recoilModel/dispatchers';
import {
  convertPathToUrl,
  navigateTo,
  checkUrl,
  updateBreadcrumb,
  getUrlSearch,
  BreadcrumbUpdateType,
} from '../../../utils/navigation';
import { createSelectedPath, getSelected } from '../../../utils/dialogUtil';
import { BreadcrumbItem } from '../../../recoilModel/types';
import { currentProjectIdState } from '../../atoms';

jest.mock('../../../utils/navigation');
jest.mock('../../../utils/dialogUtil');

const mockCheckUrl = checkUrl as jest.Mock<boolean>;
const mockNavigateTo = navigateTo as jest.Mock<void>;
const mockGetSelected = getSelected as jest.Mock<string>;
const mockUpdateBreadcrumb = updateBreadcrumb as jest.Mock<BreadcrumbItem[]>;
const mockGetUrlSearch = getUrlSearch as jest.Mock<string>;
const mockConvertPathToUrl = convertPathToUrl as jest.Mock<string>;
const mockCreateSelectedPath = createSelectedPath as jest.Mock<string>;

const projectId = '12345.678';

function expectNavTo(location: string, state: {} | null = null) {
  expect(mockNavigateTo).toHaveBeenLastCalledWith(location, state == null ? expect.anything() : state);
}

describe('navigation dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher;
  beforeEach(() => {
    mockCheckUrl.mockClear();
    mockNavigateTo.mockClear();
    mockUpdateBreadcrumb.mockReturnValue([]);
    mockConvertPathToUrl.mockClear();
    mockCreateSelectedPath.mockClear();

    mockCheckUrl.mockReturnValue(false);

    const useRecoilTestHook = () => {
      const focusPath = useRecoilValue(focusPathState(projectId));
      const breadcrumb = useRecoilValue(breadcrumbState(projectId));
      const designPageLocation = useRecoilValue(designPageLocationState(projectId));
      const dialogs = useRecoilValue(dialogsState(projectId));
      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        dialogs,
        focusPath,
        breadcrumb,
        designPageLocation,
        projectId,
        currentDispatcher,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: focusPathState(projectId), initialValue: 'path' },
        { recoilState: breadcrumbState(projectId), initialValue: [{ dialogId: '100', selected: 'a', focused: 'b' }] },
        {
          recoilState: designPageLocationState(projectId),
          initialValue: {
            dialogId: 'dialogId',
            selected: 'a',
            focused: 'b',
          },
        },
        { recoilState: currentProjectIdState, initialValue: projectId },
        {
          recoilState: dialogsState(projectId),
          initialValue: [{ id: 'newDialogId', triggers: [{ type: SDKKinds.OnBeginDialog }] }],
        },
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
        await dispatcher.setDesignPageLocation(projectId, {
          dialogId: 'dialogId',
          breadcrumb: [],
          promptTab: undefined,
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
        dialogId: 'dialogId',
        promptTab: undefined,
        focused: '',
        selected: '',
      });
    });

    it('with selection', async () => {
      await act(async () => {
        await dispatcher.setDesignPageLocation(projectId, {
          dialogId: 'dialogId',
          breadcrumb: [],
          selected: 'select',
          promptTab: undefined,
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
        dialogId: 'dialogId',
        promptTab: undefined,
        focused: '',
        selected: 'select',
      });
    });

    it('with focus overriding selection', async () => {
      await act(async () => {
        await dispatcher.setDesignPageLocation(projectId, {
          dialogId: 'dialogId',
          breadcrumb: [],
          focused: 'focus',
          selected: 'select',
          promptTab: undefined,
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
        dialogId: 'dialogId',
        promptTab: undefined,
        focused: 'focus',
        selected: 'select',
      });
    });
  });

  describe('navTo', () => {
    it('navigates to a destination', async () => {
      mockConvertPathToUrl.mockReturnValue(`/bot/${projectId}/dialogs/dialogId`);
      await act(async () => {
        await dispatcher.navTo(projectId, 'dialogId', []);
      });
      expectNavTo(`/bot/${projectId}/dialogs/dialogId`);
      expect(mockConvertPathToUrl).toBeCalledWith(projectId, 'dialogId', undefined);
    });

    it('redirects to the begin dialog trigger', async () => {
      mockConvertPathToUrl.mockReturnValue(`/bot/${projectId}/dialogs/newDialogId?selection=triggers[0]`);
      mockCreateSelectedPath.mockReturnValue('triggers[0]');
      await act(async () => {
        await dispatcher.navTo(projectId, 'newDialogId', []);
      });
      expectNavTo(`/bot/${projectId}/dialogs/newDialogId?selection=triggers[0]`);
      expect(mockConvertPathToUrl).toBeCalledWith(projectId, 'newDialogId', 'triggers[0]');
      expect(mockCreateSelectedPath).toBeCalledWith(0);
    });

    it("doesn't navigate to a destination where we already are", async () => {
      mockCheckUrl.mockReturnValue(true);
      await act(async () => {
        await dispatcher.navTo(projectId, 'dialogId', []);
      });
      expect(mockNavigateTo).not.toBeCalled();
    });
  });

  describe('selectTo', () => {
    it("doesn't go anywhere without a selection", async () => {
      await act(async () => {
        await dispatcher.selectTo(projectId, '');
      });
      expect(mockNavigateTo).not.toBeCalled();
    });

    it('navigates to a default URL with selected path', async () => {
      mockConvertPathToUrl.mockReturnValue(`/bot/${projectId}/dialogs/dialogId?selected=selection`);
      await act(async () => {
        await dispatcher.selectTo(projectId, 'selection');
      });
      expectNavTo(`/bot/${projectId}/dialogs/dialogId?selected=selection`);
      expect(mockConvertPathToUrl).toBeCalledWith(projectId, 'dialogId', 'selection');
    });

    it("doesn't go anywhere if we're already there", async () => {
      mockCheckUrl.mockReturnValue(true);
      await act(async () => {
        await dispatcher.selectTo(projectId, 'selection');
      });
      expect(mockNavigateTo).not.toBeCalled();
    });
  });

  describe('focusTo', () => {
    it('goes to the same page with no arguments', async () => {
      await act(async () => {
        await dispatcher.focusTo(projectId, '', '');
      });
      expectNavTo(`/bot/${projectId}/dialogs/dialogId?selected=a`);
    });

    it('goes to a focused page', async () => {
      mockGetSelected.mockReturnValueOnce('select');
      await act(async () => {
        await dispatcher.focusTo(projectId, 'focus', '');
      });
      expectNavTo(`/bot/${projectId}/dialogs/dialogId?selected=select&focused=focus`);
      expect(mockUpdateBreadcrumb).toHaveBeenCalledWith(expect.anything(), BreadcrumbUpdateType.Selected);
      expect(mockUpdateBreadcrumb).toHaveBeenCalledWith(expect.anything(), BreadcrumbUpdateType.Focused);
    });

    it('goes to a focused page with fragment', async () => {
      mockGetSelected.mockReturnValueOnce('select');
      await act(async () => {
        await dispatcher.focusTo(projectId, 'focus', 'fragment');
      });
      expectNavTo(`/bot/${projectId}/dialogs/dialogId?selected=select&focused=focus#fragment`);
      expect(mockUpdateBreadcrumb).toHaveBeenCalledWith(expect.anything(), BreadcrumbUpdateType.Selected);
      expect(mockUpdateBreadcrumb).toHaveBeenCalledWith(expect.anything(), BreadcrumbUpdateType.Focused);
    });

    it('stays on the same page but updates breadcrumbs with a checked URL', async () => {
      mockCheckUrl.mockReturnValue(true);
      mockGetSelected.mockReturnValueOnce('select');
      await act(async () => {
        await dispatcher.focusTo(projectId, 'focus', 'fragment');
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
        await dispatcher.selectAndFocus(projectId, 'dialogId', 'select', 'focus');
      });
      expectNavTo(`/bot/${projectId}/dialogs/dialogId?foo=bar&baz=quux`);
    });

    it("doesn't go anywhere if we're already there", async () => {
      mockCheckUrl.mockReturnValue(true);
      await act(async () => {
        await dispatcher.selectAndFocus(projectId, 'dialogId', 'select', 'focus');
      });
      expect(mockNavigateTo).not.toBeCalled();
    });
  });
});
