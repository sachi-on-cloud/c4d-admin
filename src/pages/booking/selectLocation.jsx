import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Input,
    Button,
    List,
    ListItem,
    Typography,
} from "@material-tailwind/react";
import { IoLocationOutline, IoLocationSharp } from "react-icons/io5";
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { API_ROUTES } from "../../utils/constants";
import { ApiRequestUtils } from "../../utils/apiRequestUtils";

const LocationInput = ({ value, onChange, onSelect, placeholder, suggestions }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative">
            <Input
                type="text"
                icon={<IoLocationOutline />}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="pr-10"
            />
            {isFocused && suggestions.length > 0 && (
                <List className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                        <ListItem
                            key={index}
                            onClick={() => onSelect(suggestion)}
                            className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                        >
                            <Typography variant="small">{suggestion}</Typography>
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    );
};

const SelectLocation = () => {
    const [pickupAddress, setPickupAddress] = useState('');
    const [dropAddress, setDropAddress] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [pickupLocation, setPickupLocation] = useState(null);
    const [dropLocation, setDropLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 12.906374, lng: 80.226452 });
    const [mapZoom, setMapZoom] = useState(2);
    const mapRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const paramsPassed = location.state;

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "GOOGLE_API_KEY"
    });
    console.log('SELECT LOCATION - paramsPassed :', paramsPassed);
    useEffect(() => {
        if (pickupLocation && dropLocation) {
            fitBoundsToMarkers();
        } else if (pickupLocation || dropLocation) {
            const location = pickupLocation || dropLocation;
            setMapCenter(location);
            setMapZoom(15);
        }
    }, [pickupLocation, dropLocation]);

    const fitBoundsToMarkers = () => {
        if (mapRef.current && pickupLocation && dropLocation) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(pickupLocation);
            bounds.extend(dropLocation);
            mapRef.current.fitBounds(bounds);

            // Optional: Add some padding to the bounds
            const padding = { top: 100, right: 100, bottom: 100, left: 100 }; // Adjust as needed
            mapRef.current.panToBounds(bounds, padding);
        }
    };

    const searchLocations = async (query) => {
        if (query.length > 2) {
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.SEARCH_ADDRESS, {
                address: query
            });
            if (data?.success && data?.data) {
                setSuggestions(data.data);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectLocation = async (address, isPickup) => {
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_LATLONG, {
            address
        });
        if (data?.success) {
            const location = {
                lat: data.data.lat,
                lng: data.data.lng
            };
            if (isPickup) {
                setPickupAddress(address);
                setPickupLocation(location);
            } else {
                setDropAddress(address);
                setDropLocation(location);
            }
        }
        setSuggestions([]);
    };

    const onPressHandler = async () => {
        if (!pickupLocation) {
            alert("Please select a pickup location");
            return;
        }
        const apiReqBody = {
            bookingId: paramsPassed?.bookingId,
            pickupLat: pickupLocation.lat,
            pickupLong: pickupLocation.lng,
            pickupAddress: {
                name: pickupAddress,
            },
            dropLat: dropLocation?.lat,
            dropLong: dropLocation?.lng,
            dropAddress: dropLocation ? {
                name: dropAddress
            } : null
        };
        console.log('apiReqBody:', apiReqBody);
        const data = await ApiRequestUtils.update(API_ROUTES.ADD_LOCATION, apiReqBody);
        if (data?.success) {
            navigate('/dashboard/confirm-booking', { state: { 'bookingId': paramsPassed?.bookingId } });
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            <div className="p-4 space-y-4">
                <LocationInput
                    value={pickupAddress}
                    onChange={(value) => {
                        setPickupAddress(value);
                        searchLocations(value);
                    }}
                    onSelect={(address) => handleSelectLocation(address, true)}
                    placeholder="Enter pickup location"
                    suggestions={suggestions}
                />
                <LocationInput
                    value={dropAddress}
                    onChange={(value) => {
                        setDropAddress(value);
                        searchLocations(value);
                    }}
                    onSelect={(address) => handleSelectLocation(address, false)}
                    placeholder="Enter drop location (Optional)"
                    suggestions={suggestions}
                />
            </div>

            <div className="flex-1">
                {isLoaded && (
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={mapCenter}
                        zoom={mapZoom}
                        onLoad={(map) => {
                            mapRef.current = map;
                        }}
                    >
                        {pickupLocation && (
                            <Marker
                                position={pickupLocation}
                                icon={{
                                    url: '/img/Pickup-Location.png',
                                    scaledSize: new window.google.maps.Size(40, 40),
                                }}
                            />
                        )}
                        {dropLocation && (
                            <Marker
                                position={dropLocation}
                                icon={{
                                    url: '/img/Drop-Location.png',
                                    scaledSize: new window.google.maps.Size(40, 40)
                                }}
                            />
                        )}
                    </GoogleMap>
                )}
            </div>

            <div className="p-4">
                <Button
                    fullWidth
                    color="black"
                    onClick={onPressHandler}
                    disabled={!pickupLocation}
                >
                    Confirm & Search
                </Button>
            </div>
        </div>
    );
};

export default SelectLocation;