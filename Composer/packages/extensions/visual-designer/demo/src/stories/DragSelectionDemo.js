import React, { Component } from 'react';

import { SelectableGroup, SelectableGroupContext } from '../../../src/components/dragSelection/index';

const titles = [
  'My Aim is True',
  "This Year's Model",
  'Armed Forces',
  'Get Happy',
  'Trust',
  'Almost Blue',
  'Imperial Bedroom',
  'Punch the Clock',
  'Goodbye Cruel World',
  'King of America',
  'Blood and Chocolate',
  'Spike',
  'Mighty Like a Rose',
  'The Juliette Letters',
  'Brutal Youth',
  'Kojak Variety',
  'All This Useless Beauty',
  'Painted from Memory',
  'When I Was Cruel',
  'North',
  'The Delivery Man',
  'The River in Reverse',
  'Momofuku',
  'Secret, Profane & Sugarcane',
  'National Ransom',
];

const data = Array.from({ length: 500 }).map((item, index) => ({
  id: (index + 1).toString(),
  title: titles[index % titles.length],
}));

export class DragSelectionDemo extends Component {
  state = {
    selectedIds: [],
    testItems: data,
  };
  constructor(props) {
    super(props);
  }

  handleSelectionChange(items) {
    this.setState({ selectedIds: items });
  }

  render() {
    return (
      <SelectableGroup
        selectableTag="data-is-focused"
        selectableNodeDataTag="selectionid"
        onSelectionChange={this.handleSelectionChange.bind(this)}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {this.state.testItems.map(item => {
            return <SelectableNode key={item.id} item={item} selectedIds={this.state.selectedIds} />;
          })}
        </div>
      </SelectableGroup>
    );
  }
}

class SelectableNode extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { item, selectedIds } = this.props;
    return (
      <div
        data-is-focused={true}
        data-selectionid={item.id}
        style={{
          border: selectedIds.includes(item.id) ? '1px solid' : '',
          position: 'relative',
          width: '145px',
          minHeight: '125px',
          margin: '2px',
          textAlign: 'center',
          padding: '5px 0',
          background: 'silver',
          userSelect: 'none',
        }}
      >
        {item.title}
      </div>
    );
  }
}
