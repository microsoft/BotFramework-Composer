import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/ContextualMenu.types';
import { DefinitionSummary } from '@bfc/shared';
declare type ActionMenuItemClickHandler = (item?: IContextualMenuItem) => any;
interface ActionMenuOptions {
  isSelfHosted: boolean;
  enablePaste: boolean;
}
export declare const createActionMenu: (
  onClick: ActionMenuItemClickHandler,
  options: ActionMenuOptions,
  customActionGroups?: DefinitionSummary[][] | undefined
) => IContextualMenuItem[];
export {};
//# sourceMappingURL=createSchemaMenu.d.ts.map
