import { ComponentStory } from "@storybook/react";
import { useEffect, useRef, useState } from "react";
import { Segment } from "semantic-ui-react";
import { d, someHumanResources, someTasks } from "../sampleData";
import { customTimelineScenarios } from "./CustomTimelineScenarios";
import { CustomTimeline } from "./CustomTimeline";

export default {
  title: 'Features/Custom',
  component: CustomTimeline
};

export const CustomMenuButtonRenderer: ComponentStory<typeof CustomTimeline> = () => {

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
