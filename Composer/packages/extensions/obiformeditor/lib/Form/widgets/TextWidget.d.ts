/// <reference types="react" />
import { BFDWidgetProps } from '../types';
interface ITextWidgetProps extends BFDWidgetProps {
  hiddenErrMessage?: boolean;
  onValidate?: (err?: JSX.Element | string) => void;
}
export declare function TextWidget(props: ITextWidgetProps): JSX.Element;
export declare namespace TextWidget {
  var defaultProps: {
    schema: {};
    options: {};
    onBlur: () => void;
    onFocus: () => void;
  };
}
export {};
