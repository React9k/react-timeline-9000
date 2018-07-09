'use strict';

import React, {Component} from 'react';
import moment from 'moment';
import _ from 'lodash';
import Timeline from './timeline';

import {Layout, Form, InputNumber, Button, DatePicker, Switch} from 'antd';
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
const COLORS = ['#0099cc', '#f03a36', '#06ad96', '#fce05b', '#dd5900', '#cc6699'];

export function customItemRenderer(props) {
  const {item, ...rest} = props;

  return <span {...rest}> Custom </span>;
}

export function customGroupRenderer(props) {
  const {group, ...rest} = props;

  return (
    <span group-index={group.id} {...rest}>
      Custom {group.title}
    </span>
  );
}

export default class DemoTimeline extends Component {
  constructor(props) {
    super(props);
    const startDate = moment('2000-01-01');
    const endDate = startDate.clone().add(2, 'days');
    this.state = {selectedItems: [], rows: 100, items_per_row: 30, snap: 15, startDate, endDate, message: ''};
    this.reRender = this.reRender.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.toggleCustomRenderers = this.toggleCustomRenderers.bind(this);
  }

  componentWillMount() {
    this.reRender();
  }

  reRender() {
    const list = [];
    const groups = [];
    this.key = 0;
    for (let i = 0; i < this.state.rows; i++) {
      let last_moment = moment('2000-01-01');
      groups.push({id: i, title: `Row ${i}`});
      for (let j = 0; j < this.state.items_per_row; j++) {
        this.key += 1;
        const color = COLORS[(i + j) % COLORS.length];
        const duration = ITEM_DURATIONS[Math.floor(Math.random() * ITEM_DURATIONS.length)];
        let start = last_moment;
        let end = start.clone().add(duration);
        last_moment = end.clone().add(SPACE_DURATIONS[Math.floor(Math.random() * SPACE_DURATIONS.length)]);
        list.push({
          key: this.key,
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
    const message = `Row Click row=${rowNumber} @${time.toString()}`;
    this.setState({selectedItems: [], message});
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

  toggleCustomRenderers(checked) {
    this.setState({useCustomRenderers: checked});
  }

  handleItemClick = (e, key) => {
    const message = `Item Click ${key}`;
    console.log(message);
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

    this.setState({selectedItems: newSelection, message});
  };

  handleItemDoubleClick = (e, key) => {
    const message = `Item Double Click ${key}`;
    this.setState({message});
  };

  handleItemContextClick = (e, key) => {
    const message = `Item Context ${key}`;
    this.setState({message});
  };

  handleRowDoubleClick = (e, rowNumber, time) => {
    const message = `Row Double Click row=${rowNumber} time=${time.toString()}`;
    console.log(message);

    let end = time.clone().add(5, 'hours');
    let duration = moment.duration(end.diff(time));

    const item = {
      key: this.key++,
      title: 'New item',
      color: 'yellow',
      row: rowNumber,
      start: time,
      end: end
    };

    const newItems = _.clone(this.state.items);
    newItems.push(item);

    this.setState({items: newItems, message});
  };

  handleRowContextClick = (e, rowNumber, time) => {
    const message = `Row Context Click row=${rowNumber} time=${time.toString()}`;
    this.setState({message});
  };

  handleInteraction = (type, changes, items) => {
    console.log('interaction ', type, changes, items);

    /**
     * this is to appease the codefactor gods,
     * whose wrath condemns those who dare
     * repeat code beyond the sacred 5 lines...
     */
    function absorbChange(itemList, selectedItems) {
      itemList.forEach(item => {
        let i = selectedItems.find(i => {
          return i.key == item.key;
        });
        if (i) {
          item = i;
          item.title = moment.duration(item.end.diff(item.start)).humanize();
        }
      });
    }

    switch (type) {
      case Timeline.changeTypes.dragStart: {
        return this.state.selectedItems;
      }
      case Timeline.changeTypes.dragEnd: {
        const newItems = _.clone(this.state.items);

        absorbChange(newItems, items);
        this.setState({items: newItems});
        break;
      }
      case Timeline.changeTypes.resizeStart: {
        return this.state.selectedItems;
      }
      case Timeline.changeTypes.resizeEnd: {
        const newItems = _.clone(this.state.items);

        // Fold the changes into the item list
        absorbChange(newItems, items);

        this.setState({items: newItems});
        break;
      }
      case Timeline.changeTypes.itemsSelected: {
        this.setState({selectedItems: _.map(changes, 'key')});
        break;
      }
      default:
        return changes;
    }
  };

  render() {
    const {
      selectedItems,
      rows,
      items_per_row,
      snap,
      startDate,
      endDate,
      items,
      groups,
      message,
      useCustomRenderers
    } = this.state;
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
              <Form.Item label="Custom Renderers">
                <Switch onChange={this.toggleCustomRenderers} />
              </Form.Item>
            </Form>
            <div>
              <span>Debug: </span>
              {message}
            </div>
          </div>
          <Timeline
            items={items}
            groups={groups}
            startDate={startDate}
            endDate={endDate}
            selectedItems={selectedItems}
            snapMinutes={snap}
            onItemClick={this.handleItemClick}
            onItemDoubleClick={this.handleItemDoubleClick}
            onItemContextClick={this.handleItemContextClick}
            onInteraction={this.handleInteraction}
            onRowClick={this.handleRowClick}
            onRowContextClick={this.handleRowContextClick}
            onRowDoubleClick={this.handleRowDoubleClick}
            itemRenderer={useCustomRenderers ? customItemRenderer : undefined}
            groupRenderer={useCustomRenderers ? customGroupRenderer : undefined}
          />
        </Layout.Content>
      </Layout>
    );
  }
}
