import React from 'react';
import moment from 'moment';
import Timeline from '../../timeline';
import {timelineScenarios} from '../../TimelineScenarios';

export default {
  title: 'Features/Basic'
};

export const Main = () => {
  // utility funcion
  const d = str => moment(str).valueOf();

  // the rows (aka groups)
  // id is mandatory; should: be numeric, start from 0, have consecutive values
  const humanResources = [
    {id: 0, title: 'John Doe'},
    {id: 1, title: 'Alex Randal'},
    {id: 2, title: 'Mary Danton'},
    {id: 3, title1: 'Alex Randal'}
  ];

  // the segments
  // key is mandatory; row should point to the "id" of a row/group
  const tasks = [
    {key: 0, row: 0, title: 'Task JD1', color: 'red', start: d('2018-09-20 8:00'), end: d('2018-09-20 9:00')},
    {key: 1, row: 0, title: 'Task JD2', color: 'red', start: d('2018-09-20 18:00'), end: d('2018-09-20 19:00')},
    {key: 2, row: 0, title: 'Task JD3', color: 'red', start: d('2018-09-20 20:00'), end: d('2018-09-20 21:00')},
    {key: 3, row: 1, title: 'Task AR1', color: 'yellow', start: d('2018-09-20 7:00'), end: d('2018-09-20 8:00')},
    {key: 4, row: 1, title: 'Task AR2', color: 'yellow', start: d('2018-09-20 17:00'), end: d('2018-09-20 20:00')},
    {key: 5, row: 1, title: 'Task AR3', color: 'yellow', start: d('2018-09-20 19:00'), end: d('2018-09-20 20:00')},
    {key: 6, row: 2, title: 'Task MD1', color: 'blue', start: d('2018-09-20 8:00'), end: d('2018-09-20 10:00')},
    {key: 7, row: 2, title: 'Task MD2', color: 'blue', start: d('2018-09-20 18:00'), end: d('2018-09-20 20:00')},
    {key: 8, row: 2, title: 'Task MD3', color: 'blue', start: d('2018-09-20 20:00'), end: d('2018-09-20 21:00')}
  ];

  return (
    <>
      {/* This is a trivial example to illustrate how Timeline "glues" to its "flex" parent. 1/ In other stories we don't have this. */}
      {/* 2/ You'll probably have a better flex-box layout, i.e. not hardcoded. 3/ Use CSS classes and not styles. */}
      <div style={{display: 'flex', height: '400px'}}>
        <Timeline startDate={d('2018-09-20')} endDate={d('2018-09-21')} groups={humanResources} items={tasks} />
      </div>
    </>
  );
};

Main.parameters = {
  scenarios: [
    timelineScenarios.givenRowsThenRender,
    timelineScenarios.givenSegmentsThenRender,
    timelineScenarios.whenMouseMovesThenRedBar
  ]
};
