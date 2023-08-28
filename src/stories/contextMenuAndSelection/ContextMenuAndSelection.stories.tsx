import { createTestids } from '@famiprog-foundation/tests-are-demo';
import { Alert } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { Button, Icon, Menu } from 'semantic-ui-react';
import Timeline from '../../timeline';
import { IGanttAction, IGanttOnContextMenuShowParam, Item } from '../../types';
import { d, someHumanResources, someTasks } from '../sampleData';
import { contextMenuScenarios, selectionScenarios } from './ContextMenuAndSelectionScenarios';
import { Table, Column, DataCell } from 'fixed-data-table-2';

export default {
    title: 'Features/Context Menu And Selection',
    includeStories: /^[A-Z]/
};

export const addTaskActionLabel = "Add task for ";
export const addTaskActionIcon = "plus";
export const addTaskNotPossibleAction = "Add task: not possible. Please right click over a row with a person.";
export const editActionLabel = "Edit";
export const deleteActionLabel = "Delete";
export const deleteActionIcon = "trash";
export const deleteActionIconColor = "red";

export const ContextMenu = () => {
        const [tasks, setTasks] = useState<Item[]>([...someTasks]);
        const [segmentHeight, setSegmentHeight] = useState<number>(40);
        return (
            <>
                <Alert message={<><b>Add task</b> action is provided only for empty selection. It also has a different label depending on which row is displayed</>}/>
                <div style={{ display: 'flex', height: '400px' }}>
                    <Timeline startDate={d('2018-09-20')} endDate={d('2018-09-21')} groups={someHumanResources} items={tasks} itemHeight={segmentHeight}
                        onContextMenuShow={(contextMenuShowParam: IGanttOnContextMenuShowParam) => {
                            const actions: IGanttAction[] = [
                                {
                                    icon: "edit",
                                    label: editActionLabel,
                                    isVisible: param => param.selection.length == 1,
                                    run: param => {
                                        param.dontCloseContextMenuAfterRunAutomatically = true;
                                        // This timeout is just for exemplify a delayed closing of the CM 
                                        setTimeout(() => {
                                            param.closeContextMenu();
                                            const selectedTask = tasks.find((task) => task.key == param.selection[0]);
                                            // This timeout for the menu to actual close before the prompt is shown
                                            setTimeout(() => {
                                                let newTitle = prompt("Task new title:", selectedTask.title);
                                                newTitle && setTasks(tasks.map((task) => task == selectedTask ? { ...task, title: newTitle } : task));
                                            }, 10);
                                        }, 10);
                                    }
                                },
                                {
                                    isVisible: param => param.selection.length > 0 ,
                                    /** This is a trivial example for customizing the content of an action renderer 
                                     * but this content can be replaced according to application needs with a more complex one: 
                                     * e.g. maybe containing a color picker (for an action that changes the color of a segment)*/
                                    renderInMenu: (param) => {
                                        return <Menu.Item onClick={() => { 
                                                            setTasks(tasks.filter(task => !param.selection.includes(task.key)));
                                                            param.closeContextMenu();
                                                        }}>        
                                                    <span style={{color: "red"}}>{deleteActionLabel}</span> 
                                                    <Icon name={deleteActionIcon} color={deleteActionIconColor}/>      
                                                </Menu.Item>
                                    }
                                }
                            ];
                            // We can filter the actions that will be displayed directly here in the actions provider    
                            if (contextMenuShowParam.actionParam.row < someHumanResources.length) {
                                actions.splice(0, 0, {
                                    icon: <Icon name={addTaskActionIcon} />,
                                    label: param => addTaskActionLabel + someHumanResources[param.row].title,
                                    run: param => { 
                                        let end = moment(param.time); 
                                        end.hours(end.hours() + 3);
                                        const maxKey = tasks.reduce((maxKey, task) => maxKey > (task.key as number) ?  maxKey : (task.key as number), 0);
                                        setTasks([...tasks, { key: maxKey + 1, row: param.row, title: 'NEW TASK', start: param.time, end: end}]);
                                    }
                                });
                            } else {
                            	actions.splice(0, 0, { icon: addTaskActionIcon, label: () => addTaskNotPossibleAction});
                        	}

                            return actions;
                        }} 
                        table={<Table width={100} >
                                    <Column
                                        columnKey="title"
                                        width={100}
                                        header={<DataCell>Title</DataCell>}
                                        cell={({rowIndex}) => <DataCell>{rowIndex < someHumanResources.length ? someHumanResources[rowIndex].title : ""}</DataCell>}/>
                                </Table>}
                        />
                </div>
            </>);
};

ContextMenu.parameters = {
    scenarios: [
        ...Object.keys(contextMenuScenarios).map(key => contextMenuScenarios[key])
    ]
};

export const selectionStoryTestIds = createTestids('SelectionStory', {
    selectedItemsSpan: ''
});

export const Selection = () => {
    const [selectedItems, setSelectedItems] = useState<(number|string)[]>([]);
    const [isSelectionForced, setIsSelectionForced] = useState<boolean>(false);
    return (
      <>
        <span>
            <Button toggle active={isSelectionForced} onClick={() => setIsSelectionForced(!isSelectionForced)}>
                Force selection programmatically
            </Button>
            (The user cannot change the selection via interaction)
        </span>
        <Alert message={<>Selected segments: <span data-testid={selectionStoryTestIds.selectedItemsSpan}>{selectedItems.sort().join(", ")}</span></>}/>
        {/* This is an example illustrates: 
            1.adding onSelectionChange handler 
            2.setting selectedItems property */}
        <div style={{ display: 'flex', height: '400px' }}>
          <Timeline startDate={d('2018-09-20')} endDate={d('2018-09-21')} groups={someHumanResources} items={someTasks} 
                    selectedItems={isSelectionForced ? [0, 1] : undefined} onSelectionChange={selectedItems => setSelectedItems(selectedItems)}
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

  Selection.parameters = {
    scenarios: [
        ...Object.keys(selectionScenarios).map(key => selectionScenarios[key])
    ]
};