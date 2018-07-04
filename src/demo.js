'use strict';

import React, {Component} from 'react';
import moment from 'moment';
import _ from 'lodash';
import Timeline from './timeline';

import {Layout, Form, InputNumber, Button, DatePicker} from 'antd';
import 'antd/dist/antd.css';

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
    const startDate = moment('2000-01-01');
    const endDate = startDate.clone().add(2, 'days');
    this.state = {selectedItems: [1, 2], rows: 1000, items_per_row: 100, snap: 15, startDate, endDate};
    this.reRender = this.reRender.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
  }

  componentWillMount() {
    this.reRender();
  }

  reRender() {
    const list = [];
    const groups = [];
    let key = 0;
    for (let i = 0; i < this.state.rows; i++) {
      let last_moment = moment('2000-01-01');
      groups.push({id: i, title: `Row ${i}`});
      for (let j = 0; j < this.state.items_per_row; j++) {
        key += 1;
        const color = COLORS[(i + j) % COLORS.length];
        const duration = ITEM_DURATIONS[Math.floor(Math.random() * ITEM_DURATIONS.length)];
        let start = last_moment;
        let end = start.clone().add(duration);
        last_moment = end.clone().add(SPACE_DURATIONS[Math.floor(Math.random() * SPACE_DURATIONS.length)]);
        list.push({
          key: key,
          title: duration.humanize(),
          color,
          row: i,
          start,
          end
        });
      }
    }

    // this.state = {selectedItems: [11, 12], groups, items: list};
    this.forceUpdate();
    this.setState({items: list, groups});
  }

  handleRowClick = (e, rowNumber, time) => {
    console.log('row clicked', rowNumber, time);

    this.setState({selectedItems: []});
  };
  zoomIn() {
    let currentMins = this.state.endDate.diff(this.state.startDate, 'minutes');
    let newMins = currentMins / 2;
    this.setState({endDate: this.state.startDate.clone().add(newMins, 'minutes')});
  }
  zoomOut() {
    let currentMins = this.state.endDate.diff(this.state.startDate, 'minutes');
    let newMins = currentMins * 2;
    this.setState({endDate: this.state.startDate.clone().add(newMins, 'minutes')});
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

  handleInteraction = (type, changes, selectedItems) => {
    console.log('interaction ', type, changes, selectedItems);

    const newItems = _.clone(this.state.items);

    switch (type) {
      case Timeline.changeTypes.dragStart: {
        return selectedItems;
      }
      case Timeline.changeTypes.dragEnd: {
        const {rowChangeDelta, timeDelta} = changes;
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
      case Timeline.changeTypes.resizeStart: {
        return selectedItems;
      }
      case Timeline.changeTypes.resizeEnd: {
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
      default:
        return changes;
    }
  };

  render() {
    const {selectedItems, rows, items_per_row, snap, startDate, endDate, items, groups} = this.state;
    // const items = this.ti;
    // const groups = this.groups;
    const rangeValue = [startDate, endDate];

    return (
      <Layout className="layout">
        <Layout.Content>
          <div style={{margin: 24}}>
            <Form layout="inline">
              <Form.Item label="No rows">
                <InputNumber value={rows} onChange={e => this.setState({rows: e})} />
              </Form.Item>
              <Form.Item label="No items per row">
                <InputNumber value={items_per_row} onChange={e => this.setState({items_per_row: e})} />
              </Form.Item>
              <Form.Item label="Snap (mins)">
                <InputNumber value={snap} onChange={e => this.setState({snap: e})} />
              </Form.Item>
              <Form.Item label="Date Range">
                <DatePicker.RangePicker
                  allowClear={false}
                  value={rangeValue}
                  showTime
                  onChange={e => {
                    this.setState({startDate: e[0], endDate: e[1]}, () => this.reRender());
                  }}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={() => this.reRender()}>
                  Set
                </Button>
              </Form.Item>
              <Form.Item>
                <Button onClick={this.zoomIn}>Zoom in</Button>
              </Form.Item>
              <Form.Item>
                <Button onClick={this.zoomOut}>Zoom out</Button>
              </Form.Item>
            </Form>
          </div>
          <Timeline
            items={items}
            groups={groups}
            startDate={startDate}
            endDate={endDate}
            selectedItems={selectedItems}
            snapMinutes={snap}
            onItemClick={this.handleItemClick}
            onInteraction={this.handleInteraction}
            onRowClick={this.handleRowClick}
          />
        </Layout.Content>
      </Layout>
    );
  }
}
