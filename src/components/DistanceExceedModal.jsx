import React from 'react';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const DistanceExceedModal = ({ isVisible, onClose, content, title }) => {
  return (
    <Dialog
      open={isVisible}
      handler={onClose}
      size="sm"
      className="bg-white rounded-t-3xl"
    >
      <DialogHeader className="flex justify-between items-center p-4 border-b border-gray-200">
        <Typography variant="h6" className="text-lg font-roboto-bold text-black">
          {title || ''}
        </Typography>
        <Button
          variant="text"
          className="p-2"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6 text-black" />
        </Button>
      </DialogHeader>
      <DialogBody className="flex-1 flex justify-center items-center p-4">
        <Typography className="text-center text-base text-gray-700">
          {content}
        </Typography>
      </DialogBody>
    </Dialog>
  );
};

export default DistanceExceedModal;