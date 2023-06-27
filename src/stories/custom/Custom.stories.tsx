import { ComponentStory } from "@storybook/react";
import { useEffect, useRef, useState } from "react";
import { Segment } from "semantic-ui-react";
import PropTypes from 'prop-types';
import Timeline from "../../timeline";
import { d, someHumanResources, someTasks } from "../sampleData";
import { customTimelineScenarios } from "./CustomTimelineScenarios";
import ReactDOM from "react-dom";

export default {
  title: 'Features/Custom',
  component: Timeline
};

export const CustomMenuButtonRenderer: ComponentStory<typeof Timeline> = () => {

  class CustomTimeline extends Timeline {
    static propTypes = {
      ...super.propTypes,
      /**
       * @type { JSX.Element }
       */
      toolbarDomElement: PropTypes.object.isRequired
    };

    renderMenuButton() {
      return (this.props as any).toolbarDomElement
        ? ReactDOM.createPortal(super.renderMenuButton(), (this.props as any).toolbarDomElement)
        : super.renderMenuButton();
    }
  }

  const divRef = useRef<any>();
  const [value, setValue] = useState(0);
  // after first render when the div dom element is created for re-render 
  useEffect(() => { !value && setValue(value => value + 1) });

  return (<>
    <Segment size="mini">
      <div ref={divRef}> </div>
    </Segment>
    <CustomTimeline startDate={d('2018-09-20')} endDate={d('2018-09-21')} groups={someHumanResources} items={someTasks} toolbarDomElement={divRef.current} />
  </>);

};

CustomMenuButtonRenderer.parameters = {
  scenarios: Object.keys(customTimelineScenarios).map(key => customTimelineScenarios[key])
};
