import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Button, Card, Typography, CircularProgress, Spinner } from "@material-tailwind/react";
import { Formik, Field, ErrorMessage } from 'formik';
import { Utils } from '../../utils/utils';
import moment from 'moment';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import SearchableDropdown from '@/components/SearchableDropdown';
import DistanceExceedModal from '@/components/DistanceExceedModal';

const EditBooking = (props) => {
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState(null);
    const [packageTypeSelectedData, setPackageTypeSelectedData] = useState([]);
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropSuggestions, setDropSuggestions] = useState([]);
    const [mapCenter, setMapCenter] = useState({ lat: 12.906374, lng: 80.226452 });
    const [mapZoom, setMapZoom] = useState(10);
    const [pickupLocation, setPickupLocation] = useState(null);
    const [dropLocation, setDropLocation] = useState(null);
    const mapRef = useRef(null);
    const [quoteDetails, setQuoteDetails] = useState(null);
    const [customerData, setCustomerData] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerNumber, setCustomerNumber] = useState('');
    const [serviceAreas, setServiceAreas] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedAreaId, setSelectedAreaId] = useState(null);
    const [currentServiceType, setCurrentServiceType] = useState('');
    const [discountDetails, setDiscountDetails] = useState(null);
    const [driverSuggestions, setDriverSuggestions] = useState([]);
    const [distanceExceedModal, setDistanceExceedModal] = useState(false);
    const [cityLimitExceedModal, setCityLimitExceedModal] = useState(false);
    const [zoneErrorModal, setZoneErrorModal] = useState({ show: false, text: '', title: '' });
    const [dropTaxiDistanceExceedModal, setDropTaxiDistanceExceedModal] = useState(false);
    const [driverPickUpLocation, setDriverPickUpLocation] = useState(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [serviceAreaLoading, setServiceAreaLoading] = useState(false);
    const [packagesLoading, setPackagesLoading] = useState(false);
    const [premiumServicesMap, setPremiumServicesMap] = useState({})

    const fetchData = async () => {
    try {
        const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_ALL_CUSTOMERS, {
            forSearch: true
        });
        setCustomerData(response.data);
    } catch (error) {
        console.error('Error fetching customer data:', error);
    }
};

    const fetchGeoData = async () => {
        try {
            setServiceAreaLoading(true);
            const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST, {});
            const filteredAreas = response.data.filter((area) => area.type === 'Service Area');
            setServiceAreas(filteredAreas);
            if (response.premiumServices) {
      setPremiumServicesMap(response.premiumServices);
      console.log("Premium Services Map Loaded:", response.premiumServices);
    }
        } catch (error) {
            console.error('Error fetching GEO_MARKINGS_LIST:', error);
        } finally {
            setServiceAreaLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
        fetchGeoData();
        if (props.bookingData) {
            getBookingDetailsById(props.bookingData.id, props.bookingData.customerId);
        }
    }, [props.bookingData]);

    useEffect(() => {
        if (selectedAreaId) {
            const selectedArea = serviceAreas.find((area) => area.id === parseInt(selectedAreaId));
            const newServices = selectedArea ? selectedArea.services : [];
            setServices(newServices);
            setCurrentServiceType('');
        } else {
            setServices([]);
            setCurrentServiceType('');
        }
    }, [selectedAreaId, serviceAreas]);

