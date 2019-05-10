import React from 'react';
import ProductionProcedure from './ProductionProcedure';
import { useProcedureIdsOfJob, useJobColor } from './store/useSelector';
import ProductionJobOptionsButton from './ProductionJobOptionsButton';
import ProductionJobStatusButton from './ProductionJobStatusButton';

import classNames from 'classnames/bind';
import productionStyles from './Production.module.css';

const cx = classNames.bind(productionStyles);

const ProductionJob = React.memo(({
  id,
  procedureIds,
  backgroundColor,
  foregroundColor,
}) => {
  return (
    <section className={cx("production__job-section")}>
      <ProductionJobOptionsButton id={id} />
      <ProductionJobStatusButton id={id}/>
      <h3 className={cx("production__job-header")}>
        Job
        <span
          className={cx("production__job-header-color-box")}
          style={{ backgroundColor: backgroundColor, color: foregroundColor }}
        >
          {id}
        </span>
        :
      </h3>
      <ol className={cx("production__procedures")}>
        {procedureIds.map(pId => <li key={pId}><ProductionProcedure id={pId} /></li>)}
      </ol>
    </section >
  );
})


const ProductionJobContainer = ({
  id
}) => {
  const procedureIds = useProcedureIdsOfJob(id);
  const [backgroundColor, foregroundColor] = useJobColor(id);

  return (
    <ProductionJob
      id={id}
      procedureIds={procedureIds}
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
    />
  );
};

export default ProductionJobContainer;