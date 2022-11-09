import {Alert} from 'antd';
import React from 'react';
import ItemRenderer from '../../components/ItemRenderer';
import Timeline from '../../timeline';
import {d, someHumanResources, someTasks} from '../sampleData';
import {itemRendererScenarios} from './ItemRendererScenarios';
import {timelineScenarios} from '../TimelineScenarios';

export default {
  title: 'Features/Item Renderer'
};

export const PropsForItemRenderer = () => {
  const tasks = [
    ...someTasks,
    {
      key: 11,
      row: 3,
      title: 'With style',
      start: d('2018-09-20 7:00'),
      end: d('2018-09-20 8:00'),
      style: {
        opacity: 0.5,
        border: '2px blue solid',
        borderRadius: '7px'
      }
    },
    {
      key: 12,
      row: 3,
      title: 'With class',
      start: d('2018-09-20 9:00'),
      end: d('2018-09-20 10:00'),
      className: 'story-custom-item-class'
    },
    {
      key: 13,
      row: 3,
      title: 'With color and tooltip',
      start: d('2018-09-20 10:30'),
      end: d('2018-09-20 12:45'),
      color: '#FFA215',
      tooltip: 'I am tooltip'
    },
    {
      key: 14,
      row: 3,
      title: 'With gradient, but w/o glow',
      start: d('2018-09-20 13:00'),
      end: d('2018-09-20 15:25'),
      color: 'red',
      gradientStop: 10,
      gradientBrightness: 70,
      gradientReverseDirection: true,
      glowOnHover: false
    }
  ];
  return (
    <>
      <Alert
        message={
          <>
            The last row has items w/ props that are rendered by <code>ItemRenderer</code>.
          </>
        }
      />
      <Timeline startDate={d('2018-09-20')} endDate={d('2018-09-21')} groups={someHumanResources} items={tasks} />
    </>
  );
};

PropsForItemRenderer.parameters = {
  scenarios: [
    itemRendererScenarios.title,
    itemRendererScenarios.tooltip,
    itemRendererScenarios.glowOnHover,
    itemRendererScenarios.color,
    itemRendererScenarios.gradientBrightness,
    itemRendererScenarios.gradientStop,
    itemRendererScenarios.gradientReverseDirection,
    itemRendererScenarios.className,
    itemRendererScenarios.style
  ]
};

export const DefaultPropsForItemRenderer = () => {
  return (
    <>
      <Alert
        message={
          <>
            All the <code>ItemRenderer</code>s have the same (default) props.
          </>
        }
      />
      <Timeline
        startDate={d('2018-09-20')}
        endDate={d('2018-09-21')}
        groups={someHumanResources}
        items={someTasks}
        itemRendererDefaultProps={{
          className: 'story-custom-item-class',
          color: 'red'
        }}
      />
    </>
  );
};

DefaultPropsForItemRenderer.parameters = {
  scenarios: [timelineScenarios.propertyItemRendererDefaultProps]
};

export const CustomItemRenderer = () => {
  const tasks = [...someTasks];
  tasks[0].type = 'analysis';
  tasks[0].spentHours = 24;
  tasks[3].type = 'analysis';
  tasks[3].spentHours = 4;

  tasks[1].type = 'development';
  tasks[2].type = 'testing';
  tasks[2].allTestsPassed = true;
  tasks[4].type = 'testing';
  tasks[4].allTestsPassed = false;

  // custom item renderer that delegates to other renders based on the type of task
  class CustomItemRenderer extends ItemRenderer {
    render() {
      const {type} = this.props.item;
      if (!type) {
        return super.render();
      }
      if (type === 'analysis') {
        return <AnalysisItemRenderer {...this.props} />;
      } else if (type === 'development') {
        return <DevelopmentItemRenderer {...this.props} />;
      } else {
        return <TestingItemRenderer {...this.props} />;
      }
    }
  }

  class AnalysisItemRenderer extends ItemRenderer {
    // we override the actual renderer of the title
    getTitle() {
      return (
        <>
          <b>[A]</b> {super.getTitle()} <u>{this.props.item.spentHours}</u>
        </>
      );
    }

    // text color depending data in the item
    getTextColor() {
      return this.props.item.spentHours > 10 ? 'yellow' : 'black';
    }
  }

  class DevelopmentItemRenderer extends ItemRenderer {
    // override to return a solid color
    getBackgroundGradient() {
      return this.getColor();
    }

    getClassName() {
      return super.getClassName() + ' story-custom-item-class';
    }
  }

  class TestingItemRenderer extends ItemRenderer {
    getColor() {
      return this.props.item.allTestsPassed ? 'green' : 'red';
    }

    getStyle() {
      return {
        ...super.getStyle(),
        borderRadius: '8px'
      };
    }

    getHeight() {
      return '20px';
    }
  }

  return (
    <>
      <Alert
        message={
          <>
            We have different custom item renderers, based on the "task type". They can modify the known props, based on
            logic specific to each item. And they can also process new props, unknown to <code>ItemRenderer</code>.
          </>
        }
      />
      <Timeline
        startDate={d('2018-09-20')}
        endDate={d('2018-09-21')}
        groups={someHumanResources}
        items={someTasks}
        itemRenderer={CustomItemRenderer}
      />
    </>
  );
};

CustomItemRenderer.parameters = {
  scenarios: [timelineScenarios.propertyItemRenderer]
};
