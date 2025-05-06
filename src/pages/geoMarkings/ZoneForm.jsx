import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Alert,
} from '@material-tailwind/react';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';

const ZoneForm = ({ onSave, initialData = null, coordinates = null, serviceAreaId }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!coordinates || coordinates.length < 3) {
        throw new Error('Please draw a valid polygon with at least 3 points');
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        type: 'Zone',
        serviceAreaId: serviceAreaId,
        coordinates: coordinates,
      };

      const response = initialData?.id 
        ? await ApiRequestUtils.update(`${API_ROUTES.GEO_MARKINGS}/${initialData.id}`, payload)
        : await ApiRequestUtils.post(API_ROUTES.GEO_MARKINGS, payload);
      
      if (response?.success) {
        onSave({
          ...formData,
          id: initialData?.id || response.data?.id,
          coordinates
        });
      } else {
        throw new Error(response?.message || `Failed to ${initialData ? 'update' : 'create'} zone`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 mt-4">
      <Typography variant="h6" color="blue-gray" className="mb-4">
        Zone Details
      </Typography>
      {error && (
        <Alert color="red" className="mb-4">
          {error}
        </Alert>
      )}
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
            placeholder="Enter zone name"
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
        <Button 
          type="submit" 
          className="mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Save')} Zone
        </Button>
      </form>
    </Card>
  );
};

export default ZoneForm; 