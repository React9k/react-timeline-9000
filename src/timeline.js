'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Measure from 'react-measure';

import moment from 'moment';
import interact from 'interactjs';
import _ from 'lodash';
import {Column, Group, InteractOption, Item, RowLayer} from './index';

import {pixToInt, intToPix} from './utils/commonUtils';
import {
  adjustRowTopPositionToViewport,
  rowItemsRenderer,
  rowLayerRenderer,
  getNearestRowNumber,
  getNearestRowObject,
  getMaxOverlappingItems,
  getTrueBottom,
  getVerticalMarginBorder,
  getRowObjectRowNumber
} from './utils/itemUtils';
import {
  timeSnap,
  getTimeAtPixel,
  getPixelAtTime,
  getSnapPixelFromDelta,
  pixelsPerMillisecond,
  convertDateToMoment,
  convertMomentToDateType
} from './utils/timeUtils';
import Timebar from './components/timebar';
import SelectBox from './components/selector';
import ItemRenderer from './components/ItemRenderer';
import {GroupRenderer} from './components/GroupRenderer';
import TimelineBody from './components/body';
import {Marker} from './components/Marker';

// startsWith polyfill for IE11 support
import 'core-js/fn/string/starts-with';

const SINGLE_COLUMN_LABEL_PROPERTY = 'title';
const EMPTY_GROUP_KEY = 'empty-group';

