import React from 'react';
import { Button } from '@material-tailwind/react';

function StepFooterActions({
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Continue',
  backDisabled = false,
  nextDisabled = false,
  hideBack = false,
}) {
  return (
    <div className="mt-6 flex items-center justify-end gap-2">
      {!hideBack ? (
        <Button variant="outlined" onClick={onBack} disabled={backDisabled}>
          {backLabel}
        </Button>
      ) : null}
      <Button className="bg-primary" onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
      </Button>
    </div>
  );
}

export default StepFooterActions;
