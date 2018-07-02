'use strict';

import React, {Component} from 'react';
import moment from 'moment';
import _ from 'lodash';
import Timeline from './timeline';

const ROWS = 100;
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

    let list = [];
    let groups = [];
    for (let i = 0; i < ROWS; i++) {
      let last_moment = moment('2000-01-01');
      groups.push({id: i, title: `Row ${i}`});
      for (let j = 0; j < ITEMS_PER_ROW; j++) {
        const color = COLORS[(i + j) % COLORS.length];
        const duration = ITEM_DURATIONS[Math.floor(Math.random() * ITEM_DURATIONS.length)];
        let start = last_moment;
        let end = start.clone().add(duration);
        last_moment = end.clone().add(SPACE_DURATIONS[Math.floor(Math.random() * SPACE_DURATIONS.length)]);
        list.push({
          key: Number(`${i}${j}`),
          title: duration.humanize(),
          color,
          row: i,
          start,
          end
        });
      }
    }

    this.state = {selectedItems: [11, 12], groups, items: list};
  }

  handleRowClick = (e, rowNumber, time) => {
    console.log('row clicked', rowNumber, time);

    this.setState({selectedItems: []});
  };

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

  handleInteraction = (type, changes, selectedItems) => {
    console.log('interaction ', type, changes, selectedItems);

    // const newItems = JSON.parse(JSON.stringify(this.state.items));
    const newItems = _.cloneDeep(this.state.items);

    switch (type) {
      case Timeline.changeTypes.resizeEnd: {
        console.log('resize end interaction');
        const {isStartTimeChange, timeDelta} = changes;
        newItems.forEach(item => {
          if (selectedItems.includes(item.key)) {
            if (isStartTimeChange) {
              item.start = item.start.clone().add(timeDelta, 'minutes');
            } else {
              item.end = item.end.clone().add(timeDelta, 'minutes');
            }
          }
        });

        this.setState({items: newItems});
        break;
      }
      case Timeline.changeTypes.dragEnd: {
        console.log('drag end interaction');
        const {rowChangeDelta, timeDelta} = changes;
        // Update the item with the new changes.
        newItems.forEach(item => {
          if (selectedItems.includes(item.key)) {
            let itemDuration = item.end.diff(item.start);
            let newStart = item.start.clone().add(timeDelta, 'minutes');
            let newEnd = newStart.clone().add(itemDuration);
            item.start = newStart;
            item.end = newEnd;

            if (rowChangeDelta < 0) {
              item.row = Math.max(0, item.row + rowChangeDelta);
            } else if (rowChangeDelta > 0) {
              item.row = Math.min(this.state.groups.length - 1, item.row + rowChangeDelta);
            }
          }
        });

        this.setState({items: newItems});
        break;
      }
      default:
        return changes;
    }
  };

  render() {
    const {selectedItems, groups, items} = this.state;
    const startDate = moment('2000-01-01');
    const endDate = startDate.clone().add(1, 'days');
    const snapMinutes = 15;

    return (
      <Timeline
        items={items}
        groups={groups}
        startDate={startDate}
        endDate={endDate}
        selectedItems={selectedItems}
        snapMinutes={snapMinutes}
        onItemClick={this.handleItemClick}
        onInteraction={this.handleInteraction}
        onRowClick={this.handleRowClick}
      />
    );
  }
}
