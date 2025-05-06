import React, { useState } from 'react';
import { Typography, Button, IconButton } from '@material-tailwind/react';
import ServiceAreaForm from '../ServiceAreaForm';
import GoogleMapDrawing from '../../../components/GoogleMapDrawing';

const ServiceAreasTab = ({
  showForm,
  setShowForm,
  selectedPolygon,
  setSelectedPolygon,
  handlePolygonComplete,
  handleServiceAreaSave,
  serviceAreas,
  selectedItem,
  setSelectedItem,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showDrawingManager, setShowDrawingManager] = useState(false);

  const handleCreateNew = () => {
    setIsCreating(true);
    setShowForm(true);
    setSelectedPolygon(null);
    setSelectedItem(null);
    // Delay showing drawing manager to ensure map is loaded
    setTimeout(() => setShowDrawingManager(true), 500);
  };

  const handleCancel = () => {
    setShowDrawingManager(false);
    setIsCreating(false);
    setShowForm(false);
    setSelectedPolygon(null);
    setSelectedItem(null);
  };

  const handleSave = (formData) => {
    handleServiceAreaSave(formData);
    setShowDrawingManager(false);
    setIsCreating(false);
  };

  const handleEdit = (area) => {
    setSelectedItem(area);
    setShowForm(true);
    // Delay showing drawing manager to ensure map is loaded
    setTimeout(() => setShowDrawingManager(true), 500);
  };

  // Show create/edit form with map
  if (isCreating || selectedItem) {
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5">
            {selectedItem ? 'Edit Service Area' : 'Create New Service Area'}
          </Typography>
          <Button
            color="red"
            variant="text"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
        <div className="mb-6">
          <Typography variant="small" color="gray" className="mb-2">
            Draw a polygon on the map to define your service area boundaries
          </Typography>
          <div className="h-[500px] w-full">
            <GoogleMapDrawing
              onPolygonComplete={handlePolygonComplete}
              existingPolygons={serviceAreas.map(area => area.coordinates)}
              showDrawingManager={showDrawingManager}
              mapHeight="500px"
            />
          </div>
        </div>
        {showForm && (
          <ServiceAreaForm
            onSave={handleSave}
            initialData={selectedItem}
          />
        )}
      </div>
    );
  }

  // Show list view by default
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5">Service Areas</Typography>
        <Button
          color="blue"
          onClick={handleCreateNew}
        >
          Create New Service Area
        </Button>
      </div>
      
      {serviceAreas.length === 0 ? (
        <div className="text-center py-8 bg-blue-gray-50/30 rounded-lg">
          <Typography color="gray" className="font-medium">
            No service areas defined yet
          </Typography>
          <Typography color="gray" variant="small" className="mt-1">
            Click 'Create New Service Area' to get started
          </Typography>
        </div>
      ) : (
        <div className="grid gap-4">
          {serviceAreas.map((area, index) => (
            <div 
              key={index} 
              className="p-4 border border-blue-gray-100 rounded-lg hover:border-blue-gray-200 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Typography variant="h6" color="blue-gray">
                    {area.name}
                  </Typography>
                  {area.description && (
                    <Typography variant="small" color="gray" className="mt-1">
                      {area.description}
                    </Typography>
                  )}
                </div>
                <IconButton
                  color="blue"
                  variant="text"
                  onClick={() => handleEdit(area)}
                >
                  Edit
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceAreasTab; 