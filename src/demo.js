'use strict';

import {Cell} from 'fixed-data-table-2';
import React, {Fragment} from 'react';
import _ from 'lodash';
import moment from 'moment';
import {Component} from 'react';

import Timeline from './timeline';

import {Button, Checkbox, DatePicker, Form, Icon, InputNumber, Switch} from 'antd';
import 'antd/dist/antd.css';
import './stories/storybook.css';
import './style.css';
import {ItemRenderer} from '.';
import {Table, Column, DataCell} from 'fixed-data-table-2';
import {CustomItemRenderer} from './demo/customRenderers';

const {TIMELINE_MODES} = Timeline;

const ITEM_DURATIONS = [moment.duration(6, 'hours'), moment.duration(12, 'hours'), moment.duration(18, 'hours')];

const COLORS = ['#0099cc', '#f03a36', '#06ad96', '#fce05b', '#dd5900', '#cc6699'];

const headerStyle = {
  color: '#000',
  fontSize: '12px',
  lineHeight: '1',
  background: '#CCFFEE',
  border: 'none'
};

// Moment timezones can be enabled using the following
// import moment from 'moment-timezone';
// moment.locale('en-au');
// moment.tz.setDefault('Australia/Perth');

export default class DemoTimeline extends Component {
  constructor(props) {
    super(props);

    const startDate = moment('2018-08-31');
    //const endDate = startDate.clone().add(4, 'days');
    const endDate = moment('2018-09-30');
    this.state = {
      selectedItems: [],
      rows: 100,
      items_per_row: 30,
      snap: 60,
      startDate,
      endDate,
      minDate: moment('2018-07-31'),
      maxDate: moment('2018-10-30'),
      message: '',
      timelineMode: TIMELINE_MODES.SELECT | TIMELINE_MODES.DRAG | TIMELINE_MODES.RESIZE,
      useTable: true,
      useMoment: true
    };
    this.reRender = this.reRender.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.toggleCustomRenderers = this.toggleCustomRenderers.bind(this);
    this.toggleSelectable = this.toggleSelectable.bind(this);
    this.toggleDraggable = this.toggleDraggable.bind(this);
    this.toggleResizable = this.toggleResizable.bind(this);
    this.toggleUseMoment = this.toggleUseMoment.bind(this);
    this.toggleUseTable = this.toggleUseTable.bind(this);
  }

  componentWillMount() {
    this.reRender();
  }

  reRender(useMoment = this.state.useMoment) {
    const list = [];
    const groups = [];
    const {snap} = this.state;

    this.key = 0;
    for (let i = 0; i < this.state.rows; i++) {
      groups.push({id: i, title: `Row ${i}`, description: `Description for row ${i}`});
      for (let j = 0; j < this.state.items_per_row; j++) {
        this.key += 1;
        const colorIndex = (i + j) % (COLORS.length + 1);
        const color = colorIndex != COLORS.length + 1 ? COLORS[colorIndex] : '';
        const gradientStop = Math.random() * 100;
        let glowOnHover = false;
        let tooltip;
        if ((i + j) % 3 === 0) {
          glowOnHover = true;
          tooltip = 'Item with key=' + this.key;
        }
        const duration = ITEM_DURATIONS[Math.floor(Math.random() * ITEM_DURATIONS.length)];
        // let start = last_moment;
        let start = moment(
          Math.floor(
            Math.random() * (this.state.maxDate.valueOf() - this.state.minDate.valueOf()) + this.state.minDate.valueOf()
          )
        );
        let end = start.clone().add(duration);

        // Round to the nearest snap distance
        const roundedStartSeconds = Math.floor(start.second() / snap) * snap;
        const roundedEndSeconds = Math.floor(end.second() / snap) * snap;
        start.second(roundedStartSeconds);
        end.second(roundedEndSeconds);

        list.push({
          key: this.key,
          title: duration.humanize(),
          color,
          row: i,
          start: useMoment ? start : start.valueOf(),
          end: useMoment ? end : end.valueOf(),
          glowOnHover,
          gradientStop,
          tooltip
        });
      }
    }

    // this.state = {selectedItems: [11, 12], groups, items: list};
    this.forceUpdate();
    this.setState({items: list, groups, useMoment});
  }

