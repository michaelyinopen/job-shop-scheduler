import React, { useReducer } from 'react';

//WithContext
import {
  TimelineDispatchContext,
  TimelineStateContext,
  TimelineGroupsStateContext,
  TimelineItemsStateContext,
} from '@michaelyin/timeline';
import jobShopReducer, { init as jobShopInit } from './store/reducer';
import {
  timelineStateSelector,
  timelineGroupsSelector,
  proceduresSelector,
  referenceDateSelector,
  previewTasksSelector,
} from './store/selectors';
import { usePreviewAppliedTimelineItems } from './store/useSelector';
import JobShopDispatchContext from './JobShopDispatchContext';
import JobShopStateContext from './JobShopStateContext';

//Presentation
import {
  ControlledTimeline,
  TimelineContent,
  GroupAxis,
  ScheduleContainer,
  TimeAxis,
} from '@michaelyin/timeline';
import Task from './Task';
import MachineLane from './MachineLane';
import JobSet from './JobSet';
import Toolbar from './Toolbar';

const JobShopScheduler = React.memo(() => {
  return (
    <React.Fragment>
      <Toolbar />
      <JobSet />
      <br />
      <ControlledTimeline
        itemComponent={Task}
        groupComponent={MachineLane}
      >
        <TimelineContent>
          <GroupAxis />
          <ScheduleContainer />
        </TimelineContent>
        <TimeAxis />
      </ControlledTimeline>
    </React.Fragment>
  );
});

const withContext = WrappedComponent => ({
  machines,
  jobs,
  referenceDate,
  timeOptions,
}) => {
  const [state, dispatch] = useReducer(
    jobShopReducer,
    {
      machines,
      jobs,
      referenceDate,
      timeOptions
    },
    jobShopInit
  );
  const timelineState = timelineStateSelector(state);
  const timelineGroups = timelineGroupsSelector(state);
  const procedures = proceduresSelector(state);
  const previewTasks = previewTasksSelector(state);
  const referenceDateFromState = referenceDateSelector(state);
  const timelineItemsWithPreview = usePreviewAppliedTimelineItems(procedures, previewTasks, referenceDateFromState);

  return (
    <JobShopDispatchContext.Provider value={dispatch}>
      <JobShopStateContext.Provider value={state}>
        <TimelineDispatchContext.Provider value={dispatch}>
          <TimelineStateContext.Provider value={timelineState}>
            <TimelineGroupsStateContext.Provider value={timelineGroups}>
              <TimelineItemsStateContext.Provider value={timelineItemsWithPreview}>
                <WrappedComponent />
              </TimelineItemsStateContext.Provider>
            </TimelineGroupsStateContext.Provider>
          </TimelineStateContext.Provider>
        </TimelineDispatchContext.Provider>
      </JobShopStateContext.Provider>
    </JobShopDispatchContext.Provider>
  );
};

export default withContext(JobShopScheduler);