import React, { useEffect, useRef, useState, useCallback } from 'react';
import getThemeColors from '@/theme/colors';
import { useLoadScript, GoogleMap, DrawingManager, Polygon } from '@react-google-maps/api';

// Keep libraries array static outside component
const LIBRARIES = ['drawing', 'geometry'];

// Default center (Chennai)
const defaultCenter = { lat: 12.9324523, lng: 79.1377447 };

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '8px'
};

const mapOptions = {
  zoomControl: true,
  mapTypeControl: true,
  mapTypeControlOptions: {
    style: 1, // Default (dropdown menu), or set to 2 for horizontal bar
    position: 3, // TOP_RIGHT (can adjust as needed)
  },
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  draggableCursor: 'crosshair'
};

const drawingManagerOptions = {
  drawingControl: true,
  drawingControlOptions: {
    position: 2, // TOP_CENTER
    drawingModes: ['polygon']
  },
  polygonOptions: {
  fillColor: getThemeColors().mapFill,
    fillOpacity: 0.4,
    strokeWeight: 2,
  strokeColor: getThemeColors().mapStroke,
    clickable: true,
    editable: true,
    draggable: true,
    zIndex: 1
  }
};

const GoogleMapDrawing = ({
  center = defaultCenter,
  zoom = 12,
  existingPolygons = [],
  onPolygonComplete,
  onPolygonUpdate,
  onPolygonDelete,
  mapHeight = '500px',
  showDrawingManager = false
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
    version: "weekly"
  });

  const [map, setMap] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const drawingManagerRef = useRef(null);
  const polygonRefs = useRef([]);

  const onLoadDrawingManager = useCallback((drawingMgr) => {
    console.log('Drawing manager loaded');
    drawingManagerRef.current = drawingMgr;
  }, []);

  const onUnmountDrawingManager = useCallback(() => {
    console.log('Drawing manager unmounted');
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setMap(null);
    }
    drawingManagerRef.current = null;
  }, []);

  const onMapLoad = useCallback((map) => {
    setMap(map);
    map.setCenter(defaultCenter);
    
  }, []);

  useEffect(() => {
    if (map) {
      setIsMapLoaded(true);
    }
  }, [map]);

  const handlePolygonComplete = useCallback((polygon) => {
    console.log('Polygon completed');
    
    // Get the underlying Google Maps polygon instance
    const nativePolygon = polygon;
    if (!nativePolygon) {
      console.error('Could not access polygon instance');
      return;
    }

    const path = nativePolygon.getPath();
    const coordinates = path.getArray().map(coord => ({
      lat: coord.lat(),
      lng: coord.lng()
    }));
    
    if (onPolygonComplete) {
      onPolygonComplete(coordinates);
    }

    // Reset drawing mode
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null);
    }
  }, [onPolygonComplete]);

  // Add handlers for polygon path updates
  const handlePolygonPathChange = useCallback((polygon, index) => {
    console.log('Polygon path changed');
    
    // Get the underlying Google Maps polygon instance
    const nativePolygon = polygon;
    if (!nativePolygon) {
      console.error('Could not access polygon instance');
      return;
    }

    const path = nativePolygon.getPath();
    const coordinates = path.getArray().map(coord => ({
      lat: coord.lat(),
      lng: coord.lng()
    }));
    
    console.log('Updated coordinates:', coordinates);
    if (onPolygonUpdate) {
      onPolygonUpdate(coordinates, index);
    }
  }, [onPolygonUpdate]);

  // Add handlers for polygon deletion
  const handlePolygonDelete = useCallback((index) => {
    if (onPolygonDelete) {
      onPolygonDelete(index);
    }
  }, [onPolygonDelete]);

  // Effect to handle drawing manager visibility
  useEffect(() => {
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setMap(showDrawingManager ? map : null);
    }
  }, [showDrawingManager, map]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setMap(null);
        drawingManagerRef.current = null;
      }
    };
  }, []);

  if (loadError) {
    return (
      <div className="h-[500px] w-full flex items-center justify-center bg-red-50 rounded-lg">
        <div className="text-red-500 text-center px-4">
          <div className="font-medium mb-2">Error Loading Maps</div>
          <div className="text-sm">Failed to load Google Maps. Please check your API key and internet connection.</div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[500px] w-full flex items-center justify-center bg-blue-gray-50/30 rounded-lg">
        <div className="text-blue-gray-500 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-gray-500 mx-auto mb-4"></div>
          <div>Loading Google Maps...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showDrawingManager && (
        <div className="bg-blue-gray-50 p-3 rounded-lg text-sm text-blue-gray-700">
          <p className="font-medium">Drawing Instructions:</p>
          <ol className="list-decimal ml-4 mt-1 space-y-1">
            <li>Click the polygon icon in the toolbar at the top of the map</li>
            <li>Click on the map to start drawing your polygon</li>
            <li>Continue clicking to add more points</li>
            <li>Click the first point again to complete the polygon</li>
          </ol>
        </div>
      )}
      <div style={{ height: mapHeight }} className="w-full relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          options={mapOptions}
          onLoad={onMapLoad}
        >
         {isMapLoaded && <DrawingManager
            onLoad={onLoadDrawingManager}
            onUnmount={onUnmountDrawingManager}
            options={drawingManagerOptions}
            onPolygonComplete={handlePolygonComplete}
          />}
          
          {isMapLoaded && existingPolygons.map((polygonCoords, index) => (
            <Polygon
              key={index}
              path={polygonCoords}
              options={{...drawingManagerOptions.polygonOptions}}
              onLoad={polygon => {
                polygonRefs.current[index] = polygon;
              }}
              onMouseUp={() => {
                if (polygonRefs.current[index]) {
                  handlePolygonPathChange(polygonRefs.current[index], index);
                }
              }}
              onDragEnd={() => {
                if (polygonRefs.current[index]) {
                  handlePolygonPathChange(polygonRefs.current[index], index);
                }
              }}
              onChange={() => {
                if (polygonRefs.current[index]) {
                  handlePolygonPathChange(polygonRefs.current[index], index);
                }
              }}
              onRightClick={() => handlePolygonDelete(index)}
            />
          ))}
        </GoogleMap>
        
      </div>
    </div>
  );
};

export default GoogleMapDrawing; 