useEffect(() => {
    if (bookingData?.customerId) {
        setSelectedCustomer(bookingData.customerId);
        const customer = customerData.find(c => c.id === bookingData.customerId);
        if (customer) {
            setCustomerNumber(customer.phoneNumber || '');
        }
    }
}, [bookingData, customerData]);

    useEffect(() => {
        if (props.bookingData) {
            getBookingDetailsById(props.bookingData.id, props.bookingData.customerId);
        }
    }, [props.bookingData]);

    const getBookingDetailsById = async(bookingId, customerId) =>{
        try{
            const data = await ApiRequestUtils.get(API_ROUTES.GET_CONFIRMATION_BOOKING_BY_ID + "/" + bookingId, customerId);
        if(data.success){
            setBookingData(data?.data);
                // console.log("dtaaa", data?.data)
            }
        }
        catch{
                console.error('loader is not working')
            }
            finally {
            setLoading(false);
        }
    };

    const getPackageListDetails = useCallback(async (serviceType, zone) => {
        try {
            setPackagesLoading(true);
            const serviceTypeMap = {
                'RENTAL_DROP_TAXI': 'RENTAL',
                'RENTAL_HOURLY_PACKAGE': 'RENTAL',
            };
            const mappedServiceType = serviceTypeMap[serviceType] || serviceType;

            if (!['DRIVER', 'RENTAL', 'RIDES'].includes(mappedServiceType)) {
                console.error('Invalid serviceType:', mappedServiceType);
                setPackageTypeSelectedData([]);
                return;
            }

            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.ZONE_PACKAGE_LIST, {
                serviceType: mappedServiceType,
                zone: zone || '',
            });

            if (data?.success && Array.isArray(data?.data)) {
                setPackageTypeSelectedData(data?.data);
            } else {
                console.error('Failed to fetch package list or data is not an array:', data?.message || 'No message provided');
                setPackageTypeSelectedData([]);
            }
        } catch (error) {
            console.error('Error fetching package list:', error.message || error);
            setPackageTypeSelectedData([]);
        } finally {
            setPackagesLoading(false);
        }
    }, []);

    const getQuoteOutstationDetails = async (values) => {
        const zoneData = await zoneCheckUpFun(values);
        let actualZone = '';
        if (zoneData.success && zoneData.serviceArea) {
            actualZone = zoneData.serviceArea.name;
        } else {
            console.error('Error getting zone for outstation');
            actualZone = serviceAreas.find(area => area.id === parseInt(selectedAreaId))?.name || '';
        }

        const serviceTypeMap = {
            'RENTAL_DROP_TAXI': 'RENTAL',
            'RENTAL_HOURLY_PACKAGE': 'RENTAL',
        };
        const mappedServiceType = serviceTypeMap[values?.serviceType] || values?.serviceType;
        const quoteData = {
            serviceType: values?.serviceType == "RENTAL_DROP_TAXI" ? 'RENTAL' : values?.serviceType || mappedServiceType,
            bookingType: values?.tripType?.toUpperCase(),
            packageType: 'Outstation',
            fromDate: moment(`${values?.rideDate} ${values?.rideTime}`, "YYYY-MM-DD HH:mm:ss").toISOString(),
            toDate: moment(`${values?.toDate} ${values?.toTime}`, "YYYY-MM-DD HH:mm:ss").toISOString(),
            carType: values?.carType != "Sedan" ? values?.carType.toUpperCase() : values?.carType,
            pickupLat: values?.pickupLocation?.lat ? values?.pickupLocation?.lat : bookingData?.pickupLat,
            pickupLong: values?.pickupLocation?.lng ? values?.pickupLocation?.lng : bookingData?.pickupLong,
            driverStartLat: values?.driverPickUpLocation?.lat,
            driverStartLong: values?.driverPickUpLocation?.lng,
            dropLat: values?.dropLocation?.lat ? values?.dropLocation?.lat : bookingData?.dropLat,
            dropLong: values?.dropLocation?.lng ? values?.dropLocation?.lng : bookingData?.dropLong,
            acType: values?.acType?.toUpperCase(),
            zone: actualZone,
            driverStartLat: values.driverPickUpLocation?.lat,
            driverStartLong: values.driverPickUpLocation?.lng,
            driverStartAddress: {
                name: values.driverPickUpAddress,
            },
            isPremiumService : values?.isPremiumService ? true : false
        };
        if (values?.serviceType === 'RENTAL_DROP_TAXI') {
            quoteData.serviceFor = 'RENTAL';
        }
        else if (values?.serviceType === 'RENTAL') {
            quoteData.serviceFor = 'RENTAL';
        }
        else if (values?.serviceType === 'DRIVER') {
            quoteData.serviceFor = 'DRIVER';
        }
        const data = await ApiRequestUtils.post(API_ROUTES.GET_QUOTE_OUTSTATION, quoteData);
        // console.log("QOYTEE DATA", data);
        if (data.success) {
            setQuoteDetails(data?.data);
            setDiscountDetails(data?.data);
        }
    };
    const initialValues = {
        serviceType: bookingData?.serviceType || '',
        packageTypeSelected: bookingData?.packageType || '',
        tripType: bookingData?.bookingType == "DROP ONLY" ? "Drop Only" : "Round Trip" || '',
        transmissionType : bookingData?.transmissionType || '',
        packageSelected: bookingData?.packageId ? bookingData?.packageId : '',
        customerId: bookingData?.customerId ? bookingData?.customerId : '',
        carType: bookingData?.carType ? bookingData?.carType : '',
        pickupAddress: bookingData?.pickupAddress?.name || '',
        dropAddress: bookingData?.dropAddress?.name || '',
        rideDate: bookingData?.fromDate ? moment(bookingData.fromDate).format('YYYY-MM-DD') : '',
        rideTime: bookingData?.fromDate ? moment(bookingData.fromDate).format('HH:mm') : '',
        toDate: bookingData?.toDate ? moment(bookingData.toDate).format('YYYY-MM-DD') : '',
        toTime: bookingData?.toDate ? moment(bookingData.toDate).format('HH:mm') : '',
        acType: bookingData?.acType?.toUpperCase(),
        zone: bookingData?.zone || '',
        driverPickUpAddress: bookingData?.driverStartAddress?.name || '',
        driverPickUpLocation: bookingData?.driverStartLat && bookingData?.driverStartLong ? {
            lat: bookingData.driverStartLat,
            lng: bookingData.driverStartLong
        } : null,
        luggage: '',
        seaterCapacity: '',
        sourceType: bookingData?.sourceType || '',
        isPremiumService : bookingData?.isPremiumService || false,
    };



    const getQuoteRides = async (values, setFieldValue) => {
        let checkDistance = true;
        let checkCityLimit = true;

        if (values.serviceType === 'RIDES') {
            checkDistance = await calculateDistance(values);
            checkCityLimit = await calcluateCityLimit(values);
        } else if (values.serviceType === 'RENTAL_DROP_TAXI') {
            checkDistance = await calculateDistance(values);
        }

        if (!checkDistance) {
            if (values.serviceType === 'RIDES') {
                setDistanceExceedModal(true);
            } else if (values.serviceType === 'RENTAL_DROP_TAXI') {
                setDropTaxiDistanceExceedModal(true);
            }
            setFieldValue?.('pickupAddress', '');
            setFieldValue?.('dropAddress', '');
            setIsButtonDisabled(false);
            return;
        } else if (!checkCityLimit) {
            setCityLimitExceedModal(true);
            setFieldValue?.('pickupAddress', '');
            setFieldValue?.('dropAddress', '');
            setIsButtonDisabled(false);
            return;
        }

        const serviceTypeMap = {
            'RENTAL_DROP_TAXI': 'RENTAL',
            'RENTAL_HOURLY_PACKAGE': 'RENTAL',
        };
        const mappedServiceType = serviceTypeMap[values.serviceType] || values.serviceType;

        let actualZone = serviceAreas.find(area => area.id === parseInt(selectedAreaId))?.name || '';

        const zoneData = await zoneCheckUpFun(values);
        if (!zoneData.success || !zoneData.serviceArea) {
            setZoneErrorModal({ show: true, text: zoneData.error || 'Service not available in this area.', title: zoneData.title || 'Oops!' });
            setFieldValue?.('pickupAddress', '');
            setIsButtonDisabled(false);
            return;
        }

        actualZone = zoneData.serviceArea.name;

        const quoteDate = {
            serviceType: values.serviceType === 'RENTAL_HOURLY_PACKAGE' ? 'RENTAL' : values.serviceType || mappedServiceType,
            bookingType: '',
            serviceFor: values.serviceType === 'RENTAL_HOURLY_PACKAGE' ? 'RENTAL_HOURLY_PACKAGE' : values.serviceType,
            packageType: 'Local',
            fromDate: moment(`${values?.rideDate} ${values?.rideTime}`, "YYYY-MM-DD HH:mm:ss").toISOString(),
            carType: values.carType || '',
            period: values.serviceType === 'RENTAL_HOURLY_PACKAGE' ? packageTypeSelectedData.find(pkg => pkg.id === Number(values.packageSelected))?.period || '' : '',
            pickupLat: values?.pickupLocation?.lat ? values?.pickupLocation?.lat : bookingData?.pickupLat,
            pickupLong: values?.pickupLocation?.lng ? values?.pickupLocation?.lng : bookingData?.pickupLong,
            dropLat: values?.dropLocation?.lat ? values?.dropLocation?.lat : bookingData?.dropLat,
            dropLong: values?.dropLocation?.lng ? values?.dropLocation?.lng : bookingData?.dropLong,
            zone: actualZone,
            // driverLat: values?.driverPickUpLocation?.lat,
            // driverLong: values?.driverPickUpLocation?.lng,
            driverStartLat: values.driverPickUpLocation?.lat,
            driverStartLong: values.driverPickUpLocation?.lng,
            driverStartAddress: {
                name: values.driverPickUpAddress,
            },
            isPremiumService : values?.isPremiumService ? true : false
            
        };
        const data = await ApiRequestUtils.post(API_ROUTES.GET_QUOTE_OUTSTATION, quoteDate);
        if (data?.success) {
            setQuoteDetails(data?.data);
            setDiscountDetails(data?.data);
        }
    };

    useEffect(() => {
        if (!selectedAreaId || !currentServiceType) {
            setPackageTypeSelectedData([]);
            return;
        }
        const selectedArea = serviceAreas.find((area) => area.id === parseInt(selectedAreaId));
        const zone = selectedArea ? selectedArea.name : '';
        getPackageListDetails(currentServiceType, zone);
    }, [selectedAreaId, currentServiceType, getPackageListDetails, serviceAreas]);

    useEffect(() => {
        if (bookingData && serviceAreas.length > 0) {
            setCurrentServiceType(bookingData.serviceType);
            // Set initial service area if available from booking data
            const bookingZone = bookingData.zone;
            if (bookingZone) {
                const area = serviceAreas.find(area => area.name === bookingZone);
                if (area) {
                    setSelectedAreaId(area.id);
                }
            }
            // Set driver pickup location if available
            if (bookingData.driverStartLat && bookingData.driverStartLong) {
                setDriverPickUpLocation({
                    lat: bookingData.driverStartLat,
                    lng: bookingData.driverStartLong
                });
            }
        }
    }, [bookingData, serviceAreas]);

    const zoneCheckUpFun = async (val) => {
        const serviceTypeMap = {
            'RIDES': 'RIDES',
            'RENTAL_DROP_TAXI': 'RENTAL',
            'RENTAL_HOURLY_PACKAGE': 'RENTAL',
        };
        const mappedServiceType = serviceTypeMap[val.serviceType] || val.serviceType;

        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.ZONE_PACKAGE_LIST, {
            serviceType: mappedServiceType,
            lat: val.pickupLocation?.lat || bookingData?.pickupLat,
            long: val.pickupLocation?.lng || bookingData?.pickupLong,
        });
        return data;
    };

    const calculateDistance = async (values) => {
        let calculateDistance = await ApiRequestUtils.getWithQueryParam(API_ROUTES.DISTANCE_CHECKING, {
            pickupLat: values.pickupLocation?.lat || bookingData?.pickupLat,
            pickupLong: values.pickupLocation?.lng || bookingData?.pickupLong,
            dropLat: values?.dropLocation?.lat || bookingData?.dropLat,
            dropLong: values?.dropLocation?.lng || bookingData?.dropLong,
            serviceType: values.serviceType === 'RENTAL_DROP_TAXI' ? "RENTAL" : values.serviceType,
        });

        if (calculateDistance?.success) {
            if (values.serviceType === "RIDES") {
                return calculateDistance?.data?.showAlert;
            } else if (values.serviceType === 'RENTAL_DROP_TAXI') {
                const distance = calculateDistance?.data?.estimatedDistance || 0;
                return distance <= 300;
            }
        }
        // For other service types (like RENTAL_HOURLY_PACKAGE), return true to skip distance check
        return true;
    };

    const calcluateCityLimit = async (values) => {
        let calculateDistance = await ApiRequestUtils.getWithQueryParam(API_ROUTES.CITY_LIMIT_CHECKING, {
            pickupLat: values.pickupLocation?.lat || bookingData?.pickupLat,
            pickupLong: values.pickupLocation?.lng || bookingData?.pickupLong,
            dropLat: values?.dropLocation?.lat || bookingData?.dropLat,
            dropLong: values?.dropLocation?.lng || bookingData?.dropLong,
        });
        if (calculateDistance?.success) {
            return calculateDistance?.cityLimit;
        }
        return false;
    };
    const searchLocations = async (query, isPickup, type) => {
        if (query.length > 2) {
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.SEARCH_ADDRESS, { address: query });
            if (data?.success && data?.data) {
                if (isPickup) {
                    setPickupSuggestions(data?.data);
                } else if (type === 'driver') {
                    setDriverSuggestions(data?.data);
                }
                else {
                    setDropSuggestions(data?.data);
                }
            }
        } else {
            setPickupSuggestions([]);
            setDriverSuggestions([]);
            setDropSuggestions([]);
        }
    };

    const handleSelectLocation = async (address, isPickup, type, setFieldValue, values) => {
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_LATLONG, { address });
        if (data?.success) {
            const location = { lat: data.data.lat, lng: data.data.lng };
            if (isPickup) {
                setFieldValue("pickupAddress", address);
                setFieldValue("pickupLocation", location);
                setPickupLocation(location);
                setPickupSuggestions([]);

                // Automatic service area detection for pickup location
                if (values && values.serviceType) {
                    const zoneData = await zoneCheckUpFun({
                        serviceType: values.serviceType || currentServiceType,
                        pickupLocation: location
                    });
                    if (zoneData.success && zoneData.serviceArea) {
                        const newArea = serviceAreas.find(area => area.name === zoneData.serviceArea.name);
                        if (newArea && newArea.id !== parseInt(selectedAreaId)) {
                            setSelectedAreaId(newArea.id);
                            setFieldValue("serviceTypeArea", newArea.id);
                            getPackageListDetails(currentServiceType, newArea.name);
                        }
                    } else {
                        setZoneErrorModal({
                            show: true,
                            text: zoneData.error || 'Service not available in this area.',
                            title: zoneData.title || 'Oops!'
                        });
                        setFieldValue("pickupAddress", "");
                        setFieldValue("pickupLocation", null);
                        setPickupLocation(null);
                    }
                }
            }
            else if (type === 'driver') {
                setFieldValue("driverPickUpAddress", address);
                setFieldValue("driverPickUpLocation", location);
                setDriverPickUpLocation(location);
                setDriverSuggestions([]);
            }
            else {
                setFieldValue("dropAddress", address);
                setFieldValue("dropLocation", location);
                setDropLocation(location);
                setDropSuggestions([]);
            }
        }
    };

    // const handlePickupMarkerDragEnd = useCallback((event) => {
    //     const newLat = event.latLng.lat();
    //     const newLng = event.latLng.lng();
    //     setPickupLocation({ lat: newLat, lng: newLng });

    //     // Fetch the address using Geocoding API
    //     const geocoder = new window.google.maps.Geocoder();
    //     geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
    //         if (status === 'OK' && results[0]) {
    //             setPickupAddress(results[0].formatted_address);
    //             setFieldValue("pickupAddress", results[0].formatted_address);
    //         } else {
    //             setPickupAddress('Address not found');
    //         }
    //     });
    // }, []);

    // const handleDropMarkerDragEnd = useCallback((event) => {
    //     const newLat = event.latLng.lat();
    //     const newLng = event.latLng.lng();
    //     setDropLocation({ lat: newLat, lng: newLng });

    //     // Fetch the address using Geocoding API
    //     const geocoder = new window.google.maps.Geocoder();
    //     geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
    //         if (status === 'OK' && results[0]) {
    //             setFieldValue("dropAddress", results[0].formatted_address);
    //             setDropAddress(results[0].formatted_address);
    //         } else {
    //             setDropAddress('Address not found');
    //         }
    //     });
    // }, []);

    const onBackPressHandler = async () => {
        props.editCancel()
    };

    function convertTimeFormat(time) {
        let [hours, minutes, seconds] = time.split(':');
        hours = parseInt(hours);

        const period = hours >= 12 ? 'p.m.' : 'a.m.';
        hours = hours % 12 || 12;

        return `${hours}:${minutes} ${period}`;
    }

    // Luggage and seater capacity logic based on car type
    const useLuggageAndSeaterLogic = (carType, setFieldValue) => {
        useEffect(() => {
            if (carType === 'Mini' || carType === 'Sedan') {
                setFieldValue('luggage', 1);
                setFieldValue('seaterCapacity', '5');
            } else if (carType === 'SUV' || carType === 'MUV') {
                setFieldValue('luggage', 2);
                setFieldValue('seaterCapacity', '7');
            } else {
                setFieldValue('luggage', '');
                setFieldValue('seaterCapacity', '');
            }
        }, [carType, setFieldValue]);
    };

    const editSubmit = async (values) => {
        let data;
        let editBookingData;
        if (values.submitType == "default") {
            data = {
                packageId: values?.packageSelected === "0" ? 0 : Number(values?.packageSelected),
                packageType: values?.packageTypeSelected,
                customerId: bookingData?.Customer?.id,
                bookingId: bookingData?.id,
                adminBooking: true,
                serviceType: values?.serviceType,
                bookingType: values?.tripType.toUpperCase(),
                transmissionType : values?.transmissionType ? values?.transmissionType : bookingData?.transmissionType,
                carType: values?.carType ? values?.carType : bookingData?.carType,
                fromDate: moment(`${values?.rideDate} ${values?.rideTime}`, "YYYY-MM-DD HH:mm:ss").toISOString(),
                pickupLat: values?.pickupLocation?.lat ? values?.pickupLocation?.lat : bookingData?.pickupLat,
                pickupLong: values?.pickupLocation?.lng ? values?.pickupLocation?.lng : bookingData?.pickupLong,
                pickupAddress: {
                    name: values?.pickupAddress ? values?.pickupAddress : bookingData?.pickupAddress?.name
                },
                dropLat: null,
                dropLong: null,
                dropAddress: null,
                toDate: null,
                period: values?.serviceType === 'RENTAL_HOURLY_PACKAGE' || values?.serviceType === 'DRIVER' ? packageTypeSelectedData.find(pkg => pkg.id === Number(values?.packageSelected))?.period || '' : '',
                acType: values?.acType.toUpperCase(),
                sourceType: values?.sourceType,
                zone: values?.zone,
                isPremiumService : values?.isPremiumService ? true : false
            };
            // console.log("DADADA", values)
            if (values.packageTypeSelected == 'Outstation' && values?.tripType?.toUpperCase() == 'ROUND TRIP') {
                data.toDate = moment(`${values.toDate} ${values.toTime}`, "YYYY-MM-DD HH:mm:ss").toISOString();
            }
            if (!(values.packageTypeSelected == 'Local' && values?.tripType?.toUpperCase() == 'DROP ONLY')) {
                data.dropLat = values?.dropLocation?.lat ? values?.dropLocation?.lat : bookingData?.dropLat
                data.dropLong = values?.dropLocation?.lng ? values?.dropLocation?.lng : bookingData?.dropLong
                data.dropAddress = values?.dropLocation ? { name: values?.dropAddress } : bookingData?.dropAddress ? {
                    name: values?.dropAddress ? values?.dropAddress : bookingData?.dropAddress?.name
                } : null
            }
            editBookingData = await ApiRequestUtils.update(API_ROUTES.UPDATE_BOOKING, data);
        } else if (values.submitType == 'rides') {
            data = {
                customerId: bookingData?.Customer?.id,
                bookingId: bookingData?.id,
                pickupLat: values?.pickupLocation?.lat ? values?.pickupLocation?.lat : bookingData?.pickupLat,
                pickupLong: values?.pickupLocation?.lng ? values?.pickupLocation?.lng : bookingData?.pickupLong,
                pickupAddress: {
                    name: values?.pickupAddress ? values?.pickupAddress : bookingData?.pickupAddress?.name
                },
                sourceType: values?.sourceType,
                fromDate: moment(`${values?.rideDate} ${values?.rideTime}`, "YYYY-MM-DD HH:mm:ss").toISOString(),
                zone: values?.zone,
                isPremiumService : values?.isPremiumService ? true : false
            }
            console.log("DADADAD", data)
            data.dropLat = values?.dropLocation?.lat ? values?.dropLocation?.lat : bookingData?.dropLat
            data.dropLong = values?.dropLocation?.lng ? values?.dropLocation?.lng : bookingData?.dropLong
            data.dropAddress = {
                name: values?.dropAddress ? values?.dropAddress : bookingData?.dropAddress?.name
            }
            
            editBookingData = await ApiRequestUtils.update(API_ROUTES.UPDATE_RIDES_BOOKING, data);
        } else if (values.submitType == 'auto') {
            data = {
                customerId: bookingData?.Customer?.id,
                bookingId: bookingData?.id,
                pickupLat: values?.pickupLocation?.lat ? values?.pickupLocation?.lat : bookingData?.pickupLat,
                pickupLong: values?.pickupLocation?.lng ? values?.pickupLocation?.lng : bookingData?.pickupLong,
                pickupAddress: {
                    name: values?.pickupAddress ? values?.pickupAddress : bookingData?.pickupAddress?.name
                },
                dropLat: values?.dropLocation?.lat ? values?.dropLocation?.lat : bookingData?.dropLat,
                dropLong: values?.dropLocation?.lng ? values?.dropLocation?.lng : bookingData?.dropLong,
                dropAddress: {
                    name: values?.dropAddress ? values?.dropAddress : bookingData?.dropAddress?.name
                }
            }
            editBookingData = await ApiRequestUtils.update(API_ROUTES.UPDATE_RIDES_BOOKING, data);
        }
        if (editBookingData.success) {
            props.editCancel();
        }
    }

    return (
        <div className="p-4 mx-auto">
            {loading ? (
                <div className="flex justify-center">
                    <Spinner className="h-12 w-12" />
                </div>
            ) : (
                <>

            <div className='pb-4'>
                <Typography variant="h5" className='text-gray-900'>
                    Edit Booking - {bookingData?.bookingNumber}
                </Typography>
            </div>
            <Formik
                initialValues={initialValues}
                onSubmit={editSubmit}
                enableReinitialize
            >
                {({ handleSubmit, setFieldValue, values, dirty, isValid }) => {
                  const getCurrentPremiumOptions = () => {
  if (values?.serviceType === 'RENTAL' && values.packageTypeSelected === 'Outstation' && values?.tripType === 'Drop Only') {
    return premiumServicesMap['RENTAL_DROP_TAXI'] || [];
  }
  if (values?.serviceType === 'RENTAL' && values.packageTypeSelected === 'Outstation' && values?.tripType === 'Round Trip') {
    return premiumServicesMap['RENTAL'] || [];
  }
  if (values?.serviceType === 'RENTAL_DROP_TAXI') {
    return premiumServicesMap['RENTAL_DROP_TAXI'] || [];
  }
  return premiumServicesMap[values?.serviceType] || [];
};
                useLuggageAndSeaterLogic(values.carType, setFieldValue);
                    return(
                    <> {customerData && (
    <div className="p-2 flex mb-4 pointer-events-none">
        <SearchableDropdown
            searchVal={setCustomerNumber}
            addVal={customerNumber}
            selected={selectedCustomer}
            options={customerData}
            onSelect={(val) => {
                setFieldValue('customerId', val);
                setSelectedCustomer(val.id);
            }}
          
        />
    </div>
)}

                                    <div className="flex-1 mb-4">
                                        <div>
                                            <Typography variant="h6" className="mb-2">
                                                Service Area
                                            </Typography>
                                            {serviceAreaLoading ? (
                                                <div className="flex justify-center items-center p-4">
                                                    <Spinner className="h-6 w-6" />
                                                </div>
                                            ) : (
                                                <Field as="select"
                                                    disabled
                                                    name="serviceArea"
                                                    value={selectedAreaId || ''}
                                                    onChange={(e) => {
                                                        const areaId = e.target.value;
                                                        setSelectedAreaId(areaId);
                                                        setFieldValue('serviceArea', areaId);
                                                    }}
                                                    className="p-2 w-full rounded-xl border-2 border-gray-300"
                                                >
                                                    <option value="">Select Service Area</option>
                                                    {serviceAreas.map((area) => (
                                                        <option key={area.id} value={area.id}>
                                                            {area.name}
                                                        </option>
                                                    ))}
                                                </Field>
                                            )}
                                            <ErrorMessage name="serviceArea" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>
                                <div>
                                    <Typography variant="h6" className="mb-2">
                                        Service Type
                                    </Typography>
                                    <Field as="select" name="serviceType" disabled className="p-2 w-full rounded-xl border-2 border-gray-300">
                                        <option value="">Service Type</option>
                                        <option value="DRIVER">Driver</option>
                                        <option value="RENTAL">Rentals</option>
                                        <option value="RIDES">Rides</option>
                                        <option value="AUTO">Auto</option>
                                    </Field>
                                    <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
                                </div>
                            </div>
                                    {bookingData?.serviceType !== "RIDES" && bookingData?.serviceType !== "AUTO" && <>
                            <div className='space-y-3 my-3'>
                                <div className={['RENTAL', 'DRIVER'].includes(values.serviceType) ? 'hidden' : ''}>
                                    <Button
                                        color={values.packageTypeSelected === 'Local' ? 'blue' : 'gray'}
                                        onClick={() => {
                                            if (values.packageTypeSelected !== 'Local') {
                                                setFieldValue('packageTypeSelected', 'Local');
                                                setFieldValue('packageSelected', '');
                                                setFieldValue('fromDate', '');
                                                setFieldValue('toDate', '');
                                            }
                                        }}
                                        variant={values?.packageTypeSelected === 'Local' ? 'filled' : 'outlined'}
                                        disabled
                                    >
                                        Local
                                    </Button>
                                    <Button
                                        color={values.packageTypeSelected === 'Outstation' ? 'blue' : 'gray'}
                                        onClick={() => {
                                            if (values.packageTypeSelected !== 'Outstation') {
                                                setFieldValue('packageTypeSelected', 'Outstation');
                                                setFieldValue('packageSelected', '');
                                                setFieldValue('fromDate', '');
                                                setFieldValue('toDate', '');
                                            }
                                        }}
                                        disabled
                                        variant={values?.packageTypeSelected === 'Outstation' ? 'filled' : 'outlined'}
                                    >
                                        Outstation
                                    </Button>
                                </div>
                                <div className={['RENTAL', 'DRIVER'].includes(values.serviceType) ? 'hidden' : ''}>
                                    <Typography className="text-sm font-medium text-black">Trip Type</Typography>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        {(values?.serviceType !== 'RENTAL') && (<Button
                                            color={values.tripType === 'Drop Only' ? 'blue' : 'gray'}
                                            onClick={() => setFieldValue('tripType', 'Drop Only')}
                                            variant={values?.tripType === 'Drop Only' ? 'filled' : 'outlined'}
                                            disabled
                                        >
                                            Drop Only
                                        </Button>)}
                                        <Button
                                            color={values.tripType === 'Round Trip' ? 'blue' : 'gray'}
                                            onClick={() => setFieldValue('tripType', 'Round Trip')}
                                            variant={values?.tripType === 'Round Trip' ? 'filled' : 'outlined'}
                                            disabled
                                        >
                                            Round Trip
                                        </Button>
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 mt-2 space-x-3'>
                                        {(
                                            values?.isPremiumService ||
                                            values?.serviceType === 'RENTAL_DROP_TAXI' ||
                                            (values?.serviceType === 'RENTAL'  && values.packageTypeSelected === 'Outstation' &&
                                                (values?.tripType === 'Round Trip' || values?.tripType === 'Drop Only'))
                                        ) && (

                                                <div className="w-full">
                                                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                                                        <Field
                                                            type="checkbox"
                                                            name="isPremiumService"
                                                            className="h-5 w-5 text-primary-600 rounded"
                                                            onChange={(e) => {
                                                                setFieldValue('isPremiumService', e.target.checked);
                                                                if (!e.target.checked) {
                                                                    setFieldValue('carType', ''); // reset when disabled
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">Enable Premium Service</span>
                                                    </label>
                                                </div>
                                            )}
                                            
                                </div>
                                    <div>
                                        {values?.isPremiumService && (
                                            <div className="w-full mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm font-semibold text-blue-900 mb-3">
                                                    Premium Options Available:
                                                </p>
                                                {getCurrentPremiumOptions().length > 0 ? (
                                                    <div className="flex gap-4">
                                                        {getCurrentPremiumOptions().map((premium, index) => (
                                                            <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                                                <Field
                                                                    type="radio"
                                                                    name="carType"
                                                                    value={premium.carType}
                                                                    className="h-4 w-4 text-primary-600"
                                                                    onChange={(e) => setFieldValue('carType', e.target.value)}
                                                                />
                                                                <span className="text-gray-800 font-medium">
                                                                    {premium.label}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-600 italic">
                                                        No premium options available for {values?.serviceType}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                
                                <div>
                                    {!values?.isPremiumService && ( <>    
                                    <label className="text-sm font-medium text-black-700">Car Type</label>
                                    <div className="flex gap-4">
                                        {['Mini', 'Sedan', 'SUV', 'MUV'].map((carType) => (
                                            <label key={carType} className="flex items-center space-x-2">
                                                <Field
                                                    type="radio"
                                                    name="carType"
                                                    value={carType}
                                                    className="h-4 w-4 text-primary-600"
                                                />
                                                <span className="text-black-700">{carType}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <ErrorMessage name="carType" component="div" className="text-red-500 text-sm mt-1" />
                                </>)}
                                </div>


                                {(values?.serviceType !== 'RENTAL') && (<div>
                                    <label className="text-sm font-medium text-black-700">Transmission Type</label>
                                    <div className="grid grid-cols-8 mt-2">
                                        {['Manual', 'Automatic'].map((transType) => (
                                            <label key={transType} className="flex items-center space-x-2">
                                                <Field
                                                    type="radio"
                                                    name="transmissionType"
                                                    value={transType}
                                                    className="h-4 w-4 text-primary-600"
                                                />
                                                <span className="text-black-700">{transType}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <ErrorMessage name="transmissionType" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                                )}
                            </div>
                                    {((values.serviceType === 'RENTAL' && values.packageTypeSelected === 'Outstation')) && (
                                        <div>
                                            <Typography className="text-sm font-medium text-black-700">AC Type</Typography>
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <Button
                                                    color={values.acType === 'AC' ? 'blue' : 'gray'}
                                                    onClick={() => setFieldValue('acType', 'AC')}
                                                    variant={values?.acType === 'AC' ? 'filled' : 'outlined'}
                                                >
                                                    AC
                                                </Button>

                                                <Button
                                                    color={values.acType === 'N0N AC' ? 'blue' : 'gray'}
                                                    disabled
                                                    onClick={() => setFieldValue('acType', 'NON AC')}
                                                    variant={values?.acType === 'NON AC' ? 'filled' : 'outlined'}
                                                >
                                                    NON AC
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                        {/* Source Type Field for all services */}
                                        {values.serviceType && (
                                            <div className="space-y-2 mb-4">
                                                <label htmlFor="sourceType" className="text-sm font-medium text-gray-700">Source Type <span className="text-red-500">*</span></label>
                                                <Field as="select" name="sourceType" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                                                    <option value="">Select Source Type</option>
                                                    <option value="Facebook">Facebook</option>
                                                    <option value="Instagram">Instagram</option>
                                                    <option value="Influencer Reels">Influencer Reels</option>
                                                    <option value="WhatsApp">WhatsApp</option>
                                                    <option value="Google">Google</option>
                                                    <option value="YouTube">YouTube</option>
                                                    <option value="Justdial">Justdial</option>
                                                    <option value="Paper Notice">Paper Notice</option>
                                                    <option value="On Field">On Field</option>
                                                </Field>
                                                <ErrorMessage name="sourceType" component="div" className="text-red-500 text-sm" />
                                            </div>
                                        )}

                                     <div className="flex gap-4 mb-2">
                            <div className="flex-1 mb-2">
                                <Typography variant="h6" className="mb-2">
                                    Pickup Date & Time
                                </Typography>
                                <Field
                                    type="datetime-local"
                                    name="rideDateTime"
                                    className="p-2 w-full rounded-xl border-2 border-gray-300"
                                    value={values.rideDate ? `${values.rideDate}T${values.rideTime}` : ''}
                                    min={`${moment().format('YYYY-MM-DD')}T00:00`}
                                    onClick={(e) => {
                                                    if (e.target.showPicker) e.target.showPicker();
                                                        }}
                                    onChange={(e) => {
                                        const selectedDateTime = e.target.value;
                                        const formattedDate = moment(selectedDateTime).format('YYYY-MM-DD');
                                        const formattedTime = moment(selectedDateTime).format('HH:mm');

                                        setFieldValue('rideDate', formattedDate);
                                        setFieldValue('rideTime', formattedTime);

                                        if (formattedDate !== values.fromDate) {
                                            setFieldValue('fromDate', '');
                                            setFieldValue('toDate', '');
                                        }
                                    }}
                                />
                            </div>
                            {(values.tripType == 'Round Trip' && values.packageTypeSelected == 'Outstation') && <div className="flex-1 mb-2">
                                <Typography variant="h6" className="mb-2">Return Date & Time</Typography>
                                <Field
                                    type="datetime-local"
                                    name="toDateTime"
                                    className="p-2 w-full rounded-xl border-2 border-gray-300"
                                    value={values.toDate ? `${values.toDate}T${values.toTime}` : ''}
                                    min={`${values.rideDate || moment().format('YYYY-MM-DD')}T00:00`}
                                    onChange={(e) => {
                                        const selectedDateTime = e.target.value;
                                        const formattedDate = moment(selectedDateTime).format('YYYY-MM-DD');
                                        const formattedTime = moment(selectedDateTime).format('HH:mm');

                                        setFieldValue('toDate', formattedDate);
                                        setFieldValue('toTime', formattedTime);
                                    }}
                                />
                            </div>}
                            </div>
                            {values.packageTypeSelected == 'Local' && <div className="flex-1 mb-4">
                                <div>
                                    <Typography variant="h6" className="mb-2">
                                        Choose a package
                                    </Typography>
                                    <Field as="select" name="packageSelected" className="p-2 w-full rounded-xl border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50" value={values.packageSelected}
                                        onChange={(e) => {
                                            setFieldValue('packageSelected', e.target.value);
                                            if (values.packageTypeSelected === 'Outstation' && values.fromDate && values.toDate) {
                                                setDatePickerVisible(false);
                                                handleChange('fromDate')("");
                                                handleChange('toDate')("")
                                            }
                                        }}
                                    >
                                        <option value="">Select Package</option>
                                        {packageTypeSelectedData
                                            .filter((item) => {
                                                if (values.serviceType === 'CAR_WASH') {
                                                    return item.type === 'CarWash';
                                                }
                                                else if (values.serviceType === 'RENTAL' && values.tripType === 'Local') {
                                                    return item.serviceType === 'RENTAL' && item.type === 'Local';
                                                }
                                                return values.packageTypeSelected === item.type;
                                            })
                                            .map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {values.serviceType === 'CAR_WASH'
                                                        ? (
                                                            <span>
                                                                <span className="text-base">{item.period}</span>
                                                                <span className="text-sm"> - {item.description}</span>
                                                            </span>
                                                        )
                                                        : (`${item.period} ${values.packageTypeSelected === 'Outstation' ? 'd' : 'hr'}`)
                                                    }
                                                </option>
                                            ))}
                                    </Field>
                                    <ErrorMessage name="packageSelected" component="div" className="text-red-500 text-sm" />
                                </div>
                            </div>}
                             <div className="flex  gap-2 ">
                            <div className="flex-1 p-2 space-y-2">
                                <label className="block text-sm font-medium text-black-700">
                                    Pickup Location <span className="text-red-500">*</span>
                                </label>
                                <Field
                                    type="text"
                                    name="pickupAddress"
                                    className="p-2 w-full rounded-xl border-2 border-gray-300"
                                    placeholder="Enter pickup location"
                                    onChange={(e) => {
                                        setFieldValue("pickupAddress", e.target.value);
                                        setFieldValue("pickupLocation", null);
                                        searchLocations(e.target.value, true);
                                    }}
                                />
                                {pickupSuggestions.length > 0 && (
                                    <ul className="border rounded-lg bg-white mt-2">
                                        {pickupSuggestions.map((suggestion, index) => (
                                            <li
                                                key={index}
                                                className="p-2 cursor-pointer hover:bg-gray-100"
                                                onClick={() => {
                                                    handleSelectLocation(suggestion, true, null, setFieldValue, values);
                                                }}
                                            >
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            {(values.tripType !== 'Drop Only' || values.packageTypeSelected === 'Outstation') && !(values.serviceType === 'RENTAL' && values.packageTypeSelected === 'Local') && (<div className="flex-1 p-2 space-y-2">
                                <label className="block text-sm font-medium text-black-700">Drop Location<span className="text-red-500">*</span></label>
                                <Field
                                    type="text"
                                    name="dropAddress"
                                    className="p-2 w-full rounded-xl border-2 border-gray-300"
                                    placeholder="Enter drop location (Optional)"
                                    onChange={(e) => {
                                        setFieldValue("dropAddress", e.target.value);
                                        setFieldValue("dropLocation", null);
                                        searchLocations(e.target.value, false);
                                    }}
                                />
                                {dropSuggestions.length > 0 && (
                                    <ul className="border rounded-lg bg-white mt-2">
                                        {dropSuggestions.map((suggestion, index) => (
                                            <li
                                                key={index}
                                                className="p-2 cursor-pointer hover:bg-gray-100"
                                                onClick={() => {
                                                    handleSelectLocation(suggestion, false, null, setFieldValue, values);
                                                }}
                                            >
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>)}
                                        </div>
                                        {(values.serviceType === 'RENTAL' && values.packageTypeSelected === 'Outstation' || values.serviceType === 'RIDES') && (
                                            <div className="p-2 space-y-2">
                                                <label className="block text-sm font-medium text-black-700">
                                                    Driver Starting Point
                                                </label>
                                                <Field
                                                    type="text"
                                                    name="driverPickUpAddress"
                                                    className="p-2 w-full rounded-xl border-2 border-gray-300"
                                                    placeholder="Enter driver pickup location (Optional)"
                                                    onChange={(e) => {
                                                        setFieldValue("driverPickUpAddress", e.target.value);
                                                        setFieldValue("driverPickUpLocation", null);
                                                        searchLocations(e.target.value, false, 'driver');
                                                    }}
                                                />
                                                {driverSuggestions.length > 0 && (
                                                    <ul className="border rounded-lg bg-white mt-2">
                                                        {driverSuggestions.map((suggestion, index) => (
                                                            <li
                                                                key={index}
                                                                className="p-2 cursor-pointer hover:bg-gray-100"
                                                                onClick={() => handleSelectLocation(suggestion, false, 'driver', setFieldValue, values)}
                                                            >
                                                                {suggestion}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>)}


                                        {/* Add luggage and seater capacity fields */}
                                        {(values.serviceType === 'DRIVER' || values.serviceType === 'RENTAL' || values.serviceType === 'RENTAL_HOURLY_PACKAGE' || values.serviceType === 'RENTAL_DROP_TAXI') && (
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="p-2 space-y-2">
                                                    <label className="block text-sm font-medium text-black-700">
                                                        Luggage
                                                    </label>
                                                    <Field
                                                        type="number"
                                                        name="luggage"
                                                        className="p-2 w-full rounded-xl border-2 border-gray-300"
                                                        placeholder="Luggage Count (Auto-filled)"
                                                        disabled={true}
                                                        value={values.luggage || ''}
                                                    />
                                                    <ErrorMessage name="luggage" component="div" className="text-red-500 text-sm" />
                                                </div>
                                                <div className="p-2 space-y-2">
                                                    <label className="block text-sm font-medium text-black-700">
                                                        Seater Capacity
                                                    </label>
                                                    <Field
                                                        type="text"
                                                        name="seaterCapacity"
                                                        className="p-2 w-full rounded-xl border-2 border-gray-300"
                                                        placeholder="Seater Capacity (Auto-filled)"
                                                        disabled={true}
                                                        value={values.seaterCapacity || ''}
                                                    />
                                                    <ErrorMessage name="seaterCapacity" component="div" className="text-red-500 text-sm" />
                                                </div>
                                            </div>
                                        )}
                                        {values.packageSelected && values.packageTypeSelected == 'Local' && (values.serviceType == 'DRIVER' || values.serviceType == 'RENTAL')
                            && <Card className="my-6">
                                <div className="border rounded-xl bg-gray-200 p-4">
                                    <h2 className="text-2xl font-bold text-center">Estimated Price Details</h2>
                                    <hr className="my-2 border border-black" />
                                    <div className="mt-4">
                                        <div className="flex justify-between">
                                            <Typography color="gray" variant="h6">Package:</Typography>
                                            <Typography>
                                                {packageTypeSelectedData.find(pkg => pkg.id === Number(values.packageSelected))?.period || ""} hr
                                            </Typography>
                                        </div>
                                        <>
                                                            <div className="flex justify-between">

                                                                <Typography color="gray" variant="h6">Estimated Fare</Typography>
                                                                <Typography>
                                                                    {values.packageSelected && values.packageTypeSelected === 'Local' ? (
                                                                        values.serviceType === 'DRIVER' ? (
                                                                            `₹${(() => {
                                                                                const selectedPackage = packageTypeSelectedData.find(pkg => pkg.id === Number(values.packageSelected));
                                                                                if (!selectedPackage) return "N/A";
                                                                                switch (values.carType?.toUpperCase()) {
                                                                                    case "MINI":
                                                                                    case "SEDAN":
                                                                                    case "SUV":
                                                                                        return selectedPackage.price || "N/A";
                                                                                    case "MUV":
                                                                                        return selectedPackage.priceMVP || "N/A";
                                                                                    default:
                                                                                        return "N/A";
                                                                                }
                                                                            })()}`
                                                                        ) : values.serviceType === 'RENTAL' ? (
                                                                            `₹${(() => {
                                                                                const selectedPackage = packageTypeSelectedData.find(pkg => pkg.id === Number(values.packageSelected));
                                                                                if (!selectedPackage) return "N/A";
                                                                                switch (values.carType?.toUpperCase()) {
                                                                                    case "MINI":
                                                                                        return selectedPackage.price || "N/A";
                                                                                    case "SEDAN":
                                                                                        return selectedPackage.priceSedan || "N/A";
                                                                                    case "SUV":
                                                                                        return selectedPackage.priceSuv || "N/A";
                                                                                    case "MUV":
                                                                                        return selectedPackage.priceMVP || "N/A";
                                                                                    default:
                                                                                        return "N/A";
                                                                                }
                                                                            })()}`
                                                                        ) : "N/A"
                                                                    ) : "N/A"}
                                                                </Typography>
                                                            </div>
                                                        </>
                                                    </div>
                                                </div>
                                            </Card>}
                                        {quoteDetails &&
                                            <Card className="my-6">
                                                <div className="border rounded-xl bg-gray-200 p-4">
                                                    <h2 className="text-2xl font-bold text-center">Estimated Price Details</h2>
                                                    <hr className="my-2 border border-black" />
                                                    <div className="mt-4">
                                                        <>
                                                            <div className="grid grid-cols-2 justify-between">
                                                                {values?.serviceType !== 'DRIVER' && (<>
                                                                    <Typography color="gray" variant="h6">Pick up to Drop  Kilometer + Driver Km For Pickup Location</Typography>
                                                                    <Typography>
                                                                        {Math.round(quoteDetails.value?.estimatedDistance || quoteDetails.amount?.estimatedDistance || 0) + (Number(quoteDetails.value?.baseKm || quoteDetails.amount?.baseKm || 0))} Kms + {quoteDetails.value?.driverWithin || quoteDetails.amount?.driverWithin || 0} Kms
                                                                    </Typography></>)}
                                                                                                                    {quoteDetails?.amount?.isPremiumFare && (
                                                        <>
                                                            <Typography color="gray" variant="h6">Car Service</Typography>
                                                            <Typography className='font-semibold'> {quoteDetails.amount?.isPremiumFare ? "Premium Car Service" : "Not a Premium Car Services "}</Typography>
                                                        </>
                                                    )}
                                                    {quoteDetails?.amount?.isPremiumFare && (
                                                        <>
                                                            <Typography color="gray" variant="h6">Premium Car Type</Typography>
                                                            <Typography> {quoteDetails.amount?.premiumDetails?.appliedCarType}</Typography>
                                                        </>
                                                    )}
                                                                {values?.serviceType !== 'DRIVER' && values?.serviceType !== 'RENTAL_DROP_TAXI' && (
                                                                    <>
                                                                        <Typography color="gray" variant="h6">Per Km Rate</Typography>
                                                                        <Typography>
                                                                            ₹ {quoteDetails.value?.kilometerPriceVal || quoteDetails.amount?.kilometerPriceVal}
                                                                        </Typography></>)}
                                                                <Typography color="gray" variant="h6">Base Fare upto {quoteDetails.value?.baseKm || quoteDetails.amount?.baseKm} Kilometer</Typography>
                                                                <Typography>
                                                                    ₹ {quoteDetails.amount?.baseFare}
                                                                </Typography>

                                                                {(values?.serviceType === "RENTAL" || values?.serviceType === "RENTAL_DROP_TAXI" || values?.serviceType === "RENTAL_HOURLY_PACKAGE") && (
                                                                    <>
                                                                        <Typography color="gray" variant="h6">Car Type:</Typography>
                                                                        <Typography>
                                                                            {quoteDetails.amount?.carType || ''}
                                                                        </Typography>
                                                                    </>
                                                                )}

                                                                {quoteDetails.amount?.isPrimeLocation === true && quoteDetails.amount?.rideSurchargeAmount > 0 &&
                                                                    <>
                                                                        <Typography color="gray" variant="h6">Surcharge Applied</Typography>
                                                                        <Typography>
                                                                            ₹  {quoteDetails.amount?.rideSurchargeAmount}
                                                                        </Typography>
                                                                    </>
                                                                }
                                                                <Typography color="gray" variant="h6">Estimated Fare</Typography>
                                                                <Typography>
                                                                    ₹ {quoteDetails.amount?.estimatedPrice}
                                                                </Typography>
                                                                {quoteDetails.discount?.percentage > 0 && <>

                                                                    <Typography color="gray" variant="h6">Discount Applied</Typography>
                                                                    <Typography>
                                                                        {quoteDetails.discount?.percentage} %
                                                                    </Typography>
                                                                    <Typography color="gray" variant="h6">Total estimated Fare</Typography>
                                                                    <Typography className='font-roboto-medium text-lg text-gray-900'>
                                                                        {/* {quoteDetails.discount?.percentage} % - ₹ {quoteDetails.amount?.estimatedPrice} */}
                                                                        ₹ {(quoteDetails.amount?.estimatedPrice) - (quoteDetails.amount?.estimatedPrice * quoteDetails.discount?.percentage / 100)}
                                                                    </Typography>

                                                                </>}
                                                </div>

                                            </>
                                        </div>
                                    </div>
                                </Card>
                            }





                            {values.packageTypeSelected == 'Outstation' && values.serviceType === 'RENTAL' &&
                                <Button fullWidth className='my-6 mx-2 bg-primary' onClick={() => getQuoteOutstationDetails(values)}>
                                    Check Estimated Price
                                </Button>
                            }


                {values.serviceType == 'DRIVER' && values.packageTypeSelected == 'Outstation' &&
                    <Button fullWidth className='my-6 mx-2 bg-primary' onClick={() => getQuoteOutstationDetails(values)}>
                        Check Estimated Price
                    </Button>
                }
                            <div className="flex justify-center my-6 gap-4">
                                <Button
                                    color="gray"
                                    onClick={onBackPressHandler}
                                    className='my-6 mx-2 '
                                >
                                    Back
                                </Button>
                                <Button
                                    color="blue"
                                    onClick={() => {
                                        setFieldValue("submitType", "default");
                                        handleSubmit()
                                    }}
                                    disabled={!dirty || !isValid || (!values.rideDate && !values.toDate) || (!values.pickupAddress && !values.dropAddress)}
                                    className='my-6 mx-2'
                                >
                                    Confirm Booking
                                </Button>
                            </div>
                        </>}
                        {bookingData?.serviceType == "RIDES" &&
                            <>
                            <div className="mt-6">
                                    <div className="mt-3 space-y-5">
                                        <div className="flex items-center space-x-3 ml-2">
                                            <Field
                                                type="checkbox"
                                                name="isPremiumService"
                                                className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                                                onChange={(e) => {
                                                    setFieldValue('isPremiumService', e.target.checked);
                                                    if (!e.target.checked) {
                                                        setFieldValue('carType', '');
                                                    }
                                                }}
                                            />
                                            <span className="text-sm font-medium text-gray-700">Enable Premium Service</span>
                                        </div>
                                        {values?.isPremiumService && (
                                            <div className="w-full mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm font-semibold text-blue-900 mb-3">
                                                    Premium Options Available:
                                                </p>
                                                {getCurrentPremiumOptions().length > 0 ? (
                                                    <div className="flex gap-4">
                                                        {getCurrentPremiumOptions().map((premium, index) => (
                                                            <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                                                <Field
                                                                    type="radio"
                                                                    name="carType"
                                                                    value={premium.carType}
                                                                    className="h-4 w-4 text-primary-600"
                                                                    onChange={(e) => setFieldValue('carType', e.target.value)}
                                                                />
                                                                <span className="text-gray-800 font-medium">
                                                                    {premium.label}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-600 italic">
                                                        No premium options available for {values?.serviceType}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {!values.isPremiumService && (
                                            <>
                                                <div className='ml-2'>
                                                    <label className="text-sm font-medium text-black-700">Car Type</label>
                                                    <div className="flex gap-6 mt-2">
                                                        {['Mini', 'Sedan'].map((carType) => (
                                                            <label key={carType} className="flex items-center space-x-2 cursor-pointer">
                                                                <Field
                                                                    type="radio"
                                                                    name="carType"
                                                                    value={carType}
                                                                    className="h-4 w-4 text-primary-600"
                                                                    onChange={(e) => {
                                                                        setFieldValue('carType', e.target.value);
                                                                    }}
                                                                />
                                                                <span className="text-black-700">{carType}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    <ErrorMessage name="carType" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            <div className="flex-1 mb-2">
                                <Typography variant="h6" className="mb-2">
                                    Pickup Date & Time
                                </Typography>
                                <Field
                                    type="datetime-local"
                                    name="rideDateTime"
                                    className="p-2 w-full rounded-xl border-2 border-gray-300"
                                    value={values.rideDate ? `${values.rideDate}T${values.rideTime}` : ''}
                                    min={`${moment().format('YYYY-MM-DD')}T00:00`}
                                    onClick={(e) => {
                                                    if (e.target.showPicker) e.target.showPicker();
                                                        }}
                                    onChange={(e) => {
                                        const selectedDateTime = e.target.value;
                                        const formattedDate = moment(selectedDateTime).format('YYYY-MM-DD');
                                        const formattedTime = moment(selectedDateTime).format('HH:mm');

                                        setFieldValue('rideDate', formattedDate);
                                        setFieldValue('rideTime', formattedTime);

                                        if (formattedDate !== values.fromDate) {
                                            setFieldValue('fromDate', '');
                                            setFieldValue('toDate', '');
                                        }
                                    }}
                                />
                            </div>
                                <div className="flex  gap-2 ">
                                    <div className="flex-1 p-2 space-y-2">
                                        <label className="block text-sm font-medium text-black-700">
                                                        Customers Pickup Location <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                        type="text"
                                        name="pickupAddress"
                                        className="p-2 w-full rounded-xl border-2 border-gray-300"
                                        placeholder="Enter pickup location"
                                        onChange={(e) => {
                                            setFieldValue("pickupAddress", e.target.value);
                                            setFieldValue("pickupLocation", null);
                                            searchLocations(e.target.value, true);
                                        }}
                                    />
                                    {pickupSuggestions.length > 0 && (
                                        <ul className="border rounded-lg bg-white mt-2">
                                            {pickupSuggestions.map((suggestion, index) => (
                                                <li
                                                    key={index}
                                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                                    onClick={() => {
                                                        handleSelectLocation(suggestion, true, null, setFieldValue, values);
                                                    }}
                                                >
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="flex-1 p-2 space-y-2">
                                    <label className="block text-sm font-medium text-black-700">Drop Location<span className="text-red-500">*</span></label>
                                    <Field
                                        type="text"
                                        name="dropAddress"
                                        className="p-2 w-full rounded-xl border-2 border-gray-300"
                                        placeholder="Enter drop location (Optional)"
                                        onChange={(e) => {
                                            setFieldValue("dropAddress", e.target.value);
                                            setFieldValue("dropLocation", null);
                                            searchLocations(e.target.value, false);
                                        }}
                                    />
                                    {dropSuggestions.length > 0 && (
                                        <ul className="border rounded-lg bg-white mt-2">
                                            {dropSuggestions.map((suggestion, index) => (
                                                <li
                                                    key={index}
                                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                                    onClick={() => {
                                                        handleSelectLocation(suggestion, false, null, setFieldValue, values);
                                                    }}
                                                >
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                            </div>
                                            {/* Quote details for RIDES */}
                                            {quoteDetails &&
                                                <Card className="my-6">
                                                    <div className="border rounded-xl bg-gray-200 p-4">
                                                        <h2 className="text-2xl font-bold text-center">Estimated Price Details</h2>
                                                        <hr className="my-2 border border-black" />
                                                        <div className="mt-4">
                                                            <div className="grid grid-cols-2 justify-between">
                                                                <Typography color="gray" variant="h6">Pick up to Drop  Kilometer + Driver Km For Pickup Location</Typography>
                                                                <Typography>
                                                                    {Math.round((quoteDetails.value?.estimatedDistance || quoteDetails.amount?.estimatedDistance) + (Number(quoteDetails.amount?.baseKm || quoteDetails.value?.baseKm)) || 0)} Kms
                                                                    +   {quoteDetails.value?.driverWithin || quoteDetails.amount?.driverWithin} Kms
                                                                </Typography>
                                                                <Typography color="gray" variant="h6">Base Fare upto {quoteDetails.amount?.baseKm} Kilometer</Typography>
                                                                <Typography>
                                                                    ₹ {quoteDetails.value?.baseFare || quoteDetails.amount?.baseFare}
                                                                </Typography>
                                                                <Typography color="gray" variant="h6">Per Km Rate</Typography>
                                                                <Typography>
                                                                    ₹ {quoteDetails.value?.kilometerPriceVal || quoteDetails.amount?.kilometerPriceVal}
                                                                </Typography>

                                                                {(quoteDetails.value?.rideSurchargeAmount > 0 || quoteDetails.amount?.rideSurchargeAmount > 0) && (
                                                                    <>
                                                                        <Typography color="gray" variant="h6">Surcharge Applied</Typography>
                                                                        <Typography>
                                                                            ₹ {quoteDetails.value?.rideSurchargeAmount || quoteDetails.amount?.rideSurchargeAmount}
                                                                        </Typography>
                                                                    </>
                                                                )}
                                                                <Typography color="gray" variant="h6">Estimated Fare</Typography>
                                                                <Typography>
                                                                    ₹ {quoteDetails.value?.estimatedPrice || quoteDetails.amount?.estimatedPrice}
                                                                </Typography>
                                                                {quoteDetails.discount?.percentage > 0 && (
                                                                    <>
                                                                        <Typography color="gray" variant="h6">Discount Applied</Typography>
                                                                        <Typography>
                                                                            {quoteDetails.discount?.percentage} %
                                                                        </Typography>
                                                                        <Typography color="gray" variant="h6">Total Estimated Fare</Typography>
                                                                        <Typography className='font-roboto-medium text-lg text-gray-900'>
                                                                            ₹ {(quoteDetails.value?.estimatedPrice || quoteDetails.amount?.estimatedPrice) - ((quoteDetails.value?.estimatedPrice || quoteDetails.amount?.estimatedPrice) * quoteDetails.discount?.percentage / 100)}
                                                                        </Typography>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            }

                                            {bookingData?.serviceType == 'RIDES' &&
                                                <Button fullWidth className='my-6 mx-2 bg-primary' onClick={() => getQuoteRides(values, setFieldValue)}>
                                                    Check Estimated Price
                                                </Button>
                                            }
                                <div className="flex justify-center my-6 gap-4">
                                    <Button
                                        color="gray"
                                        onClick={onBackPressHandler}
                                        className='my-6 mx-2'
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        color="blue"
                                        onClick={() => {
                                            setFieldValue("submitType", "rides");
                                            handleSubmit()
                                        }}
                                        disabled={!(values.pickupAddress && values.dropAddress) || isButtonDisabled}
                                        className='my-6 mx-2'
                                    >
                                        Confirm Booking
                                    </Button>
                                </div>
                            </>
                        }
                        {bookingData?.serviceType == "AUTO" && (
                                    <div className="flex gap-2">
                                        <div className="flex-1 p-2 space-y-2">
                                            <label className="block text-sm font-medium text-black-700">
                                                Pickup Location <span className="text-red-500">*</span>
                                            </label>
                                            <Field
                                                type="text"
                                                name="pickupAddress"
                                                className="p-2 w-full rounded-xl border-2 border-gray-300"
                                                placeholder="Enter pickup location"
                                                onChange={(e) => {
                                                    setFieldValue("pickupAddress", e.target.value);
                                                    setFieldValue("pickupLocation", null);
                                                    searchLocations(e.target.value, true);
                                                }}
                                            />
                                            {pickupSuggestions.length > 0 && (
                                                <ul className="border rounded-lg bg-white mt-2">
                                                    {pickupSuggestions.map((suggestion, index) => (
                                                        <li
                                                            key={index}
                                                            className="p-2 cursor-pointer hover:bg-gray-100"
                                                            onClick={() => {
                                                                handleSelectLocation(suggestion, true, null, setFieldValue, values);
                                                            }}
                                                        >
                                                            {suggestion}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="flex-1 p-2 space-y-2">
                                            <label className="block text-sm font-medium text-black-700">
                                                Drop Location (Delivery Address) <span className="text-red-500">*</span>
                                            </label>
                                            <Field
                                                type="text"
                                                name="dropAddress"
                                                className="p-2 w-full rounded-xl border-2 border-gray-300"
                                                placeholder="Enter delivery address"
                                                onChange={(e) => {
                                                    setFieldValue("dropAddress", e.target.value);
                                                    setFieldValue("dropLocation", null);
                                                    searchLocations(e.target.value, false);
                                                }}
                                            />
                                            {dropSuggestions.length > 0 && (
                                                <ul className="border rounded-lg bg-white mt-2">
                                                    {dropSuggestions.map((suggestion, index) => (
                                                        <li
                                                            key={index}
                                                            className="p-2 cursor-pointer hover:bg-gray-100"
                                                            onClick={() => {
                                                                handleSelectLocation(suggestion, false, null, setFieldValue, values);
                                                            }}
                                                        >
                                                            {suggestion}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                    
                                )}
                                {bookingData?.serviceType == "AUTO" &&                                 <div className="flex justify-center my-6 gap-4">
                                <Button
                                    color="gray"
                                    onClick={onBackPressHandler}
                                    className='my-6 mx-2 '
                                >
                                    Back
                                </Button>
                                <Button
                                    color="blue"
                                    onClick={() => {
                                        setFieldValue("submitType", "auto");
                                        handleSubmit()
                                    }}
                                    disabled={!dirty || !isValid || (!values.pickupAddress && !values.dropAddress)}
                                    className='my-6 mx-2'
                                >
                                    Confirm Booking
                                </Button>
                            </div>}
                    </>
                            )
                        }}
                    </Formik>
                </>)}
            <DistanceExceedModal isVisible={dropTaxiDistanceExceedModal} onClose={() => { setDropTaxiDistanceExceedModal(false); }} title="Going a bit far?" content="You can choose Outstation within 300km only for the DropTaxi service." />
            <DistanceExceedModal isVisible={distanceExceedModal} onClose={() => { setDistanceExceedModal(false); }} title="Going a bit far?" content="Rides above 10 km are allowed only through DropTaxi or Outstation service." />
            <DistanceExceedModal isVisible={cityLimitExceedModal} onClose={() => { setCityLimitExceedModal(false); }} title="Oops!" content="We currently serve only Vellore, Kanchipuram, Tiruvannamalai. Try another pickup location nearby." />
            <DistanceExceedModal isVisible={zoneErrorModal.show} onClose={() => { setZoneErrorModal({ show: false }); }} title={zoneErrorModal.title} content={zoneErrorModal.text} />
        </div>
    );
};

export default EditBooking;
