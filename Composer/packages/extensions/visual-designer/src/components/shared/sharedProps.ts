export interface LgTemplate {
  Name: string;
  Body: string;
}

export interface EditorProps {
  id: string;
  data: any;
  onEvent: (action, id) => object | void;

  hideSteps?: boolean;
}
export interface NodeProps {
  id: string;
  data: any;
  focused?: boolean;
  onEvent: (action, id) => object | void;
  onResize: (action?, id?) => object | void;

  isRoot?: boolean;
}

export const defaultNodeProps = {
  id: '',
  data: {},
  onEvent: () => {},
  onResize: () => {},
};
