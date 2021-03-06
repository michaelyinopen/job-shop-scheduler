import React from 'react';
import renderer from 'react-test-renderer';
import { DragDropContextProvider } from 'react-dnd';
import testBackend from 'react-dnd-test-backend';
import { JobShopScheduler } from './index';

const referenceDate = new Date(2019, 0, 1);

const timeOptions = {
  minTime: new Date(2019, 0, 1),
  maxTime: new Date(2019, 0, 1, 1),
  viewStartTime: new Date(2019, 0, 1),
  viewEndTime: new Date(2019, 0, 1, 1),
  minViewDuration: 1800000,
  maxViewDuration: 3600000
};

const machines = [
  { "id": 1, title: "M1", description: "Machine 1" },
  { "id": 2, title: "M2", description: "Machine 2" },
  { "id": 3, title: "M3", description: "Machine 3" },
  { "id": 4, title: "M4", description: "Machine 4" }
];
const jobs = [
  {
    "id": 1,
    "procedures": [
      { "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 600000 },
      { "id": 2, "jobId": 1, "machineId": 2, "sequence": 2, "processingMilliseconds": 480000 },
      { "id": 3, "jobId": 1, "machineId": 3, "sequence": 3, "processingMilliseconds": 240000 }
    ]
  },
  {
    "id": 2,
    "procedures": [
      { "id": 4, "jobId": 2, "machineId": 2, "sequence": 1, "processingMilliseconds": 480000 },
      { "id": 5, "jobId": 2, "machineId": 1, "sequence": 2, "processingMilliseconds": 180000 },
      { "id": 6, "jobId": 2, "machineId": 4, "sequence": 3, "processingMilliseconds": 300000 },
      { "id": 7, "jobId": 2, "machineId": 3, "sequence": 4, "processingMilliseconds": 360000 }
    ]
  },
  {
    "id": 3,
    "procedures": [
      { "id": 8, "jobId": 3, "machineId": 1, "sequence": 1, "processingMilliseconds": 240000 },
      { "id": 9, "jobId": 3, "machineId": 2, "sequence": 2, "processingMilliseconds": 420000 },
      { "id": 10, "jobId": 3, "machineId": 4, "sequence": 3, "processingMilliseconds": 180000 }
    ]
  },
];

const Demo = () => {
  return (
    <DragDropContextProvider backend={testBackend}>
      <JobShopScheduler
        timeOptions={timeOptions}
        referenceDate={referenceDate}
        machines={machines}
        jobs={jobs}
      />
    </DragDropContextProvider>
  );
};

test('Can render demo', () => {
  const component = renderer.create(
    <Demo />
  );
});


test('Matches snapshot', () => {
  const component = renderer.create(
    <Demo />
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});