interface LgTemplate {
  Name: string;
  Body: string;
}

export interface NodeProps {
  id: string;
  data: any;
  focusedId: string;
  getLgTemplates: (id: string, templateName: string) => Promise<LgTemplate[]>;
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
