import React from 'react';
import Timeline from '../../timeline';
import { timelineScenarios } from '../TimelineScenarios';
import { d, someHumanResources, someTasks } from '../sampleData';
import { ComponentStory } from '@storybook/react';
import { Group, Item } from '../../index';

export default {
  title: 'Features/Basic',
  component: Timeline
};

export const Main: ComponentStory<typeof Timeline> = () => {
  // the rows (aka groups)
  // id is mandatory; should: be numeric, start from 0, have consecutive values
  const humanResources: Group[] = [...someHumanResources, { id: 4, title: 'George Walsh' }];

  // the segments
  // key is mandatory; row should point to the "id" of a row/group
  const tasks: Item[] = [
    ...someTasks, // we split this array in 2 parts for illustration purposes, i.e. to capture the data shape in the storybook
    { key: 11, row: 4, title: 'Task GW1', start: d('2018-09-20 7:00'), end: d('2018-09-20 8:00') },
    { key: 12, row: 4, title: 'Task GW2', start: d('2018-09-20 17:00'), end: d('2018-09-20 19:00') }
  ];

  return (
    <>
      {/* This is a trivial example to illustrate how Timeline "glues" to its "flex" parent. Notes: */}
      {/* 1/ In other stories we don't have this, because we have a Storybook decorator that wraps w/ a div + CSS class. */}
      {/* 2/ You'll probably have a better flex-box layout, i.e. not hardcoded. 3/ Use CSS classes and not styles. */}
      <div style={{ display: 'flex', height: '400px' }}>
        <Timeline startDate={d('2018-09-20')} endDate={d('2018-09-21')} groups={humanResources} items={tasks} />
      </div>
    </>
  );
};

Main.parameters = {
  scenarios: [
    timelineScenarios.rendererForGroups,
    timelineScenarios.rendererForItems,
    timelineScenarios.whenMouseMovesThenRedBar
  ]
};
