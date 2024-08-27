import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Input,
    Button,
    List,
    ListItem,
    Typography,
} from "@material-tailwind/react";
import { IoLocationOutline } from "react-icons/io5";
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
            {suggestions.length > 0 && (
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

const SelectLocation = (props) => {
    const [pickupAddress, setPickupAddress] = useState('');
    const [dropAddress, setDropAddress] = useState('');
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropSuggestions, setDropSuggestions] = useState([]);
    const [pickupLocation, setPickupLocation] = useState(null);
    const [dropLocation, setDropLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 12.906374, lng: 80.226452 });
    const [mapZoom, setMapZoom] = useState(2);
    const mapRef = useRef(null);
    const [editBooking, setEditBooking] = useState(props.editBooking);

    const navigate = useNavigate();
    const location = useLocation();
    const paramsPassed = location.state;

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyBophy4_QEc4vRjYu222kNHtuNiDga29Uo"
    });
    useEffect(() => {
        if (pickupLocation && dropLocation) {
            fitBoundsToMarkers();
        } else if (pickupLocation || dropLocation) {
            const location = pickupLocation || dropLocation;
            setMapCenter(location);
            setMapZoom(15);
        }
    }, [pickupLocation, dropLocation]);
    useEffect(() => {
        if (editBooking) {
            if (editBooking?.pickupLat && editBooking?.pickupLong) {
                console.log(editBooking?.pickupAddres);
                setPickupAddress(editBooking?.pickupAddress?.name);
                setPickupLocation({
                    lat: editBooking?.pickupLat,
                    lng: editBooking?.pickupLong
                });
            }
            if (editBooking?.dropLat && editBooking?.dropLong) {
                let location = {
                    lat: editBooking?.dropLat,
                    lng: editBooking?.dropLong
                };
                setDropAddress(editBooking?.dropAddress?.name);
                setDropLocation(location);
            }
        }
    }, [editBooking])
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

    const searchLocations = async (query, val) => {
        if (query.length > 2) {
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.SEARCH_ADDRESS, {
                address: query
            });
            if (data?.success && data?.data) {
                if (val) {
                    setPickupSuggestions(data?.data)
                } else {
                    setDropSuggestions(data?.data);
                }
            }
        } else {
            setPickupSuggestions([]);
            setDropSuggestions([]);
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
        setPickupSuggestions([]);
        setDropSuggestions([]);
    };

    const onPressHandler = async () => {
        if (!pickupLocation) {
            alert("Please select a pickup location");
            return;
        }
        const apiReqBody = {
            bookingId: props?.bookingId,
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
        //console.log('apiReqBody:', apiReqBody);
        const data = await ApiRequestUtils.update(API_ROUTES.ADD_LOCATION, apiReqBody, props?.customerId);
        if (data?.success) {
            props?.onNext(1);
        }
    };

    const handlePickupMarkerDragEnd = useCallback((event) => {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        setPickupLocation({ lat: newLat, lng: newLng });

        // Fetch the address using Geocoding API
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                setPickupAddress(results[0].formatted_address);
            } else {
                setPickupAddress('Address not found');
            }
        });
    }, []);

    const handleDropMarkerDragEnd = useCallback((event) => {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        setDropLocation({ lat: newLat, lng: newLng });

        // Fetch the address using Geocoding API
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                setDropAddress(results[0].formatted_address);
            } else {
                setDropAddress('Address not found');
            }
        });
    }, []);

    return (
        <div className="flex flex-col h-screen bg-white w-full my-4">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Select Location</h1>
            </div>
            <div className="p-2 space-y-4">
                <LocationInput
                    value={pickupAddress}
                    onChange={(value) => {
                        setPickupAddress(value);
                        searchLocations(value, true);
                    }}
                    onSelect={(address) => handleSelectLocation(address, true)}
                    placeholder={props.serviceType !== 'CAR_WASH' ? "Enter pickup location" : "Enter location"}
                    suggestions={pickupSuggestions}
                />
                {props.serviceType !== 'CAR_WASH' && <LocationInput
                    value={dropAddress}
                    onChange={(value) => {
                        setDropAddress(value);
                        searchLocations(value, false);
                    }}
                    onSelect={(address) => handleSelectLocation(address, false)}
                    placeholder="Enter drop location (Optional)"
                    suggestions={dropSuggestions}
                />}
            </div>

            <div className="flex-1">
                {isLoaded && (
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '75%' }}
                        center={mapCenter}
                        zoom={mapZoom}
                        onLoad={(map) => {
                            mapRef.current = map;
                        }}
                    >
                        {pickupLocation && (
                            <Marker
                                position={pickupLocation}
                                draggable={true}
                                icon={{
                                    url: '/img/Pickup-Location.png',
                                    scaledSize: new window.google.maps.Size(40, 40),
                                }}
                                onDragEnd={handlePickupMarkerDragEnd}
                            />
                        )}
                        {dropLocation && (
                            <Marker
                                position={dropLocation}
                                draggable={true}
                                icon={{
                                    url: '/img/Drop-Location.png',
                                    scaledSize: new window.google.maps.Size(40, 40)
                                }}
                                onDragEnd={handleDropMarkerDragEnd}
                            />
                        )}
                    </GoogleMap>
                )}
            </div>
            {/* <div className='flex flex-row'>
                <Button
                    fullWidth
                    onClick={() => {
                        props?.onPrev()
                    }}
                    className='my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl'
                >
                    Prev
                </Button>
                <Button
                    fullWidth
                    color="black"
                    onClick={onPressHandler}
                    disabled={!pickupLocation}
                    className='my-6 mx-2 rounded-xl'
                >
                    Next
                </Button>
            </div> */}
        </div>
    );
};

export default SelectLocation;
