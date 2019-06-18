export declare const DialogGroup: {
  RESPONSE: string;
  INPUT: string;
  BRANCHING: string;
  MEMORY: string;
  STEP: string;
  CODE: string;
  LOG: string;
  RULE: string;
  RECOGNIZER: string;
  SELECTOR: string;
  OTHER: string;
};
export declare const dialogGroups: {
  [x: string]: {
    label: string;
    types: string[];
  };
};
export declare function getDialogGroupByType(type: any): string;
