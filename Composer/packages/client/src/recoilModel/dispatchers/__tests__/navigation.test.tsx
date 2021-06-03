// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act, HookResult } from '@botframework-composer/test-utils/lib/hooks';
import { SDKKinds } from '@bfc/shared';

import { navigationDispatcher } from '../navigation';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { focusPathState, designPageLocationState } from '../../atoms/botState';
import { dialogsSelectorFamily } from '../../selectors';
import { Dispatcher } from '../../../recoilModel/dispatchers';
import { convertPathToUrl, navigateTo, checkUrl, getUrlSearch } from '../../../utils/navigation';
import { createSelectedPath, getSelected } from '../../../utils/dialogUtil';
import {
  currentProjectIdState,
  botProjectIdsState,
  botProjectFileState,
  projectMetaDataState,
  dispatcherState,
} from '../../atoms';

jest.mock('../../../utils/navigation');
jest.mock('../../../utils/dialogUtil');

const mockCheckUrl = checkUrl as jest.Mock<boolean>;
const mockNavigateTo = navigateTo as jest.Mock<void>;
const mockGetSelected = getSelected as jest.Mock<string>;
const mockGetUrlSearch = getUrlSearch as jest.Mock<string>;
const mockConvertPathToUrl = convertPathToUrl as jest.Mock<string>;
const mockCreateSelectedPath = createSelectedPath as jest.Mock<string>;

const projectId = '12345.678';
const skillId = '98765.4321';

function expectNavTo(location: string) {
  expect(mockNavigateTo).toHaveBeenLastCalledWith(location);
}

