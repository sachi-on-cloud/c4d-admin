import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Alert,
} from '@material-tailwind/react';
import Select from 'react-select';

const ZoneForm = ({ onSave, initialData = null, coordinates = null, serviceAreaId }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    config_data: {
      ride_minimum_surcharge: initialData?.config_data?.ride_minimum_surcharge || 0,
      rental_minimum_surcharge: initialData?.config_data?.rental_minimum_surcharge || 0,
      ride_trip_amount_surcharge_percentage: initialData?.config_data?.ride_trip_amount_surcharge_percentage || 0,
      rental_trip_amount_surcharge_percentage: initialData?.config_data?.rental_trip_amount_surcharge_percentage || 0,
      off_time_surcharge_percentage: initialData?.config_data?.off_time_surcharge_percentage || 0,
    }
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfigChange = (field, value) => {
    // Convert to number and validate
    const numValue = parseFloat(value);
    // Only update if it's a valid number or empty string (for user typing)
    if (!isNaN(numValue) || value === '') {
      setFormData(prev => ({
        ...prev,
        config_data: {
          ...prev.config_data,
          [field]: value === '' ? 0 : numValue
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!coordinates || coordinates.length < 3) {
        throw new Error('Please draw a valid polygon with at least 3 points');
      }

      // Validate percentage fields are between 0 and 100
      const percentageFields = [
        'ride_trip_amount_surcharge_percentage',
        'rental_trip_amount_surcharge_percentage',
        'off_time_surcharge_percentage'
      ];

      for (const field of percentageFields) {
        if (formData.config_data[field] < 0 || formData.config_data[field] > 100) {
          throw new Error(`${field.replace(/_/g, ' ').toUpperCase()} must be between 0 and 100`);
        }
      }

      // Validate minimum surcharge amounts are not negative
      if (formData.config_data.ride_minimum_surcharge < 0) {
        throw new Error('Ride minimum surcharge cannot be negative');
      }
      if (formData.config_data.rental_minimum_surcharge < 0) {
        throw new Error('Rental minimum surcharge cannot be negative');
      }

      onSave({
        ...formData,
        coordinates,
        parent_id: serviceAreaId,
        type: 'Zone'
      });
    } catch (err) {
      console.log(err);
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

        {/* Description (SELECT) */}
        <div className="overflow-visible relative z-50">
          <label className="text-sm text-gray-700 mb-1 block font-medium">
            Description <span className="text-red-500">*</span>
          </label>

          <Select
            options={[
              { value: 'City', label: 'City' },
              { value: 'Prime', label: 'Prime' },
            ]}
            value={
              formData.description
                ? { value: formData.description, label: formData.description }
                : null
            }
            onChange={(selected) => {
              setFormData({
                ...formData,
                description: selected ? selected.value : '',
              });
            }}
            placeholder="Select description"
            isClearable={false}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              control: (base, state) => ({
                ...base,
                borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                '&:hover': { borderColor: '#9ca3af' },
              }),
            }}
          />
        </div>

        {/* Surcharge Configuration Section */}
        <div className="mt-4">
          <Typography variant="h6" color="blue-gray" className="mb-4">
            Surcharge Configuration
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Minimum Surcharge Amounts */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Ride Minimum Surcharge Amount
              </Typography>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.config_data.ride_minimum_surcharge}
                onChange={(e) => handleConfigChange('ride_minimum_surcharge', e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Rental Minimum Surcharge Amount
              </Typography>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.config_data.rental_minimum_surcharge}
                onChange={(e) => handleConfigChange('rental_minimum_surcharge', e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Percentage Based Surcharges */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Ride Trip Amount Based Surcharge (%)
              </Typography>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.config_data.ride_trip_amount_surcharge_percentage}
                onChange={(e) => handleConfigChange('ride_trip_amount_surcharge_percentage', e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Rental Trip Amount Based Surcharge (%)
              </Typography>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.config_data.rental_trip_amount_surcharge_percentage}
                onChange={(e) => handleConfigChange('rental_trip_amount_surcharge_percentage', e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Off Time Surcharge (%)
              </Typography>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.config_data.off_time_surcharge_percentage}
                onChange={(e) => handleConfigChange('off_time_surcharge_percentage', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="mt-6"
          disabled={isSubmitting || !coordinates}
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Save')} Zone
        </Button>
      </form>
    </Card>
  );
};

export default ZoneForm; 