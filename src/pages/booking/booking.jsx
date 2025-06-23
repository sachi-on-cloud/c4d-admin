import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Button,
    Card,
    Typography,
} from "@material-tailwind/react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Utils } from '../../utils/utils';
import { API_ROUTES, ColorStyles } from '../../utils/constants';
import { BOOKING_DETAILS_SCHEMA } from '../../utils/validations';
import { ApiRequestUtils } from '../../utils/apiRequestUtils';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BookingsList, SearchDrivers } from '.';
import SearchableDropdown from '@/components/SearchableDropdown';
import CustomerAdd from '../customer/add';
import SelectLocation from './selectLocation';
import BookingItem from "./confirmBooking"
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import EditBooking from './editBooking';


// Format date to YYYY-MM-DD for input's min attribute
const currentDate = () => {
    return (new Date()).toISOString().split('T')[0];
};

const Booking = (props) => {
    const [loading, setLoading] = useState(false);
    const [packageTypeSelectedData, setPackageTypeSelectedData] = useState([]);
    const [bookingTimes, setBookingTimes] = useState([]);
    const [bookingTimesForDay, setBookingTimesForDay] = useState([]);
    const [range, setRange] = useState({});
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [customerData, setCustomerData] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(0);
    const [showQuickCreateCustomer, setShowQuickCreateCustomer] = useState(false);
    const [bookingStage, setBookingStage] = useState(0);
    const [bookingData, setBookingData] = useState();
    const [bookingView, setBookingView] = useState(false);
    const [editBooking, setEditBooking] = useState();
    const [customerNumber, setCustomerNumber] = useState('');
    const [addCustomerNumber, setAddCustomerNumber] = useState('');

    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropSuggestions, setDropSuggestions] = useState([]);
    const [pickupLocation, setPickupLocation] = useState(null);
    const [dropLocation, setDropLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 12.906374, lng: 80.226452 });
    const [mapZoom, setMapZoom] = useState(10);
    const mapRef = useRef(null);
    const [quoteDetails, setQuoteDetails] = useState(null);

    const [editBookingView, setEditBookingView] = useState(false);

    const fetchData = async () => {
        try {
            const response = await ApiRequestUtils.get(API_ROUTES.GET_ALL_CUSTOMERS);
            setCustomerData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const navigate = useNavigate();
    const location = useLocation();
    const params = location.state;

    const getPackageListDetails = useCallback(async () => {
        const data = await ApiRequestUtils.get(API_ROUTES.PACKAGES_LIST);
        if (data?.success) {
            setPackageTypeSelectedData(data?.data);
        }
    }, []);

    const getQuoteOutstationDetails = async (values) => {
        const quoteData = {
            serviceType: values?.serviceType == "RENTAL_DROP_TAXI" ? 'RENTAL' : values?.serviceType,
            bookingType: values?.tripType?.toUpperCase(),
            fromDate: moment(`${values?.rideDate} ${values?.rideTime}`, "YYYY-MM-DD HH:mm:ss").toISOString(),
            toDate: moment(`${values?.toDate} ${values?.toTime}`, "YYYY-MM-DD HH:mm:ss").toISOString(),
            carType: values?.carType != "Sedan" ? values?.carType.toUpperCase() : values?.carType,
            pickupLat: values?.pickupLocation?.lat,
            pickupLong: values?.pickupLocation?.lng,
            dropLat: values?.dropLocation?.lat,
            dropLong: values?.dropLocation?.lng,
            acType: values?.acType?.toUpperCase(),
        };
        const data = await ApiRequestUtils.post(API_ROUTES.GET_QUOTE_OUTSTATION, quoteData);
        //console.log("QOYTEE DATA", data);
        if (data.success) {
            setQuoteDetails(data?.data);
        }
    };

    const getQuoteRides = async (val) => {
        const quoteDate = {
            serviceType: val.serviceType,
            bookingType: "",
            fromDate: moment(`${val?.rideDate} ${val?.rideTime}`, "YYYY-MM-DD HH:mm:ss").toISOString(),
            carType: '',
            pickupLat: val?.pickupLocation?.lat,
            pickupLong: val?.pickupLocation?.lng,
            dropLat: val?.dropLocation?.lat,
            dropLong: val?.dropLocation?.lng,
        }
        const data = await ApiRequestUtils.post(API_ROUTES.GET_QUOTE_OUTSTATION, quoteDate);
        if (data?.success) {
            setQuoteDetails(data?.data)
        }
    }

    useEffect(() => {
        setBookingTimes(Utils.generateBookingTimes());
        fetchData();
        if (params && params.refreshData) {
            setShowQuickCreateCustomer(false);
        }
        if (params && params.customerPhoneNumber !== undefined) {
            setAddCustomerNumber(params.customerPhoneNumber);
            setCustomerNumber(params.customerPhoneNumber);
            setSelectedCustomer(params.selectCustomer);
        }
    }, [params]);

    useEffect(() => {
        getPackageListDetails();
        if (params?.bookingDetails?.packageType === "Outstation" && params?.bookingDetails?.fromDate && params?.bookingDetails?.toDate) {
            setRange({ startDate: params?.bookingDetails?.fromDate, endDate: params?.bookingDetails?.toDate })
        }
    }, []);
    const initialValues = {
        packageTypeSelected: 'Local',
        rideTime: '',
        rideDate: moment().format('YYYY-MM-DD'),
        carSelected: {},
        packageSelected: "",
        fromDate: "",
        toDate: "",
        customerId: '',
        serviceType: '',
        cabType: ''
    };

    const handleDateChange = (dates, setFieldValue, handleChange, rideDate) => {
        const [start, end] = dates;
        setFieldValue('fromDate', start);
        setFieldValue('toDate', end);
        setFieldValue('packageSelected', '0')
        if (start && end) {
            setRange({ startDate: start, endDate: end });
            setDatePickerVisible(false);
        }
        let startDate = moment(start).format("DD-MM-YYYY");
        if (rideDate != startDate) {
            setFieldValue('rideDate', moment(start).format("YYYY-MM-DD"));
            setBookingTimesForDay(Utils.generateBookingTimesForDay(moment(start).format("YYYY-MM-DD")));
        }
    };

    const countDaysBetween = (date1, date2) => {
        //console.log("countDaysBetween", date1, date2);
        const timeDiff = date2.getTime() - date1.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    };

    let days, daysText;
    if (range.startDate && range.endDate) {
        days = countDaysBetween(range.startDate, range.endDate);
        daysText = days == 1 ? '1 Day' : days == 1 ? '2 Days and 1 Night' : `${days} Days and ${days - 1} Nights`;
    }

    const onRideSubmitHandler = async (values) => {
        const bookingData = {
            pickupLat: values.pickupLocation.lat,
            pickupLong: values.pickupLocation.lng,
            pickupAddress: {
                name: values.pickupAddress,
            },
            dropLat: values.dropLocation?.lat,
            dropLong: values.dropLocation?.lng,
            dropAddress: {
                name: values.dropAddress
            },
        }
        let data = await ApiRequestUtils.post(API_ROUTES.ADD_NEW_RIDES_BOOKING, bookingData, values.customerId?.id);
        if (data?.success) {
            setIsOpen(false);
            setBookingData(data?.data);
        }
    }

    const onSubmitHandler = async (values) => {
        const bookingData = {
            carId: values?.carSelected?.id,
            packageId: values?.packageSelected === "0" ? 0 : Number(values?.packageSelected),
            packageType: values?.packageTypeSelected,
            date: values?.rideDate,
            time: values?.rideTime,
            // fromDate: values.fromDate,
            customerId: values.customerId?.id,
            adminBooking: true,
            serviceType: values.serviceType,
            cabType: values.cabType,
            bookingType: values?.tripType?.toUpperCase(),
            acType: values?.acType?.toUpperCase(),
            transmissionType: values.transmissionType,
            carType: values.carType,
            fromDate: moment(`${values.rideDate} ${values.rideTime}`, "YYYY-MM-DD HH:mm:ss").toISOString(),
            pickupLat: values.pickupLocation.lat,
            pickupLong: values.pickupLocation.lng,
            pickupAddress: {
                name: values.pickupAddress,
            },
            dropLat: values.dropLocation?.lat,
            dropLong: values.dropLocation?.lng,
            dropAddress: values.dropLocation ? {
                name: values.dropAddress
            } : null,
            source: 'Call',
        };

        if (values.toDate && values.toTime) {
            bookingData.toDate = moment(`${values.toDate} ${values.toTime}`, "YYYY-MM-DD HH:mm:ss").toISOString()
        };
        let data;
        data = await ApiRequestUtils.post(values.serviceType == "DRIVER" ? API_ROUTES.ADD_NEW_BOOKING : API_ROUTES.ADD_NEW_RENTAL_BOOKING, bookingData, values?.customerId?.id);
        if (data?.success) {
            setIsOpen(false);
            if (params?.bookingDetails) {
                navigate('/dashboard/confirm-booking', { state: { 'bookingId': params?.bookingDetails?.id } });
            } else {
                setBookingStage(1);
                setRange({ startDate: new Date(values?.fromDate), endDate: new Date(values?.toDate) })
                setBookingData(data?.data);
            }
        }
    };

    function convertTimeFormat(time) {
        let [hours, minutes, seconds] = time.split(':');
        hours = parseInt(hours);
        const period = hours >= 12 ? 'p.m.' : 'a.m.';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${period}`;
    };

    const onAssignDriver = (data) => {
        setBookingData(data);
        setBookingStage(2);
        setBookingView(false);
        setEditBooking();
        setSelectedCustomer(0);
    };

    const onEditBooking = async (data) => {
        // console.log('ON EDIT BOOKING :', data);
        setEditBooking(data);
        setBookingStage(0);
        setEditBookingView(true);
        setBookingView(false);
    };

    const onEditBackPress = () => {
        setEditBookingView(false);
        setIsOpen(false);
    };

    const onSelectBooking = (data) => {
        //console.log('selecting booking', data);
        setBookingStage(4);
        setBookingData(data);
        setBookingView(true);
        setEditBooking();
        setEditBookingView(false);
    };

    const onConfirmBooking = () => {
        setBookingStage(0);
        setBookingView(false);
        //console.log("LIST", bookingStage);
    };

    // if (loading) {
    //     return (
    //         <div className="flex justify-center items-center h-screen">
    //             <Spinner className="h-12 w-12" />
    //         </div>
    //     );
    // }
    const onCancelBookingView = () => { }

    const resetPackageValues = (setFieldValue, newServiceType) => {
        setFieldValue("packageSelected", "");

        if (newServiceType === 'CAR_WASH') {
            setFieldValue("packageTypeSelected", "CarWash");
        } else if (newServiceType === 'DRIVER') {
            setFieldValue("packageTypeSelected", "Local");
        }
        else if (newServiceType === 'RENTAL_HOURLY_PACKAGE') {
            setFieldValue("packageTypeSelected", "Local");
            setFieldValue("tripType", "Drop Only");
        }
        else if (newServiceType === 'RENTAL') {
            setFieldValue("packageTypeSelected", "Outstation");
            setFieldValue("tripType", "Round Trip");
            setFieldValue("acType", "Ac");
        }
        else if (newServiceType === 'RENTAL_DROP_TAXI') {
            setFieldValue("packageTypeSelected", "Outstation");
            setFieldValue("tripType", "Drop Only");
            setFieldValue("acType", "Ac");
        }
        else {
            setFieldValue("packageTypeSelected", "");
        }

        setFieldValue("fromDate", "");
        setFieldValue("toDate", "");
        setRange({});
        setDatePickerVisible(false);
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

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyBophy4_QEc4vRjYu222kNHtuNiDga29Uo"
    });

    const validationCheckForDriver = (val) => {
        if (!val || val.serviceType !== "DRIVER") { return false; }

        // const currentDate = new Date(); 
        // const rideDate = val.rideDate ? new Date(val.rideDate) : null;
        // if (!rideDate || rideDate <= currentDate) { return true; }

        if (val.packageTypeSelected === "Local") {
            if (!val.packageSelected) { return true; } return false;
        }

        if (val.packageTypeSelected === "Local" && val.tripType === "Round Trip") {
            if (!val.dropLocation) { return true; } return false;
        }

        if (val.packageTypeSelected === "Outstation" && val.tripType === "Drop Only") {
            if (!val.dropLocation) { return true; } return false;
        }

        if (val.packageTypeSelected === "Outstation" && val.tripType === "Round Trip") {
            if (!val.dropLocation || !val.toDate || !val.toTime) { return true; } return false;
        }

        return false;
    };

    const validationCheckForDriverRental = (val) => {
        if (!val || val.serviceType !== "RENTAL") { return false; }

        if (val.packageTypeSelected == "Outstation" && val.tripType === "Drop Only") {
            if (!val.dropLocation) { return true; } return false;
        }
        if (val.packageTypeSelected == "Outstation") {
            if (!val.acType) { return true; } return false;
        }
    }
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

    const getStatusDisplay = (status) => {
        const statusLower = status?.toLowerCase();

        switch (statusLower) {
            case 'started':
                return (
                    <span className="mx-3 px-2 py-1 text-white bg-blue-600 rounded-md text-sm font-medium">
                        On Trip
                    </span>
                );
            case 'ended':
                return (
                    <span className="mx-3 px-2 py-1 text-white bg-green-600 rounded-md text-sm font-medium">
                        Completed
                    </span>
                );
            case 'customer_cancelled':
                return (
                    <span className="mx-3 px-2 py-1 text-white bg-red-600 rounded-md text-sm font-medium">
                        Cancelled
                    </span>
                );
            case 'initiated':
                if (bookingData?.Driver?.id || bookingData?.Cab?.id) {
                    return (
                        <span className="mx-3 px-2 py-1 text-white bg-gray-600 rounded-md text-sm font-medium">
                            Booked
                        </span>
                    );
                }
                case 'quoted':
                return (
                    <span className="mx-3 px-2 py-1 text-white bg-gray-600 rounded-md text-sm font-medium">
                        QUOTED
                    </span>
                );

                case 'confirmed':
                    return(
                        <span className="mx-3 px-2 py-1 text-white bg-yellow-600 rounded-md text-sm font-medium">
                        CONFIRMED
                    </span>
                    );
                case 'request_driver':
                   return(
                        <span className="mx-3 px-2 py-1 text-white bg-blue-600 rounded-md text-sm font-medium">
                        REQUEST DRIVER
                    </span>
                    );
            default:
                return null;
        }
    };

    // modal data
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className='flex flex-row space-x-6 justify-between w-full'>
            <div className='w-full'>
                <div className='py-6 rounded-3xl flex justify-end'>
                    <button
                        onClick={() => setIsOpen(true)}
                        className={`px-4 py-2 rounded-3xl ${ColorStyles.addButtonColor}`}
                    >
                        Add New Booking
                    </button>

                </div>
                <BookingsList customerId={selectedCustomer} setIsOpen={setIsOpen} bookingStage={bookingStage} onAssignDriver={onAssignDriver} onSelectBooking={onSelectBooking} type={props.typeProp} />
            </div>
            <div>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 w-full" onClick={() => {
                        setIsOpen(false)
                        onConfirmBooking()
                        setSelectedCustomer();
                        setEditBookingView();
                        setEditBooking();
                        setQuoteDetails();
                    }}>
                        <div className="bg-black-gray-500 rounded-2xl  h-screen p-2 w-[75%]  shadow-lg relative" onClick={(e) => e.stopPropagation()}>
                            <div className="flex-1 bg-[#f5f5f5] rounded-xl max-h-screen overflow-y-auto overflow-x-hidden shadow p-4">
                                {/* max-h-screen overflow-y-auto shadow p-4 */}

                                <div className='rounded-2xl justify-end items-end space-x-12 flex'>
                                    <button
                                        onClick={
                                            () => {
                                                setIsOpen(false);
                                                onConfirmBooking();
                                                setSelectedCustomer();
                                                setEditBookingView();
                                                setEditBooking();
                                                setQuoteDetails();
                                            }
                                        }
                                        className="px-0 py-0 bg-black-500"
                                    >
                                        X
                                    </button>
                                </div>
                                {!showQuickCreateCustomer && !editBookingView && <div className='text-2xl font-bold mb-8'>
                                    <Typography variant="h5" color='#000000'>
                                        {/* ${bookingData?.Customer?.firstName ? `- ${bookingData?.Customer?.firstName}` : ''} */}
                                        <div className="flex items-center">
                                            {bookingView ? (
                                                <>
                                                    {`Booking Details - ${bookingData?.bookingNumber}`}
                                                    {bookingData?.status && getStatusDisplay(bookingData.status)}
                                                </>
                                            ) : (bookingStage === 0 ? 'New Booking' : bookingStage === 1 ? 'New Booking' : bookingData?.serviceType == "RENTAL" ? `Assign Cab - ${bookingData?.bookingNumber}` : `Assign Captain - ${bookingData?.bookingNumber} `)}
                                        </div>
                                    </Typography>
                                </div>}
                                {showQuickCreateCustomer && <CustomerAdd isQuickCreate={true} customerNumber={customerNumber} />}
                                {!showQuickCreateCustomer && !bookingView && <>
                                    {(bookingStage === 0 || bookingStage === 1) && <Formik
                                        initialValues={initialValues}
                                        onSubmit={async (values, { resetForm }) => {
                                            if (values.submitType == "rides") {
                                                await onRideSubmitHandler(values);
                                            } else {
                                                await onSubmitHandler(values);
                                            }
                                            setLoading(true);
                                            resetForm();
                                            setRange({});
                                            setLoading(false);
                                            setQuoteDetails();
                                        }}
                                        validationSchema={BOOKING_DETAILS_SCHEMA}
                                        enableReinitialize={true}
                                    >
                                        {({ handleSubmit, values, setFieldValue, isValid, dirty, handleChange, errors }) => (
                                            <>
                                                {customerData && <div className="p-2 flex">
                                                    <SearchableDropdown searchVal={setCustomerNumber} addVal={addCustomerNumber} selected={editBooking?.customerId} options={customerData} onSelect={(val) => {
                                                        setFieldValue('customerId', val);
                                                        setSelectedCustomer(val.id)
                                                    }} />

                                                    {!editBookingView && <Button
                                                        className="ml-3 w-1/2"
                                                        fullWidth
                                                        color="blue"
                                                        onClick={() => { setShowQuickCreateCustomer(true) }}>
                                                        Add New
                                                    </Button>}
                                                </div>}
                                                {!editBookingView && <div className="flex-1 mb-4">
                                                    <div>
                                                        <Typography variant="h6" className="mb-2">
                                                            Service Type
                                                        </Typography>
                                                        <Field as="select" name="serviceType" className="p-2 w-full rounded-xl border-2 border-gray-300" onChange={(e) => {
                                                            //console.log('e.target.value', e.target.value);
                                                            setFieldValue("serviceType", e.target.value, false);
                                                            resetPackageValues(setFieldValue, e.target.value);
                                                            setFieldValue("serviceType", e.target.value, true);
                                                            // if (e.target.value === 'CAR_WASH')
                                                            //     setFieldValue("packageTypeSelected", "CarWash");

                                                        }}>
                                                            <option value="">Service Type</option>
                                                            <option value="DRIVER">Acting Driver</option>
                                                            <option value="RIDES">Local Rides</option>
                                                            <option value="RENTAL_HOURLY_PACKAGE">Hourly Package</option>
                                                            <option value="RENTAL_DROP_TAXI">Drop Taxi</option>
                                                            <option value="RENTAL">OutStation</option>
                                                        </Field>
                                                        <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
                                                    </div>
                                                </div>}
                                                {(values.serviceType === 'DRIVER' || values.serviceType === 'RENTAL' || (values.serviceType === 'RENTAL_HOURLY_PACKAGE' || values.serviceType === 'RENTAL_DROP_TAXI')) && (
                                                    <div className='space-y-3 my-3'>
                                                        <div className={`grid grid-cols-2 gap-4 ${values.serviceType === 'RENTAL' || values.serviceType === 'RENTAL_HOURLY_PACKAGE' || values.serviceType === 'RENTAL_DROP_TAXI' ? 'hidden' : ''}`}>
                                                            {(values.serviceType === 'RENTAL_HOURLY_PACKAGE' || values.serviceType === 'DRIVER') && <Button
                                                                color={values.packageTypeSelected === 'Local' ? 'blue' : 'gray'}
                                                                onClick={() => {
                                                                    if (values.packageTypeSelected !== 'Local') {
                                                                        setFieldValue('packageTypeSelected', 'Local');
                                                                        setFieldValue('packageSelected', '');
                                                                        setRange({});
                                                                        setFieldValue('fromDate', '');
                                                                        setFieldValue('toDate', '');
                                                                    }
                                                                }}
                                                                disabled={bookingStage === 1}
                                                                variant={values?.packageTypeSelected === 'Local' ? 'filled' : 'outlined'}
                                                            >
                                                                Local
                                                            </Button>}
                                                            {(values.serviceType === 'RENTAL' || values.serviceType === 'DRIVER' || values.serviceType === 'RENTAL_DROP_TAXI') &&
                                                                <Button
                                                                    color={values.packageTypeSelected === 'Outstation' ? 'blue' : 'gray'}
                                                                    onClick={() => {
                                                                        if (values.packageTypeSelected !== 'Outstation') {
                                                                            setFieldValue('packageTypeSelected', 'Outstation');
                                                                            setFieldValue('packageSelected', '');
                                                                            setRange({});
                                                                            setFieldValue('fromDate', '');
                                                                            setFieldValue('toDate', '');
                                                                        }
                                                                    }}
                                                                    disabled={bookingStage === 1}
                                                                    variant={values?.packageTypeSelected === 'Outstation' ? 'filled' : 'outlined'}
                                                                >
                                                                    Outstation
                                                                </Button>}
                                                        </div>
                                                        {((values.serviceType === 'RENTAL' && values.packageTypeSelected === 'Outstation') || (values.serviceType === 'RENTAL_HOURLY_PACKAGE' && values.packageTypeSelected === 'Local') || (values.serviceType === 'RENTAL_DROP_TAXI' && values.packageTypeSelected === 'Outstation') || (values.serviceType === 'DRIVER')) && (
                                                            <div className={['RENTAL', 'RENTAL_HOURLY_PACKAGE', 'RENTAL_DROP_TAXI'].includes(values.serviceType) ? 'hidden' : ''}>
                                                                <Typography className="text-sm font-medium text-black-700">Trip Type</Typography>
                                                                <div className="grid grid-cols-2 gap-4 mt-2">
                                                                    {(values.serviceType === 'RENTAL_DROP_TAXI' ||
                                                                        values.serviceType === 'DRIVER' ||
                                                                        values.serviceType === 'RENTAL_HOURLY_PACKAGE') && (
                                                                            <Button
                                                                                color={values.tripType === 'Drop Only' ? 'blue' : 'gray'}
                                                                                onClick={() => setFieldValue('tripType', 'Drop Only')}
                                                                                variant={values?.tripType === 'Drop Only' ? 'filled' : 'outlined'}
                                                                            >
                                                                                Drop Only
                                                                            </Button>
                                                                        )}
                                                                    {(values.serviceType === 'RENTAL' || values.serviceType === 'DRIVER') && (
                                                                        <Button
                                                                            color={values.tripType === 'Round Trip' ? 'blue' : 'gray'}
                                                                            onClick={() => setFieldValue('tripType', 'Round Trip')}
                                                                            variant={values?.tripType === 'Round Trip' ? 'filled' : 'outlined'}
                                                                        >
                                                                            Round Trip
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className='grid grid-cols-2 mt-2 space-x-3'>
                                                            {(values.serviceType === 'DRIVER' || values.serviceType === 'RENTAL' || values.serviceType === 'RENTAL_HOURLY_PACKAGE' || values.serviceType === 'RENTAL_DROP_TAXI' ? 'visible' : '') && (<div>
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
                                                            )}
                                                            {(values.serviceType === 'DRIVER') && (
                                                                <div>
                                                                    <label className="text-sm font-medium text-black-700">Transmission Type</label>
                                                                    <div className="flex gap-2">
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
                                                    </div>

                                                )}
                                                {(((values.serviceType === 'RENTAL' || values.serviceType === 'RENTAL_DROP_TAXI') && values.packageTypeSelected === 'Outstation')) && (
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
                                                <div className='grid grid-cols-2 mt-2 space-x-3'>
                                                    {(values.serviceType === 'DRIVER' || values.serviceType === 'CAR_WASH' || values.serviceType === 'RENTAL' || values.serviceType === 'RENTAL_HOURLY_PACKAGE' || values.serviceType === 'RENTAL_DROP_TAXI') && (
                                                        <div className="flex-1 mb-2">
                                                            <Typography variant="h6" className="mb-2">
                                                                Pickup Date & Time
                                                            </Typography>
                                                            <Field
                                                                type="datetime-local"
                                                                name="rideDateTime"
                                                                disabled={bookingStage === 1}
                                                                className="p-2 w-full rounded-xl border-2 border-gray-300"
                                                                value={values.rideDate ? `${values.rideDate}T${values.rideTime}` : ''}
                                                                min={`${moment().format('YYYY-MM-DD')}T00:00`}
                                                                onChange={(e) => {
                                                                    const selectedDateTime = e.target.value;
                                                                    const formattedDate = moment(selectedDateTime).format('YYYY-MM-DD');
                                                                    const formattedTime = moment(selectedDateTime).format('HH:mm');

                                                                    setFieldValue('rideDate', formattedDate);
                                                                    setFieldValue('rideTime', formattedTime);

                                                                    setBookingTimesForDay(Utils.generateBookingTimesForDay(new Date(formattedDate)));

                                                                    if (formattedDate !== values.fromDate) {
                                                                        setRange({});
                                                                        setFieldValue('fromDate', '');
                                                                        setFieldValue('toDate', '');
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    {(values.serviceType === 'DRIVER' || values.serviceType === 'RENTAL') && values.packageTypeSelected === "Outstation" && values.tripType === 'Round Trip' && (
                                                        <div className="flex-1 mb-2">
                                                            <Typography variant="h6" className="mb-2">
                                                                Return Date & Time
                                                            </Typography>
                                                            <Field
                                                                type="datetime-local"
                                                                name="returnDateTime"
                                                                disabled={bookingStage === 1}
                                                                className="p-2 w-full rounded-xl border-2 border-gray-300"
                                                                value={values.toDate ? `${values.toDate}T${values.toTime}` : ''}
                                                                min={values.rideDate ? `${values.rideDate}T${values.rideTime}` : `${moment().format('YYYY-MM-DD')}T00:00`}
                                                                onChange={(e) => {
                                                                    const selectedDateTime = e.target.value;
                                                                    const formattedDate = moment(selectedDateTime).format('YYYY-MM-DD');
                                                                    const formattedTime = moment(selectedDateTime).format('HH:mm');

                                                                    setFieldValue('toDate', formattedDate);
                                                                    setFieldValue('toTime', formattedTime);

                                                                    if (moment(formattedDate).isBefore(values.rideDate)) {
                                                                        setFieldValue('toTime', '');
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {(values.serviceType === 'DRIVER' || values.serviceType === 'CAR_WASH' || values.serviceType === 'RENTAL' || values.serviceType === 'RENTAL_HOURLY_PACKAGE') && values.packageTypeSelected == 'Local' &&
                                                    <div className="flex-1 mb-4">
                                                        <div>
                                                            <Typography variant="h6" className="mb-2">
                                                                Choose a package
                                                            </Typography>
                                                            <Field as="select" disabled={bookingStage === 1} name="packageSelected" className="p-2 w-full rounded-xl border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" value={values.packageSelected}
                                                                onChange={(e) => {
                                                                    setFieldValue('packageSelected', e.target.value);
                                                                    if (values.packageTypeSelected === 'Outstation' && values.fromDate && values.toDate) {
                                                                        setDatePickerVisible(false);
                                                                        setRange({});
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
                                                                        else if (values.serviceType === 'DRIVER') {
                                                                            return item.serviceType === 'DRIVER' && item.type === 'Local';
                                                                        }
                                                                        else if (values.serviceType === 'RENTAL' || values.serviceType === 'RENTAL_HOURLY_PACKAGE') {
                                                                            return item.serviceType === 'RENTAL' || item.serviceType === 'RENTAL_HOURLY_PACKAGE' && item.type === 'Local';
                                                                        }
                                                                        return values.packageTypeSelected === item.type;
                                                                    })
                                                                    .map((item) => (
                                                                        <option key={item.id} value={item.id}>
                                                                            {/* {item.period} {values.packageTypeSelected === 'Outstation' ? 'd' : values.packageTypeSelected === 'Local' ? 'hr' : ''} */}
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
                                                    </div>
                                                }

                                                {/* {(values.serviceType === 'DRIVER' || values.serviceType === 'CAB') && values.packageTypeSelected === "Outstation" && (
                                    <div className="space-y-4 mb-4">
                                        <Typography variant="h6" className="text-center">OR</Typography>
                                        <Button
                                            fullWidth
                                            color="blue"
                                            disabled={bookingStage === 1}
                                            onClick={() => setDatePickerVisible(!datePickerVisible)}
                                        >
                                            Select Date Range
                                        </Button>
                                        {datePickerVisible && (
                                            <div className='w-full'>
                                                <DatePicker
                                                    selected={values.fromDate}
                                                    onChange={(dates) => {
                                                        //console.log(values.rideDate, " ", dates.start)
                                                        handleDateChange(dates, setFieldValue, handleChange, values.rideDate)
                                                    }}
                                                    startDate={values.fromDate}
                                                    endDate={values.toDate}
                                                    selectsRange
                                                    inline
                                                    className="w-full h-full"
                                                    minDate={new Date()}
                                                />
                                            </div>
                                        )}
                                        {(range.startDate && range.endDate) && (
                                            <Card className="p-4">
                                                <div className="grid grid-cols-2 gap-4 mb-2">
                                                    <div>
                                                        <Typography>Departure</Typography>
                                                        <Typography variant="h4">{new Date(range.startDate).getDate()}</Typography>
                                                        <Typography>{new Date(range.startDate).toLocaleString('default', { month: 'short' })}</Typography>
                                                    </div>
                                                    <div>
                                                        <Typography>Return</Typography>
                                                        <Typography variant="h4">{new Date(range.endDate).getDate()}</Typography>
                                                        <Typography>{new Date(range.endDate).toLocaleString('default', { month: 'short' })}</Typography>
                                                    </div>
                                                </div>
                                                <Typography variant='h6'>
                                                    Selected Date: {countDaysBetween(range.startDate, range.endDate)} days
                                                </Typography>
                                                <Typography variant='h6'>
                                                    Total Amount: ₹ {countDaysBetween(range.startDate, range.endDate) * 1000}
                                                </Typography>
                                            </Card>
                                        )}
                                    </div>
                                )} */}
                                                <div className='grid grid-cols-2'>
                                                    {((values.tripType) || (values.serviceType == 'RIDES') || (values.serviceType == 'RENTAL') || (values.serviceType == 'RENTAL_HOURLY_PACKAGE')) && <div className="p-2 space-y-2">
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
                                                    </div>}
                                                    <div className="p-2 space-y-2 space-x-3">
                                                        {((values.packageSelected && values.tripType == "Local" && values.serviceType !== 'RENTAL_HOURLY_PACKAGE') || (values.packageSelected && values.tripType == "Round Trip" && values.serviceType !== 'CAR_WASH') || (values.packageTypeSelected == 'Outstation') || (values.serviceType == 'RIDES')) && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-black-700">Drop Location<span className="text-red-500">*</span></label>
                                                                <Field
                                                                    type="text"
                                                                    name="dropAddress"
                                                                    className="p-2  mt-2 w-full rounded-xl border-2 border-gray-300"
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

                                                        )}
                                                    </div>
                                                </div>
                                                {values.packageSelected &&
                                                    <Card className="my-6">
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
                                                                            {values.serviceType === 'DRIVER' || (values.serviceType === 'RENTAL' || values.serviceType === 'RENTAL_HOURLY_PACKAGE' && values.packageTypeSelected == "Local") ?
                                                                                ("₹" + packageTypeSelectedData.find(pkg => pkg.id === Number(values.packageSelected))?.price || "")
                                                                                : ""
                                                                            }
                                                                        </Typography>
                                                                    </div>
                                                                </>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                }

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
                                                                        {values.serviceType !== 'DRIVER' && <Typography color="gray" variant="h6">Estimated Distance</Typography>}
                                                                        {values.serviceType !== 'DRIVER' && <Typography>
                                                                            {Math.round(quoteDetails.amount.estimatedDistance)} Kms
                                                                        </Typography>}
                                                                        {values.serviceType !== 'DRIVER' && <Typography color="gray" variant="h6">Kilometer Price Value</Typography>}
                                                                        {values.serviceType !== 'DRIVER' && <Typography>
                                                                            ₹ {quoteDetails.amount.kilometerPriceVal}
                                                                        </Typography>}
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

                                                {/* {values.pickupAddress && isLoaded && (
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '50%' }}
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
                                )} */}

                                                {/* <p>Form Errors (Debug):</p><p>{JSON.stringify(errors, null, 2)}</p> */}

                                                {values.packageTypeSelected == 'Outstation' && values.dropLocation && values.pickupLocation &&
                                                    <Button fullWidth className='my-6 mx-2' onClick={() => getQuoteOutstationDetails(values)}>
                                                        Check Estimated Price
                                                    </Button>
                                                }

                                                {values.serviceType == 'RIDES' && values.dropLocation && values.pickupLocation &&
                                                    <Button fullWidth className='my-6 mx-2' onClick={() => getQuoteRides(values)}>
                                                        Check Estimated Price
                                                    </Button>
                                                }

                                                {bookingStage === 0 && (values.serviceType === 'DRIVER' || values.serviceType === 'CAR_WASH') && <Button
                                                    fullWidth
                                                    color="blue"
                                                    onClick={() => {
                                                        setFieldValue("submitType", "default");
                                                        handleSubmit();
                                                    }}
                                                    disabled={
                                                        !dirty ||
                                                        !isValid ||
                                                        !values.rideDate ||
                                                        !values.packageTypeSelected ||
                                                        !values.pickupAddress ||
                                                        (values.packageTypeSelected === "Local" && !values.packageSelected) ||
                                                        (values.packageTypeSelected === "Outstation" && !values.dropAddress) ||
                                                        (values.packageTypeSelected === "Local" && values.tripType === "Round Trip" && !values.dropAddress) ||
                                                        validationCheckForDriver(values)
                                                    }
                                                    className={`my-6 mx-2 ${ColorStyles.continueButtonColor}`}
                                                >
                                                    Continue
                                                </Button>}
                                                {(values.serviceType == 'RIDES') &&
                                                    <Button
                                                        fullWidth
                                                        color="blue"
                                                        onClick={() => {
                                                            setFieldValue("submitType", "rides");
                                                            handleSubmit();
                                                        }}
                                                        disabled={!(values.pickupAddress && values.dropAddress && selectedCustomer)}
                                                        className={`my-6 mx-2 ${ColorStyles.continueButtonColor}`}
                                                    >
                                                        Continue
                                                    </Button>
                                                }
                                                <div className='p-3'>
                                                    {values.serviceType == 'RENTAL' &&
                                                        <Button
                                                            fullWidth
                                                            color="blue"
                                                            onClick={() => {
                                                                setFieldValue("submitType", "rental");
                                                                handleSubmit();
                                                            }}
                                                            disabled={
                                                                !dirty ||
                                                                !isValid ||
                                                                !values.rideDate ||
                                                                !values.packageTypeSelected ||
                                                                !values.pickupAddress ||
                                                                (values.packageTypeSelected === "Local" && !values.packageSelected) ||
                                                                (values.packageTypeSelected === "Outstation" && !values.dropAddress) ||
                                                                (values.packageTypeSelected === "Outstation" && !values.acType) ||
                                                                (values.packageTypeSelected === "Outstation" && values.tripType === "Round Trip" && !values.toDate) ||
                                                                validationCheckForDriverRental(values)
                                                            }
                                                            className={`my-6 mx-2 ${ColorStyles.continueButtonColor}`}
                                                        >
                                                            Continue
                                                        </Button>
                                                    }
                                                    {values.serviceType == 'RENTAL_HOURLY_PACKAGE' &&
                                                        <Button
                                                            fullWidth
                                                            color="blue"
                                                            onClick={() => {
                                                                setFieldValue("submitType", "rental");
                                                                handleSubmit();
                                                            }}
                                                            disabled={
                                                                !dirty ||
                                                                !isValid ||
                                                                !values.rideDate ||
                                                                !values.packageSelected ||
                                                                !values.pickupAddress
                                                            }
                                                            className={`my-6 mx-2 ${ColorStyles.continueButtonColor}`}
                                                        >
                                                            Continue
                                                        </Button>
                                                    }
                                                    {values.serviceType == 'RENTAL_DROP_TAXI' &&
                                                        <Button
                                                            fullWidth
                                                            color="blue"
                                                            onClick={() => {
                                                                setFieldValue("submitType", "rental");
                                                                handleSubmit();
                                                            }}
                                                            disabled={
                                                                !dirty ||
                                                                !isValid ||
                                                                !values.rideDate ||
                                                                !values.acType ||
                                                                !values.pickupAddress ||
                                                                !values.dropAddress
                                                            }
                                                            className={`my-6 mx-2 ${ColorStyles.continueButtonColor}`}
                                                        >
                                                            Continue
                                                        </Button>
                                                    }
                                                </div>
                                            </>
                                        )}
                                    </Formik>}
                                    {bookingStage === 2 && bookingData && (
                                        <SearchDrivers bookingData={bookingData} onNext={() => {
                                            setBookingStage(0);
                                            setBookingData(null);
                                            setIsOpen(false);
                                        }} />
                                    )}
                                </>}
                                {bookingView && <>
                                    <BookingItem bookingData={bookingData} setIsOpen={() => setIsOpen(false)} onCancel={onCancelBookingView} onAssignDriver={onAssignDriver} onEdit={onEditBooking} onConfirm={onConfirmBooking} />
                                </>}
                                {editBookingView &&
                                    <EditBooking bookingData={bookingData} setIsOpen={() => setIsOpen(false)} editCancel={onEditBackPress} />
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Booking;