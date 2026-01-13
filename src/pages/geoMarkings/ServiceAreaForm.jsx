import React, { useState, useMemo } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Alert,
  Switch,
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

  const initialNewServices =
    (initialData?.newServices &&
      Array.isArray(initialData.newServices.data) &&
      initialData.newServices.data) ||
    (Array.isArray(initialData?.newServices) ? initialData.newServices : []);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    services: initialServiceTypes,
    quickServices: initialQuickServices,
    highlightedService: initialHighlighted, // ← Now string (single value)
    newServices: initialNewServices,
  });

  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);
  const [servicesError, setServicesError] = useState(null);
  const [quickServiceError, setQuickServiceError] = useState(null);
  const [newServicesError, setNewServicesError] = useState(null);
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

  const isValidHexColor = (value) =>
    typeof value === 'string' && /^#([0-9A-Fa-f]{6})$/.test(value);

  const newServiceNameOptions = [
    { value: 'ROOT CABS', label: 'Root Cabs' },
    { value: 'ROOT FOOD', label: 'Root Food' },
    { value: 'ROOT PARCEL', label: 'Root Parcel' },
    { value: 'ROOT STAY', label: 'Root Stay' },
  ];

  const validateQuickServices = (selected) => {
    if (selected.length !== 4) {
      setQuickServiceError('Please select exactly 4 Quick Services');
      return false;
    }
    setQuickServiceError(null);
    return true;
  };

  const validateNewServices = (services) => {
    const names = (services || []).map((s) => s.name).filter(Boolean);

    if (!names.includes('ROOT CABS')) {
      setNewServicesError('ROOT CABS is mandatory');
      return false;
    }

    if (names.length < 2) {
      setNewServicesError('Please select at least 2 New Services');
      return false;
    }

    setNewServicesError(null);
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
  

  const handleNewServiceChange = (index, field, value) => {
    const updated = [...formData.newServices];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, newServices: updated });
    validateNewServices(updated);
  };

  const handleNewServiceToggle = (index, checked) => {
    const updated = [...formData.newServices];
    updated[index] = { ...updated[index], isUpdate: checked };
    setFormData({ ...formData, newServices: updated });
  };
