import { Alert } from 'antd';
import React from 'react';
import Timeline from '../../timeline';
import { BackgroundLayer } from '../../components/BackgroundLayer';
import { HighlightedInterval } from '../../components/HighlightedInterval';
import { Marker } from '../../components/Marker';
import { d, someHumanResources, someTasks, startOfCurrentMonth, endOfCurrentMonth, dateAndHourOfCurrentMonth } from '../sampleData';
import { backgroundLayerScenarios } from './BackgroundLayerScenarios';
export default {
  title: 'Features/Background Layer'
};

export const Main = () => {
  return (
    <Timeline startDate={startOfCurrentMonth()}
      endDate={endOfCurrentMonth()} groups={someHumanResources} items={[]}
      backgroundLayer={
        <BackgroundLayer verticalGrid nowMarker highlightWeekends
          highlightedIntervals={[
            <HighlightedInterval start={dateAndHourOfCurrentMonth(15)} end={dateAndHourOfCurrentMonth(18)} />,
            <HighlightedInterval start={dateAndHourOfCurrentMonth(20, 19)} end={dateAndHourOfCurrentMonth(21, 10)} />
          ]}
          markers={[
            <Marker date={dateAndHourOfCurrentMonth(10, 12)} />,
            <Marker date={dateAndHourOfCurrentMonth(15, 12)} />
          ]}
        />}
    />
  );
};

Main.parameters = {
  scenarios: [
    backgroundLayerScenarios.verticalGrid,
    backgroundLayerScenarios.nowMarker,
    backgroundLayerScenarios.highlightWeekends,
    backgroundLayerScenarios.markers,
    backgroundLayerScenarios.highlightedIntervals
  ]
}

export const CustomClassNamesAndStyles = () => {
  return (
    <Timeline startDate={startOfCurrentMonth()}
      endDate={endOfCurrentMonth()} groups={someHumanResources} items={[]}
      backgroundLayer={
        <BackgroundLayer verticalGrid verticalGridClassName='story-custom-vertical-grid-class' verticalGridStyle={{opacity: 0.5}}
          nowMarker nowMarkerClassName='story-custom-now-marker-class' nowMarkerStyle={{opacity: 0.7}}
          highlightWeekends highlightWeekendsClassName='story-custom-highlighted-weekends-class' highlightWeekendsStyle={{opacity: 0.8}}
          highlightedIntervals={[
            <HighlightedInterval className='story-custom-highlighted-interval-class' style={{background: '#f6bea3'}} start={dateAndHourOfCurrentMonth(15)} end={dateAndHourOfCurrentMonth(18)} />,
            <HighlightedInterval className='story-custom-highlighted-interval-class' style={{background: '#f6bea3'}} start={dateAndHourOfCurrentMonth(20, 19)} end={dateAndHourOfCurrentMonth(21, 10)} />
          ]}
          markers={[
            <Marker className='story-custom-marker-class' style={{width: '2px'}} date={dateAndHourOfCurrentMonth(10, 12)} />,
            <Marker className='story-custom-marker-class' style={{width: '2px'}} date={dateAndHourOfCurrentMonth(15, 12)} />
          ]}
        />}
    />
  );
};

CustomClassNamesAndStyles.parameters = {
  scenarios: [
    backgroundLayerScenarios.verticalGridClassName,
    backgroundLayerScenarios.nowMarkerClassName,
    backgroundLayerScenarios.highlightWeekendsClassName,
    backgroundLayerScenarios.classNameForMarker,
    backgroundLayerScenarios.highlightedIntervalClassName
  ]
}