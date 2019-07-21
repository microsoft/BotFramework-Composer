export interface LgTemplate {
  Name: string;
  Body: string;
}

export interface NodeProps {
  id: string;
  data: any;
  focusedId: string;
  onEvent: (action, id) => object | void;
  onResize: (action?, id?) => object | void;

  isRoot?: boolean;
}

export const defaultNodeProps = {
  id: '',
  data: {},
  focusedId: '',
  onEvent: () => {},
  onResize: () => {},
};
