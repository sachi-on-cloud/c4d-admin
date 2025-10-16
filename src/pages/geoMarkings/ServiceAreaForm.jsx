import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Alert,
} from '@material-tailwind/react';
import Select from 'react-select';

const ServiceAreaForm = ({ onSave, initialData = null, coordinates = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    services: initialData?.services ||  [], // Handle both services and serviceTypes
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

      onSave({
        ...formData,
        coordinates,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  const serviceTypeOptions = [
    { value:"RENTAL_DROP_TAXI", label: 'Drop Taxi' },
    { value:"RENTAL", label: 'Outstation' },
    {value:"DRIVER", label: 'Acting Driver' },
    { value:"RIDES", label: 'Local Rides' },
    { value:"RENTAL_HOURLY_PACKAGE", label: 'Hourly Package' },
    { value:"AUTO", label: 'Auto' },
    { value:"PARCEL", label: 'Parcel' },
  ];

  return (
    <Card className="p-4 mt-4">
      <Typography variant="h6" color="blue-gray" className="mb-4">
        Service Area Details
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
        {/* Multi-Select Dropdown */}
        <div className="overflow-visible relative z-50">
          <label className="text-sm text-gray-700 mb-1 block">Service Types</label>
          <Select
            isMulti
            options={serviceTypeOptions}
            value={serviceTypeOptions.filter((opt) =>
              formData.services.includes(opt.value)
            )}
            onChange={(selected) =>
              setFormData({
                ...formData,
                services: selected ? selected.map((s) => s.value) : [],
              })
            }
            closeMenuOnSelect={false} // Keep dropdown open after selection
            placeholder="Select service types"
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
        </div>
        <Button
          type="submit"
          className="mt-4"
          disabled={isSubmitting || !coordinates}
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Save')} Service Area
        </Button>
      </form>
    </Card>
  );
};

export default ServiceAreaForm;