  handleRowClick = (e, rowNumber, clickedTime, snappedClickedTime) => {
    const message = `Row Click row=${rowNumber} @ time/snapped=${clickedTime.toString()}/${snappedClickedTime.toString()}`;
    this.setState({selectedItems: [], message});
  };
  zoomIn() {
    let currentMilliseconds = this.state.endDate.diff(this.state.startDate, 'milliseconds');
    let newSec = currentMilliseconds / 2;
    this.setState({endDate: this.state.startDate.clone().add(newSec, 'milliseconds')});
  }
  zoomOut() {
    let currentMilliseconds = this.state.endDate.diff(this.state.startDate, 'milliseconds');
    let newSec = currentMilliseconds * 2;
    this.setState({endDate: this.state.startDate.clone().add(newSec, 'milliseconds')});
  }

  toggleCustomRenderers(checked) {
    this.setState({useCustomRenderers: checked});
  }

  toggleSelectable() {
    const {timelineMode} = this.state;
    let newMode = timelineMode ^ TIMELINE_MODES.SELECT;
    this.setState({timelineMode: newMode, message: 'Timeline mode change: ' + timelineMode + ' -> ' + newMode});
  }
  toggleDraggable() {
    const {timelineMode} = this.state;
    let newMode = timelineMode ^ TIMELINE_MODES.DRAG;
    this.setState({timelineMode: newMode, message: 'Timeline mode change: ' + timelineMode + ' -> ' + newMode});
  }
  toggleResizable() {
    const {timelineMode} = this.state;
    let newMode = timelineMode ^ TIMELINE_MODES.RESIZE;
    this.setState({timelineMode: newMode, message: 'Timeline mode change: ' + timelineMode + ' -> ' + newMode});
  }
  toggleUseMoment() {
    const {useMoment} = this.state;
    this.reRender(!useMoment);
  }

  toggleUseTable() {
    const {useTable} = this.state;
    this.setState({useTable: !useTable});
  }

