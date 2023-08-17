import { Only, Scenario, ScenarioOptions, render, tad } from "@famiprog-foundation/tests-are-demo";
import { contextMenuTestIds } from "../components/ContextMenu/ContextMenu";
import { ContextMenu, addTaskActionIcon, addTaskActionLabel, addTaskNotPossibleAction, deleteActionIcon, deleteActionIconColor, deleteActionLabel, editActionLabel } from "../stories/contextMenuAndSelection/ContextMenuAndSelection.stories";
import { someHumanResources, someTasks } from "../stories/sampleData";
import Timeline, { PARENT_ELEMENT, timelineTestids as testids } from "../timeline";
import { getPixelAtTime, getTimeAtPixel } from "../utils/timeUtils";
import { rightClick } from "../utils/testUtils";

const CLICK_X =30;
export class ContextMenuTestsAreDemo {

    async before() {
        render(<ContextMenu />);
    }

    @Only()
    @Scenario("WHEN I right click on a row, THEN a context menu with one action opens")
    @ScenarioOptions({ linkWithNextScenario: true })
    async whenRightClickOnARow() {
        // WHEN right click on a row
        const firstRow = tad.screenCapturing.getByTestId(testids.row + "_0");
        const clickPosition = { clientX: Math.round(firstRow.getBoundingClientRect().x) + CLICK_X, clientY: Math.round(firstRow.getBoundingClientRect().y) + 20 };
        await tad.showSpotlight({ message: "I right click on a row", focusOnLastElementCaptured: true });
        rightClick(firstRow, clickPosition);

        // THEN CM is opened at the clicked position
        tad.demoForEndUserHide();
        const popup = tad.screenCapturing.getByTestId(contextMenuTestIds.popup);
        await tad.assertWaitable.exists(popup);
        await this.isPopupPositionedNearPoint(popup.getBoundingClientRect(), { x: clickPosition.clientX, y: clickPosition.clientY });
        tad.demoForEndUserShow();

        // AND it has an 'Add task' actions
        let menuEntry = tad.withinCapturing(popup).getByTestId(contextMenuTestIds.menuItem + "_0");
        tad.cc("The context menu contains an 'Add' action");
        await tad.assertWaitable.equal(menuEntry.textContent, addTaskActionLabel + someHumanResources[0].title);
        tad.demoForEndUserHideNext();
        await tad.assertWaitable.include(menuEntry.querySelector("i").className, addTaskActionIcon);
    }

    @Scenario("WHEN I click on an action, THEN the action is run (w/ or w/o closing the menu)")
    @ScenarioOptions({ linkWithNextScenario: true })
    async whenClickAnAction() {
        // WHEN I click on "Add"
        const popup = tad.screenCapturing.getByTestId(contextMenuTestIds.popup);
        await tad.userEventWaitable.click(tad.withinCapturing(popup).getByTestId(contextMenuTestIds.menuItem + "_0"));

        // THEN a new task is added
        let newSegment = tad.screenCapturing.getByTestId(testids.item + "_" + someTasks.length);
        await tad.assertWaitable.exists(newSegment);

        tad.demoForEndUserHide();
        // AND the CM is closed
        await tad.assertWaitable.notExists(tad.screenCapturing.queryByTestId(contextMenuTestIds.popup));

        // AND the new task is position correctly on x axes
        // Gantt works with times "snapped to grid" so the position for the new task should be snapped to grid 
        const timeline = tad.getObjectViaCheat(Timeline);
        const firstRow = tad.screenCapturing.getByTestId(testids.row + "_0");
        const ganttLeftOffset = timeline.calculateLeftOffset() + PARENT_ELEMENT(timeline.props.componentId).getBoundingClientRect().left;
        const clickedX = firstRow.getBoundingClientRect().x + CLICK_X;
        const clickedXInGantt = clickedX - ganttLeftOffset;
        const clickedTime = getTimeAtPixel(clickedXInGantt, timeline.getStartDate(), timeline.getEndDate(), timeline.getTimelineWidth(undefined), timeline.getTimelineSnap());
        const clickedXSnappedToGrid = getPixelAtTime(clickedTime, timeline.getStartDate(), timeline.getEndDate(), timeline.getTimelineWidth(undefined))
             + ganttLeftOffset;     
        await tad.assertWaitable.equal(Math.round(newSegment.getBoundingClientRect().x), Math.round(clickedXSnappedToGrid));
        
        // AND is correctly added to the clicked row
        await tad.assertWaitable.equal(newSegment.getBoundingClientRect().y, firstRow.getBoundingClientRect().y);
        tad.demoForEndUserShow();
    }

    @Scenario("WHEN I right click on a segment, THEN a context menu with 3 actions is shown")
    @ScenarioOptions({ linkWithNextScenario: true })
    async whenRightClickOnASegment() {
        const segment = tad.screenCapturing.getByTestId(testids.item + "_0");
        const segmentBoundingRect = segment.getBoundingClientRect();

        // WHEN right click on a segment
        await tad.showSpotlight({ message: "I right click on a segment", focusOnLastElementCaptured: true });
        rightClick(segment, { clientX: segmentBoundingRect.x + segmentBoundingRect.width / 2, clientY: segmentBoundingRect.y + segmentBoundingRect.height / 2 });
        
        // THEN the CM opens
        tad.demoForEndUserHideNext();
        const popup = tad.screenCapturing.getByTestId(contextMenuTestIds.popup);
        await tad.assertWaitable.exists(popup);

        // AND it has: 'Add', 'Edit' and 'Delete' actions
        tad.cc("The context menu contains an 'Add' action");
        await tad.assertWaitable.equal(tad.withinCapturing(popup).getByTestId(contextMenuTestIds.menuItem + "_0").textContent, addTaskActionLabel + someHumanResources[0].title);
        
        tad.cc("And an 'Edit' action");
        await tad.assertWaitable.equal(tad.withinCapturing(popup).getByTestId(contextMenuTestIds.menuItem + "_1").textContent, editActionLabel);
        
        tad.cc("And a 'Delete' action");
        let menuEntry = tad.withinCapturing(popup).getByTestId(contextMenuTestIds.menuItem + "_2");
        await tad.assertWaitable.equal(menuEntry.textContent, deleteActionLabel);
        tad.cc("With a custom red renderer");
        tad.demoForEndUserHideNext();
        await tad.assertWaitable.include(menuEntry.querySelector("i").className, deleteActionIcon);
        await tad.assertWaitable.include(menuEntry.querySelector("i").className, deleteActionIconColor);
    }