/**
 * Timeline class
 * @extends React.Component<Timeline.propTypes>
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
     * @type { Array.<number> }
     */
    selectedItems: PropTypes.arrayOf(PropTypes.number),

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
     * Single column mode: the width of the column.
     * Multiple columns mode: the default width of the columns (if column.width is not configured), which may be overridden on a per column basis.
     * @type { number }
     */
    groupOffset: PropTypes.number.isRequired,

    /**
     * The columns that will be rendered using data from groups.
     * @type { Array.<Column> }
     */
    tableColumns: PropTypes.arrayOf(
      PropTypes.shape({
        /**
         * The default renderer for a cell is props.groupRenderer that renders labelProperty from group.
         * The renderer for a column can be overriden using cellRenderer. cellRenderer can be a React element
         * or a function or a class component that generates a React element.
         */
        labelProperty: PropTypes.string,
        cellRenderer: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
        // The default renderer for a header is props.groupTitleRenderer that renders headerLabel.
        // The renderer for a header column can be overriden using headerRenderer. headerRenderer can be a React element
        // or a function or a class component that generates a React element.
        headerLabel: PropTypes.string,
        headerRenderer: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),

        /**
         * Width of the column in px.
         */
        width: PropTypes.number
      })
    ),

    /**
     * Single column mode: the renderer of a cell.
     * Multiple columns mode: the default renderer of a cell, which may be overridden on a per column basis.
     * @type { Function }
     */
    groupRenderer: PropTypes.func,

    /**
     * Single column mode: the renderer of the header cell.
     * Multiple columns mode: the default renderer of a header cell, which may be overridden on a per column basis.
     * @type { Function }
     */
    groupTitleRenderer: PropTypes.func,

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
    onItemContext: PropTypes.func,

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
    onRowContext: PropTypes.func,

    /**
     * @type { Function }
     */
    onRowDoubleClick: PropTypes.func,

    /**
     * @type { Function }
     */
    onGroupRowClick: PropTypes.func,

    /**
     * @type { Function }
     */
    onGroupRowDoubleClick: PropTypes.func,

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
    backgroundLayer: PropTypes.object
  };

  static defaultProps = {
    rowLayers: [],
    groupOffset: 150,
    itemHeight: 40,
    snapMinutes: 15,
    cursorTimeFormat: 'D MMM YYYY HH:mm',
    componentId: 'r9k1',
    showCursorTime: true,
    groupRenderer: GroupRenderer,
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
    // in rtl9k:
    // useMoment: true,
    useMoment: false,
    tableColumns: [],
    selectedItems: [],
    snap: undefined,
    groupTitleRenderer: undefined,
    timebarFormat: undefined,
    bottomResolution: undefined,
    topResolution: undefined,
    onItemClick() {},
    onItemDoubleClick() {},
    onItemContext() {},
    onRowClick() {},
    onRowContext() {},
    onRowDoubleClick() {},
    onGroupRowClick() {},
    onGroupRowDoubleClick() {},
    onInteraction() {},
    itemRendererDefaultProps: {},
    backgroundLayer: null
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

  constructor(props) {
    super(props);
    this.selecting = false;
    this.state = {
      selection: [],
      cursorTime: null,
      groups: this.props.groups,
      verticalGridLines: [],
      width: 0,
      height: 0
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
    this.setTimeMap = this.setTimeMap.bind(this);
    this.getItem = this.getItem.bind(this);
    this.changeGroup = this.changeGroup.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
    this.getTimelineWidth = this.getTimelineWidth.bind(this);
    this.itemFromElement = this.itemFromElement.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.grid_ref_callback = this.grid_ref_callback.bind(this);
    this.select_ref_callback = this.select_ref_callback.bind(this);
    this.throttledMouseMoveFunc = _.throttle(this.throttledMouseMoveFunc.bind(this), 20);
    this.mouseMoveFunc = this.mouseMoveFunc.bind(this);
    this.getCursor = this.getCursor.bind(this);
    this.setVerticalGridLines = this.setVerticalGridLines.bind(this);

    const canSelect = Timeline.isBitSet(Timeline.TIMELINE_MODES.SELECT, this.props.timelineMode);
    const canDrag = Timeline.isBitSet(Timeline.TIMELINE_MODES.DRAG, this.props.timelineMode);
    const canResize = Timeline.isBitSet(Timeline.TIMELINE_MODES.RESIZE, this.props.timelineMode);
    this.setUpDragging(canSelect, canDrag, canResize);
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
  }

  componentWillReceiveProps(nextProps) {
    this.setTimeMap(
      nextProps.items,
      convertDateToMoment(nextProps.startDate, nextProps.useMoment),
      convertDateToMoment(nextProps.endDate, nextProps.useMoment),
      nextProps.useMoment
    );
    this.fillInTimelineWithEmptyRows(nextProps.groups);
    // @TODO
    // investigate if we need this, only added to refresh the grid
    // when double click -> add an item
    this.refreshGrid();
  }

  componentWillUnmount() {
    if (this._itemInteractable) this._itemInteractable.unset();
    if (this._selectRectangleInteractable) this._selectRectangleInteractable.unset();

    window.removeEventListener('resize', this.updateDimensions);
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
  }

  /**
   * Start of the displayed interval (as moment object).
   *
   * @return {moment}
   */
  getStartDate() {
    return convertDateToMoment(this.props.startDate, this.props.useMoment);
  }

  /**
   * End of the displayed interval (as moment object).
   *
   * @return {moment}
   */
  getEndDate() {
    return convertDateToMoment(this.props.endDate, this.props.useMoment);
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
    if (totalWidth !== undefined) return totalWidth - this.calculateLeftOffset();
    return this._grid.props.width - this.calculateLeftOffset();
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
    this._grid.recomputeGridSize(config);
    // fill in timeline with empty rows only on resize
    if (!_.isEmpty(config)) {
      this.fillInTimelineWithEmptyRows(this.state.groups);
    }
  };

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
            this.props.onInteraction(Timeline.changeTypes.dragStart, null, this.props.selectedItems);

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
            this.props.onInteraction(Timeline.changeTypes.resizeStart, null, this.props.selectedItems);
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
          const nearestRowObject = getNearestRowObject(e.clientX, e.clientY);

          // this._selectBox.start(e.clientX, e.clientY);
          // this._selectBox.start(e.clientX, topRowObj.style.top);
          const startY = adjustRowTopPositionToViewport(nearestRowObject, nearestRowObject.getBoundingClientRect().y);
          this._selectBox.start(e.clientX, startY);
          // const bottomRow = Number(getNearestRowNumber(left + width, top + height));
        })
        .on('dragmove', e => {
          const magicalConstant = 2;
          // @bendog: I added this magical constant to solve the issue of selection bleed,
          // I don't understand why it works, but if frequentist statisticians can use imaginary numbers, so can i.
          const {startX, startY} = this._selectBox;
          const startRowObject = getNearestRowObject(startX, startY);
          const {clientX, clientY} = e;
          const currentRowObject = getNearestRowObject(clientX, clientY);
          if (currentRowObject !== undefined && startRowObject !== undefined) {
            // only run if you can detect the top row
            const startRowNumber = getRowObjectRowNumber(startRowObject);
            const currentRowNumber = getRowObjectRowNumber(currentRowObject);
            // const numRows = 1 + Math.abs(startRowNumber - currentRowNumber);
            const rowMarginBorder = getVerticalMarginBorder(currentRowObject);
            if (startRowNumber <= currentRowNumber) {
              // select box for selection going down
              // get the first selected rows top
              let startTop = Math.ceil(startRowObject.getBoundingClientRect().top + rowMarginBorder);
              startTop = adjustRowTopPositionToViewport(startRowObject, startTop);
              // get the currently selected rows bottom
              const currentBottom = Math.floor(getTrueBottom(currentRowObject) - magicalConstant - rowMarginBorder);
              this._selectBox.start(startX, startTop);
              this._selectBox.move(clientX, currentBottom);
            } else {
              // select box for selection going up
              // get the currently selected rows top
              const currentTop = Math.ceil(currentRowObject.getBoundingClientRect().top + rowMarginBorder);
              // get the first selected rows bottom
              const startBottom = Math.floor(getTrueBottom(startRowObject) - magicalConstant - rowMarginBorder * 2);
              // the bottom will bleed south unless you counter the margins and boreders from the above rows
              this._selectBox.start(startX, startBottom);
              this._selectBox.move(clientX, currentTop);
            }
          }
        })
        .on('dragend', e => {
          let {top, left, width, height} = this._selectBox.end();
          //Get the start and end row of the selection rectangle
          const topRowObject = getNearestRowObject(left, top);
          if (topRowObject !== undefined) {
            // only confirm the end of a drag if the selection box is valid
            const topRowNumber = Number(getNearestRowNumber(left, top));
            const topRowLoc = topRowObject.getBoundingClientRect();
            const rowMarginBorder = getVerticalMarginBorder(topRowObject);
            const y = Math.floor(topRowLoc.top - rowMarginBorder) + Math.floor(height - rowMarginBorder);
            const bottomRow = Number(
              getNearestRowNumber(left + width, adjustRowTopPositionToViewport(topRowObject, y))
            );
            //Get the start and end time of the selection rectangle
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
            //Get items in these ranges
            let selectedItems = [];
            for (let r = Math.min(topRowNumber, bottomRow); r <= Math.max(topRowNumber, bottomRow); r++) {
              selectedItems.push(
                ..._.filter(this.rowItemMap[r], i => {
                  return this.getStartFromItem(i).isBefore(endTime) && this.getEndFromItem(i).isAfter(startTime);
                })
              );
            }
            this.props.onInteraction && this.props.onInteraction(Timeline.changeTypes.itemsSelected, selectedItems);
          }
        });
    }
  }

  _handleItemRowEvent = (e, itemCallback, rowCallback) => {
    e.preventDefault();
    // Skip click handler if selecting with selection box
    if (this.selecting) {
      return;
    }
    if (e.target.hasAttribute('data-item-index') || e.target.parentElement.hasAttribute('data-item-index')) {
      let itemKey = e.target.getAttribute('data-item-index') || e.target.parentElement.getAttribute('data-item-index');
      itemCallback && itemCallback(e, Number(itemKey));
    } else {
      let row = e.target.getAttribute('data-row-index');
      let clickedTime = getTimeAtPixel(
        e.clientX - this.calculateLeftOffset(),
        this.getStartDate(),
        this.getEndDate(),
        this.getTimelineWidth()
      );

      //const roundedStartMinutes = Math.round(clickedTime.minute() / this.props.snap) * this.props.snap; // I dont know what this does
      let snappedClickedTime = timeSnap(clickedTime, this.getTimelineSnap() * 60);
      rowCallback && rowCallback(e, row, clickedTime, snappedClickedTime);
    }
  };

  /**
   * @param {number} width container width (in px)
   */
  cellRenderer(width) {
    /**
     * @param  {} columnIndex Always 1
     * @param  {} key Unique key within array of cells
     * @param  {} parent Reference to the parent Grid (instance)
     * @param  {} rowIndex Vertical (row) index of cell
     * @param  {} style Style object to be applied to cell (to position it);
     */
    const {timelineMode, onItemHover, onItemLeave} = this.props;
    const canSelect = Timeline.isBitSet(Timeline.TIMELINE_MODES.SELECT, timelineMode);
    return ({columnIndex, key, parent, rowIndex, style}) => {
      // the items column is the last column in the grid; itemCol is the index of this column
      let itemCol = this.props.tableColumns && this.props.tableColumns.length > 0 ? this.props.tableColumns.length : 1;
      if (itemCol == columnIndex) {
        let itemsInRow = this.rowItemMap[rowIndex];
        // Previously, `rowLayers` constant was instatiated outside the arrow function. However, I have discovered that when
        // the rowLayers were updated, the `rowLayers` constant had the previous value,
        // but this.props.rowLayers has the new value.
        const layersInRow = this.props.rowLayers.filter(r => r.rowNumber === rowIndex);
        let rowHeight = this.props.itemHeight;
        if (this.rowHeightCache[rowIndex]) {
          rowHeight = rowHeight * this.rowHeightCache[rowIndex];
        }
        return (
          <div
            key={key}
            style={style}
            data-row-index={rowIndex}
            className="rct9k-row"
            onClick={e => this._handleItemRowEvent(e, Timeline.no_op, this.props.onRowClick)}
            onMouseDown={e => (this.selecting = false)}
            onMouseMove={e => (this.selecting = true)}
            onMouseOver={e => {
              this.selecting = false;
              return this._handleItemRowEvent(e, onItemHover, null);
            }}
            onMouseLeave={e => {
              this.selecting = false;
              return this._handleItemRowEvent(e, onItemLeave, null);
            }}
            onContextMenu={e =>
              this._handleItemRowEvent(e, this.props.onItemContextClick, this.props.onRowContextClick)
            }
            onDoubleClick={e => this._handleItemRowEvent(e, this.props.onItemDoubleClick, this.props.onRowDoubleClick)}>
            {rowItemsRenderer(
              itemsInRow,
              this.getStartDate(),
              this.getEndDate(),
              width,
              this.props.itemHeight,
              this.props.itemRenderer,
              canSelect ? this.props.selectedItems : [],
              this.props.itemRendererDefaultProps,
              this.getStartFromItem,
              this.getEndFromItem
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
      } else {
        // Single column mode: the renderer of the cell is props.groupRenderer
        // with default labelProperty: SINGLE_COLUMN_LABEL_PROPERTY(title).
        //
        // Multiple columns mode: default renderer - props.groupRenderer with column.labelProperty;
        // custom renderer: column.cellRenderer.
        let labelProperty = '';
        let ColumnRenderer = this.props.groupRenderer;
        if (this.props.tableColumns && this.props.tableColumns.length > 0) {
          const column = this.props.tableColumns[columnIndex];
          if (column.cellRenderer) {
            ColumnRenderer = column.cellRenderer;
          } else {
            labelProperty = column.labelProperty;
          }
        } else {
          labelProperty = SINGLE_COLUMN_LABEL_PROPERTY;
        }
        let group = _.find(this.state.groups, g => g.id == rowIndex);
        return (
          <div
            data-row-index={rowIndex}
            key={key}
            style={style}
            className="rct9k-group"
            onClick={e => this.props.onGroupRowClick(e, group)}
            onDoubleClick={e => this.props.onGroupRowDoubleClick(e, group)}>
            {React.isValidElement(ColumnRenderer) && ColumnRenderer}
            {!React.isValidElement(ColumnRenderer) && (
              <ColumnRenderer group={group} labelProperty={labelProperty} rowIndex={rowIndex} />
            )}
          </div>
        );
      }
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
   * Set the grid ref.
   * @param {Object} reactComponent Grid react element
   */
  grid_ref_callback(reactComponent) {
    this._grid = reactComponent;
    this._gridDomNode = ReactDOM.findDOMNode(this._grid);
  }

  /**
   * Set the select box ref.
   * @param {Object} reactComponent Selectbox react element
   */
  select_ref_callback(reactComponent) {
    this._selectBox = reactComponent;
  }

  /**
   * Event handler for onMouseMove.
   * Only calls back if a new snap time is reached
   */
  throttledMouseMoveFunc(e) {
    const {componentId} = this.props;
    const leftOffset = document.querySelector(`.rct9k-id-${componentId} .parent-div`).getBoundingClientRect().left;
    const cursorSnappedTime = getTimeAtPixel(
      e.clientX - this.calculateLeftOffset() - leftOffset,
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
  }

  /**
   * Calculates left offset of the timeline (group lists). If props.tableColumns is defined,
   * the left offset is the sum of the widths of all tableColumns; otherwise returns groupOffset.
   * @returns {number} left offset
   */
  calculateLeftOffset() {
    const {tableColumns, groupOffset} = this.props;
    if (!tableColumns || tableColumns.length == 0) {
      return groupOffset;
    }

    let totalOffset = 0;
    tableColumns.forEach(column => {
      totalOffset += column.width ? column.width : groupOffset;
    });
    return totalOffset;
  }

  /**
   * Setter for verticalGridLines (that will be passed to `BackgroundLayer`).
   * @param { object } verticalGridLines
   */
  setVerticalGridLines(verticalGridLines) {
    this.setState({verticalGridLines});
  }

  render() {
    const {
      onInteraction,
      groupOffset,
      showCursorTime,
      timebarFormat,
      componentId,
      groupTitleRenderer,
      shallowUpdateCheck,
      forceRedrawFunc,
      bottomResolution,
      topResolution,
      tableColumns,
      backgroundLayer
    } = this.props;
    let that = this;

    const divCssClass = `rct9k-timeline-div rct9k-id-${componentId}`;
    let varTimebarProps = {};
    if (timebarFormat) varTimebarProps['timeFormats'] = timebarFormat;
    if (bottomResolution) varTimebarProps['bottom_resolution'] = bottomResolution;
    if (topResolution) varTimebarProps['top_resolution'] = topResolution;

    /**
     * @param { Column } column
     * @returns { number } width of a column
     */
    function getColumnWidth(column) {
      return column.width ? column.width : groupOffset;
    }

    /**
     * @param { number } width
     * @returns { Function }
     */
    function columnWidth(width) {
      return ({index}) => {
        // The width of the first column when tableColumns is not defined is groupOffset.
        if (index == 0 && (!that.props.tableColumns || that.props.tableColumns.length == 0)) return groupOffset;

        // The width of the last column is width minus the left offset.
        // The left offset is groupOffset when tableColumns is not defined or
        // the sum of the widths of all tableColumns.
        let leftOffset = groupOffset;
        if (that.props.tableColumns && that.props.tableColumns.length > 0) {
          if (index < that.props.tableColumns.length) {
            return getColumnWidth(that.props.tableColumns[index]);
          } else {
            leftOffset = 0;
            that.props.tableColumns.forEach(column => {
              leftOffset += getColumnWidth(column);
            });
          }
        }
        return width - leftOffset;
      };
    }

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
        left: cursorPix + this.calculateLeftOffset(),
        key: 1
      });
    }
    return (
      // Instead of <Measure .../>, in the past <AutoSizer ... /> was used. However it would round with/height, which generated and endless
      // scrollbar appear/disappear, depending on the parent, depending on the resolution.
      <Measure
        bounds
        onResize={contentRect => {
          const config = {width: contentRect.bounds?.width || 0, height: contentRect.bounds?.height || 0};
          this.setState(config);
          this.refreshGrid(config);
        }}>
        {({measureRef}) => {
          const leftOffset = this.calculateLeftOffset();
          const bodyHeight = calculateHeight(this.state.height);
          const timebarHeight = getTimebarHeight();
          return (
            <div ref={measureRef} className={divCssClass}>
              <div className="parent-div" onMouseMove={this.mouseMoveFunc}>
                <SelectBox ref={this.select_ref_callback} />
                <Timebar
                  cursorTime={this.getCursor()}
                  start={this.getStartDate()}
                  end={this.getEndDate()}
                  width={this.state.width}
                  leftOffset={leftOffset}
                  selectedRanges={this.state.selection}
                  groupTitleRenderer={groupTitleRenderer}
                  tableColumns={tableColumns}
                  groupOffset={groupOffset}
                  setVerticalGridLines={this.setVerticalGridLines}
                  {...varTimebarProps}
                />
                {markers.map(m => (
                  <Marker
                    key={m.key}
                    height={this.state.height}
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
                  width={this.state.width}
                  columnWidth={columnWidth(this.state.width)}
                  height={bodyHeight}
                  rowHeight={this.rowHeight}
                  rowCount={this.state.groups.length}
                  columnCount={(tableColumns && tableColumns.length > 0 ? tableColumns.length : 1) + 1}
                  cellRenderer={this.cellRenderer(this.getTimelineWidth(this.state.width))}
                  grid_ref_callback={this.grid_ref_callback}
                  shallowUpdateCheck={shallowUpdateCheck}
                  forceRedrawFunc={forceRedrawFunc}
                />
                {backgroundLayer &&
                  React.cloneElement(backgroundLayer, {
                    startDateTimeline: this.getStartDate(),
                    endDateTimeline: this.getEndDate(),
                    width: this.state.width,
                    leftOffset: leftOffset,
                    height: bodyHeight,
                    topOffset: timebarHeight,
                    verticalGridLines: this.state.verticalGridLines
                  })}
              </div>
            </div>
          );
        }}
      </Measure>
    );
  }
}
