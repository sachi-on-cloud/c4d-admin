import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Button,Card,Typography,CircularProgress} from "@material-tailwind/react";
import { Formik, Field, ErrorMessage } from 'formik';
import { Utils } from '../../utils/utils';
import moment from 'moment';
import { GoogleMap, Marker} from '@react-google-maps/api';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import SearchableDropdown from '@/components/SearchableDropdown';

const EditBooking = (props) => {
    const [loading,setLoading]=useState(true);
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
useEffect(() => {
    fetchData();
    if (props.bookingData) {
        getBookingDetailsById(props.bookingData.id, props.bookingData.customerId);
    }
}, [props.bookingData]);

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
            console.log("dtaaa",data?.data)
            }
        }
        catch{
                console.error('loader is not working')
            }
            finally {
            setLoading(false);
        }
    };

    const getPackageListDetails = useCallback(async () => {
        const data = await ApiRequestUtils.get(API_ROUTES.PACKAGES_LIST);
        if (data?.success) {
            setPackageTypeSelectedData(data?.data);
        }
    }, []);

    const getQuoteOutstationDetails = async (values) =>{
        const quoteData = {
            serviceType: values?.serviceType == "RENTAL_DROP_TAXI" ? 'RENTAL' : values?.serviceType,
            bookingType: values?.tripType?.toUpperCase(),
            fromDate: moment(`${values?.rideDate} ${values?.rideTime}`, "YYYY-MM-DD HH:mm:ss").toISOString(),
            toDate: moment(`${values?.toDate} ${values?.toTime}`, "YYYY-MM-DD HH:mm:ss").toISOString(),
            carType: values?.carType != "Sedan" ? values?.carType.toUpperCase() : values?.carType,
            pickupLat: values?.pickupLocation?.lat ? values?.pickupLocation?.lat : bookingData?.pickupLat,
            pickupLong: values?.pickupLocation?.lng ? values?.pickupLocation?.lng : bookingData?.pickupLong,
            dropLat: values?.dropLocation?.lat ? values?.dropLocation?.lat : bookingData?.dropLat,
            dropLong: values?.dropLocation?.lng ? values?.dropLocation?.lng : bookingData?.dropLong,
            acType:values?.acType?.toUpperCase(),
        };
        const data = await ApiRequestUtils.post(API_ROUTES.GET_QUOTE_OUTSTATION, quoteData);
        console.log("QOYTEE DATA",data);
        if (data.success) {
            setQuoteDetails(data.data);
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
        acType: bookingData?.acType == "Ac" ? "Ac" : "Non Ac" || ''
    };
    
    const searchLocations = async (query, isPickup) => {
        if (query.length > 2) {
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.SEARCH_ADDRESS, { address: query });
            if (data?.success && data?.data) {
                if (isPickup) {
                    setPickupSuggestions(data?.data);
                } else {
                    setDropSuggestions(data?.data);
                }
            }
        } else {
            setPickupSuggestions([]);
            setDropSuggestions([]);
        }
    };
    
    const handleSelectLocation = async (address, isPickup, setFieldValue) => {
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_LATLONG, { address });
        if (data?.success) {
            const location = { lat: data.data.lat, lng: data.data.lng };
            if (isPickup) {
                setFieldValue("pickupAddress", address);
                setFieldValue("pickupLocation", location);
                setPickupLocation(location);
                setPickupSuggestions([]);
            } else {
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

    useEffect(()=>{
        getPackageListDetails();
    },[]);

    const editSubmit = async(values) =>{
        let data;
        let editBookingData;
        if(values.submitType=="default"){
             data = {
                packageId: values?.packageSelected === "0" ? 0 : Number(values?.packageSelected),
                packageType: values?.packageTypeSelected,
                customerId: bookingData?.Customer?.id,
                bookingId: bookingData?.id ,
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
                acType: values?.acType.toUpperCase()
            };
            if(values.packageTypeSelected == 'Outstation' && values?.tripType?.toUpperCase() == 'ROUND TRIP'){
                data.toDate = moment(`${values.toDate} ${values.toTime}`, "YYYY-MM-DD HH:mm:ss").toISOString();       
            }
            if(!(values.packageTypeSelected == 'Local' && values?.tripType?.toUpperCase() == 'DROP ONLY')){
                data.dropLat = values?.dropLocation?.lat ? values?.dropLocation?.lat : bookingData?.dropLat
                data.dropLong = values?.dropLocation?.lng ? values?.dropLocation?.lng : bookingData?.dropLong
                data.dropAddress = values?.dropLocation ? {name: values?.dropAddress} : bookingData?.dropAddress ? {
                    name: values?.dropAddress ? values?.dropAddress : bookingData?.dropAddress?.name
                } : null
            }
            editBookingData = await ApiRequestUtils.update(API_ROUTES.UPDATE_BOOKING, data);
        }else if(values.submitType == 'rides'){
            data = {
                customerId: bookingData?.Customer?.id,
                bookingId: bookingData?.id,
                pickupLat: values?.pickupLocation?.lat ? values?.pickupLocation?.lat : bookingData?.pickupLat,
                pickupLong: values?.pickupLocation?.lng ? values?.pickupLocation?.lng : bookingData?.pickupLong,
                pickupAddress: {
                    name: values?.pickupAddress ? values?.pickupAddress : bookingData?.pickupAddress?.name
                },
            }
            data.dropLat = values?.dropLocation?.lat ? values?.dropLocation?.lat : bookingData?.dropLat
            data.dropLong = values?.dropLocation?.lng ? values?.dropLocation?.lng : bookingData?.dropLong
            data.dropAddress = {
                name: values?.dropAddress ? values?.dropAddress : bookingData?.dropAddress?.name
            }
            editBookingData = await ApiRequestUtils.update(API_ROUTES.UPDATE_RIDES_BOOKING, data);
        }
        if(editBookingData.success){
            props.editCancel();
        }
    }

    return (
        <div className="p-4 mx-auto">
            {loading ? (
            <div className="flex justify-center">
                    <div role="status">
                        <svg aria-hidden="true" class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                        <span class="sr-only">Loading...</span>
                    </div>
            </div>
        ) : (
            <>
           
            <div className='pb-4'>
                <Typography variant="h5" color='#000000'>
                    Edit Booking - {bookingData?.bookingNumber}
                </Typography>
            </div>
            <Formik
                initialValues={initialValues}
                onSubmit={editSubmit}
                enableReinitialize
            >
                {({ handleSubmit, setFieldValue, values, dirty, isValid }) => {
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
                        {bookingData?.serviceType !== "RIDES" && <>
                            <div className="flex-1 mb-4">
                                <div>
                                    <Typography variant="h6" className="mb-2">
                                        Service Type
                                    </Typography>
                                    <Field as="select" name="serviceType" disabled className="p-2 w-full rounded-xl border-2 border-gray-300">
                                        <option value="">Service Type</option>
                                        <option value="DRIVER">Driver</option>
                                        <option value="RENTAL">Rentals</option>
                                        <option value="RIDES">Rides</option>
                                    </Field>
                                    <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
                                </div>
                            </div>
                            <div className='space-y-3 my-3'>
                                <div className={`grid grid-cols-2 gap-4 ${values.serviceType === 'RENTAL' ? 'hidden' : ''}`}>
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
                                <div className={['RENTAL'].includes(values.serviceType) ? 'hidden' : ''}>
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
                                    <label className="text-sm font-medium text-black-700">Car Type</label>
                                    <div className="flex gap-4">
                                        {['Mini', 'Sedan', 'SUV', 'MUV'].map((carType) => (
                                            <label key={carType} className="flex items-center space-x-2">
                                                <Field
                                                    type="radio"
                                                    name="carType"
                                                    value={carType}
                                                    className="h-4 w-4 text-blue-600"
                                                />
                                                <span className="text-black-700">{carType}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <ErrorMessage name="carType" component="div" className="text-red-500 text-sm mt-1" />
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
                                                    className="h-4 w-4 text-blue-600"
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
                                                    color={values.acType === 'Ac' ? 'blue' : 'gray'}
                                                    onClick={() => setFieldValue('acType', 'Ac')}
                                                    variant={values?.acType === 'Ac' ? 'filled' : 'outlined'}
                                                >
                                                    AC
                                                </Button>

                                                <Button
                                                    color={values.acType === 'Non Ac' ? 'blue' : 'gray'}
                                                    onClick={() => setFieldValue('acType', 'Non Ac')}
                                                    variant={values?.acType === 'Non Ac' ? 'filled' : 'outlined'}
                                                >
                                                    NON AC
                                                </Button>
                                            </div>
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
                            {(values.tripType =='Round Trip' && values.packageTypeSelected == 'Outstation') && <div className="flex-1 mb-2">
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
                            {values.packageTypeSelected =='Local' && <div className="flex-1 mb-4">
                                <div>
                                    <Typography variant="h6" className="mb-2">
                                        Choose a package
                                    </Typography>
                                    <Field as="select" name="packageSelected" className="p-2 w-full rounded-xl border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" value={values.packageSelected}
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
                                                    return item.serviceType === 'RENTAL'  && item.type === 'Local';
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
                                                    handleSelectLocation(suggestion, true, setFieldValue);
                                                }}
                                            >
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            {(values.tripType !== 'Drop Only' || values.packageTypeSelected === 'Outstation') && !(values.serviceType === 'RENTAL' && values.packageTypeSelected === 'Local') && ( <div className="flex-1 p-2 space-y-2">
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
                                                    handleSelectLocation(suggestion, false, setFieldValue);
                                                }}
                                            >
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>)}
                            </div>
                            {values.packageSelected && values.packageTypeSelected =='Local' && <Card className="my-6">
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
                                                    ₹ {packageTypeSelectedData.find(pkg => pkg.id === Number(values.packageSelected))?.price || ""}
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
                                                    <Typography color="gray" variant="h6">Estimated Fare</Typography>
                                                    <Typography>
                                                        ₹ {quoteDetails.amount.estimatedPrice}
                                                    </Typography>
                                                    <Typography color="gray" variant="h6">Base Fare</Typography>
                                                    <Typography>
                                                        ₹ {quoteDetails.amount.baseFare} 
                                                    </Typography>
                                                    <Typography color="gray" variant="h6">Estimated Distance</Typography>
                                                    <Typography>
                                                            {Math.round(quoteDetails.amount.estimatedDistance)}
                                                    </Typography>
                                                    <Typography color="gray" variant="h6">Kilometer Price Value</Typography>
                                                    <Typography>
                                                        ₹{quoteDetails.amount.kilometerPriceVal}
                                                    </Typography>
                                                    {/* <Typography color="gray" variant="h6">Extra Km Price</Typography>
                                                    <Typography>
                                                        ₹ {quoteDetails.amount.extraKmPrice}
                                                    </Typography> */}
                                                    {/* <Typography color="gray" variant="h6">difference Days</Typography>
                                                    <Typography>
                                                        ₹ {quoteDetails.amount.differenceDays}
                                                    </Typography> */}
                                                    {/* <Typography color="gray" variant="h6">driver Charge</Typography>
                                                    <Typography>
                                                        ₹ {quoteDetails.amount.driverCharge}
                                                    </Typography> */}
                                                </div>
                                            </>
                                        </div>
                                    </div>
                                </Card>
                            }
                            {values.packageTypeSelected == 'Outstation' && 
                            <Button fullWidth className='my-6 mx-2 bg-[#1A73E8]' onClick={() => getQuoteOutstationDetails(values)}>
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
                                    onClick={()=>{
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
                                                        handleSelectLocation(suggestion, true, setFieldValue);
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
                                                        handleSelectLocation(suggestion, false, setFieldValue);
                                                    }}
                                                >
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                 </div>
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
                                        onClick={()=>{
                                            setFieldValue("submitType", "rides"); 
                                            handleSubmit()
                                        }}
                                        // disabled={!dirty || !isValid}
                                        className='my-6 mx-2'
                                    >
                                        Confirm Booking
                                    </Button>
                                </div>
                            </>
                        }
                    </>
                )}}
            </Formik>
            </> )}
        </div>
    );
};

export default EditBooking;
