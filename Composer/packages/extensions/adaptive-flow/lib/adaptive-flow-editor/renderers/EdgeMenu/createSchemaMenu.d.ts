import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/ContextualMenu.types';
import { DefinitionSummary } from '@bfc/shared';
import { MenuUISchema } from '@bfc/extension';
declare type ActionMenuItemClickHandler = (item?: IContextualMenuItem) => any;
interface ActionMenuOptions {
  isSelfHosted: boolean;
  enablePaste: boolean;
}
export declare const createActionMenu: (
  onClick: ActionMenuItemClickHandler,
  options: ActionMenuOptions,
  menuSchema?: MenuUISchema | undefined,
  customActionGroups?: DefinitionSummary[][] | undefined
) => IContextualMenuItem[];
export {};
//# sourceMappingURL=createSchemaMenu.d.ts.map
