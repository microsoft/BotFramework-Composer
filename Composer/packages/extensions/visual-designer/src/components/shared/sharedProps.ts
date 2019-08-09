export interface LgTemplate {
  Name: string;
  Body: string;
}

export interface EditorProps {
  id: string;
  data: any;
  onEvent: (action, id) => object | void;
}
export interface NodeProps {
  id: string;
  data: any;
  focused?: boolean;
  onEvent: (action, id, ...rest) => object | void;
  onResize: (action?, id?) => object | void;

  selectableRef?: any;
  selected?: boolean;
  selecting?: boolean;
  isRoot?: boolean;
}

export const defaultNodeProps = {
  id: '',
  data: {},
  onEvent: () => {},
  onResize: () => {},
};
