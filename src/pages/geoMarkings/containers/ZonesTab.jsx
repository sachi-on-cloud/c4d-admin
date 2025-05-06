import React from 'react';
import { Typography, Button, IconButton } from '@material-tailwind/react';
import GoogleMapDrawing from '../../../components/GoogleMapDrawing';
import ZoneForm from '../ZoneForm';

const ZonesTab = ({
  showForm,
  setShowForm,
  selectedPolygon,
  setSelectedPolygon,
  handlePolygonComplete,
  handleZoneSave,
  zones,
  selectedItem,
  setSelectedItem,
}) => {
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h5">Zones</Typography>
        <Button
          color="blue"
          onClick={() => {
            setShowForm(false);
            setSelectedPolygon(null);
          }}
        >
          Draw New Zone
        </Button>
      </div>
      <div className="h-[500px] w-full mb-4">
        <GoogleMapDrawing
          onPolygonComplete={handlePolygonComplete}
          existingPolygons={zones.map(zone => zone.coordinates)}
          drawingMode="polygon"
          mapHeight="500px"
        />
      </div>
      {showForm && (
        <ZoneForm
          onSave={handleZoneSave}
          initialData={selectedItem}
        />
      )}
      <div className="mt-4">
        {zones.map((zone, index) => (
          <div key={index} className="p-4 border rounded-lg mb-2 flex justify-between items-center">
            <div>
              <Typography>{zone.name}</Typography>
              <Typography variant="small" color="gray">
                Min Surcharge: ${zone.minimumSurcharge} | Trip Surcharge: {zone.tripAmountSurcharge}%
                {zone.offTimeSurcharge && ` | Off-Time: ${zone.offTimeSurcharge}`}
              </Typography>
              <Typography variant="small" color="gray">
                {zone.offTimeStart && zone.offTimeEnd && 
                  `Off-Time Hours: ${zone.offTimeStart} - ${zone.offTimeEnd}`}
              </Typography>
            </div>
            <div>
              <IconButton
                color="blue"
                onClick={() => {
                  setSelectedItem(zone);
                  setShowForm(true);
                }}
              >
                Edit
              </IconButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZonesTab; 