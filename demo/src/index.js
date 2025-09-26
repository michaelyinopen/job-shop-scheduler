import React, { useState, useRef } from 'react';
import { render } from 'react-dom';
import { DragDropContextProvider } from 'react-dnd';
import html5Backend from 'react-dnd-html5-backend';

import { JobShopScheduler } from '../../src'
import '../css/index.css';

import { sampleOneData } from './sampleOneData';
import { sampleTwoData } from './sampleTwoData';

const referenceDate = new Date(2019, 0, 1);

const paddingStyle = { padding: "0 10px" };

const Demo = () => {
  const [chosenSample, setChosenSample] = useState(sampleOneData);

  const { current: chooseSampleOne } = useRef(() => {
    setChosenSample(sampleOneData)
  });

  const { current: chooseSampleTwo } = useRef(() => {
    setChosenSample(sampleTwoData)
  });

  return (
    <DragDropContextProvider backend={html5Backend}>
      <div style={paddingStyle}>
        <h1><a href='https://github.com/michaelyinopen/job-shop-scheduler'>@michaelyin/job-shop-scheduler</a> Demo</h1>
        <h2>{chosenSample.name}</h2>
        <p>Drag all procedures to the timeline, until they are all assigned and there are no conflicts.</p>
        <JobShopScheduler
          key={chosenSample.name}
          referenceDate={referenceDate}
          timeOptions={chosenSample.timeOptions}
          machines={chosenSample.machines}
          jobs={chosenSample.jobs}
        />
        <p>Best time is {chosenSample.bestTimeMilliseconds / 60000}min.</p>
        {chosenSample.name !== "Sample 1" && <button onClick={chooseSampleOne}>See Sample 1</button>}
        {chosenSample.name !== "Sample 2" && <button onClick={chooseSampleTwo}>See Sample 2</button>}
      </div>
    </DragDropContextProvider>
  );
};

render(<Demo />, document.querySelector('#demo'))