describe('navigation dispatcher', () => {
  const useRecoilTestHook = () => {
    const focusPath = useRecoilValue(focusPathState(projectId));
    const designPageLocation = useRecoilValue(designPageLocationState(projectId));
    const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));
    const currentDispatcher = useRecoilValue(dispatcherState);

    return {
      dialogs,
      focusPath,
      designPageLocation,
      projectId,
      currentDispatcher,
    };
  };

  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeEach(() => {
    mockCheckUrl.mockClear();
    mockNavigateTo.mockClear();
    mockConvertPathToUrl.mockClear();
    mockCreateSelectedPath.mockClear();

    mockCheckUrl.mockReturnValue(false);

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: focusPathState(projectId), initialValue: 'path' },
        {
          recoilState: designPageLocationState(projectId),
          initialValue: {
            dialogId: 'dialogId',
            selected: 'a',
            focused: 'b',
          },
        },
        {
          recoilState: designPageLocationState(skillId),
          initialValue: {
            dialogId: 'dialogInSkillId',
            selected: 'a',
            focused: 'b',
          },
        },
        { recoilState: currentProjectIdState, initialValue: projectId },
        {
          recoilState: dialogsSelectorFamily(projectId),
          initialValue: [{ id: 'newDialogId', triggers: [{ type: SDKKinds.OnBeginDialog }] }],
        },
        {
          recoilState: botProjectIdsState,
          initialValue: [projectId],
        },
        {
          recoilState: botProjectFileState(projectId),
          initialValue: { foo: 'bar' },
        },
        {
          recoilState: projectMetaDataState(projectId),
          initialValue: { isRootBot: true },
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
          selected: '',
          focused: '',
          promptTab: undefined,
        });
      });
      expect(renderedComponent.current.focusPath).toEqual('dialogId#');

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
          selected: 'select',
          focused: '',
          promptTab: undefined,
        });
      });
      expect(renderedComponent.current.focusPath).toEqual('dialogId#.select');

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
          focused: 'focus',
          selected: 'select',
          promptTab: undefined,
        });
      });
      expect(renderedComponent.current.focusPath).toEqual('dialogId#.focus');

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
        await dispatcher.navTo(projectId, 'dialogId');
      });
      expectNavTo(`/bot/${projectId}/dialogs/dialogId`);
      expect(mockConvertPathToUrl).toBeCalledWith(projectId, projectId, 'dialogId');
    });
  });

  describe('selectTo', () => {
    it("doesn't go anywhere without a selection", async () => {
      await act(async () => {
        await dispatcher.selectTo(null, null, '');
      });
      expect(mockNavigateTo).not.toBeCalled();
    });

    it('navigates to a default URL with selected path', async () => {
      mockConvertPathToUrl.mockReturnValue(`/bot/${projectId}/dialogs/dialogId?selected=selection`);
      await act(async () => {
        await dispatcher.selectTo(null, null, 'selection');
      });
      expectNavTo(`/bot/${projectId}/dialogs/dialogId?selected=selection`);
      expect(mockConvertPathToUrl).toBeCalledWith(projectId, null, 'dialogId', 'selection');
    });

    it('navigates to a default URL with skillId and selected path', async () => {
      mockConvertPathToUrl.mockReturnValue(`/bot/${projectId}/skill/${skillId}/dialogs/dialogId?selected=selection`);
      await act(async () => {
        await dispatcher.selectTo(skillId, 'dialogId', 'selection');
      });
      expectNavTo(`/bot/${projectId}/skill/${skillId}/dialogs/dialogId?selected=selection`);
      expect(mockConvertPathToUrl).toBeCalledWith(projectId, skillId, 'dialogId', 'selection');
    });

    it("doesn't go anywhere if we're already there", async () => {
      mockCheckUrl.mockReturnValue(true);
      await act(async () => {
        await dispatcher.selectTo(null, null, 'selection');
      });
      expect(mockNavigateTo).not.toBeCalled();
    });
  });

  describe('focusTo', () => {
    it('goes to the same page with no arguments', async () => {
      await act(async () => {
        await dispatcher.focusTo(projectId, null, '', '');
      });
      expectNavTo(`/bot/${projectId}/dialogs/dialogId?selected=a`);
    });

    it('goes to a focused page', async () => {
      mockGetSelected.mockReturnValueOnce('select');
      await act(async () => {
        await dispatcher.focusTo(projectId, null, 'focus', '');
      });
      expectNavTo(`/bot/${projectId}/dialogs/dialogId?selected=select&focused=focus`);
    });

    it('goes to a focused page with skill', async () => {
      mockGetSelected.mockReturnValueOnce('select');
      await act(async () => {
        await dispatcher.focusTo(projectId, skillId, 'focus', '');
      });
      expectNavTo(`/bot/${projectId}/skill/${skillId}/dialogs/dialogInSkillId?selected=select&focused=focus`);
    });

    it('goes to a focused page with fragment', async () => {
      mockGetSelected.mockReturnValueOnce('select');
      await act(async () => {
        await dispatcher.focusTo(projectId, null, 'focus', 'fragment');
      });
      expectNavTo(`/bot/${projectId}/dialogs/dialogId?selected=select&focused=focus#fragment`);
    });

    it('goes to a focused page with skill and fragment', async () => {
      mockGetSelected.mockReturnValueOnce('select');
      await act(async () => {
        await dispatcher.focusTo(projectId, skillId, 'focus', 'fragment');
      });
      expectNavTo(`/bot/${projectId}/skill/${skillId}/dialogs/dialogInSkillId?selected=select&focused=focus#fragment`);
    });

    it('stays on the same page but updates breadcrumbs with a checked URL', async () => {
      mockCheckUrl.mockReturnValue(true);
      mockGetSelected.mockReturnValueOnce('select');
      await act(async () => {
        await dispatcher.focusTo(projectId, null, 'focus', 'fragment');
      });
      expect(mockNavigateTo).not.toBeCalled();
    });
  });

  describe('selectAndFocus', () => {
    it('sets selection and focus with a valid search', async () => {
      mockGetUrlSearch.mockReturnValue('?foo=bar&baz=quux');
      await act(async () => {
        await dispatcher.selectAndFocus(projectId, null, 'dialogId', 'select', 'focus');
      });
      expectNavTo(`/bot/${projectId}/dialogs/dialogId?foo=bar&baz=quux`);
    });

    it('sets selection and focus with a valid search and skillId', async () => {
      mockGetUrlSearch.mockReturnValue('?foo=bar&baz=quux');
      await act(async () => {
        await dispatcher.selectAndFocus(projectId, skillId, 'dialogId', 'select', 'focus');
      });
      expectNavTo(`/bot/${projectId}/skill/${skillId}/dialogs/dialogId?foo=bar&baz=quux`);
    });

    it("doesn't go anywhere if we're already there", async () => {
      mockCheckUrl.mockReturnValue(true);
      await act(async () => {
        await dispatcher.selectAndFocus(projectId, null, 'dialogId', 'select', 'focus');
      });
      expect(mockNavigateTo).not.toBeCalled();
    });
  });
});
