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
import { Formik, Form } from 'formik';
import { Utils } from '../../utils/utils';
import { API_ROUTES } from '../../utils/constants';
import { BOOKING_DETAILS_SCHEMA } from '../../utils/validations';
import { ApiRequestUtils } from '../../utils/apiRequestUtils';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BookingsList } from '.';
import SearchableDropdown from '@/components/SearchableDropdown';

const Booking = () => {
    const [packageTypeSelectedData, setPackageTypeSelectedData] = useState([]);
    const [bookingTimes, setBookingTimes] = useState([]);
    const [bookingTimesForDay, setBookingTimesForDay] = useState([]);
    const [range, setRange] = useState({});
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [customerData, setCustomerData] = useState([]);

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
    }, []);

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
        customerId: ''
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
            serviceType: 'DRIVER'
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
                navigate('/dashboard/select-location', {
                    state: {
                        'bookingId': data?.data?.id,
                        'customerId': data?.data?.customerId
                    }
                });
            }
        }
    }
    return (
        <div className='flex flex-row space-x-6 justify-between'>
            <BookingsList />
            <div className="flex-1 bg-white p-3 rounded-xl">
                <Formik
                    initialValues={initialValues}
                    onSubmit={async (values, { resetForm }) => {
                        await onSubmitHandler(values);
                        resetForm();
                        setRange({});
                    }}
                    validationSchema={BOOKING_DETAILS_SCHEMA}
                    enableReinitialize
                >
                    {({ handleSubmit, errors, touched, values, setFieldValue, handleChange, isValid, dirty }) => (
                        <Form className='space-y-4'>
                            {customerData && <div className="p-2">
                                <SearchableDropdown options={customerData} onSelect={(val) => {
                                    setFieldValue('customerId', val);
                                }} />
                            </div>}
                            <div className="flex-1 mt-2 mb-2">
                                <div className="grid grid-cols-2 gap-4">
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
                            </div>

                            <div className="flex-1 mb-2">
                                <Typography variant="h6" className="mb-2">
                                    When to ride?
                                </Typography>
                                <Input
                                    type="date"
                                    value={values.rideDate}
                                    onChange={(e) => {
                                        console.log('ON CHANGE :', e.target.value);
                                        const newDate = new Date(e.target.value);
                                        console.log('New Date :', newDate);
                                        setFieldValue('rideDate', moment(e.target.value).format('YYYY-MM-DD'));
                                        setBookingTimesForDay(Utils.generateBookingTimesForDay(newDate));
                                    }}
                                />
                            </div>

                            <div className="flex-1 mb-4">
                                <Typography variant="h6" className="mb-2">Choose a time</Typography>
                                <Select
                                    label=""
                                    value={values?.rideTime ? values?.rideTime : ''}
                                    onChange={(val) => {
                                        const selectedVal = (values.rideDate !== moment().format('YYYY-MM-DD') ? bookingTimesForDay : bookingTimes).find(el => el.id === val);
                                        setFieldValue('rideTime', selectedVal.id);
                                    }}
                                    animate={{
                                        mount: { y: 0 },
                                        unmount: { y: 25 },
                                    }}
                                    selected={(element) => {
                                        if (element) {
                                            console.log('element :', element.props)
                                            return element.props.value
                                        }
                                    }}
                                    className='p-4 text-black'
                                >
                                    {(values.rideDate !== moment().format('YYYY-MM-DD') ? bookingTimesForDay : bookingTimes).map((item) => (
                                        <Option key={item.id} value={item.data} data-id={item.id} name={item.data}>
                                            {item.data}
                                        </Option>
                                    ))}
                                </Select>
                                {/* <div className="grid grid-cols-4 gap-2">
                                    {(values.rideDate !== moment().format('YYYY-MM-DD') ? bookingTimesForDay : bookingTimes).map((item) => (
                                        <Button
                                            key={item.id}
                                            color={values.rideTime === item.id ? 'black' : 'gray'}
                                            onClick={() => setFieldValue('rideTime', item.id)}
                                            variant={values.rideTime === item.id ? 'filled' : 'outlined'}
                                        >
                                            {item.data}
                                        </Button>
                                    ))}
                                </div> */}
                                {errors.rideTime && touched.rideTime && (
                                    <Typography color="red" className="mt-2">{errors.rideTime}</Typography>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center mb-3">
                                    <Typography variant="h6">Choose a package</Typography>
                                </div>
                                <div className="flex-row space-x-6 px-2">
                                    {packageTypeSelectedData
                                        .filter((item) => values.packageTypeSelected === item.type)
                                        .map((item) => (
                                            <Button
                                                key={item.id}
                                                color={values.packageSelected === item.id.toString() ? 'black' : 'gray'}
                                                onClick={() => {
                                                    handleChange('packageSelected')(item.id.toString());
                                                    if (values.packageTypeSelected === 'Outstation') {
                                                        setDatePickerVisible(false);
                                                        setRange({});
                                                        // handleChange('fromDate')("");
                                                        // handleChange('toDate')("")
                                                    }
                                                }}
                                                className='max-h-fit max-w-fit'
                                                variant={values.packageSelected === item.id.toString() ? 'filled' : 'outlined'}
                                            >
                                                <div>
                                                    <Typography>{item.period} {values.packageTypeSelected === 'Outstation' ? 'd' : 'hr'}</Typography>
                                                    <Typography>₹ {item.price}</Typography>
                                                </div>
                                            </Button>
                                        ))}
                                </div>
                                {errors.packageSelected && touched.packageSelected && (
                                    <Typography color="red" className="mt-2">{errors.packageSelected}</Typography>
                                )}
                            </div>

                            {values.packageTypeSelected === "Outstation" && (
                                <div className="space-y-4 mb-4">
                                    <Typography variant="h6" className="text-center">OR</Typography>
                                    <Button
                                        fullWidth
                                        color="gray"
                                        onClick={() => setDatePickerVisible(!datePickerVisible)}
                                    >
                                        Select Date Range
                                    </Button>
                                    {datePickerVisible && (
                                        <div className='border border-red-400 flex-1'>
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
                                            <div className="grid grid-cols-2 gap-4">
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
                                            <Typography>
                                                Selected Date: {countDaysBetween(values.fromDate, values.toDate)} days
                                            </Typography>
                                            <Typography>
                                                Total Amount: ₹ {countDaysBetween(values.fromDate, values.toDate) * 1000}
                                            </Typography>
                                        </Card>
                                    )}
                                </div>
                            )}

                            <Button
                                fullWidth
                                color="black"
                                onClick={handleSubmit}
                                disabled={!dirty || !isValid}
                                className='my-6 mx-2'
                            >
                                Continue
                            </Button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default Booking;