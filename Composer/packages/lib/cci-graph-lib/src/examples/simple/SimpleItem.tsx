import * as React from 'react';
import { Node } from '../../graph/Node';
import { NodeContent } from '../../graph/NodeContent';

export enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

export interface SimpleItem {
  id: string;
  value: Color;
  neighborIds: string[];
  onClick?: (id: string) => void;
}

export interface DirectedGraphItem {
  id: string;
  value: string;
  neighborIds: string[];
  contentRenderer: React.ComponentClass<any>;
  footerRenderer: React.ComponentClass<any>;
  onClick?: (id: string) => void;
}

class SimpleItemNodeContent extends NodeContent<SimpleItem> {
  public render(): React.ReactNode {
    const { id, value, onClick } = this.props.data;
    const colorClass = value === Color.Red ? 'red' : value === Color.Green ? 'green' : 'blue';

    return (
      <div className={`simple-item-content ${colorClass}`} onClick={() => onClick(id)}>
        {id}
      </div>
    );
  }
}

export const ItemRenderer = Node(SimpleItemNodeContent);
