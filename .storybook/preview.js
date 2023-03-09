import "semantic-ui-css/semantic.min.css";
import { Label, Segment } from "semantic-ui-react";

export const parameters = {
  // actions: { argTypesRegex: "^on[A-Z].*" },
  previewTabs: {
    'storybook/docs/panel': { hidden: true }
  },
  viewMode: 'story',
  controls: {
    disable: true,
    // matchers: {
    //   color: /(background|color)$/i,
    //   date: /Date$/,
    // },
  },
  actions: {
    disable: true
  },
  options: {
    storySort: {
      method: 'configure',
      includeNames: true,
      order: [
        'Features',
        ['Basic', 'Item Renderer', 'Background Layer', '*']
      ]
    }
  }
}

export const decorators = [
  (Story, context) => <>
    {context.parameters.scenarios && <ScenariosList scenarios={context.parameters.scenarios} />}
    <div className="demo">
      <Story />
    </div>
  </>
];

const ScenariosList = (props) => <Segment>
  Illustrated scenarios: &nbsp;
  {props.scenarios.map((scenario, i) => <Label key={i} color="blue">{scenario}</Label>)}
</Segment>