import React, { useState } from 'react';
import Timeline from '../../timeline';
import { d, someHumanResources, someTasks } from '../sampleData';
import { dragToCreateScenarios } from './DragToCreateScenarios';
import { DragToCreateParam, Item } from '../../types';
import { Form, Radio } from 'semantic-ui-react';
import { createTestids } from '@famiprog-foundation/tests-are-demo';
import { Table, Column, DataCell} from 'fixed-data-table-2';

export default {
    title: 'Features/Drag to create',
    includeStories: /^[A-Z]/
};

export const dragToCreateStoriesTestIds = createTestids('DragToCreateStory', {forceDragToCreateModeTrueRadio:'', forceDragToCreateModeFalseRadio:''});

export const Main = () => {
    let groups = [...someHumanResources, { id: 4, title: 'Andy' }];
    const [forceDragToCreateMode, setForceDragToCreateMode] = useState<undefined|string>();
    const [tasks, setTasks] = useState<Item[]>([...someTasks]);
    const handleRadioChange = (e, { value }) => setForceDragToCreateMode(value);
        return <>
            <Form size="mini">
                <Form.Field>
                    <Radio label="Default enable/disable drag to create mechanism (via 'Drag to create' context menu action)"
                        name='radioGroup'
                        value= {undefined}
                        checked={forceDragToCreateMode === undefined}
                        onChange={handleRadioChange}/>
                </Form.Field>
                <Form.Field>
                    <Radio label="forceDragToCreateMode = true (no 'Drag to create' action)"
                        name='radioGroup'
                        value='true'
                        checked={forceDragToCreateMode === 'true'}
                        onChange={handleRadioChange}
                        data-testid={dragToCreateStoriesTestIds.forceDragToCreateModeTrueRadio}/>
                </Form.Field>
                <Form.Field>
                    <Radio label="forceDragToCreateMode = false (no 'Drag to create' action)"
                        name='radioGroup'
                        value='false'
                        checked={forceDragToCreateMode === 'false'}
                        onChange={handleRadioChange} 
                        data-testid={dragToCreateStoriesTestIds.forceDragToCreateModeFalseRadio}/>
                </Form.Field>
            </Form>
            <Timeline startDate={d('2018-09-20')} endDate={d('2018-09-21')} groups={groups} items={tasks} forceDragToCreateMode={forceDragToCreateMode ? forceDragToCreateMode === "true" : undefined}
                table={<Table width={100}>
                            <Column
                                columnKey="title"
                                width={100}
                                header={<DataCell>Title</DataCell>}
                                cell={({rowIndex}) => <DataCell>{rowIndex < someHumanResources.length ? someHumanResources[rowIndex].title : ""}</DataCell>}/>
                        </Table>}
                onDragToCreateEnded={(param: DragToCreateParam) => {
                    if (groups[param.groupIndex]) {
                        const task = {
                            key: param.itemIndex,
                            row: param.groupIndex, title: 'Task ' + groups[param.groupIndex].title + param.itemIndex,
                            start: param.itemStart,
                            end: param.itemEnd || param.itemStart
                        }
                        setTasks([...tasks, task]);
                    }
                }} />
        </>
};

Main.parameters = {
    scenarios: Object.keys(dragToCreateScenarios).map(key => dragToCreateScenarios[key])
};
