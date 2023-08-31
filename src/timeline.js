'use strict';

import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Measure from 'react-measure';

import interact from 'interactjs';
import _ from 'lodash';
import {Button, Popup} from 'semantic-ui-react';
import {Group, InteractOption, Item, RowLayer} from './index';

import {TestsAreDemoCheat, createTestids} from '@famiprog-foundation/tests-are-demo';
import {Marker} from './components/Marker';
import TimelineBody from './components/body';
import SelectBox from './components/selector';
import Timebar from './components/timebar';
import {intToPix, pixToInt} from './utils/commonUtils';
import {
  adjustRowTopPositionToViewport,
  getMaxOverlappingItems,
  getNearestRowNumber,
  getNearestRowObject,
  getRowObjectRowNumber,
  getTrueBottom,
  getVerticalMarginBorder,
  rowItemsRenderer,
  rowLayerRenderer
} from './utils/itemUtils';
import {
  convertDateToMoment,
  convertMomentToDateType,
  getPixelAtTime,
  getSnapPixelFromDelta,
  getTimeAtPixel,
  pixelsPerMillisecond,
  timeSnap
} from './utils/timeUtils';

// startsWith polyfill for IE11 support
import 'core-js/fn/string/starts-with';
import SplitPane from 'react-split-pane';
import 'fixed-data-table-2/dist/fixed-data-table.css';
// TODO DB this is temporary. Created a copy because if we have used ItemRenderer file the default property for itemRenderer property
// didn't work and it gets undefined
import ItemRenderer from './components/ItemRenderer';
import {SelectionHolder} from './utils/SelectionHolder';
import {IGanttAction} from './types';
import {ContextMenu} from './components/ContextMenu/ContextMenu';

const testids = createTestids('Timeline', {
  menuButton: '',
  dragToCreatePopup: '',
  dragToCreatePopupCancelButton: '',
  dragToCreatePopupLabel: '',
  row: ``,
  group: ``,
  item: '',
  selector: '',
  table: '',
  ganttBody: '',
  splitPaneResizer: ''
});
export const timelineTestids = testids;

const EMPTY_GROUP_KEY = 'empty-group';
//TODO DB this was added by bogdan. From my understanding it reprezents the table vertical scrollbar width
// If we don't take in consideration this, a horizontal scrollbar appears
export const TABLE_OFFSET = 15;
export const DEFAULT_ITEM_HEIGHT = 40;
export const DEFAULT_ROW_CLASS = 'rct9k-row';
export const DEFAULT_ROW_EVEN_CLASS = 'rct9k-row-even';
/**
 * Be default we do not use any special css for the odd rows because they are blank by default
 * Added for the cases that user wants customize the color of the even rows also
 **/
export const DEFAULT_ROW_ODD_CLASS = '';
export const DRAG_TO_CREATE_POPUP_CLOSE_TIME = 5000;
export const DRAG_TO_CREATE_POPUP_LABEL_2 = 'Popup will close in a few moments.';

const ZOOM_PERCENT = 0.2;
const MIN_DISPLAY_TIME = 60000;

export const PARENT_ELEMENT = componentId => document.querySelector(`.rct9k-id-${componentId} .parent-div`);

const TableWithStyle = ({table}) => {
  const tableStyle = `.public_fixedDataTableCell_main {
      background-color: inherit!important;
    }
  `;

  return (
    <div>
      <style>{tableStyle}</style>
      {React.cloneElement(table)}
    </div>
  );
};

export const DRAG_TO_CREATE_ACTION_LABEL = 'Drag to create';
/**
 * Timeline class
 * @extends React.Component<Timeline.propTypes>
 */
export default class Timeline extends React.Component {
  /**
   * @type {object}
   */
  static TIMELINE_MODES = Object.freeze({
    SELECT: 1,
    DRAG: 2,
    RESIZE: 4
  });

