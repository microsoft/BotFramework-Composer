import { SDKKinds } from '@bfc/shared';
export interface MenuOptions {
  label?: string;
  group?: string;
  submenu?: string[] | false;
}
export declare type MenuUISchema = {
  [key in SDKKinds]?: MenuOptions | MenuOptions[];
};
//# sourceMappingURL=menuSchema.d.ts.map
