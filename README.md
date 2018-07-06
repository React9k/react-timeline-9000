# React Timeline 9000
## Build Status
[![Build Status](https://travis-ci.org/lilfolr/react-timeline-9000.svg?branch=master)](https://travis-ci.org/lilfolr/react-timeline-9000)
[![CodeFactor](https://www.codefactor.io/repository/github/lilfolr/react-timeline-9000/badge)](https://www.codefactor.io/repository/github/lilfolr/react-timeline-9000)


| Action         | Command       |
| -------------- | ------------- |
| Build          | `$ make`      |
| Test           | `$ make test` |
| Run dev server | `$ make run`  |

## Demo
* http://bhp-react-timeline-9k.s3-website-ap-southeast-2.amazonaws.com/

# Documentation


# Interaction

Default interaction for multiple selection is largely governed by the leading item, which is defined as the item that is directly interacted with when multiple items are selected.

## Default behaviour 

### Dragging

All items will move by the same horizontal delta and row changes will be calculated by the row delta of the leading item

### Resizing

All items will gain the resize delta from the leading item.

### Overriding the default behaviour

TBA

`onInteraction(type, changes, leadTimeDelta, leaderGroupDelta,selectedItems)`

# Callbacks

## Item level

`onItemClick(e, key)`

`onItemDoubleClick(e, key)`

`onItemContextClick(e, key)`

## Row Level
`onRowClick(e, rowNumber, time)`

`onRowDoubleClick(e, rowNumber, time)`

`onRowContextClick (e, rowNumber, time)`

## Z-indexes
| Item                                  | Index |
| ------------------------------------- | ----- |
| Vertical markers                      | 1     |
| Timeline items                        | 2     |
| Timeline items when dragging/resizing | 3     |
| Selection box (for multi-select)      | 4     |