  static propTypes = {
    /**
     * The rows (aka groups) of the Timeline.
     *
     * `id` is mandatory, it should: be numeric, start with 0 and have consecutive values.
     *
     * `title` is used displayed by the default renderer. This is optional, i.e. you may use this and/or other fields, provided
     * you have a custom renderer.
     * @type { Array.<Group> }
     */
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string
      })
    ).isRequired,

    /**
     * The segments (aka items). An item is associated with a row. Hence `row` is mandatory, pointing to an `id` of a row (group).
     *
     * `key` is also needed and has the React standard meaning.
     *
     * `start` and `stop` are dates (numeric/millis or moment objects, cf. `useMoment`).
     *
     * All the props of an item are copied to the props of the item renderer. E.g. `<ItemRenderer {...props.itemRendererDefaultProps } {...item}` ... />. See its
     * doc, to see what props are known/rendered by `ItemRenderer` (such as `title`, `color`, etc.). The item renderer can be
     * customized using the `itemRenderer` prop.
     * @type { Array.<Item> }
     */
    items: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        row: PropTypes.number.isRequired,
        // start and end are not required because getStartFromItem() and getEndFromItem() functions
        // are being used and they can be overriden to use other fields
        start: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
        end: PropTypes.oneOfType([PropTypes.number, PropTypes.object])
      })
    ).isRequired,

    /**
     * By default when the user clicks/drag to select items they gets selected.
     * By setting this property the gantt selection mechanism (mentioned above) is disabled, and the selected items are only the ones "dictated" by this property
     * @type { Array.<number | string> }
     */
    selectedItems: PropTypes.arrayOf(PropTypes.number | PropTypes.string),

    /**
     * The component that is the item (segment) renderer. You can change the default component (i.e. `ItemRenderer`). We
     * recommend to create a subclass of it, rather than creating one from scratch.
     * @type { Function }
     */
    itemRenderer: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),

    /**
     * This is used more or less like this:
     *
     * ```jsx
     * <ItemRenderer {...props.itemRendererDefaultProps } {...item} ... />
     * ```
     *
     * This is the way to go if you want to set a property for all segments (items). E.g. `color`. Take a look at the props
     * of `ItemRenderer` to see what are the possible options. If you override the item renderer, and it will accept additional
     * props, you can of course specify them here.
     * @type { object }
     */
    itemRendererDefaultProps: PropTypes.object,

    /**
     * The height of the items (segments) in pixels, it is used to calculate the height of the row.
     *
     * Items (segments) that are overlapping are displayed one below the other. In this case, the height of the row will
     * be the maximum number of overlapping items (segments) multiplied by `itemHeight`.
     * @type { number }
     */
    itemHeight: PropTypes.number,

    /**
     * List of layers that will be rendered for a row.
     * @type { Array.<RowLayer> }
     */
    rowLayers: PropTypes.arrayOf(
      PropTypes.shape({
        // start and end are not required because getStartFromItem() and getEndFromItem() functions
        // are being used and they can be overriden to use other fields
        start: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
        end: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
        rowNumber: PropTypes.number.isRequired,
        style: PropTypes.object.isRequired
      })
    ),

    /**
     * The name of the css class that will be applied both for gantt rows and for table rows
     * If it is not set it defaults to 'DEFAULT_ROW_CLASS'
     *
     * Example of usecase: change the default alternative rows coloring by setting 'rowClassName', 'rowEvenClassName' and 'rowOddClassName'
     *
     * @type {string}
     */
    rowClassName: PropTypes.string,

    /**
     * The name of the css class that will be applied both for gantt rows and for table rows that have an even row index
     * If it is not set it defaults to 'DEFAULT_ROW_EVEN_CLASS'
     *
     * Example of usecase: change the default alternative rows coloring by setting 'rowClassName', 'rowEvenClassName' and 'rowOddClassName'
     *
     * @type {string}
     */

    rowEvenClassName: PropTypes.string,

    /**
     * The name of the css class that will be applied both for gantt and for table rows that have an odd row index
     * If it is not set it defaults to 'DEFAULT_ROW_ODD_CLASS'
     *
     * Example of usecase: change the default alternative rows coloring by setting 'rowClassName', 'rowEvenClassName' and 'rowOddClassName'
     *
     * @type {string}
     */
    rowOddClassName: PropTypes.string,

    /**
     * Start of the displayed interval, as date (numeric/millis or moment object, cf. `useMoment`).
     * @type {number | object}
     */
    startDate: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,

    /**
     * End of the displayed interval, as date (numeric/millis or moment object, cf. `useMoment`).
     * @type { number | object }
     */
    endDate: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,

    /** If `false`, then when you "talk" dates/times to the Timeline, then you use
     * plain timestamps (i.e. number of millis, e.g. `new Date().valueOf()`). And this everywhere where
     * a date/time is needed (e.g. for an item, for global start/end, etc.). This is the **recommended** (and the default) way to go, especially if you use Redux.
     *
     * NOTE 1: the Timeline still uses "moment" internally. And this because it was quicker to refactor this way.
     * This may change in the future, if we find reasons and time to refactor more.
     *
     * NOTE 2: The upstream repo, had this `true` by default, in order to maintain backward compatibility. But we discovered that w/ `false`, the component
     * actually works both w/ timestamps AND moment objects. And this is because we convert using `moment(date)`, which works in the 2 cases. Obviously it's
     * not a good idea to mix the date types, one of the reasons being that maybe in the future moment won't be used internally any more.
     *
     * @type { boolean }
     */
    useMoment: PropTypes.bool,

    /**
     * The table component for displaying the groups. It appears in the left side of the gantt.
     * By setting the <code> table </code> component you can customize its look and feel as you like.
     *
     *
     * Empty rows can be added at the bottom of the table to fill in the remaining empty space.
     * So the cell renderers of your table should take in consideration those possible empty rows (without any data behind)
     *
     * @type { JSX.element}
     */
    table: PropTypes.object,

    /**
     * @type { number }
     */
    snap: PropTypes.number, //like snapMinutes, but for seconds; couldn't get it any lower because the pixels are not calculated correctly

    /**
     * @type { number }
     */
    snapMinutes: PropTypes.number,

    /**
     * Shows the cursor time in the timebar and a red marker in the grid indicating the cursor time.
     * @type { boolean }
     */
    showCursorTime: PropTypes.bool,

    /**
     * The format of the cursor time displayed in the timebar.
     * @type { string }
     */
    cursorTimeFormat: PropTypes.string,

    /**
     * A unique key to identify the component. Only needed when 2 grids are mounted.
     * @type { string }
     */
    componentId: PropTypes.string,

    /**
     * @type { number }
     */
    timelineMode: PropTypes.number,

    /**
     * @type { object }
     */
    timebarFormat: PropTypes.object,

    /**
     * @type { string }
     */
    bottomResolution: PropTypes.string,

    /**
     * @type { string }
     */
    topResolution: PropTypes.string,

    /**
     * If true timeline will try to minimize re-renders . Set to false if items don't show up/update on prop change.
     * @type { boolean }
     */
    shallowUpdateCheck: PropTypes.bool,

    /**
     * Function called when shallowUpdateCheck==true. If returns true the timeline will be redrawn.
     * If false the library will decide if redrawing is required.
     * @type { Function }
     */
    forceRedrawFunc: PropTypes.func,

    /**
     * @type { InteractOption }
     */
    interactOptions: PropTypes.shape({
      draggable: PropTypes.object,
      pointerEvents: PropTypes.object,
      // TODO: this doesn't seem used; originally it was w/ "required"; I removed this to avoid warnings in console
      resizable: PropTypes.object
    }),

    /**
     * @type { Function }
     */
    onItemClick: PropTypes.func,

    /**
     * @type { Function }
     */
    onItemDoubleClick: PropTypes.func,

    /**
     * @type { Function }
     */
    onItemContextClick: PropTypes.func,

    /**
     * @type { Function }
     */
    onInteraction: PropTypes.func,

    /**
     * @type { Function }
     */
    onRowClick: PropTypes.func,

    /**
     * @type { Function }
     */
    onRowContextClick: PropTypes.func,

    /**
     * @type { Function }
     */
    onRowDoubleClick: PropTypes.func,

    /**
     * @type { Function }
     */
    onItemHover: PropTypes.func,

    /**
     * @type { Function }
     */
    onItemLeave: PropTypes.func,

    /**
     * This property should be used like this:
     *
     * ```jsx
     * <Timeline backgroundLayer={<BackgroundLayer ... /> ... />
     * ```
     * @type { JSX.Element }
     */
    backgroundLayer: PropTypes.object,

    /**
     * Gantt has a default enable/disable drag to create mechanism implemented via a "Drag to create" context menu action.
     * If this property is set, this default mechanism is disabled and the application can enter/exit the dragToCreateMode by setting this property to true/false
     *
     * @type { undefined | boolean}
     */
    forceDragToCreateMode: PropTypes.bool,

    /**
     * Function called when getDragToCreateMode == true on dragstart
     * @param { DragToCreateParam } param
     * @type { Function }
     */
    onDragToCreateStarted: PropTypes.func,

    /**
     * Function called when getDragToCreateMode == true on dragend
     * @param { DragToCreateParam } param
     * @type { Function }
     */
    onDragToCreateEnded: PropTypes.func,

    /**
     * Function called everytime the segments selection changes.
     * It receives as parameter the indexes of the selected items.
     *
     * @type {(selectedItems: (number | string)[]) => void}
     */
    onSelectionChange: PropTypes.func,

    /**
     * Should provide actions that will fill the right click context menu.
     * If no actions are provided the context menu will not show
     *
     * @type {(param: IGanttOnContextMenuShowParam) => IGanttAction[]}
     */
    onContextMenuShow: PropTypes.func
  };

  static defaultProps = {
    rowLayers: [],
    itemHeight: DEFAULT_ITEM_HEIGHT,
    snapMinutes: 15,
    cursorTimeFormat: 'D MMM YYYY HH:mm',
    componentId: 'r9k1',
    showCursorTime: true,
    itemRenderer: ItemRenderer,
    timelineMode: Timeline.TIMELINE_MODES.SELECT | Timeline.TIMELINE_MODES.DRAG | Timeline.TIMELINE_MODES.RESIZE,
    // in rtl9k
    // shallowUpdateCheck: false,
    shallowUpdateCheck: true,
    forceRedrawFunc: null,
    onItemHover() {},
    onItemLeave() {},
    interactOptions: {},
    itemStyle: {},
    rowClassName: DEFAULT_ROW_CLASS,
    rowEvenClassName: DEFAULT_ROW_EVEN_CLASS,
    rowOddClassName: DEFAULT_ROW_ODD_CLASS,
    // in rtl9k:
    // useMoment: true,
    useMoment: false,
    selectedItems: undefined,
    snap: 1,
    timebarFormat: undefined,
    bottomResolution: undefined,
    topResolution: undefined,
    onItemClick() {},
    onItemDoubleClick() {},
    onItemContextClick() {},
    onRowClick() {},
    onRowContextClick() {},
    onRowDoubleClick() {},
    onInteraction() {},
    itemRendererDefaultProps: {},
    backgroundLayer: null,
    forceDragToCreateMode: undefined,
    onDragToCreateStarted: undefined,
    onDragToCreateEnded: undefined,
    onContextMenuShow: undefined,
    onSelectionChange() {}
  };

  /**
   * The types of interactions - see {@link onInteraction}
   */
  static changeTypes = {
    resizeStart: 'resizeStart',
    resizeEnd: 'resizeEnd',
    dragEnd: 'dragEnd',
    dragStart: 'dragStart',
    itemsSelected: 'itemsSelected',
    snappedMouseMove: 'snappedMouseMove'
  };

  /**
   * Checks if the given bit is set in the given mask
   * @param {number} bit Bit to check
   * @param {number} mask Mask to check against
   * @returns {boolean} True if bit is set; else false
   */
  static isBitSet(bit, mask) {
    return (bit & mask) === bit;
  }

  /**
   * Alias for no op function
   */
  static no_op = () => {};

  getInitialTableWidth() {
    return (this.props.table ? this.props.table.props.width : 0) + TABLE_OFFSET;
  }

  constructor(props) {
    super(props);
    this.selecting = false;
    this.getInitialTableWidth = this.getInitialTableWidth.bind(this);
    this.state = {
      selection: [],
      cursorTime: null,
      groups: this.props.groups,
      verticalGridLines: [],
      screenHeight: 0,
      gridWidth: 0,
      tableWidth: this.getInitialTableWidth(),
      dragToCreateMode: false,
      dragToCreatePopupClosed: false,
      openMenu: false,
      dragCancel: false,
      rightClickDraggingState: undefined,
      scrollTop: 0,
      openedContextMenuCoordinates: undefined,
      openedContextMenuRow: undefined,
      openedContextMenuTime: undefined,
      startDate: this.props.startDate,
      endDate: this.props.endDate
    };

    // These functions need to be bound because they are passed as parameters.
    // getStartFromItem and getEndFromItem are used in rowItemsRenderer function
    // to obtain the start and end of the rendered items.
    this.getStartFromItem = this.getStartFromItem.bind(this);
    this.getEndFromItem = this.getEndFromItem.bind(this);
    // getStartFromRowLayer and getEndFromRowLayer are used in rowLayerRenderer
    // to obtain the start and end of the rendered row layers.
    this.getStartFromRowLayer = this.getStartFromRowLayer.bind(this);
    this.getEndFromRowLayer = this.getEndFromRowLayer.bind(this);

    this.setTimeMap(this.props.items);

    this.cellRenderer = this.cellRenderer.bind(this);
    this.rowHeight = this.rowHeight.bind(this);
    this.tableRowHeight = this.tableRowHeight.bind(this);
    this.setTimeMap = this.setTimeMap.bind(this);
    this.getItem = this.getItem.bind(this);
    this.changeGroup = this.changeGroup.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
    this.getTimelineWidth = this.getTimelineWidth.bind(this);
    this.itemFromElement = this.itemFromElement.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.grid_ref_callback = this.grid_ref_callback.bind(this);
    this.table_ref_callback = this.table_ref_callback.bind(this);
    this.select_ref_callback = this.select_ref_callback.bind(this);
    this.selectionHolder_ref_callback = this.selectionHolder_ref_callback.bind(this);
    this.menuButton_ref_callback = this.menuButton_ref_callback.bind(this);
    this.throttledMouseMoveFunc = _.throttle(this.throttledMouseMoveFunc.bind(this), 20);
    this.mouseMoveFunc = this.mouseMoveFunc.bind(this);
    this.mouseDownFunc = this.mouseDownFunc.bind(this);
    this.mouseUpFunc = this.mouseUpFunc.bind(this);
    this.getCursor = this.getCursor.bind(this);
    this.setVerticalGridLines = this.setVerticalGridLines.bind(this);
    this.handleScrollTable = this.handleScrollTable.bind(this);
    this.handleScrollGantt = this.handleScrollGantt.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.selectionChangedHandler = this.selectionChangedHandler.bind(this);
    this.mouseWheel = this.mouseWheel.bind(this);

    const canSelect = Timeline.isBitSet(Timeline.TIMELINE_MODES.SELECT, this.props.timelineMode);
    const canDrag = Timeline.isBitSet(Timeline.TIMELINE_MODES.DRAG, this.props.timelineMode);
    const canResize = Timeline.isBitSet(Timeline.TIMELINE_MODES.RESIZE, this.props.timelineMode);
    this.setUpDragging(canSelect, canDrag, canResize);
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
    window.addEventListener('mousewheel', this.mouseWheel, {passive: false});
  }

  componentWillUnmount() {
    if (this._itemInteractable) this._itemInteractable.unset();
    if (this._selectRectangleInteractable) this._selectRectangleInteractable.unset();

    window.removeEventListener('resize', this.updateDimensions);
    window.removeEventListener('mousewheel', this.mouseWheel);
  }

  componentDidUpdate(prevProps, prevState) {
    const {timelineMode, selectedItems} = this.props;
    const selectionChange = !_.isEqual(prevProps.selectedItems, selectedItems);
    const timelineModeChange = !_.isEqual(prevProps.timelineMode, timelineMode);

    if (timelineModeChange || selectionChange) {
      const canSelect = Timeline.isBitSet(Timeline.TIMELINE_MODES.SELECT, timelineMode);
      const canDrag = Timeline.isBitSet(Timeline.TIMELINE_MODES.DRAG, timelineMode);
      const canResize = Timeline.isBitSet(Timeline.TIMELINE_MODES.RESIZE, timelineMode);
      this.setUpDragging(canSelect, canDrag, canResize);
    }
    if (this.props.startDate != prevProps.startDate || this.props.endDate != prevProps.endDate) {
      this.setState({startDate: this.props.startDate, endDate: this.props.endDate});
    }
    if (
      prevProps != this.props ||
      prevState.startDate != this.state.startDate ||
      prevState.endDate != this.state.endDate
    ) {
      this.setTimeMap(
        this.props.items,
        convertDateToMoment(this.state.startDate, this.props.useMoment),
        convertDateToMoment(this.state.endDate, this.props.useMoment),
        this.props.useMoment
      );
      this.fillInTimelineWithEmptyRows(this.props.groups);
      // @TODO
      // investigate if we need this, only added to refresh the grid
      // when double click -> add an item
      this.refreshGrid();
    }
  }

  mouseWheel(e) {
    if (e.ctrlKey) {
      let target = e.target;
      while (target) {
        if (target.className.includes('rct9k-grid')) {
          break;
        }
        target = target.parentElement;
      }
      if (!target) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      const interval = moment(this.state.endDate).valueOf() - moment(this.state.startDate).valueOf();
      const delta = e.clientX / this._grid.props.width;
      let deltaInterval = interval * ZOOM_PERCENT;
      if (e.deltaY > 0) {
        deltaInterval *= -1;
      }
      let startDate = moment(moment(this.state.startDate).valueOf() + delta * deltaInterval);
      let endDate = moment(moment(this.state.endDate).valueOf() - (1 - delta) * deltaInterval);
      if (endDate - startDate < MIN_DISPLAY_TIME) {
        return;
      }
      if (startDate.valueOf() < moment(this.props.startDate).valueOf()) {
        startDate = this.props.startDate;
      }
      if (endDate.valueOf() > moment(this.props.endDate).valueOf()) {
        endDate = this.props.endDate;
      }
      this.setState({startDate, endDate});
      this.throttledMouseMoveFunc(e);
    }
  }

  /**
   *
   * @return boolean
   */
  getDragToCreateMode() {
    return this.props.forceDragToCreateMode == undefined
      ? this.state.dragToCreateMode
      : this.props.forceDragToCreateMode;
  }

  /**
   * Start of the displayed interval (as moment object).
   *
   * @return {moment}
   */
  getStartDate() {
    return convertDateToMoment(this.state.startDate, this.props.useMoment);
  }

  /**
   * End of the displayed interval (as moment object).
   *
   * @return {moment}
   */
  getEndDate() {
    return convertDateToMoment(this.state.endDate, this.props.useMoment);
  }

  /**
   * Start of the segment (item).
   *
   * @param {Item} item The segment (item).
   * @param {boolean} useMoment This parameter is necessary because this method is also called when
   * the component receives new props. Default value: `this.props.useMoment`.
   * @return {moment}
   */
  getStartFromItem(item, useMoment = this.props.useMoment) {
    return convertDateToMoment(item.start, useMoment);
  }

  /**
   * It assigns `newDateAsMoment` to the start of the segment (item), but first it converts it
   * to moment or number/milliseconds according to `useMoment`.
   *
   * @param {Item} item The segment (item).
   * @param {moment} newDateAsMoment
   * @return {void}
   */
  setStartToItem(item, newDateAsMoment) {
    item.start = convertMomentToDateType(newDateAsMoment, this.props.useMoment);
  }

  /**
   * End of the segment (item).
   *
   * @param {Item} item The segment (item).
   * @param {boolean} useMoment This parameter is necessary because this method is also called when
   * the component receives new props. Default value: `this.props.useMoment`.
   * @return {moment}
   */
  getEndFromItem(item, useMoment = this.props.useMoment) {
    return convertDateToMoment(item.end, useMoment);
  }

  /**
   * It assigns `newDateAsMoment` to the end of the segment (item), but first it converts it
   * to moment or number/milliseconds according to `useMoment`.
   *
   * @param {Item} item The segment (item).
   * @param {moment} newDateAsMoment
   * @return {void}
   */
  setEndToItem(item, newDateAsMoment) {
    item.end = convertMomentToDateType(newDateAsMoment, this.props.useMoment);
  }

  /**
   * Start of the layer as a moment object.
   *
   * @param {RowLayer} layer
   * @return {moment}
   */
  getStartFromRowLayer(layer) {
    return convertDateToMoment(layer.start, this.props.useMoment);
  }

  /**
   * It assigns `newDateAsMoment` to the start of the segment (item), but first it converts it
   * to moment or number/milliseconds according to `useMoment`.
   *
   * @param {RowLayer} layer
   * @param {moment} newDateAsMoment
   */
  setStartToRowLayer(layer, newDateAsMoment) {
    layer.start = convertMomentToDateType(newDateAsMoment, this.props.useMoment);
  }

  /**
   * End of the layer as a moment object.
   *
   * @param {RowLayer} layer
   * @return {moment}
   */
  getEndFromRowLayer(layer) {
    return convertDateToMoment(layer.end, this.props.useMoment);
  }

  /**
   * It assigns `newDateAsMoment` to the end of the segment (item), but first it converts it
   * to moment or number/milliseconds according to `useMoment`.
   *
   * @param {RowLayer} layer
   * @param {moment} newDateAsMoment
   */
  setEndToRowLayer(layer, newDateAsMoment) {
    layer.end = convertMomentToDateType(newDateAsMoment, this.props.useMoment);
  }

  /**
   * Re-renders the grid when the window or container is resized
   */
  updateDimensions() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.forceUpdate();
      this._grid.recomputeGridSize();
    }, 100);
  }

  /**
   * Sets the internal maps used by the component for looking up item & row data
   * @param {Item[]} items The items to be displayed in the grid
   * @param {moment} startDate The visible start date of the timeline
   * @param {moment} endDate The visible end date of the timeline
   * @param {boolean} useMoment This parameter is necessary because this method is also called when
   * the component receives new props.
   */
  setTimeMap(items, startDate, endDate, useMoment) {
    if (!startDate || !endDate) {
      startDate = this.getStartDate();
      endDate = this.getEndDate();
    }
    this.itemRowMap = {}; // timeline elements (key) => (rowNo).
    this.rowItemMap = {}; // (rowNo) => timeline elements
    this.rowHeightCache = {}; // (rowNo) => max number of stacked items
    let visibleItems = _.filter(items, i => {
      return this.getEndFromItem(i, useMoment) > startDate && this.getStartFromItem(i, useMoment) < endDate;
    });
    let itemRows = _.groupBy(visibleItems, 'row');
    _.forEach(itemRows, (visibleItems, row) => {
      const rowInt = parseInt(row);
      if (this.rowItemMap[rowInt] === undefined) this.rowItemMap[rowInt] = [];
      _.forEach(visibleItems, item => {
        this.itemRowMap[item.key] = rowInt;
        this.rowItemMap[rowInt].push(item);
      });
      this.rowHeightCache[rowInt] = getMaxOverlappingItems(
        visibleItems,
        this.getStartFromItem,
        this.getEndFromItem,
        useMoment
      );
    });
  }

  /**
   * Compute the number of rows that fit inside the timeline. If there can fit
   * more rows than the model, fill in with empty groups.
   * @param {Group[]} groups
   */
  fillInTimelineWithEmptyRows(groups) {
    // remove empty groups
    groups = groups.filter(group => !group.key || !group.key.startsWith(EMPTY_GROUP_KEY));

    // get height of the grid (without timebar);
    // used to compute the number of rows we need to fill in
    if (!this._grid || this._grid.props.height <= 0) {
      this.setState({groups: groups});
      return;
    }

    // compute the total height of the actual rows;
    // if there are items that are overlapping, then the total height of a row is the maximum number
    // of items that are overlapping on that row, multiplied by props.itemHeight
    let totalItemsHeight = 0;
    let that = this;
    _.forEach(groups, group => {
      totalItemsHeight += (that.rowHeightCache[group.id] || 1) * that.props.itemHeight;
    });
    let heightToFillIn = this._grid.props.height - totalItemsHeight;
    let fillInGroups = [];

    let groupId = groups.length;
    while (heightToFillIn > 0) {
      // create new empty group;
      // if the last row would be only partially visible, then we set the height of the row as the remaining
      // height (add `rowHeight` in group, which will be used in rowHeight() function)
      let emptyGroup = {id: groupId, key: EMPTY_GROUP_KEY + groupId};
      if (heightToFillIn < this.props.itemHeight) {
        emptyGroup.rowHeight = heightToFillIn;
      }

      fillInGroups.push(emptyGroup);
      heightToFillIn -= this.props.itemHeight;
      groupId++;
    }
    this.setState({groups: [...groups, ...fillInGroups]});
  }

  /**
   * Returns an item given its DOM element
   * @param {Object} e the DOM element of the item
   * @return {Object} Item details
   * @prop {number|string} index The item's index
   * @prop {number} rowNo The row number the item is in
   * @prop {number} itemIndex Not really used - gets the index of the item in the row map
   * @prop {Item} item The provided item object
   */
  itemFromElement(e) {
    const index = e.getAttribute('data-item-index');
    const rowNo = this.itemRowMap[index];
    const itemIndex = _.findIndex(this.rowItemMap[rowNo], i => i.key == index);
    const item = this.rowItemMap[rowNo][itemIndex];

    return {index, rowNo, itemIndex, item};
  }

  /**
   * Gets an item given its ID
   * @param {number} id item id
   * @return {Item} Item object
   */
  getItem(id) {
    // This is quite stupid and shouldn't really be needed
    const rowNo = this.itemRowMap[id];
    const itemIndex = _.findIndex(this.rowItemMap[rowNo], i => i.key == id);
    return this.rowItemMap[rowNo][itemIndex];
  }

  /**
   * Move an item from one row to another
   * @param {Item} item The item object whose groups is to be changed
   * @param {number} curRow The item's current row index
   * @param {number} newRow The item's new row index
   */
  changeGroup(item, curRow, newRow) {
    item.row = newRow;
    this.itemRowMap[item.key] = newRow;
    this.rowItemMap[curRow] = this.rowItemMap[curRow].filter(i => i.key !== item.key);
    this.rowItemMap[newRow].push(item);
  }

  /**
   * Set the currently selected time ranges (for the timebar to display)
   * @param {Object[]} selections Of the form `[[start, end], [start, end], ...]`
   */
  setSelection(selections) {
    let newSelection = _.map(selections, s => {
      return {start: s[0].clone(), end: s[1].clone()};
    });
    this.setState({selection: newSelection});
  }

  /**
   * Clears the currently selected time range state
   */
  clearSelection() {
    this.setState({selection: []});
  }

  /**
   * Get the width of the timeline NOT including the left group list
   * @param {?number} totalWidth Total timeline width. If not supplied we use the timeline ref
   * @returns {number} The width in pixels
   */
  getTimelineWidth(totalWidth) {
    return totalWidth !== undefined ? totalWidth : this._grid.props.width;
  }

  /**
   * Get the snap in milliseconds from snapMinutes or snap
   * @returns { number }
   */
  getTimelineSnap() {
    if (this.props.snap) {
      return this.props.snap * 1000;
    } else if (this.props.snapMinutes) {
      return this.props.snapMinutes * 60 * 1000;
    }
    return 1;
  }

  /**
   * re-computes the grid's row sizes
   * @param {Object?} config Config to pass wo react-virtualized's compute func
   */
  refreshGrid = (config = {}) => {
    // General known problem :
    // can not use constructions like this._grid?.recomputeGridSize(config);
    // because the generation of the storybook table for component properties documentation fails
    if (this._grid) {
      this._grid.recomputeGridSize(config);
    }
    // fill in timeline with empty rows only on resize
    if (!_.isEmpty(config)) {
      this.fillInTimelineWithEmptyRows(this.state.groups);
    }
  };

  /**
   * @param {number} clientX
   * @param {number} clientY
   */
  // before it was #onDragStartSelect but can not use constructions like this
  // because the documnetation fails to be generated
  onDragStartSelect(clientX, clientY) {
    const nearestRowObject = getNearestRowObject(clientX, clientY);
    const startY = adjustRowTopPositionToViewport(nearestRowObject, nearestRowObject.getBoundingClientRect().y);
    // Add 2 to startY because on some occasions/browsers, when using document.elementsFromPonint(), it will return the wrong row if startY is used.
    // Adding 2 to it ensures that the point isn't shared with other row.
    this._selectBox.start(clientX, startY + 2);

    if (this.getDragToCreateMode() && this.props.onDragToCreateStarted) {
      const groupIndex = Number(getNearestRowNumber(clientX, clientY));
      const itemIndex = Math.max(...Object.keys(this.itemRowMap)) + 1;
      const startOffset = clientX - nearestRowObject.getBoundingClientRect().left;
      const itemStart = getTimeAtPixel(
        startOffset,
        this.getStartDate(),
        this.getEndDate(),
        this.getTimelineWidth(),
        this.getTimelineSnap()
      );
      this.props.onDragToCreateStarted({groupIndex, itemIndex, itemStart});
    }
  }

  /**
   * @param {number} clientX
   * @param {number} clientY
   * @param {number} startXElement
   */
  onDragMoveSelect(clientX, clientY, startXElement) {
    if (this.state.dragCancel) {
      // do nothing if drag is canceled
      return;
    }
    // when selection going up, the bottom start row === top next row of start and getNearestRowObject
    // returns both row and we cannot determine which row is needed and we substract this constant from bottom select box
    const magicalConstant = 2;
    const {startX, startY} = this._selectBox;
    const startRowObject = getNearestRowObject(startX, startY);
    const startXRowObject = startRowObject.getBoundingClientRect().x + 1;
    // select only row without group
    if (startXElement < startXRowObject) {
      clientX = startXRowObject;
    }
    const currentRowObject = getNearestRowObject(clientX, clientY);
    if (currentRowObject !== undefined && startRowObject !== undefined) {
      // only run if you can detect the top row
      const startRowNumber = getRowObjectRowNumber(startRowObject);
      const currentRowNumber = getRowObjectRowNumber(currentRowObject);
      if (startRowNumber <= currentRowNumber) {
        // select box for selection going down
        // get the first selected rows top
        let startTop = startRowObject.getBoundingClientRect().top;
        startTop = adjustRowTopPositionToViewport(startRowObject, startTop);
        // get the currently selected rows bottom
        // if drag to create mode set bottom from the first selected row
        const currentBottom = this.getDragToCreateMode()
          ? getTrueBottom(startRowObject)
          : getTrueBottom(currentRowObject);
        // If startTop is used as it is, on some occasions/browsers (usually when we zoom in/out and the values recalculate) we have issues when getNearestRowObject is called.
        // It uses document.elementsFromPoint() and it returns the wrong row or 2 rows and can't determine which row is needed.
        // For top value we add magical constant and for bottom value we substract it. This way we assure that the point is "more inside" the row and is not shared with other row.
        this._selectBox.start(startX, startTop + magicalConstant);
        this._selectBox.move(clientX, currentBottom - magicalConstant);
      } else {
        // select box for selection going up
        // get the currently selected rows top
        // if drag to create mode keep set top from the first selected row
        const currentTop = this.getDragToCreateMode()
          ? startRowObject.getBoundingClientRect().top
          : currentRowObject.getBoundingClientRect().top;
        // get the first selected rows bottom
        const startBottom = getTrueBottom(startRowObject);
        // the bottom will bleed south unless you counter the margins and boreders from the above rows
        this._selectBox.start(startX, startBottom - magicalConstant);
        this._selectBox.move(clientX, currentTop + magicalConstant);
      }
    }
  }

  onDragEndSelect(event) {
    if (this.state.dragCancel) {
      // only reset dragCancel on dragend if drag is canceled
      this.setState({dragCancel: false});
      return;
    }

    let {top, left, width, height} = this._selectBox.end();
    // Get the start and end row of the selection rectangle
    const topRowObject = getNearestRowObject(left, top);
    if (topRowObject !== undefined) {
      // only confirm the end of a drag if the selection box is valid
      const topRowNumber = Number(getNearestRowNumber(left, top));
      const topRowLoc = topRowObject.getBoundingClientRect();
      const rowMarginBorder = getVerticalMarginBorder(topRowObject);
      const y = Math.floor(topRowLoc.top - rowMarginBorder) + Math.floor(height - rowMarginBorder);
      const bottomRow = Number(getNearestRowNumber(left + width, adjustRowTopPositionToViewport(topRowObject, y)));
      // Get the start and end time of the selection rectangle
      left = left - topRowLoc.left;
      let startOffset = width > 0 ? left : left + width;
      let endOffset = width > 0 ? left + width : left;
      const startTime = getTimeAtPixel(
        startOffset,
        this.getStartDate(),
        this.getEndDate(),
        this.getTimelineWidth(),
        this.getTimelineSnap()
      );
      const endTime = getTimeAtPixel(
        endOffset,
        this.getStartDate(),
        this.getEndDate(),
        this.getTimelineWidth(),
        this.getTimelineSnap()
      );
      // Get items in these ranges
      let selectedItems = [];
      for (let r = Math.min(topRowNumber, bottomRow); r <= Math.max(topRowNumber, bottomRow); r++) {
        selectedItems.push(
          ..._.filter(this.rowItemMap[r], i => {
            return this.getStartFromItem(i).isBefore(endTime) && this.getEndFromItem(i).isAfter(startTime);
          })
        );
      }
      !this.getDragToCreateMode() &&
        this.props.onInteraction &&
        this.props.onInteraction(Timeline.changeTypes.itemsSelected, selectedItems);

      // delegate the selection change to the selection component
      !this.getDragToCreateMode() && this._selectionHolder.addRemoveItems(_.map(selectedItems, 'key'), event);

      if (this.getDragToCreateMode() && this.props.onDragToCreateEnded) {
        // get avaible itemIndex and call the onDragToCreateEnded
        const itemIndex = Math.max(...Object.keys(this.itemRowMap)) + 1;
        this.props.onDragToCreateEnded({groupIndex: topRowNumber, itemIndex, itemStart: startTime, itemEnd: endTime});
        this.setDragToCreateMode(false);
      }

      if (event.button == 2) {
        this.setState({openedContextMenuCoordinates: {x: event.clientX, y: event.clientY}});
        this.setState({openedContextMenuRow: bottomRow});
        const leftOffset = PARENT_ELEMENT(this.props.componentId).getBoundingClientRect().left;
        this.setState({
          openedContextMenuTime: getTimeAtPixel(
            event.clientX - leftOffset,
            this.getStartDate(),
            this.getEndDate(),
            this.getTimelineWidth(),
            this.getTimelineSnap()
          )
        });
      }
    }
  }

  /**
   * @param { boolean } canSelect
   * @param { boolean } canDrag
   * @param { boolean } canResize
   */
  setUpDragging(canSelect, canDrag, canResize) {
    // No need to setUpDragging during SSR
    if (typeof window === 'undefined') {
      return;
    }

    const topDivClassId = `rct9k-id-${this.props.componentId}`;

    const selectedItemSelector = '.rct9k-items-outer-selected';
    if (this._itemInteractable) this._itemInteractable.unset();
    if (this._selectRectangleInteractable) this._selectRectangleInteractable.unset();

    this._itemInteractable = interact(`.${topDivClassId} .item_draggable`);
    this._selectRectangleInteractable = interact(`.${topDivClassId} .parent-div`);

    this._itemInteractable.pointerEvents(this.props.interactOptions.pointerEvents).on('tap', e => {
      this._handleItemRowEvent(e, this.props.onItemClick, this.props.onRowClick);
    });

    if (canDrag) {
      this._itemInteractable
        .draggable({
          enabled: true,
          allowFrom: selectedItemSelector,
          restrict: {
            restriction: `.${topDivClassId}`,
            elementRect: {left: 0, right: 1, top: 0, bottom: 1}
          },
          ...this.props.interactOptions.draggable
        })
        .on('dragstart', e => {
          let selections = [];
          const animatedItems =
            this.props.onInteraction &&
            this.props.onInteraction(Timeline.changeTypes.dragStart, null, this._selectionHolder.state.selectedItems);

          _.forEach(animatedItems, id => {
            let domItem = this._gridDomNode.querySelector("span[data-item-index='" + id + "'");
            if (domItem) {
              selections.push([this.getStartFromItem(this.getItem(id)), this.getEndFromItem(this.getItem(id))]);
              domItem.setAttribute('isDragging', 'True');
              domItem.setAttribute('drag-x', 0);
              domItem.setAttribute('drag-y', 0);
              domItem.style['z-index'] = 4;
            }
          });
          this.setSelection(selections);
        })
        .on('dragmove', e => {
          const target = e.target;
          let animatedItems = this._gridDomNode.querySelectorAll("span[isDragging='True'") || [];

          let dx = (parseFloat(target.getAttribute('drag-x')) || 0) + e.dx;
          let dy = (parseFloat(target.getAttribute('drag-y')) || 0) + e.dy;
          let selections = [];

          // Snap the movement to the current snap interval
          const snapDx = getSnapPixelFromDelta(
            dx,
            this.getStartDate(),
            this.getEndDate(),
            this.getTimelineWidth(),
            this.getTimelineSnap()
          );

          _.forEach(animatedItems, domItem => {
            const {item} = this.itemFromElement(domItem);
            let itemDuration = this.getEndFromItem(item).diff(this.getStartFromItem(item));
            let newPixelOffset = pixToInt(domItem.style.left) + snapDx;
            let newStart = getTimeAtPixel(
              newPixelOffset,
              this.getStartDate(),
              this.getEndDate(),
              this.getTimelineWidth(),
              this.getTimelineSnap()
            );

            let newEnd = newStart.clone().add(itemDuration);
            selections.push([newStart, newEnd]);

            // Translate the new start time back to pixels, so we can animate the snap
            domItem.style.webkitTransform = domItem.style.transform = 'translate(' + snapDx + 'px, ' + dy + 'px)';
          });

          target.setAttribute('drag-x', dx);
          target.setAttribute('drag-y', dy);

          this.setSelection(selections);
        })
        .on('dragend', e => {
          const {item, rowNo} = this.itemFromElement(e.target);
          let animatedItems = this._gridDomNode.querySelectorAll("span[isDragging='True'") || [];

          this.setSelection([[this.getStartFromItem(item), this.getEndFromItem(item)]]);
          this.clearSelection();

          // Change row
          let newRow = getNearestRowNumber(e.clientX, e.clientY);

          let rowChangeDelta = newRow - rowNo;
          // Update time
          let newPixelOffset = pixToInt(e.target.style.left) + (parseFloat(e.target.getAttribute('drag-x')) || 0);
          let newStart = getTimeAtPixel(
            newPixelOffset,
            this.getStartDate(),
            this.getEndDate(),
            this.getTimelineWidth(),
            this.getTimelineSnap()
          );

          const timeDelta = newStart.clone().diff(this.getStartFromItem(item), 'minutes');
          const changes = {rowChangeDelta, timeDelta};
          let items = [];

          // Default, all items move by the same offset during a drag
          _.forEach(animatedItems, domItem => {
            const {item, rowNo} = this.itemFromElement(domItem);

            let itemDuration = this.getEndFromItem(item).diff(this.getStartFromItem(item));
            let newStart = this.getStartFromItem(item)
              .clone()
              .add(timeDelta, 'minutes');
            let newEnd = newStart.clone().add(itemDuration);
            this.setStartToItem(item, newStart);
            this.setEndToItem(item, newEnd);
            if (rowChangeDelta < 0) {
              item.row = Math.max(0, item.row + rowChangeDelta);
            } else if (rowChangeDelta > 0) {
              item.row = Math.min(this.props.groups.length - 1, item.row + rowChangeDelta);
            }

            items.push(item);
          });

          this.props.onInteraction && this.props.onInteraction(Timeline.changeTypes.dragEnd, changes, items);

          // Reset the styles
          animatedItems.forEach(domItem => {
            domItem.style.webkitTransform = domItem.style.transform = 'translate(0px, 0px)';
            domItem.setAttribute('drag-x', 0);
            domItem.setAttribute('drag-y', 0);
            domItem.style['z-index'] = 3;
            domItem.style['top'] = intToPix(
              this.props.itemHeight * Math.round(pixToInt(domItem.style['top']) / this.props.itemHeight)
            );
            domItem.removeAttribute('isDragging');
          });

          this._grid.recomputeGridSize({rowIndex: 0});
        });
    }
    if (canResize) {
      this._itemInteractable
        .resizable({
          allowFrom: selectedItemSelector,
          edges: {left: true, right: true, bottom: false, top: false},
          ...this.props.interactOptions.draggable
        })
        .on('resizestart', e => {
          const selected =
            this.props.onInteraction &&
            this.props.onInteraction(Timeline.changeTypes.resizeStart, null, this._selectionHolder.state.selectedItems);
          _.forEach(selected, id => {
            let domItem = this._gridDomNode.querySelector("span[data-item-index='" + id + "'");
            if (domItem) {
              domItem.setAttribute('isResizing', 'True');
              domItem.setAttribute('initialWidth', pixToInt(domItem.style.width));
              domItem.style['z-index'] = 4;
            }
          });
        })
        .on('resizemove', e => {
          let animatedItems = this._gridDomNode.querySelectorAll("span[isResizing='True'") || [];

          let dx = parseFloat(e.target.getAttribute('delta-x')) || 0;
          dx += e.deltaRect.left;

          let dw = e.rect.width - Number(e.target.getAttribute('initialWidth'));

          const minimumWidth =
            pixelsPerMillisecond(this.getStartDate(), this.getEndDate(), this.getTimelineWidth()) *
            this.getTimelineSnap();

          const snappedDx = getSnapPixelFromDelta(
            dx,
            this.getStartDate(),
            this.getEndDate(),
            this.getTimelineWidth(),
            this.getTimelineSnap()
          );

          const snappedDw = getSnapPixelFromDelta(
            dw,
            this.getStartDate(),
            this.getEndDate(),
            this.getTimelineWidth(),
            this.getTimelineSnap()
          );

          _.forEach(animatedItems, item => {
            item.style.width = intToPix(Number(item.getAttribute('initialWidth')) + snappedDw + minimumWidth);
            item.style.webkitTransform = item.style.transform = 'translate(' + snappedDx + 'px, 0px)';
          });
          e.target.setAttribute('delta-x', dx);
        })
        .on('resizeend', e => {
          let animatedItems = this._gridDomNode.querySelectorAll("span[isResizing='True'") || [];
          // Update time
          const dx = parseFloat(e.target.getAttribute('delta-x')) || 0;
          const isStartTimeChange = dx != 0;

          let items = [];
          let minRowNo = Infinity;

          let durationChange = null;
          // Calculate the default item positions
          _.forEach(animatedItems, domItem => {
            let startPixelOffset = pixToInt(domItem.style.left) + dx;
            const {item, rowNo} = this.itemFromElement(domItem);

            minRowNo = Math.min(minRowNo, rowNo);

            if (isStartTimeChange) {
              let newStart = getTimeAtPixel(
                startPixelOffset,
                this.getStartDate(),
                this.getEndDate(),
                this.getTimelineWidth(),
                this.getTimelineSnap()
              );
              if (durationChange === null) durationChange = this.getStartFromItem(item).diff(newStart, 'minutes');
              this.setStartToItem(item, newStart);
            } else {
              let endPixelOffset = startPixelOffset + pixToInt(domItem.style.width);
              let newEnd = getTimeAtPixel(
                endPixelOffset,
                this.getStartDate(),
                this.getEndDate(),
                this.getTimelineWidth(),
                this.getTimelineSnap()
              );
              if (durationChange === null) durationChange = this.getEndFromItem(item).diff(newEnd, 'minutes');

              this.setEndToItem(item, newEnd);
            }

            // Check row height doesn't need changing
            let new_row_height = getMaxOverlappingItems(
              this.rowItemMap[rowNo],
              this.getStartFromItem,
              this.getEndFromItem
            );
            if (new_row_height !== this.rowHeightCache[rowNo]) {
              this.rowHeightCache[rowNo] = new_row_height;
            }

            //Reset styles
            domItem.removeAttribute('isResizing');
            domItem.removeAttribute('initialWidth');
            domItem.style['z-index'] = 3;
            domItem.style.webkitTransform = domItem.style.transform = 'translate(0px, 0px)';

            items.push(item);
          });
          if (durationChange === null) durationChange = 0;
          const changes = {isStartTimeChange, timeDelta: -durationChange};

          this.props.onInteraction && this.props.onInteraction(Timeline.changeTypes.resizeEnd, changes, items);

          e.target.setAttribute('delta-x', 0);
          this._grid.recomputeGridSize({rowIndex: minRowNo});
        });
    }
    if (canSelect) {
      this._selectRectangleInteractable
        .draggable({
          enabled: true,
          ignoreFrom: '.item_draggable, .rct9k-group'
        })
        .styleCursor(false)
        .on('dragstart', e => {
          this.onDragStartSelect(e.clientX, e.clientY);
        })
        .on('dragmove', e => {
          this.onDragMoveSelect(e.clientX, e.clientY, e.page.x);
        })
        .on('dragend', e => {
          this.onDragEndSelect(e);
        });
    }
  }

  _handleItemRowEvent = (e, itemCallback, rowCallback) => {
    e.preventDefault();
    // Skip click handler if selecting with selection box
    if (this.selecting) {
      return;
    }
    let row;
    let target = e.target;
    while (target) {
      if (target.hasAttribute('data-item-index')) {
        break;
      }
      target = target.parentElement;
    }
    if (target) {
      row = target.parentElement.getAttribute('data-row-index');
      let itemKey = target.getAttribute('data-item-index');
      itemKey = isNaN(Number(itemKey)) ? itemKey : Number(itemKey);
      itemCallback && itemCallback(e, itemKey);
      // window.ontouchstart added to checks is we are on mobile
      if (e.type == 'mousedown' || (window.ontouchstart && e.type == 'tap')) {
        // Calculate new selection by delegating to selection component
        this._selectionHolder.addRemoveItems([itemKey], e);
      }
    } else {
      row = e.target.getAttribute('data-row-index');
      const leftOffset = PARENT_ELEMENT(this.props.componentId).getBoundingClientRect().left;
      let clickedTime = getTimeAtPixel(
        e.clientX - leftOffset,
        this.getStartDate(),
        this.getEndDate(),
        this.getTimelineWidth()
      );

      let snappedClickedTime = timeSnap(clickedTime, this.getTimelineSnap() * 60);
      rowCallback && rowCallback(e, row, clickedTime, snappedClickedTime);

      if (e.type == 'mousedown' || (window.ontouchstart && e.type == 'tap')) {
        this._selectionHolder.addRemoveItems([], e);
      }
    }

    if (e.type == 'contextmenu') {
      // right click => open CM
      this.setState({openedContextMenuCoordinates: {x: e.clientX, y: e.clientY}});
      this.setState({openedContextMenuRow: Number(row)});
      const leftOffset = PARENT_ELEMENT(this.props.componentId).getBoundingClientRect().left;
      this.setState({
        openedContextMenuTime: getTimeAtPixel(
          e.clientX - leftOffset,
          this.getStartDate(),
          this.getEndDate(),
          this.getTimelineWidth(),
          this.getTimelineSnap()
        )
      });

      if (!this._selectBox.isStart()) {
        // If a drag in progress, right click only cancels the current drag but keeps the drag to create mode
        this.setDragToCreateMode(false);
      }
    } else if (e.type == 'click' || (window.ontouchstart && e.type == 'tap')) {
      this.setState({openedContextMenuCoordinates: undefined});
      this.setDragToCreateMode(false);
    }
  };

  /**
   * @param {number} width container width (in px)
   */
  cellRenderer(width) {
    /**
     * @param  {} key Unique key within array of cells
     * @param  {} parent Reference to the parent Grid (instance)
     * @param  {} rowIndex Vertical (row) index of cell
     * @param  {} style Style object to be applied to cell (to position it);
     */
    const {timelineMode, onItemHover, onItemLeave} = this.props;
    const canSelect = Timeline.isBitSet(Timeline.TIMELINE_MODES.SELECT, timelineMode);
    return ({key, parent, rowIndex, style}) => {
      let itemsInRow = this.rowItemMap[rowIndex];
      // Previously, `rowLayers` constant was instatiated outside the arrow function. However, I have discovered that when
      // the rowLayers were updated, the `rowLayers` constant had the previous value,
      // but this.props.rowLayers has the new value.
      const layersInRow = this.props.rowLayers.filter(r => r.rowNumber === rowIndex);
      let rowHeight = this.props.itemHeight;
      if (this.rowHeightCache[rowIndex]) {
        rowHeight = rowHeight * this.rowHeightCache[rowIndex];
      }
      var props = this.props;
      return (
        <div
          data-testid={testids.row + '_' + rowIndex}
          key={key}
          style={style}
          data-row-index={rowIndex}
          className={
            this.props.rowClassName +
            ' ' +
            (rowIndex % 2 == 0 ? this.props.rowOddClassName : this.props.rowEvenClassName)
          }
          onClick={e => this._handleItemRowEvent(e, Timeline.no_op, this.props.onRowClick)}
          onMouseDown={e => {
            this.selecting = false;
            this._handleItemRowEvent(e, Timeline.no_op, Timeline.no_op);
          }}
          onMouseMove={e => (this.selecting = true)}
          onMouseOver={e => {
            this.selecting = false;
            return this._handleItemRowEvent(e, onItemHover, null);
          }}
          onMouseLeave={e => {
            this.selecting = false;
            return this._handleItemRowEvent(e, onItemLeave, null);
          }}
          onContextMenu={e => this._handleItemRowEvent(e, this.props.onItemContextClick, this.props.onRowContextClick)}
          onDoubleClick={e => this._handleItemRowEvent(e, this.props.onItemDoubleClick, this.props.onRowDoubleClick)}>
          {rowItemsRenderer(
            itemsInRow,
            this.getStartDate(),
            this.getEndDate(),
            width,
            this.props.itemHeight,
            this.props.itemRenderer,
            canSelect ? this._selectionHolder.state.selectedItems : [],
            this.props.itemRendererDefaultProps,
            this.getStartFromItem,
            this.getEndFromItem,
            timelineTestids
          )}
          {rowLayerRenderer(
            layersInRow,
            this.getStartDate(),
            this.getEndDate(),
            width,
            rowHeight,
            this.getStartFromRowLayer,
            this.getEndFromRowLayer
          )}
        </div>
      );
    };
  }

  getCursor() {
    const {showCursorTime, cursorTimeFormat} = this.props;
    const {cursorTime} = this.state;
    return showCursorTime && cursorTime ? cursorTime.clone().format(cursorTimeFormat) : null;
  }

  /**
   * Helper for react virtualized to get the row height given a row index.
   */
  rowHeight({index}) {
    let group = _.find(this.state.groups, g => g.id == index);
    // only for empty rows (EMPTY_GROUP_KEY), if the group has a custom row height,
    // we will return that height
    if (group.rowHeight && group.key.startsWith(EMPTY_GROUP_KEY)) {
      return group.rowHeight;
    }
    let rh = this.rowHeightCache[index] ? this.rowHeightCache[index] : 1;
    return rh * this.props.itemHeight;
  }

  /**
   * The height of the last empty row added to fill in the remaining space is different in gantt and in table because:
   * In gantt the computed available space for rows is:
   *        componentHeight - headerheight
   * But in fixed data table the computed available space for the rows is:
   *        Math.round(componentHeight) - headerheight - 2 * BORDER_HEIGHT (see roughHeights.js)
   *
   * If we have passed the same row height for table as for gantt a vertical scroll bar appeared (only for scrolling 2 or 3 px overflow)
   */
  tableRowHeight(index) {
    var tableRowHeight = this.rowHeight({index});
    let group = _.find(this.state.groups, g => g.id == index);
    if (group.rowHeight && group.key.startsWith(EMPTY_GROUP_KEY)) {
      tableRowHeight = Math.round(tableRowHeight) - 2;
    }
    return tableRowHeight;
  }

  /**
   * Set the grid ref.
   * @param {Object} reactComponent Grid react element
   */
  grid_ref_callback(reactComponent) {
    this._grid = reactComponent;
    this._gridDomNode = ReactDOM.findDOMNode(this._grid);
  }

  table_ref_callback(reactComponent) {
    this._table = reactComponent;
  }

  /**
   * Testing pourpose
   * @param {*} splitPane
   */
  splitPane_ref_callback(splitPane) {
    // We made here a querry to select the child resizer of the split pane and to put the test id on it
    // Because if we have putted the testis on parent and querry select in tests
    // the focus was putted on the parent split pane and we only needed to drag the resizer of the split pane
    if (splitPane) {
      ReactDOM.findDOMNode(splitPane)
        .querySelector('[role="presentation"]')
        .setAttribute('data-testid', testids.splitPaneResizer);
    }
  }

  /**
   * @param {Object} reactComponent Selectbox react element
   */
  select_ref_callback(reactComponent) {
    this._selectBox = reactComponent;
  }

  selectionHolder_ref_callback(reactComponent) {
    this._selectionHolder = reactComponent;
  }

  menuButton_ref_callback(reactComponent) {
    if (reactComponent) {
      this._menuButton = reactComponent.ref.current;
    }
  }

  /**
   * Event handler for onMouseMove.
   * Only calls back if a new snap time is reached
   */
  throttledMouseMoveFunc(e) {
    const leftOffset = PARENT_ELEMENT(this.props.componentId).getBoundingClientRect().left;
    const cursorSnappedTime = getTimeAtPixel(
      e.clientX - leftOffset + 2,
      this.getStartDate(),
      this.getEndDate(),
      this.getTimelineWidth(),
      this.getTimelineSnap()
    );
    if (!this.mouse_snapped_time || this.mouse_snapped_time.unix() !== cursorSnappedTime.unix()) {
      if (cursorSnappedTime.isSameOrAfter(this.getStartDate())) {
        this.mouse_snapped_time = cursorSnappedTime;
        this.setState({cursorTime: this.mouse_snapped_time});
        this.props.onInteraction &&
          this.props.onInteraction(
            Timeline.changeTypes.snappedMouseMove,
            {snappedTime: this.mouse_snapped_time.clone()},
            null
          );
      }
    }
  }

  mouseMoveFunc(e) {
    e.persist();
    this.throttledMouseMoveFunc(e);

    if (this.state.rightClickDraggingState && this.state.rightClickDraggingState != 'move') {
      e = this.state.rightClickDraggingState;
      this.onDragStartSelect(e.clientX, e.clientY);
      this.setState({rightClickDraggingState: 'move'});
    } else if (this.state.rightClickDraggingState == 'move') {
      this.onDragMoveSelect(e.clientX, e.clientY, e.pageX);
    }
  }

  mouseDownFunc(e) {
    // Because we wanted the drag to select feature to work similar to the one in Windows Explorer
    // We needed it to work also on right click. But the initial implementation of drag to select from the timeline
    // is based on interact js that ignores right click drag (this type of drag is not a nativelly supported one).
    // We choosed a basic implementation using mouseDown, mouseMove and mouseUp events for implementing the right click drag to select
    if (e.button == 1) {
      return;
    }

    // Just as drag to select with left click works,
    // Also the drag to select doesn't start on segments (item_draggable), it needds to start on the empty row

    // In some client applications the segments are complex components and can have a complex children hierachy.
    // That's why we needed to iterate from bottom to top the parent hierachy
    let target = e.target;
    while (target && !target.hasAttribute('data-row-index')) {
      if (target.classList && target.classList.contains('item_draggable')) {
        return;
      }
      target = target.parentElement;
    }

    this.setState({rightClickDraggingState: e});
  }

  mouseUpFunc(e) {
    if (this.state.rightClickDraggingState) {
      if (this.state.rightClickDraggingState == 'move') {
        this.onDragEndSelect(e);
      }
      this.setState({rightClickDraggingState: undefined});
    }
  }

  /**
   * Setter for verticalGridLines (that will be passed to `BackgroundLayer`).
   * @param { object } verticalGridLines
   */
  setVerticalGridLines(verticalGridLines) {
    this.setState({verticalGridLines});
  }

  handleScrollTable = scrollPos => {
    this._gridDomNode.scrollTop = scrollPos;
    return true;
  };

  handleScrollGantt = ({scrollTop}) => {
    this.setState({scrollTop: scrollTop});
    return true;
  };

  handleDrag(width) {
    this.setState({tableWidth: width});
    return true;
  }

  /**
   * Switches the Gantt in the mode: drag to create. Useful when you have an external mechanism that triggers this creation
   * mode (e.g. "tool" like button/buttons).
   * @param { boolean } dragToCreateMode
   */
  setDragToCreateMode(dragToCreateMode) {
    this.setState({dragToCreateMode});
    if (dragToCreateMode) {
      this.setState({dragToCreatePopupClosed: false});
      setTimeout(() => this.setState({dragToCreatePopupClosed: true}), DRAG_TO_CREATE_POPUP_CLOSE_TIME);
    }
  }

  /**
   * @returns { JSX.Element }
   */
  renderMenuButton() {
    return (
      <Popup
        data-testid={testids.dragToCreatePopup}
        position="top right"
        open={this.state.dragToCreateMode && !this.state.dragToCreatePopupClosed}
        wide="very"
        trigger={
          <Button
            data-testid={testids.menuButton}
            size="mini"
            circular
            primary
            icon="bars"
            onClick={() => {
              const {x, y, width, height} = this._menuButton.getBoundingClientRect();
              const openedContextMenuCoordinates = this.state.openedContextMenuCoordinates;
              const buttonCenter = {x: x + width / 2, y: y + height / 2};
              if (
                !openedContextMenuCoordinates ||
                openedContextMenuCoordinates.x != buttonCenter.x ||
                openedContextMenuCoordinates.y != buttonCenter.y
              ) {
                this.setState({openedContextMenuCoordinates: buttonCenter});
              } else {
                this.setState({openedContextMenuCoordinates: undefined});
              }
              this.setState({openedContextMenuRow: undefined});
              this.setState({openedContextMenuTime: undefined});
            }}
            ref={this.menuButton_ref_callback}></Button>
        }>
        <div>
          <div data-testid={testids.dragToCreatePopupLabel + '_1'}>
            <b>Click and drag</b> to create a new segment
          </div>
          <div className="rct9k-drag-to-create-popup-buttons-div">
            <Button
              data-testid={testids.dragToCreatePopupCancelButton}
              content="Cancel 'drag to create' mode"
              icon="cancel"
              negative
              size="tiny"
              onClick={() => this.setDragToCreateMode(false)}
            />
          </div>
          <div data-testid={testids.dragToCreatePopupLabel + '_2'} className="rct9k-drag-to-create-popup-hint-div">
            {DRAG_TO_CREATE_POPUP_LABEL_2}
          </div>
          <div data-testid={testids.dragToCreatePopupLabel + '_3'} className="rct9k-drag-to-create-popup-hint-div">
            To <b>cancel</b> you can also click on gantt
          </div>
        </div>
      </Popup>
    );
  }

  /**
   * @returns { JSX.Element }
   */
  renderContextMenu() {
    const actionParam = {
      selection: this._selectionHolder ? this._selectionHolder.state.selectedItems : [],
      row: this.state.openedContextMenuRow,
      time: this.state.openedContextMenuTime
    };
    let actions = this.props.onContextMenuShow ? this.props.onContextMenuShow({actionParam}) : [];
    if (this.props.onDragToCreateEnded && this.props.forceDragToCreateMode == undefined) {
      // If the user doesn't forces the enter/exit from dragToCreateMode =>
      // a default mechanism is implemented via an action that enters the drag to create mode
      let that = this;
      actions.push({
        label: DRAG_TO_CREATE_ACTION_LABEL,
        run: param => {
          that.setDragToCreateMode(true);
          param.closeContextMenu();
        }
      });
    }

    return (
      <ContextMenu
        paramsForAction={actionParam}
        positionToOpen={actions.length > 0 ? this.state.openedContextMenuCoordinates : undefined}
        actions={actions}
      />
    );
  }

  renderGanttPart({bodyHeight, timebarHeight}) {
    const {
      showCursorTime,
      timebarFormat,
      componentId,
      shallowUpdateCheck,
      forceRedrawFunc,
      bottomResolution,
      topResolution,
      backgroundLayer
    } = this.props;
    let that = this;

    let varTimebarProps = {};
    if (timebarFormat) varTimebarProps['timeFormats'] = timebarFormat;
    if (bottomResolution) varTimebarProps['bottom_resolution'] = bottomResolution;
    if (topResolution) varTimebarProps['top_resolution'] = topResolution;

    const divCssClass = `rct9k-timeline-div rct9k-id-${componentId}`;

    // Markers (only current time marker atm)
    const markers = [];
    if (showCursorTime && this.mouse_snapped_time) {
      const cursorPix = getPixelAtTime(
        this.mouse_snapped_time,
        this.getStartDate(),
        this.getEndDate(),
        this.getTimelineWidth()
      );
      markers.push({
        left: cursorPix,
        key: 1
      });
    }

    return (
      <div style={{flex: 1, overflow: 'hidden'}}>
        <Measure
          bounds
          onResize={contentRect => {
            this.setState({gridWidth: contentRect.bounds ? contentRect.bounds.width : 0});
            this.refreshGrid();
          }}>
          {({measureRef}) => {
            return (
              <div ref={measureRef} className={divCssClass}>
                <div
                  className="parent-div"
                  onMouseDown={this.mouseDownFunc}
                  onMouseMove={this.mouseMoveFunc}
                  onMouseUp={this.mouseUpFunc}
                  onContextMenu={e => {
                    if (this._selectBox.isStart()) {
                      // on right click if drag in progress cancel it
                      e.preventDefault();
                      this.setState({dragCancel: true});
                      this._selectBox.end();
                    }
                  }}>
                  <SelectBox
                    ref={this.select_ref_callback}
                    className={this.getDragToCreateMode() ? 'rct9k-selector-outer-add' : ''}
                  />
                  <Timebar
                    cursorTime={this.getCursor()}
                    start={this.getStartDate()}
                    end={this.getEndDate()}
                    width={this.state.gridWidth}
                    leftOffset={0}
                    selectedRanges={this.state.selection}
                    setVerticalGridLines={this.setVerticalGridLines}
                    {...varTimebarProps}
                  />
                  {markers.map(m => (
                    <Marker
                      key={m.key}
                      height={this.state.screenHeight}
                      top={0}
                      date={0}
                      shouldUpdate={true}
                      calculateHorizontalPosition={() => {
                        return {left: m.left};
                      }}
                      className="rct9k-marker-overlay"
                    />
                  ))}
                  <TimelineBody
                    width={this.state.gridWidth}
                    columnWidth={() => this.state.gridWidth}
                    height={bodyHeight}
                    rowHeight={this.rowHeight}
                    rowCount={this.state.groups.length}
                    columnCount={1}
                    cellRenderer={this.cellRenderer(this.getTimelineWidth(this.state.gridWidth))}
                    grid_ref_callback={this.grid_ref_callback}
                    shallowUpdateCheck={shallowUpdateCheck}
                    forceRedrawFunc={forceRedrawFunc}
                    onScroll={this.handleScrollGantt}
                  />
                  {this.renderContextMenu()}
                  {backgroundLayer &&
                    React.cloneElement(backgroundLayer, {
                      startDateTimeline: this.getStartDate(),
                      endDateTimeline: this.getEndDate(),
                      width: this.state.gridWidth,
                      leftOffset: 0,
                      height: bodyHeight,
                      topOffset: timebarHeight,
                      verticalGridLines: this.state.verticalGridLines
                    })}
                  <div className="rct9k-menu-div">{this.renderMenuButton()}</div>
                </div>
              </div>
            );
          }}
        </Measure>
      </div>
    );
  }

  render() {
    const {componentId} = this.props;
    /**
     * @returns { number } height of the timebar
     */
    function getTimebarHeight() {
      if (typeof window === 'undefined') {
        return 0;
      }
      // when this function is called for the first time, the timebar is not yet rendered
      let timebar = document.querySelector(`.rct9k-id-${componentId} .rct9k-timebar`);
      if (!timebar) {
        return 0;
      }
      // substract timebar height from total height
      return timebar.getBoundingClientRect().height;
    }

    /**
     * @param { number } height (total height of the timeline)
     * @returns { number } height of the timeline w/o timebar
     */
    function calculateHeight(height) {
      if (typeof window === 'undefined' || height === undefined) {
        return 0;
      }

      return Math.max(height - getTimebarHeight(), 0);
    }

    {
      /* Instead of <Measure .../>, in the past <AutoSizer ... /> was used. However it would round with/height, which generated and endless
    scrollbar appear/disappear, depending on the parent, depending on the resolution. */
    }
    return (
      // Can not use empty <> instead of <Fragment> because it fails the documentation generation
      <Fragment>
        <TestsAreDemoCheat objectToPublish={this} />
        <SelectionHolder
          selectionChangedHandler={this.selectionChangedHandler}
          ref={this.selectionHolder_ref_callback}
          selectedItems={this.props.selectedItems}
        />
        {this._table && <TestsAreDemoCheat objectToPublish={this._table} />}
        {
          // Instead of <Measure .../>, in the past <AutoSizer ... /> was used. However it would round with/height, which generated and endless
          // scrollbar appear/disappear, depending on the parent, depending on the resolution.
        }
        <Measure
          bounds
          onResize={contentRect => {
            const dimensions = {
              width: contentRect.bounds ? contentRect.bounds.width : 0,
              height: contentRect.bounds ? contentRect.bounds.height : 0
            };
            this.setState({screenHeight: dimensions.height});
            this.refreshGrid(dimensions);
          }}>
          {({measureRef}) => {
            const bodyHeight = calculateHeight(this.state.screenHeight);
            const timebarHeight = getTimebarHeight();
            return (
              <div ref={measureRef} style={{display: 'flex', flexDirection: 'row', flex: 1, height: '100%'}}>
                {this.props.table ? (
                  <SplitPane
                    split="vertical"
                    style={{height: this.state.screenHeight}}
                    defaultSize={this.props.table ? this.getInitialTableWidth() : 0}
                    onChange={this.handleDrag}
                    ref={this.splitPane_ref_callback}>
                    <TableWithStyle
                      table={React.cloneElement(this.props.table, {
                        rowsCount: this.state.groups.length,
                        rowHeightGetter: this.tableRowHeight,
                        rowHeight: this.props.itemHeight,
                        ref: this.table_ref_callback,
                        touchScrollEnabled: true,
                        onVerticalScroll: this.handleScrollTable,
                        scrollTop: this.state.scrollTop,
                        headerHeight: timebarHeight,
                        height: this.state.screenHeight,
                        width: this.state.tableWidth,
                        rowClassNameGetter: rowIndex =>
                          this.props.rowClassName +
                          ' ' +
                          (rowIndex % 2 == 0 ? this.props.rowOddClassName : this.props.rowEvenClassName)
                      })}
                    />
                    {this.renderGanttPart({bodyHeight, timebarHeight})}
                  </SplitPane>
                ) : (
                  this.renderGanttPart({bodyHeight, timebarHeight})
                )}
              </div>
            );
          }}
        </Measure>
      </Fragment>
    );
  }

  selectionChangedHandler(selectedItems) {
    // This is because the selectedItems are not kept in the state of the gantt but in the selection component
    this._grid.forceUpdate();
    this.props.onSelectionChange(selectedItems);
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  ////// Test functions
  ////////////////////////////////////////////////////////////////////////////////////////

  setCursorTime(x) {
    const leftOffset = PARENT_ELEMENT(this.props.componentId).getBoundingClientRect().left;
    const cursorTime = getTimeAtPixel(
      x - leftOffset,
      this.getStartDate(),
      this.getEndDate(),
      this.getTimelineWidth(),
      this.getTimelineSnap()
    );
    this.mouse_snapped_time = cursorTime;
    this.setState({cursorTime});
  }

  dragStart(element, offsetX) {
    const {x, y} = element.getBoundingClientRect();
    this.onDragStartSelect(offsetX + x, y);
    this.setCursorTime(offsetX + x);
  }

  async dragMove(x, y, delta = 10) {
    let deltaX;
    for (let i = 0; i < x; i += delta) {
      deltaX = Math.min(i + delta, x);
      await new Promise(resolve => setTimeout(resolve, delta));
      this.onDragMoveSelect(this._selectBox.startX + deltaX, this._selectBox.startY + y);
      this.setCursorTime(this._selectBox.startX + deltaX);
    }
  }

  dragEnd(event = {}) {
    this.onDragEndSelect(event);
  }

  rightClick() {
    if (this._selectBox.isStart()) {
      this.setState({dragCancel: true});
      this._selectBox.end();
      this.dragEnd();
    }
  }
}
