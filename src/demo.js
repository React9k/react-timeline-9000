'use strict';

import React, {Component} from 'react';
import moment from 'moment';

import Timeline from './timeline';

const ROWS = 1000;
const ITEMS_PER_ROW = 100;
const ITEM_DURATIONS = [
  moment.duration(15, 'minutes'),
  moment.duration(30, 'minutes'),
  moment.duration(1, 'hours'),
  moment.duration(2, 'hours'),
  moment.duration(3, 'hours')
];
const SPACE_DURATIONS = [
  moment.duration(0, 'minutes'),
  moment.duration(1, 'hours'),
  moment.duration(3, 'hours'),
  moment.duration(30, 'minutes')
];
const COLORS = ['lightblue', 'red', 'green', 'yellow', 'orange', 'pink'];

export default class DemoTimeline extends Component {
  constructor(props) {
    super(props);
    this.state = {selectedItems: [21, 22]};

    this.list = [];
    this.groups = [];
    for (let i = 0; i < ROWS; i++) {
      let last_moment = moment('2000-01-01');
      this.groups.push({id: i, title: `Row ${i}`});
      for (let j = 0; j < ITEMS_PER_ROW; j++) {
        const color = COLORS[(i + j) % COLORS.length];
        const duration = ITEM_DURATIONS[Math.floor(Math.random() * ITEM_DURATIONS.length)];
        let start = last_moment;
        let end = start.clone().add(duration);
        last_moment = end.clone().add(SPACE_DURATIONS[Math.floor(Math.random() * SPACE_DURATIONS.length)]);
        this.list.push({
          key: `${i}${j}`,
          title: duration.humanize(),
          color,
          row: i,
          start,
          end
        });
      }
    }
  }

  handleItemClick = (e, key) => {
    console.log('from demo ', key);
    const {selectedItems} = this.state;

    let newSelection = selectedItems.slice();

    // If the item is already selected, then unselected
    const idx = selectedItems.indexOf(key);
    if (idx > -1) {
      // Splice modifies in place and returns removed elements
      newSelection.splice(idx, 1);
    } else {
      newSelection.push(Number(key));
    }

    this.setState({selectedItems: newSelection});
  };

  handleInteraction = e => {
    console.log('interaction ');
  };

  render() {
    const {selectedItems} = this.state;
    const items = this.list;
    const groups = this.groups;
    const startDate = moment('2000-01-01');
    const endDate = startDate.clone().add(1, 'days');

    return (
      <Timeline
        items={items}
        groups={groups}
        startDate={startDate}
        endDate={endDate}
        selectedItems={selectedItems}
        onItemClick={this.handleItemClick}
        onInteraction={this.handleInteraction}
      />
    );
  }
}
