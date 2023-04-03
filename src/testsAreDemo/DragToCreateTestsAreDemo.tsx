import { render, Scenario, tad } from "@famiprog-foundation/tests-are-demo";
import { Main } from "../stories/dragToCreate/DragToCreate.stories";
import Timeline, { timelineTestids } from "../timeline";

export class DragToCreateTestsAreDemo {

    async before() {
        render(<Main />);
    }

    @Scenario("WHEN click on the menu button, THEN the menu opens")
    async whenClickMenuButton() {
        tad.cc("Click on the menu button");
        await tad.userEventWaitable.click(tad.screenCapturing.getByTestId(timelineTestids.menuButton));
        tad.cc("Check if the menu is open");
        await tad.assertWaitable.exists(tad.screenCapturing.getByTestId(timelineTestids.menu));
        tad.cc("Check if exist the 'Add (drag to create)' button");
        await tad.assertWaitable.equal(tad.screenCapturing.getByTestId(timelineTestids.dragToCreateButton).textContent, "Add (drag to create)");

        tad.getObjectViaCheat(Timeline).setState({ openMenu: false });
    }

    @Scenario("WHEN click on the 'Add (drag to create)' menu entry, THEN the Gantt goes into the 'drag to create mode'")
    async whenClickAddMenuEntry() {
        tad.getObjectViaCheat(Timeline).setState({ openMenu: true });

        let dragToCreateButton = tad.screenCapturing.getByTestId(timelineTestids.dragToCreateButton);
        tad.cc("Check if button is positive");
        await tad.assertWaitable.include(dragToCreateButton.className, "positive");
        tad.cc("Check if the content of button is 'Add (drag to create)'");
        await tad.assertWaitable.equal(dragToCreateButton.textContent, "Add (drag to create)");
        tad.cc("Click for drag to create mode")
        await tad.userEventWaitable.click(dragToCreateButton);

        const popup = tad.screenCapturing.getByTestId(timelineTestids.dragToCreatePopup);
        tad.cc("Check if is the drag to create mode");
        await tad.assertWaitable.exists(popup);
        tad.cc("Check if the mesage of popup is 'Drag to create mode'");
        await tad.assertWaitable.equal(popup.querySelector("div").querySelector("div").textContent, "Drag to create mode");
        const cancelButton = tad.screenCapturing.getByTestId(timelineTestids.dragToCreateCancelButton);
        tad.cc("Check if exista 'Cancel' button");
        await tad.assertWaitable.exists(cancelButton);
        tad.cc("Check if the cancel buton is negative");
        await tad.assertWaitable.include(cancelButton.className, "negative");

        tad.cc("Click on the menu button");
        await tad.userEventWaitable.click(tad.screenCapturing.getByTestId(timelineTestids.menuButton));
        dragToCreateButton = tad.screenCapturing.getByTestId(timelineTestids.dragToCreateButton);
        tad.cc("Check if exist the 'Cancel: Add (drag to create)' button");
        await tad.assertWaitable.equal(dragToCreateButton.textContent, "Cancel: Add (drag to create)");
        tad.cc("Check if button is negative");
        await tad.assertWaitable.include(dragToCreateButton.className, "negative");
        tad.cc("Check if button has the cancel icon");
        await tad.assertWaitable.equal(dragToCreateButton.querySelector("i").className, "cancel icon")

        tad.getObjectViaCheat(Timeline).setState({ openMenu: false, dragToCreateMode: false });
    }

    @Scenario("GIVEN drag to create mode, WHEN click on cancel (from the menu), THEN mode is cancelled")
    async givenDragToCreateModeWhenClickCancelFromMenu() {
        tad.getObjectViaCheat(Timeline).setState({ openMenu: true, dragToCreateMode: true });

        tad.cc("Click on `Cancel Add (drag to create)` button from menu entry for cancel the drag to create mode");
        await tad.userEventWaitable.click(tad.screenCapturing.getByTestId(timelineTestids.dragToCreateButton));
        await tad.assertWaitable.isFalse(tad.getObjectViaCheat(Timeline).state.dragToCreateMode, "Check if the drag to create mode is cancelled");
    }

    @Scenario("GIVEN drag to create mode, WHEN click on cancel (from the popup), THEN mode is cancelled")
    async givenDragToCreateModeWhenClickCancelFromPopup() {
        tad.getObjectViaCheat(Timeline).setState({ dragToCreateMode: true });

        tad.cc("Click on `Cancel` button from drag to create mode popup for cancel the drag to create mode");
        await tad.userEventWaitable.click(tad.screenCapturing.getByTestId(timelineTestids.dragToCreateCancelButton));
        await tad.assertWaitable.isFalse(tad.getObjectViaCheat(Timeline).state.dragToCreateMode, "Check if the drag to create mode is cancelled");
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
