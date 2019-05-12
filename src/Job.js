import React from 'react';
import Procedure from './Procedure';
import { useProcedureIdsOfJob, useJobColor } from './store/useSelector';
import JobOptionsButton from './JobOptionsButton';
import JobStatusButton from './JobStatusButton';

import classNames from 'classnames/bind';
import jobShopStyles from '../css/JobShop.module.css';

const cx = classNames.bind(jobShopStyles);

const Job = React.memo(({
  id,
  procedureIds,
  backgroundColor,
  foregroundColor,
}) => {
  return (
    <section className={cx("job-shop__job-section")}>
      <JobOptionsButton id={id} />
      <JobStatusButton id={id}/>
      <h3 className={cx("job-shop__job-header")}>
        Job
        <span
          className={cx("job-shop__job-header-color-box")}
          style={{ backgroundColor: backgroundColor, color: foregroundColor }}
        >
          {id}
        </span>
        :
      </h3>
      <ol className={cx("job-shop__procedures")}>
        {procedureIds.map(pId => <li key={pId}><Procedure id={pId} /></li>)}
      </ol>
    </section >
  );
})

const JobContainer = ({
  id
}) => {
  const procedureIds = useProcedureIdsOfJob(id);
  const [backgroundColor, foregroundColor] = useJobColor(id);
  return (
    <Job
      id={id}
      procedureIds={procedureIds}
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
    />
  );
};

export default JobContainer;