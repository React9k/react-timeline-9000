/**
 * Types for the item renderer class
 */
export type ItemRendererProps = {
  /**
   * Item to render
   */
  item: any;
};

/**
 * Types for the group (row) renderer component
 */
export type GroupRendererProps = {
  /**
   * The key of the data from group that should be rendered
   */
  labelProperty?: string;
  /**
   * The index of this row
   */
  rowIndex?: number;
  /**
   * The group to be rendered
   */
  group: any;
};