    @Scenario("WHEN I CTRL + right click on another segment, THEN a context menu with 2 actions is shown")
    @ScenarioOptions({ linkWithNextScenario: true })
    async whenCTRLRightClickOnAnotherSegment() {
        const segment = tad.screenCapturing.getByTestId(testids.item + "_3");
        const segmentBoundingRect = segment.getBoundingClientRect();
        await tad.showSpotlight({ message: "WHEN I CTRL + right click another segment", focusOnLastElementCaptured: true });
        rightClick(segment, { ctrlKey: true, clientX: segmentBoundingRect.x + segmentBoundingRect.width / 2, clientY: segmentBoundingRect.y + segmentBoundingRect.height / 2 });

        // THEN the CM opens
        tad.demoForEndUserHideNext();
        const popup = tad.screenCapturing.getByTestId(contextMenuTestIds.popup);
        await tad.assertWaitable.exists(popup);

        // AND it has: 'Add' and 'Delete' actions
        tad.cc("The context menu contains an 'Add' action");
        await tad.assertWaitable.equal(tad.withinCapturing(popup).getByTestId(contextMenuTestIds.menuItem + "_0").textContent, addTaskActionLabel + someHumanResources[1].title);
        
        tad.cc("And a 'Delete' action");
        await tad.assertWaitable.equal(tad.withinCapturing(popup).getByTestId(contextMenuTestIds.menuItem + "_1").textContent, deleteActionLabel);
    }

    @Scenario("WHEN I click the hamburger button, THEN the context menu is shown besides that button")
    async whenClickTheHamburgerButton() {
        // GIVEN I select one segment
        await tad.userEventWaitable.click(tad.screenCapturing.getByTestId(testids.item + "_1"));

        // WHEN
        const menuButton = tad.screenCapturing.getByTestId(testids.menuButton);
        tad.cc("Click on the menu button");
        await tad.userEventWaitable.click(menuButton);

        // THEN the context menu is opened and positioned near the center of the hamburger button");
        tad.demoForEndUserHide();
        const popup = tad.screenCapturing.getByTestId(contextMenuTestIds.popup);
        await tad.assertWaitable.exists(popup);
        const menuButtonCenter = { x: menuButton.getBoundingClientRect().x + menuButton.getBoundingClientRect().width / 2, y: menuButton.getBoundingClientRect().y + menuButton.getBoundingClientRect().height / 2 };
        await this.isPopupPositionedNearPoint(popup.getBoundingClientRect(), menuButtonCenter);
        tad.demoForEndUserShow();

        // AND it has: 'Add task: not possible', 'Edit' adn 'Delete' actions
        tad.cc("The context menu contains an 'Add task not possible' action");
        await tad.assertWaitable.equal(tad.withinCapturing(popup).getByTestId(contextMenuTestIds.menuItem + "_0").textContent, addTaskNotPossibleAction);
        tad.cc("And an 'Edit' action");
        await tad.assertWaitable.equal(tad.withinCapturing(popup).getByTestId(contextMenuTestIds.menuItem + "_1").textContent, editActionLabel);
        tad.cc("And a 'Delete' action");
        await tad.assertWaitable.equal(tad.withinCapturing(popup).getByTestId(contextMenuTestIds.menuItem + "_2").textContent, deleteActionLabel);

        // WHEN click 'Edit' (dontCloseContextMenuAfterRunAutomatically = true) THEN the CM doesn't close 
        // We putted this verification at the end of the tests, because else we needed to close the prompt for the next scenarios, and this was not trivial 
        tad.demoForEndUserHide();
        await tad.userEventWaitable.click(tad.withinCapturing(popup).getByTestId(contextMenuTestIds.menuItem + "_1"));
        await tad.assertWaitable.exists(tad.screenCapturing.getByTestId(contextMenuTestIds.popup));
        tad.demoForEndUserShow();
    }

    async isPopupPositionedNearPoint({ x: popupX, y: popupY, width: popupWidth, height: popupHeight }, { x, y }) {
        const popupEndX = Math.round(popupX + popupWidth);
        const popupEndY = Math.round(popupY + popupHeight);
        popupX = Math.floor(popupX);
        popupY = Math.round(popupY);

        // We didn't understood why it is a difference of some decimals (maximum 1 px) between the expected position and the actual position. 
        // These difference in decimals is not the same every time, is variable regarding the dimension of the window and the dpi of the screen
        // So the only thing in common is that the actual value is near the expected one at a maximum 1 px distance (below or above)
        await tad.assertWaitable.include([popupX - 1, popupX, popupX + 1, popupEndX - 1, popupEndX, popupEndX + 1], Math.round(x));
        // semantic ui popup is displayed 10 px below or 10 px above the mouse position
        await tad.assertWaitable.include([popupY - 11, popupY - 10, popupY - 9, popupEndY + 9, popupEndY + 10, popupEndY + 11], Math.round(y));
    }
}