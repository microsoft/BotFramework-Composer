export interface NodeProps {
  id: string;
  data: { [key: string]: any };
  focusedId: string;
  onEvent: (action, id) => object;
  onResize: (action, id) => object;
}

export const defaultNodeProps = {
  data: {},
  focusedId: '',
  onEvent: () => {},
  onResize: () => {},
};
