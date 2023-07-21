export const contextMenuScenarios = {
    whenRightClickThenContextMenu: 'WHEN right click on gantt, THEN a context menu is shown containing actions (each having a label and an icon)',
    whenClickActionThenRunAndCloseMenu: 'WHEN click an action, THEN a specific action is run and the context menu is closed',
    propertyOnContextMenuShow: 'PROPERTY onContextMenuShow',
    propertyDontCloseContextMenuAfterRunAutomatically: 'PROPERTY IActionParamForRun.dontCloseContextMenuAfterRunAutomatically'
};

export const selectionScenarios = {
    whenClickOrDragToSelectThenItemsSelected: "WHEN click or drag to select THEN items are selected/deselected",
    propertyOnSelectionChange: "PROPERTY onSelectionChange",
    propertySelectedItems: "PROPERTY selectedItems"
}