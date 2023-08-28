import { ComponentStory } from "@storybook/react";
import { Fragment } from "react";
import { Checkbox, Icon } from "semantic-ui-react";
import { Timeline } from "../..";
import { d, manyHumanResources, someTasks } from "../sampleData";

import { Column, DataCell, Table } from "fixed-data-table-2";
import { DEMO_TABLE_WIDTH, tableScenarios, tableTestIds } from "./TableScenarios";
export default {
    title: 'Features/Table',
    component: Timeline
};

export const GanttWithoutTable: ComponentStory<typeof Timeline> = () => {

    return (
        <Fragment>
            <Timeline startDate={d('2018-09-20')} endDate={d('2018-09-21')} groups={manyHumanResources} items={someTasks}/>
        </Fragment>
    );
}

GanttWithoutTable.parameters = {
    scenarios: [tableScenarios.propertyTable]
}

var emphasizeStyle = { color: 'red' };

const headerStyle = {
    color: '#000',
    fontSize: '12px',
    lineHeight: '1',
    background: '#CCFFEE',
    border: 'none'
};

export const ProvidingCustomTable: ComponentStory<typeof Timeline> = () => {
    return (
        <Fragment>
            <Timeline startDate={d('2018-09-20')} endDate={d('2018-09-21')} groups={manyHumanResources} items={someTasks}
                table={<Table 
                            rowHeight={50}
                            width={DEMO_TABLE_WIDTH}
                            isColumnResizing={true}
                            rowAttributesGetter={index => {return { "data-testid": tableTestIds.row + "_" + index}} }
                            >
                            <Column
                                key={0}
                                columnKey={0}
                                width={100}
                                header={<DataCell style={headerStyle}>Title</DataCell>}
                                cell={({rowIndex}) => <DataCell>
                                                        {rowIndex < manyHumanResources.length ? manyHumanResources[rowIndex].title : ""}
                                                    </DataCell>}
                            />
                            <Column
                                key={1}
                                columnKey={1}
                                width={60}
                                header={<DataCell style={headerStyle}><Icon type="check-circle" /> <span>Custom check</span></DataCell>}
                                cell={({rowIndex}) => <DataCell>
                                                    {rowIndex < manyHumanResources.length ? <Checkbox/> : ""}
                                                </DataCell>}
                            />
                            <Column
                                key={2}
                                columnKey={2}
                                width={100}
                                header={<DataCell style={headerStyle}>Job</DataCell>}
                                cell={({rowIndex}) => <DataCell>
                                                    {rowIndex < manyHumanResources.length ? manyHumanResources[rowIndex].job : ""}
                                                </DataCell>}
                            />
                        </Table>} 
            />
        </Fragment>
    );
}

ProvidingCustomTable.parameters = {
    scenarios: [tableScenarios.propertyTable]
}

