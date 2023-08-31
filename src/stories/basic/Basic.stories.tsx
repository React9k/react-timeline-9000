import React from 'react';
import Timeline from '../../timeline';
import { timelineScenarios } from '../TimelineScenarios';
import { d, someHumanResources, someTasks } from '../sampleData';
import { ComponentStory } from '@storybook/react';
import { Group, Item } from '../../index';
import { Table, Column, DataCell } from 'fixed-data-table-2';

export default {
  title: 'Features/Basic'
};

export const Main = () => {
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

  // NOTE: for DRY purposes, we store the sample data (e.g. humanResources, segments) in sampleData.ts.
  // If you look at this function from within Storybook, you don't see easily sampleData.ts.
  // That's why we added some additional records here, so that the shape of data is clear.

  return (
    <>
      {/* This is a trivial example to illustrate how Timeline "glues" to its "flex" parent. Notes: */}
      {/* 1/ In other stories we don't have this, because we have a Storybook decorator that wraps w/ a div + CSS class. */}
      {/* 2/ You'll probably have a better flex-box layout, i.e. not hardcoded. 3/ Use CSS classes and not styles. */}
      <div style={{ display: 'flex', height: '400px' }}>
        <Timeline startDate={d('2018-09-20')} endDate={d('2018-09-21')} groups={humanResources} items={tasks}
                  table={<Table width={100} >
                            <Column
                                columnKey="title"
                                width={100}
                                header={<DataCell>Title</DataCell>}
                                cell={({rowIndex}) => <DataCell>{rowIndex < humanResources.length ? humanResources[rowIndex].title : ""}</DataCell>}/>
                        </Table>}
          />
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

export const AlternativeRowColoring: ComponentStory<typeof Timeline> = () => {

  return (
    <>
      {/* This is an example to illustrate how you can customize your gantt to customize the row coloring by setting 'rowClassName',  'rowEvenClassName' and 'rowClassOddName'

          And defining your custom classes in your css file:

          .story-custom-row {
            border: 1px solid #94b9cf!important;
            border-top: 0 !important;
          }

          .story-custom-row-even {
            background-color: #DBE8F0 !important;
          }

          .story-custom-row-odd {
            background-color: #f4f7f8 !important;
          }

      */}
      <div style={{ display: 'flex', height: '400px' }}>
        <Timeline startDate={d('2018-09-20')} endDate={d('2018-09-21')} groups={someHumanResources} items={someTasks} 
                  rowClassName='story-custom-row' rowEvenClassName='story-custom-row-even' rowOddClassName='story-custom-row-odd'
                  table={<Table width={100} >
                            <Column
                                columnKey="title"
                                width={100}
                                header={<DataCell>Title</DataCell>}
                                cell={({rowIndex}) => <DataCell>{rowIndex < someHumanResources.length ? someHumanResources[rowIndex].title : ""}</DataCell>}/>
                        </Table>}/>
      </div>
    </>
  );
};

AlternativeRowColoring.parameters = {
  scenarios: [
    timelineScenarios.propertyRowClassName,
    timelineScenarios.propertyRowEvenClassName,
    timelineScenarios.propertyRowOddClassName
  ]
};