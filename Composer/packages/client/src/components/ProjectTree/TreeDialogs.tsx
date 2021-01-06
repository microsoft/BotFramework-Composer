// // Copyright (c) Microsoft Corporation.
// // Licensed under the MIT License.

// /** @jsx jsx */
// import { jsx } from '@emotion/core';
// import React from 'react';
// import { useRecoilValue } from 'recoil';
// import formatMessage from 'format-message';
// import { Diagnostic } from '@bfc/shared';
// import { jsx, css } from '@emotion/core';

// import { dispatcherState, pageElementState, PerProjectTreeData } from '../../recoilModel';
// import { BotStatus } from '../../constants';
// import TelemetryClient from '../../telemetry/TelemetryClient';

// import { ProjectTreeOptions } from './ProjectTreeNew';
// import { TreeItem } from './treeItem';
// import { ExpandableNode } from './ExpandableNode';
// import { INDENT_PER_LEVEL } from './constants';

// export type TreeLink = {
//   displayName: string;
//   isRoot: boolean;
//   bot?: BotInProject;
//   diagnostics: Diagnostic[];
//   projectId: string;
//   skillId?: string;
//   dialogId?: string;
//   trigger?: number;
//   lgFileId?: string;
//   luFileId?: string;
//   parentLink?: TreeLink;
//   onErrorClick?: (projectId: string, skillId: string, diagnostic: Diagnostic) => void;
// };

// type TreeDialogsProps = {
//   bot: PerProjectTreeData;
//   options: ProjectTreeOptions;
//   onSelect?: (link: TreeLink) => void;
//   onBotDeleteDialog?: (projectId: string, dialogId: string) => void;
//   onBotCreateDialog?: (projectId: string) => void;
//   onBotStart?: (projectId: string) => void;
//   onBotStop?: (projectId: string) => void;
//   onBotEditManifest?: (projectId: string) => void;
//   onBotExportZip?: (projectId: string) => void;
//   onBotRemoveSkill?: (skillId: string) => void;
//   onDialogCreateTrigger?: (projectId: string, dialogId: string) => void;
//   onDialogDeleteTrigger?: (projectId: string, dialogId: string, index: number) => void;
//   onErrorClick?: (projectId: string, skillId: string, diagnostic: Diagnostic) => void;
// };

// const headerCSS = (label: string) => css`
//   margin-top: -6px;
//   width: 100%;
//   label: ${label};
// `;

// const TREE_PADDING = 100; // the horizontal space taken up by stuff in the tree other than text or indentation
// const LEVEL_PADDING = 44; // the size of a reveal-triangle and the space around it

// export const TreeDialogs: React.FC<TreeDialogsProps> = (props) => {
//   const { bot, options } = props;
//   const { setPageElementState } = useRecoilValue(dispatcherState);
//   const pageElements = useRecoilValue(pageElementState).dialogs;

//   const getPageElement = (name: string) => pageElements?.[name];

//   const setPageElement = (name: string, value: any) =>
//     setPageElementState('dialogs', { ...pageElements, [name]: value });

//   const createBotSubtree = () => {
//     const key = 'bot-' + bot.projectId;
//     if (options.showDialogs && !bot.isRemote) {
//       return (
//         <ExpandableNode
//           key={key}
//           defaultState={getPageElement(key)}
//           summary={{}}
//           onToggle={(newState) => setPageElement(key, newState)}
//         >
//           <div>{createDetailsTree(bot, 1)}</div>
//         </ExpandableNode>
//       );
//     } else if (options.showRemote) {
//       return renderBotHeader(bot);
//     } else {
//       return null;
//     }
// }
//  return (
//     <span key={bot.name} css={headerCSS('bot-header')} data-testid={`BotHeader-${bot.name}`} role="grid">
//       <TreeItem
//         hasChildren={!bot.isRemote}
//         icon={bot.isRemote ? icons.EXTERNAL_SKILL : icons.BOT}
//         isActive={doesLinkMatch(link, selectedLink)}
//         isMenuOpen={isMenuOpen}
//         link={link}
//         menu={options.showMenu ? menu : []}
//         menuOpenCallback={setMenuOpen}
//         showErrors={options.showErrors}
//         textWidth={leftSplitWidth - TREE_PADDING}
//         onSelect={options.showCommonLinks ? undefined : handleOnSelect}
//       />
//     </span>
//   );
// };
