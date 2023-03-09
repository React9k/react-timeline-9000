# Change Log

## Unreleased

## v2.1.0

### Added

* [Background layer: vertical grid, highlight weekends, highlighted intervals, now marker, markers](https://github.com/flower-platform/react-timeline-10000/pull/19)

## v2.0.2

* [Upgraded color lib and code updated](https://github.com/flower-platform/react-timeline-10000/pull/20)

## v2.0.1

The first official version published since the project was forked from `react-timeline-9000` to `@famiprog-foundation/react-gantt`.

### Added

| Short description | Issue | Pull request #19| 
| - | - | - |
| Multiple columns / table mode. | React9k/react-timeline-9000#190 | React9k/react-timeline-9000#243 |
| Support for milliseconds. | React9k/react-timeline-9000#196 | React9k/react-timeline-9000#239 | 
| Use of date/millis for compatibility w/ Redux. Moment.js support is still kept. | React9k/react-timeline-9000#221 | React9k/react-timeline-9000#241 | 
| Storybook | React9k/react-timeline-9000#234 | React9k/react-timeline-9000#237 | 
| Improved ItemRenderer and nice default styles | | [commit](https://github.com/flower-platform/react-timeline-10000/commit/e005eab4b4fbee1c737c2ebf323ad65304cdc26f)
| Generate TypeScript `.d.ts` files. Storybook uses TS | | [commit](https://github.com/flower-platform/react-timeline-10000/commit/a6bb813fe2c229c97aff306d3bf9c79ce23e6503)
| minor | | React9k/react-timeline-9000#257 |
| minor | | React9k/react-timeline-9000#260 |
| minor | React9k/react-timeline-9000#271 | React9k/react-timeline-9000#272 |

## v1.1.2
### Added
- Pass resolution props to timeline

## v1.1.1
### Fixed
- Selection UI would bleed when working on very dense timeline rows
with borders and/or margins

## v1.1.0
### Changed
- Selection UI now matches functionality

## v1.0.14
### Added
- Prop to customize shallow render logic

## v1.0.13
### Added
- Option for shallow re-render check

## v1.0.12
### Fixed
- Console error when loading page [#144]
- Row layers only worked with min 1 item in row [#145]


## v1.0.11
### Added
- Row layers
- Change log
### Fixed
- Selection box bug
- Better class names [#138]

## v1.0.10
### Fixed
- Fix a critical bug introduced in V1.0.9


## v1.0.9
### Changes
- Make it so that only selected items can be dragged & resized


## v1.0.8
### Changes
- Optimize demo build size
- Throttle mouse movement
### Fixed
- Restrict dragging to timeline


## v1.0.7
### Added
- Add a group title renderer
### Fixed
- Fix edge case bug for timebar


## v1.0.6
### Added
- Add namespacing to timeline [#112]
### Changes
- Single time lable for top bar [#118]
### Fixed
- Remove dependancy on style.css [#116]
- Current-time cursor error [#115]
- Duplicate key error [#117]
- Month calc error [#119]


## v1.0.5
### Added
- Added auto-documentation
### Changed
- Throttled mouse move - for performance
### Fixed
- Fixed issue with timebar 
- Don't require style.css [#104]
- Fix demo single select [#135]
- Demo not working [Smaller build size] [#128]


## v1.0.4
### Changed
- Swapped to inline source maps
- Allow for custom timebar time format prop
### Removed
- Removed excessive console logging
### Fixed
- Fix no-render on ie11
- Fix null indicator in top timebar


## v1.0.3
### Added
- Got NPM working
