import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Button,
    Card,
    Typography,
} from "@material-tailwind/react";
import { Formik, Field, ErrorMessage } from 'formik';
import { Utils } from '../../utils/utils';
import { API_ROUTES, ColorStyles } from '../../utils/constants';
import { BOOKING_DETAILS_SCHEMA } from '../../utils/validations';
import { ApiRequestUtils } from '../../utils/apiRequestUtils';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BookingsList, SearchDrivers } from '.';
import SearchableDropdown from '@/components/SearchableDropdown';
import SelectLocation from './selectLocation';
import BookingItem from "./confirmBooking"
import EditBooking from './editBooking';
import BookingPage from '../../pages/booking/booking.jsx'

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
    const [rightBookingView,setRightBookingView] = useState(false);

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
    const initialValues = {
        packageTypeSelected: editBooking?.packageType ? editBooking?.packageType : 'Intercity',
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
            toDate: values.toDate,
            customerId: values.customerId?.id,
            adminBooking: true,
            serviceType: values.serviceType,
            cabType: values.cabType
        }
        let data;
        if (editBooking?.id) {
            bookingData['bookingId'] = editBooking?.id;
            data = await ApiRequestUtils.update(API_ROUTES.UPDATE_BOOKING, bookingData);
        } else {
            data = await ApiRequestUtils.post(API_ROUTES.ADD_NEW_BOOKING, bookingData, values?.customerId?.id);
        }
        if (data?.success) {
            if (params?.bookingDetails) {
                const targetBookingId = data?.data?.id || params?.bookingDetails?.id;
                const targetCustomerId = values?.customerId?.id || params?.bookingDetails?.customerId || 0;
                navigate(
                    `/dashboard/confirm-booking?bookingId=${encodeURIComponent(
                        targetBookingId || 0
                    )}&customerId=${encodeURIComponent(
                        targetCustomerId
                    )}&fromPath=${encodeURIComponent(location.pathname)}`
                );
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
        setRightBookingView(true);
    }
    const onEditBooking = async (data) => {
        console.log('ON EDIT BOOKING :', data);
        setEditBooking(data);
        setBookingStage(0);
        setBookingView(false);
        setEditBookingView(true)
    }

    const onEditBackPress = () => {
        setEditBookingView(false);
        setIsOpen(false)
    };

    const onSelectBooking = (data) => {
        setBookingStage(4);
        setBookingData(data);
        setBookingView(true);
        setEditBooking();
        setRightBookingView(true);
        setEditBookingView(false);
    }
    const onConfirmBooking = () => {
        setBookingStage(0);
        setBookingView(false);
        setRightBookingView(false);
    }
    const onCancelBookingView = () => { }

    const resetPackageValues = (setFieldValue, newServiceType) => {
        setFieldValue("packageSelected", "");

        if (newServiceType === 'CAR_WASH') {
            setFieldValue("packageTypeSelected", "CarWash");
        } else if (newServiceType === 'DRIVER' || newServiceType === 'CAB') {
            setFieldValue("packageTypeSelected", "Intercity");
        } else {
            setFieldValue("packageTypeSelected", "");
        }

        setFieldValue("fromDate", "");
        setFieldValue("toDate", "");
        setRange({});
        setDatePickerVisible(false);
    };
    const getStatusDisplay = (status) => {
        const statusLower = status?.toLowerCase();
        
        switch (statusLower) {
          case 'started':
            return (
              <span className="mx-3 px-2 py-1 text-white bg-primary rounded-md text-sm font-medium">
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
      const [isOpen, setIsOpen] = useState(false);
    return (
        <div className='flex flex-row space-x-6 justify-between w-full'>
            <BookingPage typeProp={props.type}/>
        </div>
    );
};

export default Booking;