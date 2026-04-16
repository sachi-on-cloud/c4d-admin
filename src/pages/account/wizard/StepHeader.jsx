import React from 'react';
import { Typography } from '@material-tailwind/react';

function StepHeader({ title, description }) {
  return (
    <div className="mb-4 rounded-lg border border-blue-gray-100 bg-blue-gray-50/40 p-4">
      <Typography variant="h6" className="text-blue-gray-900">
        {title}
      </Typography>
      {description ? <Typography className="mt-1 text-sm text-blue-gray-600">{description}</Typography> : null}
    </div>
  );
}

export default StepHeader;
