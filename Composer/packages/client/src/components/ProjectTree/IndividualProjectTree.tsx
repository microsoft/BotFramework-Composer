// // Copyright (c) Microsoft Corporation.
// // Licensed under the MIT License.

// import React, { useCallback, useMemo, useRef, Fragment } from 'react';
// import { useRecoilValue } from 'recoil';
// import { GroupedList, IGroup, IGroupHeaderProps, IGroupRenderProps } from 'office-ui-fabric-react/lib/GroupedList';
// import cloneDeep from 'lodash/cloneDeep';
// import { DialogInfo, ITrigger } from '@bfc/shared/src/types/indexers';
// import { IGroupedList } from 'office-ui-fabric-react/lib/GroupedList';
// import { IGroupedListStyles } from 'office-ui-fabric-react/lib/GroupedList';
// import { jsx, css } from '@emotion/core';

// import { dialogsNewState, dispatcherState } from '../../recoilModel';
// import { createSelectedPath, getFriendlyName } from '../../utils/dialogUtil';

// import { TreeItem } from './treeItem';

// // -------------------- Styles -------------------- //

// const groupListStyle: Partial<IGroupedListStyles> = {
//   root: {
//     width: '100%',
//     boxSizing: 'border-box',
//   },
// };

// interface IIndividualProjectTreeProps {
//   projectId: string;
//   dialogId: string;
//   selected: string;
//   onSelect: (projectId: string, id: string, selected?: string) => void;
//   onDeleteTrigger: (id: string, index: number) => void;
//   onDeleteDialog: (id: string) => void;
//   filter: string;
// }

// function sortDialog(dialogs: DialogInfo[]) {
//   const dialogsCopy = cloneDeep(dialogs);
//   return dialogsCopy.sort((x, y) => {
//     if (x.isRoot) {
//       return -1;
//     } else if (y.isRoot) {
//       return 1;
//     } else {
//       return 0;
//     }
//   });
// }

// // -------------------- ProjectTree -------------------- //

// function createGroupItem(dialog: DialogInfo, currentId: string, position: number) {
//   return {
//     key: dialog.id,
//     name: dialog.displayName,
//     level: 1,
//     startIndex: position,
//     count: dialog.triggers.length,
//     hasMoreData: true,
//     isCollapsed: dialog.id !== currentId,
//     data: dialog,
//   };
// }

// function createItem(trigger: ITrigger, index: number) {
//   return {
//     ...trigger,
//     index,
//     displayName: trigger.displayName || getFriendlyName({ $kind: trigger.type }),
//   };
// }

// function createItemsAndGroups(
//   dialogs: DialogInfo[],
//   dialogId: string,
//   filter: string
// ): { items: any[]; groups: IGroup[] } {
//   let position = 0;
//   const result = dialogs
//     .filter((dialog) => {
//       return dialog.displayName.toLowerCase().includes(filter.toLowerCase());
//     })
//     .reduce(
//       (result: { items: any[]; groups: IGroup[] }, dialog) => {
//         result.groups.push(createGroupItem(dialog, dialogId, position));
//         position += dialog.triggers.length;
//         dialog.triggers.forEach((item, index) => {
//           result.items.push(createItem(item, index));
//         });
//         return result;
//       },
//       { items: [], groups: [] }
//     );
//   console.log(result);
//   return result;
// }

// export const IndividualProjectTree: React.FC<IIndividualProjectTreeProps> = ({
//   projectId,
//   dialogId,
//   selected,
//   onSelect,
//   onDeleteTrigger,
//   onDeleteDialog,
//   filter,
// }: IIndividualProjectTreeProps) => {
//   const groupRef: React.RefObject<IGroupedList> = useRef(null);
//   const { onboardingAddCoachMarkRef } = useRecoilValue(dispatcherState);
//   const dialogs = useRecoilValue(dialogsNewState(projectId));
//   const addMainDialogRef = useCallback((mainDialog) => onboardingAddCoachMarkRef({ mainDialog }), []);

//   const sortedDialogs = useMemo(() => {
//     return sortDialog(dialogs);
//   }, [dialogs]);

//   const itemsAndGroups: { items: any[]; groups: IGroup[] } = createItemsAndGroups(sortedDialogs, dialogId, filter);

//   const onRenderHeader = (props: IGroupHeaderProps) => {
//     const toggleCollapse = (): void => {
//       groupRef.current?.toggleCollapseAll(true);
//       props.onToggleCollapse?.(props.group!);
//       onSelect(projectId, props.group!.key);
//     };
//     return (
//       <span ref={props.group?.data.isRoot && addMainDialogRef} role="grid">
//         <TreeItem
//           depth={0}
//           isActive={!props.group!.isCollapsed}
//           isSubItemActive={!!selected}
//           link={props.group!.data}
//           onDelete={onDeleteDialog}
//           onSelect={toggleCollapse}
//         />
//       </span>
//     );
//   };

//   function onRenderCell(nestingDepth?: number, item?: any): React.ReactNode {
//     return (
//       <TreeItem
//         depth={nestingDepth}
//         isActive={createSelectedPath(item.index) === selected}
//         link={item}
//         onDelete={() => onDeleteTrigger(dialogId, item.index)}
//         onSelect={() => onSelect(projectId, dialogId, createSelectedPath(item.index))}
//       />
//     );
//   }

//   const onRenderShowAll = () => {
//     return null;
//   };

//   return (
//     <Fragment>
//       <GroupedList
//         {...itemsAndGroups}
//         componentRef={groupRef}
//         groupProps={
//           {
//             onRenderHeader: onRenderHeader,
//             onRenderShowAll: onRenderShowAll,
//             showEmptyGroups: true,
//             showAllProps: false,
//             isAllGroupsCollapsed: true,
//           } as Partial<IGroupRenderProps>
//         }
//         styles={groupListStyle}
//         onRenderCell={onRenderCell}
//       />
//       <hr />
//     </Fragment>
//   );
// };
