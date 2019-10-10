export interface NodeProps {
  id: string;
  data: any;
  focused?: boolean;
  onEvent: (action, id, ...rest) => object | void;
  onResize: (action?, id?) => object | void;

  isRoot?: boolean;
}

export interface CardProps {
  id: string;
  data: any;
  label: string;
  focused?: boolean;

  onEvent: (action, id, ...rest) => object | void;
  onResize?: (action?, id?) => object | void;
}

export const defaultNodeProps = {
  id: '',
  data: {},
  onEvent: () => {},
  onResize: () => {},
};
