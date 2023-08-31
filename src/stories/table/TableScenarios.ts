import { createTestids } from "@famiprog-foundation/tests-are-demo";

export const tableScenarios = {propertyColumns: 'PROPERTY columns',
  propertyColumnsWidth: 'PROPERTY columns.width',
  propertyColumnsHeaderLabel: 'PROPERTY columns.headerLabel',
  propertyColumnsLabelProperty: 'PROPERTY columns.labelProperty',
  propertyColumnsHeaderRenderer: 'PROPERTY columns.headerRenderer',
  propertyColumnsCellRenderer: 'PROPERTY columns.cellRenderer',
  propertyTable: 'PROPERTY table',
  propertyGroupRenderer: 'PROPERTY groupRenderer',
  propertyGroupTitleRenderer: 'PROPERTY groupTitleRenderer'
};

// These are needed in TableTestsAreDemo
// Added here because they were needed in TableTestsAreDemo
// And could not be exported directly from table.storie.tsx because  
// everything exported there gets in the storybook tree as a story entry
export const tableTestIds = createTestids("Table", {row:""});
export const DEMO_TABLE_WIDTH = 260;