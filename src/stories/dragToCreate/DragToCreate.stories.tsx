import React from 'react';
import Timeline from '../../timeline';
import { d, someHumanResources, someTasks } from '../sampleData';
import { ComponentStory } from '@storybook/react';
import { dragToCreateScenarios } from './DragToCreateScenarios';

export default {
    title: 'Features/Drag to create',
    component: Timeline
};

export const Main: ComponentStory<typeof Timeline> = () => {
    return <DragToCreateDemo />;

};

Main.parameters = {
    scenarios: Object.keys(dragToCreateScenarios).map(key => dragToCreateScenarios[key])
};

class DragToCreateDemo extends React.Component {
    someTasks = [...someTasks];
    render() {
        return <Timeline startDate={d('2018-09-20')} endDate={d('2018-09-21')} groups={someHumanResources} items={this.someTasks} onDragToCreateEnded={(groupIndex: number, itemIndex: number | string, itemStart: number | object, itemEnd: number | object) => {
            console.log(someHumanResources[groupIndex])
            if (someHumanResources[groupIndex]) {
                this.someTasks.push({ key: itemIndex, row: groupIndex, title: 'Task ' + someHumanResources[groupIndex].title + itemIndex, start: itemStart, end: itemEnd });
                this.forceUpdate();
            }
        }
        } />
    }
}
