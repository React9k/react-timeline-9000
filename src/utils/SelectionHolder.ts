import React from "react";

interface SelectionHolderProps {
   
  /**
   * This property "dictates" the selection. 
   * I.e. if this property is set, the selection doesn't change anymore when user interaction happens. 
   */
  selectedItems: (number | string)[];

  /**
     * The host component should listen when the selection changes by passing this property
     * (e.g. of usecase: for updating the item renderers).
     */
  selectionChangedHandler : (selectedItems: (number | string)[]) => void;
}

interface SelectionHolderState {
  
  /**
   * If the host components needs access to the selected items it should use this
   */
  selectedItems: (number | string)[];
}

/**
 * This is a  helper non-vizual component meant to compute and hold the selection for other host components like: gantt, table, etc
 * The host component should call `addRemoveItems` and listen for selection change by setting `selectionChangedHandler`
 * 
 * @author Daniela Buzatu
 */
export class SelectionHolder extends React.Component<SelectionHolderProps, SelectionHolderState> {

  constructor(props) {
    super(props);
    this.state = {
      selectedItems: []
    };
  }

  componentDidUpdate(prevProps) {
    let selectedItems = this.props.selectedItems;
    const prevSelectedItems = prevProps.selectedItems;   
    if (selectedItems && !prevSelectedItems || !selectedItems && prevSelectedItems || selectedItems && prevSelectedItems && selectedItems.toString() !== prevSelectedItems.toString()) {
          selectedItems = this.props.selectedItems ? this.props.selectedItems : [];
          this.setState({selectedItems: selectedItems});
          // Notify the host component about selection change
          if (this.props.selectionChangedHandler) {
            this.props.selectionChangedHandler(selectedItems);
          }
    }
  }

  /**
   * Should be called by the host component when an item is clicked or right clicked (contextMenu event) or when user clicks outside any selectable items (for reseting the selection),
   * or when any other user action intended to select items happens
   * (e.g. in gantt: drawing selection rectangle)
   * It adds/removes from selection (in case of multiple selection) or set the selection (in case of single selection)
   * 
   * Usually the right click on the host component works just as a left click regarding the selection.  So the host component calls should be the same in both click cases 
   */
  addRemoveItems(itemsKeys: (number | string)[], event: MouseEvent) {
    if (this.props.selectedItems) {
      return;
    }

    if (event.type == "mousedown" && event.button == 2) {
      if (itemsKeys.length == 1 && this.state.selectedItems.includes(itemsKeys[0])) {
        // right click on a selected item => doesn't change the selection
        return;
      }
    }

    let newSelection;
    if (!(event.ctrlKey || event.shiftKey)) {
        // Single selection
        newSelection = [...itemsKeys];
    } else {
      // Multiple selection
      const oldSelection = this.state.selectedItems;
      newSelection = oldSelection.slice();
      itemsKeys.forEach(function(itemKey) {
        const idx = newSelection.indexOf(itemKey);
        if (idx > -1) {
          // already in selection => remove it
          newSelection.splice(idx, 1);
        } else {
          // not in selection => add it
          newSelection.push(itemKey);
        }
      });
    }
    this.setState( {selectedItems: newSelection});

    // Notify the host component about selection change
    if (this.props.selectionChangedHandler) {
      this.props.selectionChangedHandler(newSelection);
    }
  }

  render(): React.ReactNode {
    return null;
  }
}
