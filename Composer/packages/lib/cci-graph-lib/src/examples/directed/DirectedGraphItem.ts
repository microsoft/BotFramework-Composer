export interface DirectedGraphItem {
  id: string;
  value: string;
  neighborIds: string[];
  contentRenderer: React.ComponentClass<any>;
  footerRenderer: React.ComponentClass<any>;
  onClick?: (id: string) => void;
}
