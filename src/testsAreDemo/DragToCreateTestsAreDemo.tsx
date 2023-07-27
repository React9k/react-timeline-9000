import { render, Scenario, tad } from "@famiprog-foundation/tests-are-demo";
import { contextMenuTestIds } from "../components/ContextMenu/ContextMenu";
import { Main } from "../stories/dragToCreate/DragToCreate.stories";
import Timeline, { DRAG_TO_CREATE_ACTION_LABEL, DRAG_TO_CREATE_POPUP_CLOSE_TIME, DRAG_TO_CREATE_POPUP_LABEL_2, timelineTestids } from "../timeline";

export class DragToCreateTestsAreDemo {

    async before() {
        render(<Main />);
    }

    @Scenario("WHEN click on the menu button, THEN the menu opens with a 'Drag To Create' menu entry")
    async whenClickMenuButton() {
        tad.cc("Click on the menu button");
        await tad.userEventWaitable.click(tad.screenCapturing.getByTestId(timelineTestids.menuButton));
        tad.cc("Check if the context menu is open");
        await tad.assertWaitable.exists(tad.screenCapturing.getByTestId(contextMenuTestIds.popup));

        tad.cc("Check if exist the 'Drag To Create' action");
        await tad.assertWaitable.equal(tad.screenCapturing.getByTestId(contextMenuTestIds.menuItem + "_0").textContent, DRAG_TO_CREATE_ACTION_LABEL);
        tad.getObjectViaCheat(Timeline).setState({ openedContextMenuCoordinates: undefined });
    }

    @Scenario("WHEN click on the 'Drag To Create' menu entry, THEN the Gantt goes into the 'drag to create mode' and the drag to create popup appears")
    async whenClickAddMenuEntry() {
        // GIVEN context menu is opened by pressing the hamburger button
        await tad.userEventWaitable.click(tad.screenCapturing.getByTestId(timelineTestids.menuButton));
        
        // WHEN
        tad.cc("Click 'Drag To Create' menu entry");
        await tad.userEventWaitable.click(tad.screenCapturing.getByTestId(contextMenuTestIds.menuItem + "_0"));

	    // THEN
        await tad.assertWaitable.isTrue(tad.getObjectViaCheat(Timeline).state.dragToCreateMode, "Drag to create mode should be active");
	
	    const popup = tad.screenCapturing.getByTestId(timelineTestids.dragToCreatePopup);
        tad.cc("Check if drag to create popup exists");
        await tad.assertWaitable.exists(popup);
        
        // Check the labels
        await tad.assertWaitable.equal(tad.withinCapturing(popup).getByTestId(timelineTestids.dragToCreatePopupLabel + "_1").innerHTML, "<b>Click and drag</b> to create a new segment");
        await tad.assertWaitable.equal(tad.withinCapturing(popup).getByTestId(timelineTestids.dragToCreatePopupLabel + "_2").textContent, DRAG_TO_CREATE_POPUP_LABEL_2);
        await tad.assertWaitable.equal(tad.withinCapturing(popup).getByTestId(timelineTestids.dragToCreatePopupLabel + "_3").innerHTML, "To <b>cancel</b> you can also click on gantt");
        const cancelButton = tad.withinCapturing(popup).getByTestId(timelineTestids.dragToCreatePopupCancelButton);
        tad.cc("Check if exists 'Cancel' button");
        await tad.assertWaitable.exists(cancelButton);
        tad.cc("Check if the cancel button is negative");
        await tad.assertWaitable.include(cancelButton.className, "negative");

        // Test auto closing of the popup
        tad.demoForEndUserHide();

        // AND the popup closes after DRAG_TO_CREATE_POPUP_CLOSE_TIME 
        // I tried to test also from time to time that the popup is opened but the setTimeout(time) 
        // doesn't ensure that exacly `time` has passed, it could have passed a little bit more (and that little bit cause
        // inexact test for when the popup is still opened)
        await new Promise(resolve => setTimeout(resolve, DRAG_TO_CREATE_POPUP_CLOSE_TIME));
        await tad.assertWaitable.notExists(tad.screenCapturing.queryByTestId(timelineTestids.dragToCreatePopup));
        
        // AND still in drag to create mode
        await tad.assertWaitable.isTrue(tad.getObjectViaCheat(Timeline).state.dragToCreateMode);
        tad.demoForEndUserShow();

        tad.getObjectViaCheat(Timeline).setState({ openedContextMenuCoordinates: undefined });
        tad.getObjectViaCheat(Timeline).setState({ dragToCreateMode: false });
    }

