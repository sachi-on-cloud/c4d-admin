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
import { Formik, Form, Field } from 'formik';
import { Utils } from '../../utils/utils';
import { API_ROUTES } from '../../utils/constants';
import { BOOKING_DETAILS_SCHEMA } from '../../utils/validations';
import { ApiRequestUtils } from '../../utils/apiRequestUtils';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Booking = () => {
    const [packageTypeSelectedData, setPackageTypeSelectedData] = useState([]);
    const [savedCars, setSavedCars] = useState([]);
    const [bookingTimes, setBookingTimes] = useState([]);
    const [bookingTimesForDay, setBookingTimesForDay] = useState([]);
    const [range, setRange] = useState({});
    const [datePickerVisible, setDatePickerVisible] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const params = location.state;

    const getPackageListDetails = useCallback(async () => {
        const data = await ApiRequestUtils.get(API_ROUTES.PACKAGES_LIST);
        if (data?.success) {
            setPackageTypeSelectedData(data?.data);
        }
    }, []);

    const getSavedCarDetails = useCallback(async () => {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_ALL_CARS);
        if (data?.success) {
            data?.data.map((item) => item['label'] = item.nickName);
            setSavedCars(data?.data);
        }
    }, []);

    const addNewCarHandler = () => {
        navigate('/vehicle-registration', { state: { mode: 'add' } });
    };

    useEffect(() => {
        setBookingTimes(Utils.generateBookingTimes());
    }, []);

    useEffect(() => {
        getPackageListDetails();
        getSavedCarDetails();
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
        }
        let data;
        if (params?.bookingDetails) {
            bookingData['bookingId'] = params?.bookingDetails?.id;
            data = await ApiRequestUtils.update(API_ROUTES.UPDATE_BOOKING, bookingData);
        } else {
            data = await ApiRequestUtils.post(API_ROUTES.ADD_NEW_BOOKING, bookingData);
        }

        if (data?.success) {
            if (params?.bookingDetails) {
                navigate('/confirm-booking', { state: { 'bookingId': params?.bookingDetails?.id } });
            } else {
                navigate('/select-location', { state: { 'bookingId': data?.data?.id } });
            }
        }
    }
    console.log('initialValues :', initialValues);
    return (
        <div className="flex flex-col bg-white p-5 space-y-3">
            <Formik
                initialValues={initialValues}
                onSubmit={async (values, { resetForm }) => {
                    console.log('Values---->>>>', values);
                    await onSubmitHandler(values);
                    resetForm();
                    setRange({});
                }}
                validationSchema={BOOKING_DETAILS_SCHEMA}
                enableReinitialize
            >
                {({ handleSubmit, errors, touched, values, setFieldValue, handleChange, isValid, dirty }) => (
                    <Form>
                        <div className="flex-1 mt-2 mb-2">
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    color={values.packageTypeSelected === 'Intercity' ? 'blue' : 'gray'}
                                    onClick={() => {
                                        if (values.packageTypeSelected !== 'Intercity') {
                                            setFieldValue('packageTypeSelected', 'Intercity');
                                            setFieldValue('packageSelected', '');
                                            setRange({});
                                            setFieldValue('fromDate', '');
                                            setFieldValue('toDate', '');
                                        }
                                    }}
                                >
                                    Intercity
                                </Button>
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
                                >
                                    Outstation
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 mb-4">
                            <Typography variant="h6" className="mb-2">Select Car</Typography>
                            <Select
                                //label="Select a Car"
                                value={values?.carSelected?.id || ''}
                                onChange={(value) => {
                                    console.log('VALUE IN SELECTED CARS :', value);
                                    const car = savedCars.find(car => car.id === value);
                                    console.log('VALUE IN CARS :', car);
                                    setFieldValue('carSelected', car);
                                }}
                            >
                                {savedCars.length === 0 ? (
                                    <Option onClick={addNewCarHandler} className="text-blue-500">
                                        + Add New Car
                                    </Option>
                                ) : (
                                    savedCars.map((car) => (
                                        <Option key={car.id} value={car.id}>
                                            {car.nickName} - {car.carNumber} ({car.carType})
                                        </Option>
                                    ))
                                )}
                            </Select>
                            {errors.carSelected && touched.carSelected && (
                                <Typography color="red" className="mt-2">{errors.carSelected}</Typography>
                            )}
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
                            <div className="grid grid-cols-4 gap-2">
                                {(values.rideDate !== moment().format('YYYY-MM-DD') ? bookingTimesForDay : bookingTimes).map((item) => (
                                    <Button
                                        key={item.id}
                                        color={values.rideTime === item.id ? 'blue' : 'gray'}
                                        onClick={() => setFieldValue('rideTime', item.id)}
                                    >
                                        {item.data}
                                    </Button>
                                ))}
                            </div>
                            {errors.rideTime && touched.rideTime && (
                                <Typography color="red" className="mt-2">{errors.rideTime}</Typography>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center mb-2">
                                <Typography variant="h6">Choose a package</Typography>
                            </div>
                            <div className="flex-row space-x-6">
                                {packageTypeSelectedData
                                    .filter((item) => values.packageTypeSelected === item.type)
                                    .map((item) => (
                                        <Button
                                            key={item.id}
                                            color={values.packageSelected === item.id.toString() ? 'blue' : 'gray'}
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
                            color="blue"
                            onClick={handleSubmit}
                            disabled={!dirty || !isValid}
                            className='my-4 mx-2'
                        >
                            Continue
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default Booking;