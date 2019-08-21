import { useMemo } from 'react';
import {
  usePreviewAppliedEffectiveTask,
  usePreviewAppliedEffectiveTasks,
  usePreviewAppliedEffectiveProceduresOfJob,
  useProcedures,
  hasMillisecondsFromStart,
} from "./useSelector";

const isOverlapping = (
  { start: start1, duration: duration1 },
  { start: start2, duration: duration2 }
) => {
  const end1 = start1 + duration1;
  const end2 = start2 + duration2;
  return !(end1 <= start2) && !(start1 >= end2);
};

// omit "isfulfill" for brevity
const machineConstraint = tasks => task => {
  // Overlap
  const feasible = !tasks
    .filter(t => t.id !== task.id)
    .filter(t => t.machineId === task.machineId)
    .some(t => isOverlapping(
      { start: t.millisecondsFromStart, duration: t.processingMilliseconds },
      { start: task.millisecondsFromStart, duration: task.processingMilliseconds }
    ));
  const violationMessages = !feasible ? ["Overlapping usage of Machine"] : [];//todo better violation message
  return [feasible, violationMessages];
};

// omit "isfulfill" for brevity
const jobAssignedPrecedingConstraint = proceduresOfJob => task => {
  //todo
  const feasible = proceduresOfJob
    .filter(p => p.id !== task.id)
    .filter(p => p.sequence < task.sequence)
    .every(p => (p.millisecondsFromStart || p.millisecondsFromStart === 0))
  const violationMessages = !feasible ? ["Unassigned preceding procedure of the job"] : [];//todo better violation message
  return [feasible, violationMessages];
};

// omit "isfulfill" for brevity
const jobPrecedingFinishedConstraint = proceduresOfJob => task => {
  //todo
  const feasible = proceduresOfJob
    .filter(p => p.id !== task.id)
    .filter(p => p.sequence < task.sequence)
    .filter(p => (p.millisecondsFromStart || p.millisecondsFromStart === 0))
    .every(p => p.millisecondsFromStart + p.processingMilliseconds <= task.millisecondsFromStart)
  const violationMessages = !feasible ? ["Preceding procedures of the job are not finished"] : [];//todo better violation message
  return [feasible, violationMessages];
};

// omit "isfulfill" for brevity
const jobNoOverlapingConstraint = proceduresOfJob => task => {
  const feasible = !proceduresOfJob
    .filter(p => p.id !== task.id)
    .filter(p => p.millisecondsFromStart || p.millisecondsFromStart === 0)
    .some(t => isOverlapping(
      { start: t.millisecondsFromStart, duration: t.processingMilliseconds },
      { start: task.millisecondsFromStart, duration: task.processingMilliseconds }
    ));
  const violationMessages = !feasible ? ["Overlapping with another procedure of the job"] : [];//todo better violation message
  return [feasible, violationMessages];
};

// omit "isfulfill" for brevity
const jobConstraint = proceduresOfJob => task => {
  // omit "Job" & "constraint" for brevity
  const [fulfillsAssignedPreceding, assignedPrecedingViolationMessages] = jobAssignedPrecedingConstraint(proceduresOfJob)(task);
  const [fulfillsPrecedingFinished, precedingFinishedViolationMessages] = jobPrecedingFinishedConstraint(proceduresOfJob)(task);
  const [fulfillsNoOverlaping, noOverlapingViolationMessages] = jobNoOverlapingConstraint(proceduresOfJob)(task);

  const feasible =
    fulfillsAssignedPreceding &&
    fulfillsPrecedingFinished &&
    fulfillsNoOverlaping;
  const violationMessages = [
    ...assignedPrecedingViolationMessages,
    ...precedingFinishedViolationMessages,
    ...noOverlapingViolationMessages,
  ];

  return [feasible, violationMessages];
};

const getTaskFeasible = (task, tasks, proceduresOfJob) => {
  // omit "constraint" for brevity
  const [fulfillsMachine, machineViolationMessages] = machineConstraint(tasks)(task);
  const [fulfillsJob, jobViolationMessages] = jobConstraint(proceduresOfJob)(task);

  const feasible =
    fulfillsMachine &&
    fulfillsJob;
  const violationMessages = [
    ...machineViolationMessages,
    ...jobViolationMessages,
  ];
  return [feasible, violationMessages];
}

const useTaskFeasible = procedureId => {
  const task = usePreviewAppliedEffectiveTask(procedureId);
  const tasks = usePreviewAppliedEffectiveTasks();
  const proceduresOfJob = usePreviewAppliedEffectiveProceduresOfJob(task.jobId);

  const result = useMemo(
    () => getTaskFeasible(task, tasks, proceduresOfJob),
    [task, tasks, proceduresOfJob]
  );
  return result;
};

// returns [assigned, feasible, violationMessage]
const getProcedureStatus = (procedure, tasks, proceduresOfJob) => {
  if (!hasMillisecondsFromStart(procedure)) {
    return [false];
  }
  const [feasible, violationMessages] = getTaskFeasible(procedure, tasks, proceduresOfJob);
  if (!feasible) {
    return [true, false, violationMessages];
  }
  return [true, true];
};

// returns [feasible, allAssigned]
// unassigned procedures are not included for feasible
const getJobStatus = statusOfEachProcedure => {
  const feasible = statusOfEachProcedure.every(p => !p.assigned || p.feasible);
  const allAssigned = statusOfEachProcedure.every(p => p.assigned);
  return [feasible, allAssigned];
};

/* returns 
[
  jobFeasible,
  allAssigned,
  [
    ...{
      sequence,
      assigned,
      feasible,
      violationMessages
    },
    ...
  ]
]
*/
export const useJobStatus = jobId => {
  const procedures = useProcedures();
  const result = useMemo(
    () => {
      const tasks = procedures.filter(hasMillisecondsFromStart);
      const proceduresOfJob = procedures
        .filter(p => p.jobId === jobId)
        .sort((a, b) => a.sequence - b.sequence);
      let statusOfEachProcedure = [];
      for (var i = 0; i < proceduresOfJob.length; ++i) {
        const procedure = proceduresOfJob[i];
        const sequence = procedure.sequence;
        const [assigned, feasible, violationMessages] = getProcedureStatus(procedure, tasks, proceduresOfJob);
        statusOfEachProcedure.push({
          sequence,
          assigned,
          feasible,
          violationMessages
        });
      }
      const [jobFeasible, allAssigned] = getJobStatus(statusOfEachProcedure);
      return [jobFeasible, allAssigned, statusOfEachProcedure];
    },
    [procedures]
  );
  return result;
};

export default useTaskFeasible;