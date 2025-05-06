import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Select,
  Option,
} from '@material-tailwind/react';

const ZoneForm = ({ onSave, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    minimumSurcharge: initialData?.minimumSurcharge || '',
    tripAmountSurcharge: initialData?.tripAmountSurcharge || '',
    offTimeSurcharge: initialData?.offTimeSurcharge || '',
    offTimeStart: initialData?.offTimeStart || '',
    offTimeEnd: initialData?.offTimeEnd || '',
    description: initialData?.description || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="p-4 mt-4">
      <Typography variant="h6" color="blue-gray" className="mb-4">
        Zone Details
      </Typography>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Zone Name
          </Typography>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter zone name"
          />
        </div>
        
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Minimum Surcharge
          </Typography>
          <Input
            type="number"
            value={formData.minimumSurcharge}
            onChange={(e) => setFormData({ ...formData, minimumSurcharge: e.target.value })}
            required
            placeholder="Enter minimum surcharge amount"
          />
        </div>

        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Trip Amount-Based Surcharge (%)
          </Typography>
          <Input
            type="number"
            value={formData.tripAmountSurcharge}
            onChange={(e) => setFormData({ ...formData, tripAmountSurcharge: e.target.value })}
            required
            placeholder="Enter percentage surcharge"
          />
        </div>

        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Off-Time Surcharge
          </Typography>
          <Input
            type="number"
            value={formData.offTimeSurcharge}
            onChange={(e) => setFormData({ ...formData, offTimeSurcharge: e.target.value })}
            placeholder="Enter off-time surcharge amount"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Off-Time Start
            </Typography>
            <Input
              type="time"
              value={formData.offTimeStart}
              onChange={(e) => setFormData({ ...formData, offTimeStart: e.target.value })}
            />
          </div>
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Off-Time End
            </Typography>
            <Input
              type="time"
              value={formData.offTimeEnd}
              onChange={(e) => setFormData({ ...formData, offTimeEnd: e.target.value })}
            />
          </div>
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
          {initialData ? 'Update' : 'Save'} Zone
        </Button>
      </form>
    </Card>
  );
};

export default ZoneForm; 