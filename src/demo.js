'use strict';

import React, {Component} from 'react';
import moment from 'moment';

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
    const endDate = startDate.clone().add(1, 'days');
    this.state = {selectedItems: [21, 22], rows: 1000, items_per_row: 100, snap: 15, startDate, endDate};
    this.reRender = this.reRender.bind(this);
  }

  componentWillMount() {
    this.reRender();
  }

  reRender() {
    this.list = [];
    this.groups = [];
    for (let i = 0; i < this.state.rows; i++) {
      let last_moment = moment('2000-01-01');
      this.groups.push({id: i, title: `Row ${i}`});
      for (let j = 0; j < this.state.items_per_row; j++) {
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
    this.forceUpdate();
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
    const {selectedItems, rows, items_per_row, snap, startDate, endDate} = this.state;
    const items = this.list;
    const groups = this.groups;
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
              <Form.Item label="Snap (mins)">
                <DatePicker.RangePicker
                  allowClear={false}
                  value={rangeValue}
                  onChange={e => {
                    this.setState({startDate: e[0], endDate: e[1]}, () => this.reRender);
                  }}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={() => this.reRender()}>
                  Set
                </Button>
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
          />
        </Layout.Content>
      </Layout>
    );
  }
}