  handleItemClick = (e, key) => {
    const message = `Item Click ${key}`;
    const {selectedItems} = this.state;

    let newSelection = selectedItems.slice();

    // If the item is already selected, then unselected
    const isSelected = selectedItems.find(item => item == key);
    if (isSelected) {
      newSelection = newSelection.filter(item => item != key);
    } else {
      newSelection.push(key);
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

  handleRowDoubleClick = (e, rowNumber, clickedTime, snappedClickedTime) => {
    const message = `Row Double Click row=${rowNumber} time/snapped=${clickedTime.toString()}/${snappedClickedTime.toString()}`;

    const randomIndex = Math.floor(Math.random() * Math.floor(ITEM_DURATIONS.length));

    let start = snappedClickedTime.clone();
    let end = snappedClickedTime.clone().add(ITEM_DURATIONS[randomIndex]);
    this.key++;

    const item = {
      key: this.key++,
      title: 'New item',
      color: 'yellow',
      row: rowNumber,
      start: start,
      end: end
    };

    const newItems = _.clone(this.state.items);
    newItems.push(item);

    this.setState({items: newItems, message});
  };

  handleRowContextClick = (e, rowNumber, clickedTime, snappedClickedTime) => {
    const message = `Row Click row=${rowNumber} @ time/snapped=${clickedTime.toString()}/${snappedClickedTime.toString()}`;
    this.setState({message});
  };

  handleInteraction = (type, changes, items) => {
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
          item.title = moment.duration(moment(item.end).diff(moment(item.start))).humanize();
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
      minDate,
      maxDate,
      items,
      groups,
      message,
      useCustomRenderers,
      timelineMode,
      useMoment,
      useTable
    } = this.state;
    const rangeValue = [startDate, endDate];
    const minMaxRangeValue = [minDate, maxDate];

    const selectable = (TIMELINE_MODES.SELECT & timelineMode) === TIMELINE_MODES.SELECT;
    const draggable = (TIMELINE_MODES.DRAG & timelineMode) === TIMELINE_MODES.DRAG;
    const resizeable = (TIMELINE_MODES.RESIZE & timelineMode) === TIMELINE_MODES.RESIZE;

    const rowLayers = [];

    for (let i = 0; i < rows; i += 1) {
      if (i % 5 === 0 && i !== 0) {
        continue;
      }
      let curDate = startDate.clone();
      while (curDate.isSameOrBefore(endDate)) {
        const dayOfWeek = Number(curDate.format('d')); // 0 -> 6: Sun -> Sat
        let bandDuration = 0; // days
        let color = '';
        if (dayOfWeek % 6 === 0) {
          color = 'blue';
          bandDuration = dayOfWeek === 6 ? 2 : 1; // 2 if sat, 1 if sun
        } else {
          color = 'green';
          bandDuration = 6 - dayOfWeek;
        }

        rowLayers.push({
          start: this.state.useMoment ? curDate.clone() : curDate.valueOf(),
          end: this.state.useMoment
            ? curDate.clone().add(bandDuration, 'days')
            : curDate
                .clone()
                .add(bandDuration, 'days')
                .valueOf(),
          style: {backgroundColor: color, opacity: '0.3'},
          rowNumber: i
        });
        curDate.add(bandDuration, 'days');
      }
    }
    return (
      <div className="demo">
        <div style={{margin: 24}}>
          <Form layout="inline">
            <Form.Item label="No rows">
              <InputNumber value={rows} onChange={e => this.setState({rows: e})} />
            </Form.Item>
            <Form.Item label="No items per row">
              <InputNumber value={items_per_row} onChange={e => this.setState({items_per_row: e})} />
            </Form.Item>
            <Form.Item label="Snap (min)">
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
            <Form.Item label="Min Max Range">
              <DatePicker.RangePicker
                allowClear={false}
                value={minMaxRangeValue}
                showTime
                onChange={e => {
                  this.setState({minDate: e[0], maxDate: e[1]}, () => this.reRender());
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={() => this.reRender()}>
                Regenerate
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
            <Form.Item>
              <Checkbox onChange={this.toggleSelectable} checked={selectable}>
                Enable selecting
              </Checkbox>
            </Form.Item>
            <Form.Item>
              <Checkbox onChange={this.toggleDraggable} checked={draggable}>
                Enable dragging
              </Checkbox>
            </Form.Item>
            <Form.Item>
              <Checkbox onChange={this.toggleResizable} checked={resizeable}>
                Enable resizing
              </Checkbox>
            </Form.Item>
            <Form.Item>
              <Checkbox onChange={this.toggleUseMoment} checked={useMoment}>
                Use moment for dates
              </Checkbox>
            </Form.Item>
            <Form.Item>
              <Checkbox onChange={this.toggleUseTable} checked={useTable}>
                Use table
              </Checkbox>
            </Form.Item>
          </Form>
          <div>
            <span>Debug: </span>
            {message}
          </div>
        </div>
        <Timeline
          shallowUpdateCheck
          items={items}
          groups={groups}
          useMoment={useMoment}
          startDate={useMoment ? startDate : startDate.valueOf()}
          endDate={useMoment ? endDate : endDate.valueOf()}
          minDate={useMoment ? minDate : minDate.valueOf()}
          maxDate={useMoment ? maxDate : maxDate.valueOf()}
          table={
            useTable ? (
              <Table rowHeight={50} width={300} isColumnResizing={true}>
                <Column
                  key={0}
                  columnKey={0}
                  width={100}
                  header={<DataCell style={headerStyle}>Title</DataCell>}
                  cell={({rowIndex}) => <DataCell>{rowIndex < groups.length ? groups[rowIndex].title : ''}</DataCell>}
                />
                <Column
                  key={1}
                  columnKey={1}
                  width={100}
                  header={
                    <DataCell style={headerStyle}>
                      <Icon type="check-circle" /> <span>Custom check</span>
                    </DataCell>
                  }
                  cell={({rowIndex}) => (
                    <DataCell>{rowIndex < groups.length ? <Checkbox> Checkbox </Checkbox> : ''}</DataCell>
                  )}
                />
                <Column
                  key={2}
                  columnKey={2}
                  width={100}
                  header={<DataCell style={headerStyle}>Description</DataCell>}
                  cell={({rowIndex}) => (
                    <DataCell>{rowIndex < groups.length ? groups[rowIndex].description : ''}</DataCell>
                  )}
                />
              </Table>
            ) : (
              undefined
            )
          }
          rowLayers={rowLayers}
          selectedItems={selectedItems}
          timelineMode={timelineMode}
          snapMinutes={snap}
          onItemClick={this.handleItemClick}
          onItemDoubleClick={this.handleItemDoubleClick}
          onItemContextClick={this.handleItemContextClick}
          onInteraction={this.handleInteraction}
          onRowClick={this.handleRowClick}
          onRowContextClick={this.handleRowContextClick}
          onRowDoubleClick={this.handleRowDoubleClick}
          itemRenderer={useCustomRenderers ? CustomItemRenderer : ItemRenderer}
        />
      </div>
    );
  }
}
