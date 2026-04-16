import React from 'react';
import { Card, CardBody, Typography } from '@material-tailwind/react';

function OwnerCabWizardLayout({
  title,
  subtitle,
  steps = [],
  currentStep = 1,
  onStepChange,
  children,
}) {
  const activeIndex = Math.max(0, currentStep - 1);

  return (
    <Card className="mb-6 border border-blue-gray-100 shadow-sm">
      <CardBody className="px-4 py-4 md:px-6">
        <div className="mb-4">
          <Typography variant="h5" className="font-bold text-blue-gray-900">
            {title}
          </Typography>
          {subtitle ? (
            <Typography className="mt-1 text-sm text-blue-gray-600">{subtitle}</Typography>
          ) : null}
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-[760px] items-center gap-2">
            {steps.map((step, idx) => {
              const stepNo = idx + 1;
              const isDone = idx < activeIndex;
              const isActive = idx === activeIndex;

              return (
                <React.Fragment key={step.key || stepNo}>
                  <button
                    type="button"
                    onClick={() => onStepChange?.(stepNo)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                      isDone || isActive
                        ? 'border-primary bg-primary text-white'
                        : 'border-blue-gray-200 bg-white text-blue-gray-500'
                    }`}
                  >
                    {isDone ? '✓' : String(stepNo).padStart(2, '0')}
                  </button>

                  <div className="min-w-[110px]">
                    <Typography
                      className={`text-xs font-semibold uppercase ${
                        isActive ? 'text-primary' : 'text-blue-gray-400'
                      }`}
                    >
                      Step {stepNo}
                    </Typography>
                    <Typography className="text-sm font-medium text-blue-gray-800">{step.label}</Typography>
                  </div>

                  {idx < steps.length - 1 ? <div className="h-[2px] w-10 bg-blue-gray-100" /> : null}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="mt-4">{children}</div>
      </CardBody>
    </Card>
  );
}

export default OwnerCabWizardLayout;
