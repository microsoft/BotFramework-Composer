export declare enum DialogGroup {
  RESPONSE = 'RESPONSE',
  INPUT = 'INPUT',
  BRANCHING = 'BRANCHING',
  MEMORY = 'MEMORY',
  STEP = 'STEP',
  CODE = 'CODE',
  LOG = 'LOG',
  RULE = 'RULE',
  RECOGNIZER = 'RECOGNIZER',
  SELECTOR = 'SELECTOR',
  OTHER = 'OTHER',
}
export interface DialogGroupItem {
  label: string;
  types: string[];
}
export declare type DialogGroupsMap = { [key in DialogGroup]: DialogGroupItem };
export declare const dialogGroups: DialogGroupsMap;
export declare function getDialogGroupByType(type: any): DialogGroup.OTHER;
