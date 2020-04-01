import React from 'react';
import { LuFile } from '@bfc/indexers';
import { LuIntentSection } from '@bfc/shared';
import { FormContext } from '../types';
interface LuEditorWidgetProps {
  formContext: FormContext;
  name: string;
  height?: number | string;
  onChange?: (template?: string) => void;
  prompt?: boolean;
}
export declare class LuEditorWidget extends React.Component<LuEditorWidgetProps> {
  constructor(props: any);
  formContext: FormContext;
  name: string;
  luFileId: string;
  luFile?: LuFile;
  luIntent: LuIntentSection;
  state: {
    localValue: string;
  };
  debounceUpdate: any;
  updateLuIntent: (body: string) => void;
  static getDerivedStateFromProps(
    nextProps: any,
    prevState: any
  ): {
    localValue: any;
  } | null;
  onChange: (body: string) => void;
  render(): JSX.Element;
}
export {};
//# sourceMappingURL=LuEditorWidget.d.ts.map
