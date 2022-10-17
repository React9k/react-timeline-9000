# Table columns

Historically, the Timeline only had a single column to the left of the component. Then we improved this, by allowing the possibility to have multiple columns. Hence the left zone can now be regarded also as a table.

## Props in Timeline

| Name               | Type     | Default              | Description                                       |
|--------------------|----------|----------------------|---------------------------------------------------|
| groups             | object[] |                      | Rows data                                         |
| groupOffset        | number   | 150                  | Single column mode: the width of the column. Multiple columns mode: the default width of a column (if column.width is not configured). |
| groupRenderer      | function | DefaultGroupRenderer | Single column mode: the renderer of a cell. Multiple columns mode: the default renderer of a cell, which may be overridden on a per column basis.  |
| groupTitleRenderer | function |                      | Single mode view: the renderer of a header cell. Multiple columns mode: the default renderer of a header cell, which may be overridden on a per column basis. |
| tableColumns       | object[] | []                   | The columns that will be rendered using data from groups. |

## Props for a column (multiple columns mode)
|  Name          | Type                | Description                                                              |
|----------------|---------------------|--------------------------------------------------------------------------|
| width          | number              | The width of the column.                                                 |
| labelProperty  | string              | The key used in the default cell renderer to show the label of the cell. |
| cellRenderer   | function or element | Custom cellRenderer.                                                     |
| headerLabel    | string              | The label of the header used in the default header renderer.             |
| headerRenderer | function or element | Custom header renderer.                                                  |

## Header renderer

Single column mode:
* <code>props.groupTitleRenderer</code> is the renderer of the header cell.

Multiple columns mode:
* <code>props.groupTitleRenderer</code> is the default renderer of a header cell, which may be overridden on a per column basis. The default value of <code>props.groupTitleRenderer</code> is <code>DefaultColumnHeaderRenderer</code> that renders <code>column.headerLabel</code>.
* <code>column.headerRenderer</code> is the custom renderer for a column. It can be a React element or a function/class component.

### DefaultColumnHeaderRenderer

Default renderer for column header.

#### Props

 * props.column - object - The properties of the column
 * props.column.headerLabel - string - The header's label

#### Functions

* getLabel() - returns the label of the header, by default props.column.headerLabel.

## Cell renderer

Single column mode:
* <code>props.groupRenderer</code> is the renderer of a cell. The default value of the renderer is <code>DefaultGroupRenderer</code> that renderers by default the title property from group.

Multiple columns mode:
* <code>props.groupRenderer</code> is the default renderer of a cell, which may be overridden on a per column basis. The default value of <code>props.groupRenderer</code> is <code>DefaultGroupRenderer</code> that renders <code>column.labelProperty</code> from group.
* <code>column.cellRenderer</code> is the custom renderer for a cell. It can be a React element or a function/class component.

* <code>props.groupRenderer</code> is the default renderer of a cell, which may be overridden on a per column basis. The default value of <code>props.groupRenderer</code> is <code>DefaultGroupRenderer</code> that renders <code>column.labelProperty</code> from group.

### DefaultGroupRenderer

Default group renderer class (cell renderer).

#### Props

 * props.group - object - The group (row) to be rendered.
 * props.group.id - string - The group's id.
 * props.labelProperty - The key of the data from group that should be rendered.

#### Functions

 * getLabel() - returns the label of the cell, by default return props.labelProperty from props.group.