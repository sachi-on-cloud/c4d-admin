import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Button,
    Card,
    Typography,
    Select,
    Option,
    Input,
    Spinner,
} from "@material-tailwind/react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Utils } from '../../utils/utils';
import { API_ROUTES } from '../../utils/constants';
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
    useEffect(() => {
        if (editBooking?.packageType === "Outstation" && editBooking?.fromDate && editBooking?.toDate) {
            setRange({ startDate: new Date(editBooking?.fromDate), endDate: new Date(editBooking?.toDate) })
        }
    }, [editBooking]);
    //console.log(editBooking, "editBooking");
    const initialValues = {
        packageTypeSelected: editBooking?.packageType ? editBooking?.packageType : 'Local',
        rideTime: editBooking?.time ? editBooking?.time : '',
        rideDate: editBooking?.date ? editBooking?.date : moment().format('YYYY-MM-DD'),
        carSelected: {},
        packageSelected: editBooking?.packageId ? editBooking?.packageId : "",
        fromDate: editBooking?.fromDate ? editBooking?.fromDate : "",
        toDate: editBooking?.toDate ? editBooking?.toDate : "",
        customerId: editBooking?.customerId ? editBooking?.customerId : '',
        serviceType: editBooking?.serviceType ? editBooking?.serviceType : '',
        cabType: editBooking?.cabType ? editBooking?.cabType : ''
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

    const onSubmitHandler = async (values) => {
        const bookingData = {
            carId: values?.carSelected?.id,
            packageId: values?.packageSelected === "0" ? 0 : Number(values?.packageSelected),
            packageType: values?.packageTypeSelected,
            date: values?.rideDate,
            time: values?.rideTime,
            fromDate: values.fromDate,
            toDate: values.toDate, // outstation
            customerId: values.customerId?.id,
            adminBooking: true,
            serviceType: values.serviceType,
            cabType: values.cabType,
            bookingType:values.tripType.toUpperCase(),
            transmissionType : values.transmissionType,
            carType: values.carType,
            fromDate: moment(`${values.rideDate} ${values.rideTime}`, "YYYY-MM-DD HH:mm:ss"),    
            pickupLat: values.pickupLocation.lat,
            pickupLong: values.pickupLocation.lng,
            pickupAddress: {
                name: values.pickupAddress,
            },
            dropLat: values.dropLocation?.lat,
            dropLong: values.dropLocation?.lng,
            dropAddress: values.dropLocation ? {
                name: values.dropAddress
            } : null
        }
        console.log("VALYESS",values);
        let data;
        if (editBooking?.id) {
            bookingData['bookingId'] = editBooking?.id;
            data = await ApiRequestUtils.update(API_ROUTES.UPDATE_BOOKING, bookingData);
        } else {
            data = await ApiRequestUtils.post(API_ROUTES.ADD_NEW_BOOKING, bookingData, values?.customerId?.id);
        }
        if (data?.success) {
            if (params?.bookingDetails) {
                navigate('/dashboard/confirm-booking', { state: { 'bookingId': params?.bookingDetails?.id } });
            } else {
                setBookingStage(1);
                setRange({ startDate: new Date(values?.fromDate), endDate: new Date(values?.toDate) })
                setBookingData(data?.data);
            }
        }
    }
    function convertTimeFormat(time) {
        let [hours, minutes, seconds] = time.split(':');
        hours = parseInt(hours);

        const period = hours >= 12 ? 'p.m.' : 'a.m.';
        hours = hours % 12 || 12;

        return `${hours}:${minutes} ${period}`;
    }
    const onAssignDriver = (data) => {
        setBookingData(data);
        setBookingStage(2);
        setBookingView(false);
        setEditBooking();
        setSelectedCustomer(0);
    }
    const onEditBooking = async (data) => {
        console.log('ON EDIT BOOKING :', data);
        setEditBooking(data);
        setBookingStage(0);
        setBookingView(false);
    }

    const onSelectBooking = (data) => {
        //console.log('selecting booking', data);
        setBookingStage(4);
        setBookingData(data);
        setBookingView(true);
        setEditBooking();
    }
    const onConfirmBooking = () => {
        setBookingStage(0);
        setBookingView(false);
        //console.log("LIST", bookingStage);
    }

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
        } else if (newServiceType === 'DRIVER' || newServiceType === 'CAB') {
            setFieldValue("packageTypeSelected", "Local");
        } else {
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
                setPickupSuggestions([]);
            } else {
                setFieldValue("dropAddress", address);
                setFieldValue("dropLocation", location);
                setDropSuggestions([]);
            }
        }
    };

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
          case 'cancelled':
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
            return (
              <span className="mx-3 px-2 py-1 text-white bg-gray-600 rounded-md text-sm font-medium">
                Initiated
              </span>
            );
          default:
            return null;
        }
      };
    return (
        <div className='flex flex-row space-x-6 justify-between w-full'>
            <div className='w-4/6'>
                <BookingsList customerId={selectedCustomer} bookingStage={bookingStage} onAssignDriver={onAssignDriver} onSelectBooking={onSelectBooking} />
            </div>
            <div className="flex-1 bg-white p-3 rounded-xl w-2/6 ">
                {!showQuickCreateCustomer && <div className='text-2xl font-bold mb-8'>
                    <Typography variant="h5" color='#000000'>
                        {/* ${bookingData?.Customer?.firstName ? `- ${bookingData?.Customer?.firstName}` : ''} */}
                        <div className= "flex items-center">
                        {bookingView ? (
                            <>
                                {`Booking Details - ${bookingData?.bookingNumber}`} 
                                {bookingData?.status && getStatusDisplay(bookingData.status)}
                            </>
                        ) : ( bookingStage === 0 ? 'New Booking' : bookingStage === 1 ? 'New Booking' : bookingData?.serviceType == "CAB" ? `Assign Cab - ${bookingData?.bookingNumber}` : `Assign Captain - ${bookingData?.bookingNumber} `)}
                        </div>
                    </Typography>
                </div>}
                {showQuickCreateCustomer && <CustomerAdd isQuickCreate={true} customerNumber={customerNumber} />}
                {!showQuickCreateCustomer && !bookingView && <>
                    {(bookingStage === 0 || bookingStage === 1) && <Formik
                        initialValues={initialValues}
                        onSubmit={async (values, { resetForm }) => {
                            setLoading(true);
                            await onSubmitHandler(values);
                            // resetForm();
                            setRange({});
                            setLoading(false);
                        }}
                        validationSchema={BOOKING_DETAILS_SCHEMA}
                        enableReinitialize={true}
                    >
                        {({ handleSubmit, values, setFieldValue, isValid, dirty, handleChange }) => (
                            <>
                                {customerData && <div className="p-2 flex">
                                    <SearchableDropdown searchVal={setCustomerNumber} addVal={addCustomerNumber} selected={editBooking?.customerId} options={customerData} onSelect={(val) => {
                                        setFieldValue('customerId', val);
                                        setSelectedCustomer(val.id)
                                    }} />
                                    <Button
                                        className="ml-3 w-1/2"
                                        fullWidth
                                        color="black"
                                        onClick={() => { setShowQuickCreateCustomer(true) }}>
                                        Add New
                                    </Button>
                                </div>}
                                <div className="flex-1 mb-4">
                                    <div>
                                        <Typography variant="h6" className="mb-2">
                                            Service Type
                                        </Typography>
                                        <Field as="select" name="serviceType" disabled={editBooking || bookingStage === 1} className="p-2 w-full rounded-xl border-2 border-gray-300" onChange={(e) => {
                                            //console.log('e.target.value', e.target.value);
                                            setFieldValue("serviceType", e.target.value, false);
                                            resetPackageValues(setFieldValue, e.target.value);
                                            setFieldValue("serviceType", e.target.value, true);
                                            // if (e.target.value === 'CAR_WASH')
                                            //     setFieldValue("packageTypeSelected", "CarWash");

                                        }}>
                                            <option value="">Service Type</option>
                                            <option value="DRIVER">Driver</option>
                                            <option value="RENTALS">Rentals</option>
                                            <option value="RIDES">Rides</option>
                                        </Field>
                                        <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
                                    </div>
                                </div>
                                {(values.serviceType === 'DRIVER' || values.serviceType === 'CAB') && (
                                    <div className="space-y-3 my-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Button
                                                color={values.packageTypeSelected === 'Local' ? 'black' : 'gray'}
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
                                            </Button>
                                            <Button
                                                color={values.packageTypeSelected === 'Outstation' ? 'black' : 'gray'}
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
                                            </Button>
                                        </div>
                                        <div>
                                            <Typography className="text-sm font-medium text-gray-700">Trip Type</Typography>
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <Button
                                                    color={values.tripType === 'Drop Only' ? 'black' : 'gray'}
                                                    onClick={() => setFieldValue('tripType', 'Drop Only')}
                                                    variant={values?.tripType === 'Drop Only' ? 'filled' : 'outlined'}
                                                >
                                                    Drop Only
                                                </Button>
                                                <Button
                                                    color={values.tripType === 'Round Trip' ? 'black' : 'gray'}
                                                    onClick={() => setFieldValue('tripType', 'Round Trip')}
                                                    variant={values?.tripType === 'Round Trip' ? 'filled' : 'outlined'}
                                                >
                                                    Round Trip
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Car Type</label>
                                            <div className="grid grid-cols-4 mt-2">
                                                {['Mini', 'Sedan', 'SUV', 'MUV'].map((carType) => (
                                                    <label key={carType} className="flex items-center space-x-2">
                                                        <Field
                                                            type="radio"
                                                            name="carType"
                                                            value={carType}
                                                            className="h-4 w-4 text-blue-600"
                                                        />
                                                        <span className="text-gray-700">{carType}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <ErrorMessage name="carType" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Transmission Type</label>
                                            <div className="grid grid-cols-2 mt-2">
                                                {['Manual', 'Automatic'].map((transType) => (
                                                    <label key={transType} className="flex items-center space-x-2">
                                                        <Field
                                                            type="radio"
                                                            name="transmissionType"
                                                            value={transType}
                                                            className="h-4 w-4 text-blue-600"
                                                        />
                                                        <span className="text-gray-700">{transType}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <ErrorMessage name="transmissionType" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>
                                    </div>
                                )}


                                {(values.serviceType === 'DRIVER' || values.serviceType === 'CAR_WASH' || values.serviceType === 'CAB') && 
                                    <div className="flex-1 mb-2">
                                        <Typography variant="h6" className="mb-2">
                                            Pickup Date & Time
                                        </Typography>
                                        <div className='flex gap-x-2'>
                                            <Field type="date" name="rideDate" disabled={bookingStage === 1} className="p-2 w-full rounded-xl border-2 border-gray-300" value={values.rideDate} min={currentDate()} onChange={(e) => {
                                                const newDate = e.target.value ? moment(e.target.value).format('YYYY-MM-DD') : '';
                                                setFieldValue('rideDate', newDate);
                                                if (newDate) {
                                                    setBookingTimesForDay(Utils.generateBookingTimesForDay(new Date(newDate)));
                                                } else {
                                                    setBookingTimesForDay([]);
                                                }
                                                if (moment(e.target.value).format('YYYY-MM-DD') != values.fromDate) {
                                                    setRange({});
                                                    setFieldValue('fromDate', '');
                                                    setFieldValue('toDate', '');
                                                }
                                            }}
                                            >
                                            </Field>
                                            <Field as="select" name="rideTime" disabled={bookingStage === 1} className="p-2 w-full rounded-xl border-2 border-gray-300" value={values.rideTime}>
                                                <option value="">Select time</option>
                                                {(values.rideDate !== moment().format('YYYY-MM-DD') ? bookingTimesForDay : bookingTimes).map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {convertTimeFormat(item.id)}
                                                    </option>
                                                ))}
                                            </Field>
                                        </div>
                                    </div>
                                }

                                {(values.serviceType === 'DRIVER' || values.serviceType === 'CAB') && (values.packageTypeSelected == "Outstation" && values.tripType == 'Round Trip') &&
                                    <div className="flex-1 mb-2">
                                        <Typography variant="h6" className="mb-2">Return Date & Time</Typography>
                                        <div className='flex gap-x-2'>
                                            <Field
                                                type="date"
                                                name="toDate"
                                                disabled={bookingStage === 1}
                                                className="p-2 w-full rounded-xl border-2 border-gray-300"
                                                value={values.toDate}
                                                min={values.rideDate || currentDate()}
                                                onChange={(e) => {
                                                    const newToDate = e.target.value ? moment(e.target.value).format('YYYY-MM-DD') : '';
                                                    setFieldValue('toDate', newToDate);
                                                    if (moment(newToDate).isBefore(values.rideDate)) {
                                                        setFieldValue('toTime', '');
                                                    }
                                                }}
                                            />
                                            <Field as="select" name="toTime" disabled={!values.toDate || bookingStage === 1} className="p-2 w-full rounded-xl border-2 border-gray-300">
                                                <option value="">Select time</option>
                                                {(values.toDate !== moment().format('YYYY-MM-DD') ? bookingTimesForDay : bookingTimes).map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {convertTimeFormat(item.id)}
                                                    </option>
                                                ))}
                                            </Field>
                                        </div>
                                    </div>
                                }

                                {/* {(values.serviceType === 'CAB' || editBooking?.serviceType === 'CAB') &&
                                    <div className="flex-1 mb-4">
                                        <div>
                                            <Typography variant="h6" className="mb-2">
                                                Cab Type
                                            </Typography>
                                            <Field as="select" disabled={bookingStage === 1} name="cabType" className="p-2 w-full rounded-xl border-2 border-gray-300" value={values.cabType}>
                                                <option value="">Cab Type</option>
                                                <option value="Sedan">Sedan (5 Seater)</option>
                                                <option value="Hatchback">Hatchback (5 Seater)</option>
                                                <option value="SUV">SUV (7 Seater)</option>
                                            </Field>
                                            <ErrorMessage name="cabType" component="div" className="text-red-500 text-sm" />
                                        </div>
                                    </div>
                                } */}

                                {(values.serviceType === 'DRIVER' || values.serviceType === 'CAR_WASH' || values.serviceType === 'CAB') && values.packageTypeSelected == 'Local' &&
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
                                
                                {values.packageSelected && <Card className="my-6">
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

                                {(values.packageSelected || values.packageTypeSelected == "Outstation") && 
                                    <div className="p-2 space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
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
                                }

                                {((values.packageSelected && values.tripType == "Round Trip" && values.serviceType !== 'CAR_WASH')||(values.packageTypeSelected == 'Outstation')) &&  (
                                    <div className="p-2 space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Drop Location<span className="text-red-500">*</span></label>
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
                                )}

                                {bookingStage === 0 && (values.serviceType === 'DRIVER' || values.serviceType === 'CAR_WASH' || values.serviceType === 'CAB') && <Button
                                    fullWidth
                                    color="black"
                                    onClick={handleSubmit}
                                    disabled={!dirty || !isValid || !values.rideDate || (values.serviceType === 'CAB' && !values.cabType)}
                                    className='my-6 mx-2'
                                >
                                    Continue
                                </Button>}
                            </>
                        )}
                    </Formik>}
                    {/* {bookingStage === 0 && values.serviceType !== '' && <SelectLocation
                        serviceType={bookingData?.serviceType}
                        bookingId={bookingData?.id}
                        customerId={bookingData?.customerId}
                        editBooking={editBooking}
                        onNext={() => {
                            //setBookingStage(2);
                            onSelectBooking(bookingData)
                        }}
                        onPrev={() => setBookingStage(0)} />
                    } */}

                    {/* {bookingStage === 1  && <SelectLocation
                        serviceType={bookingData?.serviceType}
                        bookingId={bookingData?.id}
                        customerId={bookingData?.customerId}
                        editBooking={editBooking}
                        onNext={() => {
                            setBookingStage(2);
                            onSelectBooking(bookingData)
                        }}
                        onPrev={() => setBookingStage(0)} />
                    } */}
                    {
                        bookingStage === 2 && bookingData && (
                            <SearchDrivers bookingData={bookingData} onNext={() => {
                                setBookingStage(0);
                                setBookingData(null);
                            }} />
                        )}
                </>}
                {bookingView && <>
                    <BookingItem bookingData={bookingData} onCancel={onCancelBookingView} onAssignDriver={onAssignDriver} onEdit={onEditBooking} onConfirm={onConfirmBooking} />
                </>}

            </div>
        </div>
    );
};

export default Booking;