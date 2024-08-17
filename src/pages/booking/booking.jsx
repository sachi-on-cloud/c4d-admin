import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Button,
    Card,
    Typography,
    Select,
    Option,
    Input,
} from "@material-tailwind/react";
import { Formik, Form, Field, ErrorMessage, validateYupSchema } from 'formik';
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

// Format date to YYYY-MM-DD for input's min attribute
const currentDate = () => {
    return (new Date()).toISOString().split('T')[0];
};

const Booking = (props) => {
    const [packageTypeSelectedData, setPackageTypeSelectedData] = useState([]);
    const [bookingTimes, setBookingTimes] = useState([]);
    const [bookingTimesForDay, setBookingTimesForDay] = useState([]);
    const [range, setRange] = useState({});
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [customerData, setCustomerData] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(0);
    const [showQuickCreateCustomer, setShowQuickCreateCustomer] = useState(false);
    const [bookingType, setBookingType] = useState("");
    const [bookingStage, setBookingStage] = useState(0);
    const [bookingData, setBookingData] = useState();

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
    }, [params]);

    useEffect(() => {
        getPackageListDetails();
        if (params?.bookingDetails?.packageType === "Outstation" && params?.bookingDetails?.fromDate && params?.bookingDetails?.toDate) {
            setRange({ startDate: params?.bookingDetails?.fromDate, endDate: params?.bookingDetails?.toDate })
        }
    }, []);

    const initialValues = {
        packageTypeSelected: 'Intercity',
        rideTime: '',
        rideDate: moment().format('YYYY-MM-DD'),
        carSelected: {},
        packageSelected: '',
        fromDate: "",
        toDate: "",
        customerId: '',
        serviceType: ''
    };

    const handleDateChange = (dates, setFieldValue) => {
        const [start, end] = dates;
        setFieldValue('fromDate', start);
        setFieldValue('toDate', end);
        setFieldValue('packageSelected', '0')
        if (start && end) {
            setRange({ startDate: start, endDate: end });
            setDatePickerVisible(false);
        }
    };

    const countDaysBetween = (date1, date2) => {
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
            bookingId: params?.bookingDetails?.id || '',
            fromDate: values.fromDate,
            toDate: values.toDate,
            customerId: values.customerId?.id,
            adminBooking: true,
            serviceType: values.serviceType
        }
        let data;
        if (params?.bookingDetails) {
            bookingData['bookingId'] = params?.bookingDetails?.id;
            data = await ApiRequestUtils.update(API_ROUTES.UPDATE_BOOKING, bookingData);
        } else {
            data = await ApiRequestUtils.post(API_ROUTES.ADD_NEW_BOOKING, bookingData, values?.customerId?.id);
        }
        if (data?.success) {
            if (params?.bookingDetails) {
                navigate('/dashboard/confirm-booking', { state: { 'bookingId': params?.bookingDetails?.id } });
            } else {
                setBookingStage(1);
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
    const onAssignDriver = async (data) => {
        setBookingData(data);
        setBookingStage(2);
    }
    return (
        <div className='flex flex-row space-x-6 justify-between w-full'>
            <div className="flex-1 bg-white p-3 rounded-xl w-2/5 ">
                <div className='mb-2'>
                    <Typography variant="h5" color='#000000'>
                        {`${bookingStage === 0 ? 'New Booking' : bookingStage === 1 ? 'Select Location' : 'Assign Drivers'}`}
                    </Typography>
                </div>
                {bookingStage === 0 && <Formik
                    initialValues={initialValues}
                    onSubmit={async (values, { resetForm }) => {
                        await onSubmitHandler(values);
                        resetForm();
                        setRange({});
                    }}
                    validationSchema={BOOKING_DETAILS_SCHEMA}
                    enableReinitialize
                >
                    {({ handleSubmit, values, setFieldValue, isValid, dirty }) => (
                        <>
                            {customerData && <div className="p-2 flex">
                                <SearchableDropdown options={customerData} onSelect={(val) => {
                                    setFieldValue('customerId', val);
                                    // setSelectedCustomer(val.id)
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
                                    <Field as="select" name="serviceType" className="p-2 w-full rounded-xl border-2 border-gray-300">
                                        <option value="">Service Type</option>
                                        <option value="DRIVER">Acting Driver</option>
                                        <option value="CAR_WASH">Car Wash</option>
                                        {/* <option value="CAB">Cab Booking</option> */}
                                    </Field>
                                    <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
                                </div>
                            </div>
                            {(values.serviceType === 'DRIVER' || values.serviceType === 'CAB') &&
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <Button
                                        color={values.packageTypeSelected === 'Intercity' ? 'black' : 'gray'}
                                        onClick={() => {
                                            if (values.packageTypeSelected !== 'Intercity') {
                                                setFieldValue('packageTypeSelected', 'Intercity');
                                                setFieldValue('packageSelected', '');
                                                setRange({});
                                                setFieldValue('fromDate', '');
                                                setFieldValue('toDate', '');
                                            }
                                        }}
                                        variant={values?.packageTypeSelected === 'Intercity' ? 'filled' : 'outlined'}
                                    >
                                        Intercity
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
                                        variant={values?.packageTypeSelected === 'Outstation' ? 'filled' : 'outlined'}
                                    >
                                        Outstation
                                    </Button>
                                </div>
                            }


                            {(values.serviceType === 'DRIVER' || values.serviceType === 'CAB') && <div className="flex-1 mb-2">
                                <Typography variant="h6" className="mb-2">
                                    When?
                                </Typography>
                                <div className='flex gap-x-2'>
                                    {/* <Input
                                    variant='normal'
                                    type="date"
                                    value={values.rideDate}
                                    onChange={(e) => {
                                        console.log('ON CHANGE :', e.target.value);
                                        const newDate = new Date(e.target.value);
                                        console.log('New Date :', newDate);
                                        setFieldValue('rideDate', moment(e.target.value).format('YYYY-MM-DD'));
                                        setBookingTimesForDay(Utils.generateBookingTimesForDay(newDate));
                                    }}
                                /> */}
                                    <Field type="date" name="rideDate" className="p-2 w-full rounded-xl border-2 border-gray-300" min={currentDate()} onChange={(e) => {
                                        setFieldValue('rideDate', moment(e.target.value).format('YYYY-MM-DD'));
                                        setBookingTimesForDay(Utils.generateBookingTimesForDay(new Date(e.target.value)));
                                    }}></Field>
                                    <Field as="select" name="rideTime" className="p-2 w-full rounded-xl border-2 border-gray-300">
                                        <option value="">Select time</option>
                                        {(values.rideDate !== moment().format('YYYY-MM-DD') ? bookingTimesForDay : bookingTimes).map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {convertTimeFormat(item.id)}
                                            </option>
                                        ))}
                                    </Field>
                                </div></div>}

                            {values.serviceType === 'CAB' &&
                                <div className="flex-1 mb-4">
                                    <div>
                                        <Typography variant="h6" className="mb-2">
                                            Cab Type
                                        </Typography>
                                        <Field as="select" name="cabType" className="p-2 w-full rounded-xl border-2 border-gray-300">
                                            <option value="">Cab Type</option>
                                            <option value="SEDAN">Sedan (5 Seater)</option>
                                            <option value="HATCHBACK">Hatchback (5 Seater)</option>
                                            <option value="SUV">Hatchback (7 Seater)</option>
                                        </Field>
                                        <ErrorMessage name="cabType" component="div" className="text-red-500 text-sm" />
                                    </div>
                                </div>
                            }

                            {(values.serviceType === 'DRIVER' || values.serviceType === 'CAB') && <div className="flex-1 mb-4">
                                <div>
                                    <Typography variant="h6" className="mb-2">
                                        Choose a package
                                    </Typography>
                                    <Field as="select" name="packageSelected" className="p-2 w-full rounded-xl border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                        <option value="">Select Package</option>
                                        {packageTypeSelectedData
                                            .filter((item) => values.packageTypeSelected === item.type).map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.period} {values.packageTypeSelected === 'Outstation' ? 'd' : 'hr'}
                                                </option>
                                            ))}
                                    </Field>
                                    <ErrorMessage name="packageSelected" component="div" className="text-red-500 text-sm" />
                                </div>
                            </div>}

                            {(values.serviceType === 'DRIVER' || values.serviceType === 'CAB') && values.packageTypeSelected === "Outstation" && (
                                <div className="space-y-4 mb-4">
                                    <Typography variant="h6" className="text-center">OR</Typography>
                                    <Button
                                        fullWidth
                                        color="blue"
                                        onClick={() => setDatePickerVisible(!datePickerVisible)}
                                    >
                                        Select Date Range
                                    </Button>
                                    {datePickerVisible && (
                                        <div className='w-full'>
                                            <DatePicker
                                                selected={values.fromDate}
                                                onChange={(dates) => handleDateChange(dates, setFieldValue)}
                                                startDate={values.fromDate}
                                                endDate={values.toDate}
                                                selectsRange
                                                inline
                                                className="w-full h-full"
                                            />
                                        </div>
                                    )}
                                    {range.startDate && range.endDate && (
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
                                                Selected Date: {countDaysBetween(values.fromDate, values.toDate)} days
                                            </Typography>
                                            <Typography variant='h6'>
                                                Total Amount: ₹ {countDaysBetween(values.fromDate, values.toDate) * 1000}
                                            </Typography>
                                        </Card>
                                    )}
                                </div>
                            )}

                            {(values.serviceType === 'DRIVER' || values.serviceType === 'CAB') && <Button
                                fullWidth
                                color="black"
                                onClick={handleSubmit}
                                disabled={!dirty || !isValid}
                                className='my-6 mx-2'
                            >
                                Continue
                            </Button>}
                        </>
                    )}
                </Formik>}
                {
                    bookingStage === 1 &&
                    <SelectLocation
                        bookingId={bookingData?.id}
                        customerId={bookingData?.customerId}
                        onNext={() => {
                            setBookingStage(2);
                        }}
                        onPrev={() => setBookingStage(0)} />
                }
                {
                    bookingStage === 2 && <SearchDrivers bookingData={bookingData} onNext={() => {
                        setBookingStage(0);
                    }} />
                }
            </div>

            <div className='w-3/5'>
                {!showQuickCreateCustomer && <BookingsList customerId={selectedCustomer} bookingStage={bookingStage} onAssignDriver={onAssignDriver} />}

                {showQuickCreateCustomer && <CustomerAdd isQuickCreate={true} />}
            </div>
        </div>
    );
};

export default Booking;