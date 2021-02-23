// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { navigate, NavigateOptions } from '@reach/router';

import { DesignPageLocation } from '../recoilModel/types';
import { BASEPATH } from '../constants';
import { PageMode } from '../recoilModel';
import { TreeLink } from '../components/ProjectTree/types';

import { parsePathToFocused } from './convertUtils/parsePathToFocused';
import { parsePathToSelected } from './convertUtils/parsePathToSelected';
import { parseTypeToFragment } from './convertUtils/parseTypeToFragment';
import { resolveToBasePath } from './fileUtil';

export function getFocusPath(selected: string, focused: string): string {
  if (selected && focused) return focused;

  if (!focused) return selected;

  return '';
}

export function getUrlSearch(selected: string, focused: string): string {
  const search = new URLSearchParams();
  if (selected) {
    search.append('selected', selected);
  }

  if (focused) {
    search.append('focused', focused);
  }

  let result = decodeURI(search.toString());
  if (result) {
    result = '?' + result;
  }
  return result;
}

export function checkUrl(
  currentUri: string,
  projectId: string,
  skillId: string | null,
  { dialogId, selected, focused, promptTab }: DesignPageLocation
) {
  let lastUri =
    skillId == null
      ? `/bot/${projectId}/dialogs/${dialogId}${getUrlSearch(selected, focused)}`
      : `/bot/${projectId}/skill/${skillId}/dialogs/${dialogId}${getUrlSearch(selected, focused)}`;
  if (promptTab) {
    lastUri += `#${promptTab}`;
  }
  return lastUri === currentUri;
}

export interface NavigationState {
  breadcrumb?: string[];
}

export function convertPathToUrl(
  projectId: string,
  skillId: string | null,
  dialogId: string | null,
  path?: string
): string {
  //path is like main.triggers[0].actions[0]
  //uri = id?selected=triggers[0]&focused=triggers[0].actions[0]

  let uri = `/bot/${projectId}`;
  if (skillId != null && skillId !== projectId) {
    uri += `/skill/${skillId}`;
  }
  if (dialogId != null) {
    uri += `/dialogs/${dialogId}`;
  }

  if (!path) return uri;

  const items = path.split('#');
  const sub = items[0];
  const type = items[1];
  const property = items[2];

  const selected = parsePathToSelected(sub);

  if (!selected) return uri;
  uri += `?selected=${selected}`;

  const focused = parsePathToFocused(sub);
  if (!focused) return uri;
  uri += `&focused=${focused}`;

  const fragment = parseTypeToFragment(type, property);
  if (!fragment) return uri;
  uri += `#${fragment}`;

  return uri;
}

export function navigateTo(to: string, navigateOpts: NavigateOptions<NavigationState> = {}) {
  const mapNavPath = resolveToBasePath(BASEPATH, to);
  navigate(mapNavPath, navigateOpts);
}

export const openInEmulator = (url, authSettings: { MicrosoftAppId: string; MicrosoftAppPassword: string }) => {
  // this creates a temporary hidden iframe to fire off the bfemulator protocol
  // and start up the emulator
  const i = document.createElement('iframe');
  i.style.display = 'none';
  i.onload = () => i.parentNode?.removeChild(i);
  i.src = `bfemulator://livechat.open?botUrl=${encodeURIComponent(url)}&msaAppId=${
    authSettings.MicrosoftAppId
  }&msaAppPassword=${encodeURIComponent(authSettings.MicrosoftAppPassword)}`;
  document.body.appendChild(i);
};

export function buildURL(pageMode: PageMode, link: Partial<TreeLink>) {
  const { projectId, skillId, dialogId, lgFileId, luFileId } = link;

  const baseURL = skillId == null ? `/bot/${projectId}/` : `/bot/${projectId}/skill/${skillId}/`;

  if (pageMode === 'language-generation' && lgFileId) {
    return `${baseURL}${pageMode}/${dialogId ?? 'all'}/item/${lgFileId}`;
  }

  if (pageMode === 'language-understanding' && luFileId) {
    return `${baseURL}${pageMode}/${dialogId ?? 'all'}/item/${luFileId}`;
  }

  return `${baseURL}${pageMode}/${dialogId ?? 'all'}`;
}

export function createBotSettingUrl(rootProjectId: string, activeProjectId?: string, hash?: string) {
  let url = `/bot/${rootProjectId}`;
  if (activeProjectId && rootProjectId !== activeProjectId) {
    url = `${url}/skill/${activeProjectId}`;
  }
  url = `${url}/botProjectsSettings`;
  if (hash) {
    url = `${url}/${hash}`;
  }
  return url;
}

export function createDiagnosticsPageUrl(rootProjectId: string, activeProjectId?: string) {
  let url = `/bot/${rootProjectId}`;
  if (activeProjectId && rootProjectId !== activeProjectId) {
    url = `${url}/skill/${activeProjectId}`;
  }

  return `${url}/diagnostics`;
}
