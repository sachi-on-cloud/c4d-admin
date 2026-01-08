import React, { useState, useMemo } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Alert,
} from '@material-tailwind/react';
import Select from 'react-select';

const ServiceAreaForm = ({ onSave, initialData = null, coordinates = null }) => {
  const initialServiceTypes = initialData?.services || [];
  const initialQuickServices = useMemo(() => {
    return initialData?.quickServices?.filter(qs =>
      initialServiceTypes.includes(qs)
    ) || [];
  }, [initialData?.quickServices, initialServiceTypes]);

  // Fix: Handle both string and array for highlightedService
  const initialHighlighted = useMemo(() => {
    if (!initialData?.highlightedService) return '';
    if (typeof initialData.highlightedService === 'string') {
      return initialServiceTypes.includes(initialData.highlightedService)
        ? initialData.highlightedService
        : '';
    }
    if (Array.isArray(initialData.highlightedService)) {
      const valid = initialData.highlightedService.find(hs => initialServiceTypes.includes(hs));
      return valid || '';
    }
    return '';
  }, [initialData?.highlightedService, initialServiceTypes]);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    services: initialServiceTypes,
    quickServices: initialQuickServices,
    highlightedService: initialHighlighted, // ← Now string (single value)
  });

  const [error, setError] = useState(null);
  const [servicesError, setServicesError] = useState(null);
  const [quickServiceError, setQuickServiceError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceTypeOptions = [
    { value: 'RENTAL_DROP_TAXI', label: 'Drop Taxi' },
    { value: 'RENTAL', label: 'Outstation' },
    { value: 'DRIVER', label: 'Acting Driver' },
    { value: 'RIDES', label: 'Local Rides' },
    { value: 'RENTAL_HOURLY_PACKAGE', label: 'Hourly Package' },
    { value: 'AUTO', label: 'Auto' },
    { value: 'PARCEL', label: 'Parcel' },
  ];

  const availableQuickOptions = useMemo(() => {
    return serviceTypeOptions.filter(opt =>
      formData.services.includes(opt.value)
    );
  }, [formData.services]);

  const availableHighlightedOptions = useMemo(() => {
    return serviceTypeOptions.filter(opt =>
      formData.services.includes(opt.value)
    );
  }, [formData.services]);

  const validateServices = (selected) => {
    if (!selected || selected.length < 4) {
      setServicesError('Please select at least 4 Service Types');
      return false;
    }
    setServicesError(null);
    return true;
  };

  const validateQuickServices = (selected) => {
    if (selected.length !== 4) {
      setQuickServiceError('Please select exactly 4 Quick Services');
      return false;
    }
    setQuickServiceError(null);
    return true;
  };

  const handleServiceTypeChange = (selected) => {
    const newServices = selected ? selected.map(s => s.value) : [];
    const filteredQuick = formData.quickServices.filter(qs => newServices.includes(qs));
    const newHighlighted = newServices.includes(formData.highlightedService)
      ? formData.highlightedService
      : '';

    setFormData({
      ...formData,
      services: newServices,
      quickServices: filteredQuick,
      highlightedService: newHighlighted,
    });
    validateServices(newServices);
    validateQuickServices(filteredQuick);
  };

  const handleQuickServiceChange = (selected) => {
    const values = selected ? selected.map(s => s.value) : [];
    setFormData({ ...formData, quickServices: values });
    validateQuickServices(values);
  };

  const handleHighlightedChange = (selected) => {
    setFormData({
      ...formData,
      highlightedService: selected ? selected.value : '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setServicesError(null);
    setQuickServiceError(null);

    if (!formData.services || formData.services.length < 4) {
      setServicesError('Please select at least 4 Service Types');
      return;
    }

    if (formData.quickServices.length !== 4) {
      setQuickServiceError('Please select exactly 4 Quick Services');
      return;
    }

    if (!coordinates || coordinates.length < 3) {
      setError('Please draw a valid polygon with at least 3 points');
      return;
    }

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
            Name <span className="text-red-500">*</span>
          </Typography>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter service area name"
          />
        </div>
       <div className="overflow-visible relative z-50">
          <label className="text-sm text-gray-700 mb-1 block font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <Select
            options={[
              { value: 'City', label: 'City' },
              { value: 'Prime', label: 'Prime' },
            ]}
            value={{
              value: formData.description,
              label: formData.description || 'Select description',
            }}
            onChange={(selected) => {
              setFormData({ ...formData, description: selected ? selected.value : '' });
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
        {/* Multi-Select Dropdown */}
        <div className="overflow-visible relative z-50">
          <label className="text-sm text-gray-700 mb-1 block">Service Types</label>
          <Select
            isMulti
            options={serviceTypeOptions}
            value={serviceTypeOptions.filter((opt) =>
              formData.services.includes(opt.value)
            )}
            onChange={handleServiceTypeChange}
            closeMenuOnSelect={false}
            placeholder="Select service types"
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              control: (base, state) => ({
                ...base,
                borderColor: servicesError ? '#ef4444' : state.isFocused ? '#3b82f6' : '#d1d5db',
                boxShadow: servicesError
                  ? '0 0 0 1px #ef4444'
                  : state.isFocused
                    ? '0 0 0 1px #3b82f6'
                    : 'none',
                '&:hover': { borderColor: servicesError ? '#ef4444' : '#9ca3af' },
              }),
            }}
          />
          {servicesError && <p className="text-red-500 text-xs mt-1">{servicesError}</p>}
        </div>

        {/* Quick Service */}
        <div className="overflow-visible relative z-50">
          <label className="text-sm text-gray-700 mb-1 block">
            Quick Service <span className="text-red-500">*</span>
          </label>
          <Select
            isMulti
            options={availableQuickOptions}
            value={availableQuickOptions.filter((opt) =>
              formData.quickServices.includes(opt.value)
            )}
            onChange={handleQuickServiceChange}
            closeMenuOnSelect={false}
            placeholder={
              availableQuickOptions.length === 0
                ? 'First select Service Types'
                : 'Select exactly 4 quick services'
            }
            isDisabled={availableQuickOptions.length === 0}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              control: (base, state) => ({
                ...base,
                borderColor: quickServiceError ? '#ef4444' : state.isFocused ? '#3b82f6' : '#d1d5db',
                boxShadow: quickServiceError ? '0 0 0 1px #ef4444' : state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                '&:hover': { borderColor: quickServiceError ? '#ef4444' : '#9ca3af' },
              }),
            }}
          />
          {quickServiceError && <p className="text-red-500 text-xs mt-1">{quickServiceError}</p>}
        </div>

        {/* Highlighted Service - SINGLE, OPTIONAL, MAX 1 */}
        <div className="overflow-visible relative z-50">
          <label className="text-sm text-gray-700 mb-1 block">
            Highlighted Service <span className="text-gray-500 text-xs">(optional, max 1)</span>
          </label>
          <Select
            options={availableHighlightedOptions}
            value={availableHighlightedOptions.find(opt => opt.value === formData.highlightedService) || null}
            onChange={handleHighlightedChange}
            isClearable
            placeholder={
              availableHighlightedOptions.length === 0
                ? 'First select Service Types'
                : 'Select one highlighted service (optional)'
            }
            isDisabled={availableHighlightedOptions.length === 0}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="mt-4"
          disabled={
            isSubmitting ||
            !coordinates ||
            coordinates.length < 3 ||
            formData.quickServices.length !== 4 ||
            !formData.services ||
             formData.services.length < 4 ||
            !formData.name.trim()}
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Save')} Service Area
        </Button>
      </form>
    </Card>
  );
};

export default ServiceAreaForm;