const timeOptions = {
  minTime: new Date(2019, 0, 1),
  maxTime: new Date(2019, 0, 1, 0, 21),
  viewStartTime: new Date(2019, 0, 1),
  viewEndTime: new Date(2019, 0, 1, 0, 13),
  minViewDuration: 720000,
  maxViewDuration: 1260000
};

const machines = [
  { "id": 1, title: "M1", description: "Machine 1" },
  { "id": 2, title: "M2", description: "Machine 2" },
  { "id": 3, title: "M3", description: "Machine 3" }
];

const jobs = [
  {
    "id": 1,
    "procedures": [
      { "id": 1, "jobId": 1, "machineId": 1, "sequence": 1, "processingMilliseconds": 180000 },
      { "id": 2, "jobId": 1, "machineId": 2, "sequence": 2, "processingMilliseconds": 120000 },
      { "id": 3, "jobId": 1, "machineId": 3, "sequence": 3, "processingMilliseconds": 120000 }
    ]
  },
  {
    "id": 2,
    "procedures": [
      { "id": 4, "jobId": 2, "machineId": 1, "sequence": 1, "processingMilliseconds": 120000 },
      { "id": 5, "jobId": 2, "machineId": 3, "sequence": 2, "processingMilliseconds": 60000 },
      { "id": 6, "jobId": 2, "machineId": 2, "sequence": 3, "processingMilliseconds": 240000 }
    ]
  },
  {
    "id": 3,
    "procedures": [
      { "id": 7, "jobId": 3, "machineId": 2, "sequence": 1, "processingMilliseconds": 240000 },
      { "id": 8, "jobId": 3, "machineId": 3, "sequence": 2, "processingMilliseconds": 180000 }
    ]
  },
];

const bestTimeMilliseconds = 660000;

export const sampleTwoData = {
  name: "Sample 2",
  timeOptions,
  machines,
  jobs,
  bestTimeMilliseconds
}