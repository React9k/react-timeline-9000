# React Timeline 9000
A performance focused timeline component in react
## Build Status
[![Build Status](https://travis-ci.org/BHP-DevHub/react-timeline-9000.svg?branch=master)](https://travis-ci.org/BHP-DevHub/react-timeline-9000)
[![CodeFactor](https://www.codefactor.io/repository/github/bhp-devhub/react-timeline-9000/badge)](https://www.codefactor.io/repository/github/bhp-devhub/react-timeline-9000)
[![npm (scoped)](https://img.shields.io/npm/v/react-timeline-9000.svg)](https://www.npmjs.com/package/react-timeline-9000)

## Demo
* http://bhp-react-timeline-9k.s3-website-ap-southeast-2.amazonaws.com/

## Documentation
* http://bhp-react-timeline-9k.s3-website-ap-southeast-2.amazonaws.com/docs/


## Getting Started

| Action         | Command                               |
| -------------- | ------------------------------------- |
| Build          | `$ make`                              |
| Test           | `$ make test` or  `$ make test-watch` |
| Run dev server | `$ make run`                          |

* Add `import react-timeline-9000/lib/style.css` (or use your own styles based on this file)

## Contributing
Feel free to make a PR :)

# Interaction

Default interaction for multiple selection is largely governed by the leading item, which is defined as the item that is directly interacted with when multiple items are selected.

## Dragging

All items will move by the same horizontal delta and row changes will be calculated by the row delta of the leading item

## Resizing

All items will gain the resize delta from the leading item.

 ### Overriding the default behaviour

TBA

`onInteraction(type, changes, leadTimeDelta, leaderGroupDelta,selectedItems)` 

# Props Summary

See http://bhp-react-timeline-9k.s3-website-ap-southeast-2.amazonaws.com/docs for detailed docs

## Props
| Name               | Default     | Description                                                                                                                                              |
| ----------------   | -------     | ------------------------------------------------------------------------------------------------------------                                             |
| groupOffset        |             |                                                                                                                                                          |
| startDate          |             |                                                                                                                                                          |
| endDate            |             |                                                                                                                                                          |
| snapMinutes        |             |                                                                                                                                                          |
| showCursorTime     |             |                                                                                                                                                          |
| cursorTimeFormat   |             |                                                                                                                                                          |
| itemHeight         |             |                                                                                                                                                          |
| timelineMode       |             |                                                                                                                                                          |
| timebarFormat      |             |                                                                                                                                                          |
| itemRenderer       |             |                                                                                                                                                          |
| groupRenderer      |             |                                                                                                                                                          |
| shallowUpdateCheck | False       | If true timeline will try to minimize re-renders . Set to false if items don't show up/update on prop change                                             |
| shallowUpdateFunc  | () => False | Function called when `shallowUpdateCheck`==true. If returns true the timeline will be redrawn. If false the library will decide if redrawing is required |

## Data
| Name             |
| ---------------- |
| items            |
| groups           |
| selectedItems    |

## Callbacks
| Name              |
| ----------------  |
| onItemClick       |
| onItemDoubleClick |
| onItemContext     |
| onInteraction     |
| onRowClick        |
| onRowContext      |
| onRowDoubleClick  |
| onItemHover       |
| onItemLeave       |

# Styling
* View `src/style.css` for styling examples.
* For the default styles, import `react-timeline-9000/lib/style.css`

### Default Z-indexes
| Item                                  | Index |
| ------------------------------------- | ----- |
| Row Layers                            | 1     |
| Vertical markers                      | 2     |
| Timeline items                        | 3     |
| Timeline items when dragging/resizing | 4     |
| Selection box (for multi-select)      | 5     |
| Group column                          | 6     |