const handleNewServiceImageChange = (index, file) => {
    if (!file) return;

    const updated = [...formData.newServices];
    updated[index] = {
      ...updated[index],
      imageFile: file,
      imagePreview: URL.createObjectURL(file)
    };
    setFormData({ ...formData, newServices: updated });
  };



  const handleNewServiceSelectChange = (selected) => {
    const names = selected ? selected.map((s) => s.value) : [];

    const existingByName = {};
    formData.newServices.forEach((s) => {
      if (s.name) {
        existingByName[s.name] = s;
      }
    });

    const updatedNewServices = names.map((name) => {
      return (
        existingByName[name] || {
          name,
          url: '',
          isUpdate: false,
        }
      );
    });

    setFormData({ ...formData, newServices: updatedNewServices });
    validateNewServices(updatedNewServices);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNameError(null);
    setDescriptionError(null);
    setServicesError(null);
    setQuickServiceError(null);
    setNewServicesError(null);
    let hasError = false;

    if (!formData.name.trim()) {
      setNameError('Name is required');
      hasError = true;
    }

    if (!formData.description) {
      setDescriptionError('Description is required');
      hasError = true;
    }

    if (!formData.services || formData.services.length < 4) {
      setServicesError('Please select at least 4 Service Types');
      hasError = true;
    }
    if (!validateNewServices(formData.newServices)) {
      return;
    }

    if (formData.quickServices.length !== 4) {
      setQuickServiceError('Please select exactly 4 Quick Services');
      hasError = true;
    }

    if (!coordinates || coordinates.length < 3) {
      setError('Please draw a valid polygon with at least 3 points');
      hasError = true;
    }
    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    try {
      onSave({
        ...formData,
        newServices: Array.isArray(formData.newServices)
          ? formData.newServices
          : [],
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
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (nameError) {
                setNameError(null);
              }
            }}
            placeholder="Enter service area name"
            error={!!nameError}
          />
          {nameError && (
            <p className="text-red-500 text-xs mt-1">{nameError}</p>
          )}
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
            isSearchable={false}
            value={
              formData.description
                ? { value: formData.description, label: formData.description }
                : null
            }
            onChange={(selected) => {
              setFormData({ ...formData, description: selected ? selected.value : '' });
              if (selected && descriptionError) {
                setDescriptionError(null);
              }
            }}
            placeholder="Select description"
            isClearable={false}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              control: (base, state) => ({
                ...base,
                borderColor: descriptionError
                  ? '#ef4444'
                  : state.isFocused
                    ? '#3b82f6'
                    : '#d1d5db',
                boxShadow: descriptionError
                  ? '0 0 0 1px #ef4444'
                  : state.isFocused
                    ? '0 0 0 1px #3b82f6'
                    : 'none',
                '&:hover': {
                  borderColor: descriptionError ? '#ef4444' : '#9ca3af',
                },
              }),
            }}
          />
          {descriptionError && (
            <p className="text-red-500 text-xs mt-1">{descriptionError}</p>
          )}
        </div>
        {/* Multi-Select Dropdown */}
        <div className="overflow-visible relative z-50">
          <label className="text-sm text-gray-700 mb-1 block">Service Types <span className="text-red-500">*</span></label>
          <Select
            isMulti
            options={serviceTypeOptions}
            isSearchable={false}
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

        {/* New Services */}
        <div className="mt-2">
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            New Services
          </Typography>
          <div className="overflow-visible relative z-50 mb-3">
            <Select
              isMulti
              options={newServiceNameOptions}
              value={newServiceNameOptions.filter((opt) =>
                formData.newServices?.some((s) => s.name === opt.value)
              )}
              onChange={handleNewServiceSelectChange}
              closeMenuOnSelect={false}
              placeholder="Select new services"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base, state) => ({
                  ...base,
                  borderColor: newServicesError
                    ? '#ef4444'
                    : state.isFocused
                    ? '#3b82f6'
                    : '#d1d5db',
                  boxShadow: newServicesError
                    ? '0 0 0 1px #ef4444'
                    : state.isFocused
                    ? '0 0 0 1px #3b82f6'
                    : 'none',
                  '&:hover': {
                    borderColor: newServicesError ? '#ef4444' : '#9ca3af',
                  },
                }),
              }}
            />
          </div>
          {newServicesError && (
            <p className="text-red-500 text-xs mt-1">{newServicesError}</p>
          )}
          <div className="space-y-4">
            {formData.newServices?.map((service, index) => (
              <div key={index} className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1"
                    >
                      Name
                    </Typography>
                    <Typography variant="small" color="gray">
                      {service.name}
                    </Typography>
                  </div>
                 <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1"
                    >
                      Image
                    </Typography>
                    <label className="cursor-pointer block">
                      <div className={`
                        border-2  rounded p-2 text-center
                        ${service.imagePreview ? 'border-blue-500 bg-blue-50/30' : 'border-gray-300 hover:border-black'}
                      `}>
                        {service.imagePreview ? (
                          <img
                            src={service.imagePreview}
                            alt="preview"
                            className="max-h-16 mx-auto object-contain"
                          />
                        ) : (
                          <span className="text-sm text-gray-500">
                            Click to upload image (PNG, JPG, GIF)
                          </span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleNewServiceImageChange(index, file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Switch
                      color="blue"
                      checked={service.isUpdate}
                      onChange={(e) =>
                        handleNewServiceToggle(index, e.target.checked)
                      }
                      label={
                        service.isUpdate ? 'Status: Active' : 'Status: InActive'
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1"
                    >
                      Accent Color
                    </Typography>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={
                          isValidHexColor(service.accentColor)
                            ? service.accentColor
                            : '#000000'
                        }
                        onChange={(e) =>
                          handleNewServiceChange(
                            index,
                            'accentColor',
                            e.target.value
                          )
                        }
                        className="h-10 w-12 p-0 border border-gray-300 rounded"
                      />
                      <Input
                        type="text"
                        value={service.accentColor || ''}
                        onChange={(e) =>
                          handleNewServiceChange(
                            index,
                            'accentColor',
                            e.target.value
                          )
                        }
                        placeholder="#1D4ED8"
                        className="min-w-0"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1"
                    >
                      Background Color
                    </Typography>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={
                          isValidHexColor(service.backgroundColor)
                            ? service.backgroundColor
                            : '#000000'
                        }
                        onChange={(e) =>
                          handleNewServiceChange(
                            index,
                            'backgroundColor',
                            e.target.value
                          )
                        }
                        className="h-10 w-12 p-0 border border-gray-300 rounded"
                      />
                      <Input
                        type="text"
                        value={service.backgroundColor || ''}
                        onChange={(e) =>
                          handleNewServiceChange(
                            index,
                            'backgroundColor',
                            e.target.value
                          )
                        }
                        placeholder="#EAEEFF"
                        className="min-w-0"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1"
                    >
                      Pill Color
                    </Typography>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={
                          isValidHexColor(service.pillColor)
                            ? service.pillColor
                            : '#000000'
                        }
                        onChange={(e) =>
                          handleNewServiceChange(
                            index,
                            'pillColor',
                            e.target.value
                          )
                        }
                        className="h-10 w-12 p-0 border border-gray-300 rounded"
                      />
                      <Input
                        type="text"
                        value={service.pillColor || ''}
                        onChange={(e) =>
                          handleNewServiceChange(
                            index,
                            'pillColor',
                            e.target.value
                          )
                        }
                        placeholder="#1E3A8A"
                        className="min-w-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Service */}
        <div className="overflow-visible relative z-50">
          <label className="text-sm text-gray-700 mb-1 block">
            Quick Service <span className="text-red-500">*</span>
          </label>
          <Select
            isMulti
            options={availableQuickOptions}
            isSearchable={false}
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
            isSearchable={false}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Save')} Service Area
        </Button>
      </form>
    </Card>
  );
};

export default ServiceAreaForm;