    @Scenario("GIVEN drag to create mode, WHEN click on cancel, THEN mode is cancelled")
    async givenDragToCreateModeWhenClickCancel() {
        // GIVEN context menu was opened and 'Drag To Create' was pressed
        await tad.userEventWaitable.click(tad.screenCapturing.getByTestId(timelineTestids.menuButton));
        tad.cc("Click 'Drag To Create' menu entry");
        await tad.userEventWaitable.click(tad.screenCapturing.getByTestId(contextMenuTestIds.menuItem + "_0"));

	    // WHEN
        tad.cc("Click on `Cancel 'drag to create' mode` button from the drag to create popup");
        await tad.userEventWaitable.click(tad.screenCapturing.getByTestId(timelineTestids.dragToCreatePopupCancelButton));
        
        // THEN
        await tad.assertWaitable.isFalse(tad.getObjectViaCheat(Timeline).state.dragToCreateMode, "Check if the drag to create mode is cancelled");
       
        tad.getObjectViaCheat(Timeline).setState({ openedContextMenuCoordinates: undefined });
        tad.getObjectViaCheat(Timeline).setState({ dragToCreateMode: false });
    }

    @Scenario("GIVEN drag to create mode, WHEN click and drag, THEN a green selection rectangle appears")
    async givenDragToCreateModeWhenClickAndDrag() {
        tad.getObjectViaCheat(Timeline).setState({ dragToCreateMode: true });

        await startDragKeepInProgress(3, 100);
        const selector = tad.screenCapturing.getByTestId(timelineTestids.selector);
        const { height } = selector.getBoundingClientRect();
        tad.cc("A green selection rectangle appears on the row");
        await tad.assertWaitable.exists(selector);
        let row = tad.screenCapturing.getByTestId(timelineTestids.row + "_4");
        await tad.showSpotlight({ message: "On drag to create mode in progress, when we move the mouse to the other row, selection rectangle stays only on the starting row, the mouse position is on the next row", focusOnLastElementCaptured: true });
        await tad.getObjectViaCheat(Timeline).dragMove(0, height);
        tad.cc("The height of the section regtagle isn't changed");
        await tad.assertWaitable.equal(tad.screenCapturing.getByTestId(timelineTestids.selector).getBoundingClientRect().height, height);
        row = tad.screenCapturing.getByTestId(timelineTestids.row + "_2");
        await tad.showSpotlight({ message: "Move the mouse on previous row", focusOnLastElementCaptured: true });
        await tad.getObjectViaCheat(Timeline).dragMove(0, -2 * height);
        tad.cc("The height of the section regtagle isn't changed");
        await tad.assertWaitable.equal(tad.screenCapturing.getByTestId(timelineTestids.selector).getBoundingClientRect().height, height);

        tad.getObjectViaCheat(Timeline)._selectBox.end();
        tad.getObjectViaCheat(Timeline).setState({ dragToCreateMode: false });
    }

    @Scenario("GIVEN drag to create in progress, WHEN right click, THEN cancel")
    async givenDragToCreateModeInProgressWhenRightClick() {
        tad.getObjectViaCheat(Timeline).setState({ dragToCreateMode: true });

        let row = tad.screenCapturing.getByTestId(timelineTestids.row + "_3");
        tad.cc("The row don't have the segments");
        await tad.assertWaitable.equal(row.children.length, 0);
        await startDragKeepInProgress(3, 100);
        row = tad.screenCapturing.getByTestId(timelineTestids.row + "_3");
        await tad.showSpotlight({ message: "We perform the right click", focusOnLastElementCaptured: true });
        tad.getObjectViaCheat(Timeline).rightClick();
        row = tad.screenCapturing.getByTestId(timelineTestids.row + "_3");
        tad.cc("The segment wasn't created, the row don't have the segments");
        await tad.assertWaitable.equal(row.children.length, 0);

        tad.getObjectViaCheat(Timeline).setState({ dragToCreateMode: false });
    }

    @Scenario("GIVEN drag to create in progress, WHEN mouse up, THEN handler is called")
    async givenDragToCreateModeInProgressWhenMouseUp() {
        tad.getObjectViaCheat(Timeline).setState({ dragToCreateMode: true });

        await startDragKeepInProgress(3, 100);
        tad.screenCapturing.getByTestId(timelineTestids.row + "_3");
        await tad.showSpotlight({ message: "We perform the mouse up", focusOnLastElementCaptured: true });
        tad.getObjectViaCheat(Timeline).dragEnd();
        tad.cc("The segment was created");
        await tad.assertWaitable.exists(tad.screenCapturing.getByTestId(timelineTestids.item + "_11"));

        tad.getObjectViaCheat(Timeline).setState({ dragToCreateMode: false });
    }
}

async function startDragKeepInProgress(rowNumber: number, x: number, xOffset: number = 10) {
    // we need to get the row after each showSpotlight because on click next step the lastElementCaptured was lost
    let row = tad.screenCapturing.getByTestId(timelineTestids.row + "_" + rowNumber);
    await tad.showSpotlight({ message: "We perform click for start the drag", focusOnLastElementCaptured: true });
    tad.getObjectViaCheat(Timeline).dragStart(row, xOffset);
    row = tad.screenCapturing.getByTestId(timelineTestids.row + "_" + rowNumber);
    await tad.showSpotlight({ message: "We perform mouse move with " + x + "px on X axis", focusOnLastElementCaptured: true });
    await tad.getObjectViaCheat(Timeline).dragMove(x, 0);
}
