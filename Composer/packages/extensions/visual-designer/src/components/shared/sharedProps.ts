export interface NodeProps {
  id: string;
  data: { [key: string]: any };
  focusedId: string;
  onEvent: (action, id) => object | void;
  onResize: (action?, id?) => object | void;
}

export const defaultNodeProps = {
  id: '',
  data: {},
  focusedId: '',
  onEvent: () => {},
  onResize: () => {},
};
