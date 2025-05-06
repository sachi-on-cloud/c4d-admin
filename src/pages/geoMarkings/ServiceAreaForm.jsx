import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
} from '@material-tailwind/react';

const ServiceAreaForm = ({ onSave, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="p-4 mt-4">
      <Typography variant="h6" color="blue-gray" className="mb-4">
        Service Area Details
      </Typography>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Name
          </Typography>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter service area name"
          />
        </div>
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Description
          </Typography>
          <Input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter description"
          />
        </div>
        <Button type="submit" className="mt-4">
          {initialData ? 'Update' : 'Save'} Service Area
        </Button>
      </form>
    </Card>
  );
};

export default ServiceAreaForm; 