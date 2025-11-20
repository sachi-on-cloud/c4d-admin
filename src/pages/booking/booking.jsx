import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Button,
    Card,
    Typography,
} from "@material-tailwind/react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Utils } from '../../utils/utils';
import { API_ROUTES, ColorStyles,BOOKING_TERMS_AND_CONDITIONS } from '../../utils/constants';
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
import DistanceExceedModal from '@/components/DistanceExceedModal';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { PlusIcon } from '@heroicons/react/24/outline';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

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
// Format date to YYYY-MM-DD for input's min attribute
const minsToHHMM = (totalMins)=> {
        const hrs = Math.floor(totalMins / 60);
        const mins = Math.round(totalMins % 60);          // round to nearest minute
        return `${hrs} hrs : ${mins.toString().padStart(2, "0")} mins`;
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
    const [searchBookingId, setSearchBookingId] = useState('');
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropSuggestions, setDropSuggestions] = useState([]);
    const [driverSuggestions, setDriverSuggestions] = useState([]);
    const [pickupLocation, setPickupLocation] = useState(null);
    const [dropLocation, setDropLocation] = useState(null);
    const [driverPickUpLocation, setDriverPickUpLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 12.906374, lng: 80.226452 });
    const [mapZoom, setMapZoom] = useState(10);
    const mapRef = useRef(null);
    const [quoteDetails, setQuoteDetails] = useState(null);
    const [bookingType, setBookingType] = useState(props.typeProp || '');
    const [discountDetails, setDiscountDetails] = useState(null);

    const [editBookingView, setEditBookingView] = useState(false);
    const [distanceExceedModal, setDistanceExceedModal] = useState(false);
    const [cityLimitExceedModal, setCityLimitExceedModal] = useState(false);
    const [zoneErrorModal, setZoneErrorModal] = useState({ show: false, text: '', title: '' });
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [formikActions, setFormikActions] = useState({});
    const [serviceAreas, setServiceAreas] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedAreaId, setSelectedAreaId] = useState(null);
    const [currentServiceType, setCurrentServiceType] = useState('');
    const [currentPackageType, setCurrentPackageType] = useState('');
    const [dropTaxiDistanceExceedModal, setDropTaxiDistanceExceedModal] = useState(false);
    const [quotationLogs, setQuotationLogs] = useState([]);
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || "{}");
    const loggedInUserId = loggedInUser.id || 0;
     const [refreshFn, setRefreshFn] = useState(null);



  const fetchGeoData = async () => {
    try {
      const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST, {});
      const filteredAreas = response.data.filter((area) => area.type === 'Service Area');
      setServiceAreas(filteredAreas);
    //   console.log('Available service areas:', filteredAreas);
    } catch (error) {
      console.error('Error fetching GEO_MARKINGS_LIST:', error);
    }
  };

  useEffect(() => {
    fetchGeoData();
  }, []);

  useEffect(() => {
    if (selectedAreaId) {
      const selectedArea = serviceAreas.find((area) => area.id === parseInt(selectedAreaId));
      const newServices = selectedArea ? selectedArea.services : [];
      setServices(newServices);
    //   console.log('Services for selected area:', newServices);
      setCurrentServiceType('');
    } else {
      setServices([]);
      setCurrentServiceType('');
    }
  }, [selectedAreaId, serviceAreas]);

    const fetchData = async () => {
        try {
            const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_ALL_CUSTOMERS,{
                forSearch:true
            });
            setCustomerData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const navigate = useNavigate();
    const location = useLocation();
    const params = location.state;

    const getPackageListDetails = useCallback(async (serviceType, zone) => {
  try {
    // console.log('Fetching packages with:', { serviceType, zone });
    const serviceTypeMap = {
      'RENTAL_DROP_TAXI': 'RENTAL',
      'RENTAL_HOURLY_PACKAGE': 'RENTAL',
    };
    const mappedServiceType = serviceTypeMap[serviceType] || serviceType;
    // console.log('Mapped serviceType:', mappedServiceType);

    if (!['DRIVER', 'RENTAL', 'RIDES'].includes(mappedServiceType)) {
      console.error('Invalid serviceType:', mappedServiceType);
      setPackageTypeSelectedData([]);
      return;
    }

    const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.ZONE_PACKAGE_LIST, {
      serviceType: mappedServiceType,
      zone: zone || '',
    });

    // console.log('Raw API response:', JSON.stringify(data, null, 2));

    if (data?.success && Array.isArray(data?.data)) {
      setPackageTypeSelectedData(data.data);
    //   console.log('Package list fetched:', data.data);
    } else {
      console.error('Failed to fetch package list or data is not an array:', data?.message || 'No message provided');
      setPackageTypeSelectedData([]);
    }
  } catch (error) {
    console.error('Error fetching package list:', error.message || error);
    setPackageTypeSelectedData([]);
  }
}, []);

useEffect(() => {
//   console.log('useEffect for package list:', { selectedAreaId, currentServiceType, currentPackageType });
  if (!selectedAreaId || !currentServiceType) {
    // console.log('Skipping getPackageListDetails: missing selectedAreaId or currentServiceType');
    setPackageTypeSelectedData([]);
    return;
  }
  const selectedArea = serviceAreas.find((area) => area.id === parseInt(selectedAreaId));
  const zone = selectedArea ? selectedArea.name : '';
//   console.log('Calling getPackageListDetails with:', { serviceType: currentServiceType, zone });
  getPackageListDetails(currentServiceType, zone);

  if (params?.bookingDetails?.packageType === 'Outstation' && params?.bookingDetails?.fromDate && params?.bookingDetails?.toDate) {
    setRange({ startDate: params?.bookingDetails?.fromDate, endDate: params?.bookingDetails?.toDate });
  }
}, [selectedAreaId, currentServiceType, currentPackageType, getPackageListDetails, params, serviceAreas]);
    const handleTypeChange = (type) => {
        setBookingType(type);
    };
    const searchBookings = useCallback(
        debounce(async (search) => {
            if (search.length < 3) {
                setSearchResults([]);
                return;
            }

            try {
                // console.log("BOOKINGTYPE", bookingType);
                const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.SEARCH_BOOKINGS_BY_NUMBER, {
                    search,
                    type: bookingType || 'ALL_BOOKINGS',
                });
                if (data?.success && data?.data) {
                    setSearchResults(data.data);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Error searching bookings:', error);
                setSearchResults([]);
            }
        }, 300),
        [bookingType]
    );

const addQuotationLog = (values, quoteDetails, bookingId = null) => {
    const newLog = {
        userId: loggedInUserId,
        bookingId: bookingId || 0,
    //   ...((values?.serviceType === 'DRIVER' || values?.serviceType === 'RENTAL_HOURLY_PACKAGE') && {
    //         packageId: values.packageSelected ? Number(values.packageSelected) : 0
    //     }),
        pickupAddress: {
            name: values.pickupAddress || '',
            lat: values.pickupLocation?.lat || 0,
            lng: values.pickupLocation?.lng || 0,
        },
        dropAddress: values.dropAddress ? {
            name: values.dropAddress,
            lat: values.dropLocation?.lat || 0,
            lng: values.dropLocation?.lng || 0,
        } : {},
        amount: quoteDetails?.amount?.estimatedPrice === "0" || quoteDetails?.amount?.estimatedPrice === 0
            ? (quoteDetails?.amount?.packageDetails?.price || 0)
            : (quoteDetails?.amount?.estimatedPrice || 0),
        discount: quoteDetails?.discount?.percentage || 0,   
        discountAmount: (quoteDetails.amount?.estimatedPrice) - ( quoteDetails.amount?.estimatedPrice * quoteDetails.discount?.percentage/100) || 0,
        ...((values?.serviceType != 'RIDES') && {
               startDate: moment(`${values?.rideDate} ${values?.rideTime}`, "YYYY-MM-DD HH:mm:ss").toISOString() || '',
           }),
         
        ...( (values?.serviceType != 'RENTAL_DROP_TAXI' && values?.serviceType != 'RIDES'&&  values?.packageTypeSelected != 'Local')&& 
        { endDate: moment(`${values?.toDate} ${values?.toTime}`, "YYYY-MM-DD HH:mm:ss").toISOString() || ' '}
         ),

         serviceType: values?.serviceType == "RENTAL_DROP_TAXI" ? 'RENTAL_DROP_TAXI': values?.serviceType === "RENTAL_HOURLY_PACKAGE"? "HOURLY_PACKAGE" : values?.serviceType === "RENTAL"? "OUTSTATION": values?.serviceType || mappedServiceType,
        cabType: values?.carType || '', 
    };
    setQuotationLogs((prevLogs) => [...prevLogs, newLog]);
};
  const getQuoteOutstationDetails = async (values) => {
        const zoneData = await zoneCheckUpFun(values);
        // console.log("frist",zoneData)
        let actualZone = '';
        if (zoneData.success && zoneData.serviceArea) {
            actualZone = zoneData.serviceArea.name;
            // console.log('Outstation Zone', actualZone);
        } else {
            console.error('Error getting zone for outstation');
            return;
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
            pickupLat: values?.pickupLocation?.lat,
            pickupLong: values?.pickupLocation?.lng,
            driverStartLat: values?.driverPickUpLocation?.lat,
            driverStartLong: values?.driverPickUpLocation?.lng,
            dropLat: values?.dropLocation?.lat,
            dropLong: values?.dropLocation?.lng,
            acType: values?.acType?.toUpperCase(),
            zone: actualZone,
        };
        if (values?.serviceType === 'RENTAL_DROP_TAXI') {
            quoteData.serviceFor = 'RENTAL_DROP_TAXI';
        }
        else if (values?.serviceType === 'RENTAL_HOURLY_PACKAGE') {
            quoteData.serviceFor = 'RENTAL_HOURLY_PACKAGE';
        }
        else if (values?.serviceType === 'RENTAL') {
            quoteData.serviceFor = 'RENTAL';
        }
        else if(values?.serviceType === 'DRIVER') {
            quoteData.serviceFor = 'DRIVER';
        }
        const data = await ApiRequestUtils.post(API_ROUTES.GET_QUOTE_OUTSTATION, quoteData);
        // console.log("QOYTEE DATA", data);
        if (data.success) {
            setQuoteDetails(data?.data);
            setDiscountDetails(data?.data);
            // Add to quotationLogs
            addQuotationLog(values, data?.data);
        }
        // console.log("QUOTE DETAILS", quoteDetails);
    };

  const zoneCheckUpFun = async (val) => {
    const serviceTypeMap = {
        'RIDES':'RIDES',
        'RENTAL_DROP_TAXI': 'RENTAL',
        'RENTAL_HOURLY_PACKAGE':'RENTAL',
        // 'DRIVER':'ACTING DRIVER'
    };
    const mappedServiceType = serviceTypeMap[val.serviceType] || val.serviceType;

    const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.ZONE_PACKAGE_LIST, {
        serviceType: mappedServiceType,
        lat: val.pickupLocation.lat,
        long: val.pickupLocation.lng,
    });
    return data;
};
    const getQuoteRides = async (val, setFieldValue) => {
    let checkDistance = true;
    let checkCityLimit = true;

    if (val.serviceType === 'RIDES') {
        checkDistance = await calculateDistance(val);
        checkCityLimit = await calcluateCityLimit(val);
    } else if (val.serviceType === 'RENTAL_DROP_TAXI') {
        checkDistance = await calculateDistance(val); // Check distance for DropTaxi
    }

    if (!checkDistance) {
        if (val.serviceType === 'RIDES') {
            setDistanceExceedModal(true);
        } else if (val.serviceType === 'RENTAL_DROP_TAXI') {
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
    const mappedServiceType = serviceTypeMap[val.serviceType] || val.serviceType;

    let actualZone = serviceAreas.find(area => area.id === parseInt(selectedAreaId))?.name || '';
    
    const zoneData = await zoneCheckUpFun(val);
    //  console.log("secondZone",zoneData)
    if (!zoneData.success || !zoneData.serviceArea) {
        setZoneErrorModal({ show: true, text: zoneData.error || 'Service not available in this area.', title: zoneData.title || 'Oops!' });
        setFieldValue?.('pickupAddress', '');
        setIsButtonDisabled(false);
        return;
        
    }
   
    actualZone = zoneData.serviceArea.name;
    // console.log('Zone changed to', actualZone);

        const quoteDate = {
            serviceType: val.serviceType === 'RENTAL_HOURLY_PACKAGE' ? 'RENTAL' : val.serviceType || mappedServiceType,
            bookingType: '',
            serviceFor: val.serviceType === 'RENTAL_HOURLY_PACKAGE' ? 'RENTAL_HOURLY_PACKAGE' : val.serviceType,
            packageType:'Local',
            fromDate: moment(`${val?.rideDate} ${val?.rideTime}`, "YYYY-MM-DD HH:mm:ss").toISOString(),
            carType: val.carType || '',
            period: val.serviceType === 'RENTAL_HOURLY_PACKAGE' || val?.serviceType === 'DRIVER' ? packageTypeSelectedData.find(pkg => pkg.id === Number(val.packageSelected))?.period || '' : '',
            pickupLat: val?.pickupLocation?.lat,
            pickupLong: val?.pickupLocation?.lng,
            driverStartLat: val?.driverPickUpLocation?.lat,
            driverStartLong: val?.driverPickUpLocation?.lng,
            dropLat: val?.dropLocation?.lat,
            dropLong: val?.dropLocation?.lng,
            zone: actualZone,
        };
        const data = await ApiRequestUtils.post(API_ROUTES.GET_QUOTE_OUTSTATION, quoteDate);
        // console.log("QUOTE DATA", data);
        if (data?.success) {
            setQuoteDetails(data?.data)
            setDiscountDetails(data?.data);
            addQuotationLog(val, data?.data);
        }
    }

    useEffect(() => {
        setBookingTimes(Utils.generateBookingTimes());
        fetchData();
         localStorage.removeItem('bookingSearchId');
        if (refreshFn) refreshFn();
        
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
        cabType: '',
        driverPickUpAddress: '',
        driverPickUpLocation: null,
        luggage:'',
        seaterCapacity:'',
        sourceType: '',
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

    const calculateDistance = async (values) => {
    let calculateDistance = await ApiRequestUtils.getWithQueryParam(API_ROUTES.DISTANCE_CHECKING, {
        pickupLat: values.pickupLocation.lat,
        pickupLong: values.pickupLocation.lng,
        dropLat: values.dropLocation?.lat,
        dropLong: values.dropLocation?.lng,
        serviceType: values.serviceType === 'RENTAL_DROP_TAXI' ? "RENTAL" : values.serviceType,
    });

    if (calculateDistance?.success) {
        if (values.serviceType === "RIDES") {
            return calculateDistance?.data?.showAlert; // Existing logic for RIDES
        } else if (values.serviceType ==='RENTAL_DROP_TAXI') {
            // Check if distance exceeds 300 km for DropTaxi
            const distance = calculateDistance?.data?.estimatedDistance || 0;
            return distance <= 300; // Return false if distance > 300 km
        }
    }
    return true;
};

    const calcluateCityLimit = async (values) => {
        let calculateDistance = await ApiRequestUtils.getWithQueryParam(API_ROUTES.CITY_LIMIT_CHECKING, {
            pickupLat: values.pickupLocation.lat,
            pickupLong: values.pickupLocation.lng,
            dropLat: values.dropLocation?.lat,
            dropLong: values.dropLocation?.lng,
        });
        if (calculateDistance?.success) {
            return calculateDistance?.cityLimit;
        }
        return false;
    };

const sendQuotationLogs = async (bookingId, userId) => {
    try {
        // Update bookingId and ensure userId is included in all logs
        const updatedLogs = quotationLogs.map(log => ({
            ...log,
            bookingId: bookingId || 0, // Update with actual bookingId
            userId: userId || log.userId || 0, // Use provided userId or fallback to log's userId
        }));
        const response = await ApiRequestUtils.post(API_ROUTES.POST_QUOTATION_LOG, updatedLogs);
        if (response?.success) {
            console.log('Quotation logs sent successfully:', response);
            setQuotationLogs([]); // Clear the logs after successful submission
        } else {
            console.error('Failed to send quotation logs:', response?.message);
        }
    } catch (error) {
        console.error('Error sending quotation logs:', error);
    }
};
    const onRideSubmitHandler = async (values, formikBag) => {
        if (isButtonDisabled) return;
        setIsButtonDisabled(true);

        try {
            let zoneCheckUp = await zoneCheckUpFun(values);
            let checkDistance = await calculateDistance(values);
            let checkCityLimit = await calcluateCityLimit(values);

            let actualZone = '';
            if (values.serviceType === 'RIDES') {
                if (!zoneCheckUp.success || !zoneCheckUp.serviceArea) {
                    setZoneErrorModal({ show: true, text: zoneCheckUp.error || 'Service not available in this area.', title: zoneCheckUp.title || 'Oops!' });
                    setIsButtonDisabled(false);
                    return;
                }
                actualZone = zoneCheckUp.serviceArea.name;
                // console.log("third Zone",actualZone)
            } else {
                actualZone = serviceAreas.find(area => area.id === parseInt(selectedAreaId))?.name || '';
            }

            if (!checkDistance) {
                setDistanceExceedModal(true);
                setIsButtonDisabled(false);
                return;
            } else if (!checkCityLimit) {
                setCityLimitExceedModal(true);
                setIsButtonDisabled(false);
                return;
            }

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
            driverStartLat: values.driverPickUpLocation?.lat,
            driverStartLong: values.driverPickUpLocation?.lng,
            driverStartAddress: {
                name: values.driverPickUpAddress,
            },
            source: 'Call',
            sourceType: values.sourceType,
            ...((values.sourceType === "Others" || values.sourceType === "Offline Ads") && {
                otherSourceType: values.otherSourceType?.trim() || null
            }),
            serviceType:values.serviceType,
            zone: actualZone,  
        }
        let data = await ApiRequestUtils.post(API_ROUTES.ADD_NEW_RIDES_BOOKING, bookingData, values.customerId?.id);
        if (data?.success) {
            setIsOpen(false);
            setBookingData(data?.data);
             await sendQuotationLogs(data?.data?.id, loggedInUserId);
            navigate('/dashboard/booking');
            formikBag.resetForm();
            setSelectedCustomer(0);
            setSearchBookingId('');
        } else {
            console.log("Error in creating new booking");
            formikBag.setErrors({ submit: 'Failed to create booking. Please try again.' });
        }
    } catch (err) {
        console.log("ERROR IN RIDES BOOKING", err);
        formikBag.setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
        setIsButtonDisabled(false);
        formikBag.setSubmitting(false); // Ensure form is not stuck in submitting state
    }
};

   const onSubmitHandler = async (values) => {
    const serviceTypeMap = {
        'RENTAL_DROP_TAXI': 'RENTAL',
        'RENTAL_HOURLY_PACKAGE': 'RENTAL'
    };
    const mappedServiceType = serviceTypeMap[values.serviceType] || values.serviceType;

    // Check distance only for DropTaxi
    if (values.serviceType === 'RENTAL_DROP_TAXI') {
        const checkDistance = await calculateDistance(values);
        if (!checkDistance) {
            setDropTaxiDistanceExceedModal(true); // Show the DropTaxi distance exceed modal
            setIsButtonDisabled(false);
            return;
        }
    }

    const zoneData = await zoneCheckUpFun(values);
    let actualZone = serviceAreas.find(area => area.id === parseInt(selectedAreaId))?.name || '';
    if (zoneData.success && zoneData.serviceArea) {
        actualZone = zoneData.serviceArea.name;
        // console.log('Zone for booking', actualZone);
    }

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
            driverStartLat: values.driverPickUpLocation?.lat,
            driverStartLong: values.driverPickUpLocation?.lng,
            driverStartAddress: {
                name:values.driverPickUpAddress,
            },
            source: 'Call',
            sourceType: values.sourceType,
            ...((values.sourceType === "Others" || values.sourceType === "Offline Ads") && {
             otherSourceType: values.otherSourceType?.trim() || null
            }),
            luggage: values.luggage,
            seaterCapacity:values.seaterCapacity,
            period: values?.serviceType === 'RENTAL_HOURLY_PACKAGE' || values?.serviceType === 'DRIVER' ? packageTypeSelectedData.find(pkg => pkg.id === Number(values?.packageSelected))?.period || '' : '',
            serviceType: values.serviceType || mappedServiceType,
            zone: actualZone,
        };
        if(values.serviceType !== "RENTAL_HOURLY_PACKAGE" )
        {
            bookingData.dropLat= values.dropLocation?.lat;
            bookingData.dropLong= values.dropLocation?.lng;
            bookingData.dropAddress= values.dropLocation ? {
                name: values.dropAddress
            } : null;
        }
        if (values.toDate && values.toTime) {
            bookingData.toDate = moment(`${values.toDate} ${values.toTime}`, "YYYY-MM-DD HH:mm:ss").toISOString()
        };
        let data;
        data = await ApiRequestUtils.post(values.serviceType == "DRIVER" ? API_ROUTES.ADD_NEW_BOOKING : API_ROUTES.ADD_NEW_RENTAL_BOOKING, bookingData, values?.customerId?.id);
        if (data?.success) {
            setIsOpen(false);
        await sendQuotationLogs(data?.data?.result?.id, loggedInUserId);
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
        setSearchBookingId('');
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

    const searchLocations = async (query, isPickup, type) => {
        if (query.length > 2) {
            try {
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.SEARCH_ADDRESS, { address: query });
            if (data?.success && data?.data) {
                if (isPickup) {
                    setPickupSuggestions(data?.data);
                } else if (type === 'driver') {
                    setDriverSuggestions(data?.data);
                } else {
                    setDropSuggestions(data?.data);
                }
            } else {
                setPickupSuggestions([]);
                setDriverSuggestions([]);
                setDropSuggestions([]);
            }
        } catch (error) {
            console.error('Error searching locations:', error);
            setPickupSuggestions([]);
            setDriverSuggestions([]);
            setDropSuggestions([]);
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

            // Check zone for pickup location
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
        } else if (type === 'driver') {
            setFieldValue("driverPickUpAddress", address);
            setFieldValue("driverPickUpLocation", location);
            setDriverPickUpLocation(location);
            setDriverSuggestions([]);
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
                    <span className="mx-3 px-2 py-1 text-white bg-primary rounded-md text-sm font-medium">
                        On Trip
                    </span>
                );
            case 'ended':
                if (bookingData?.tripStatus === true) {
                return (
                    <span className="mx-3 px-2 py-1 text-white bg-green-600 rounded-md text-sm font-medium">
                        Completed
                    </span>
                );
            }
            return (
                <span className="mx-3 px-2 py-1 text-white bg-green-600 rounded-md text-sm font-medium">
                    ENDED
                </span>
            );
            case 'customer_cancelled':
                return (
                    <span className="mx-3 px-2 py-1 text-white bg-gray-600 rounded-md text-sm font-medium">
                        Cancelled
                    </span>
                );
                case 'cancelled':
                return (
                    <span className="mx-3 px-2 py-1 text-white bg-primary rounded-md text-sm font-medium">
                       Customer Cancelled
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
                    <span className="mx-3 px-2 py-1 text-white bg-yellow-600 rounded-md text-sm font-medium">
                        QUOTED
                    </span>
                );

                case 'confirmed':
                    return(
                        <span className="mx-3 px-2 py-1 text-white bg-green-600 rounded-md text-sm font-medium">
                        CONFIRMED
                    </span>
                    );
                case 'request_driver':
                   return(
                        <span className="mx-3 px-2 py-1 text-white bg-orange-600 rounded-md text-sm font-medium">
                        REQUEST DRIVER
                    </span>
                    );
                case 'booking_accepted':
                   return(
                        <span className="mx-3 px-2 py-1 text-white bg-green-600 rounded-md text-sm font-medium">
                        DRIVER ACCEPTED
                    </span>
                    );
                case 'end_otp':
                   return(
                        <span className="mx-3 px-2 py-1 text-white bg-gray-600 rounded-md text-sm font-medium">
                        END OTP
                    </span>
                    );
                case 'driver_on_the_way':
                   return(
                        <span className="mx-3 px-2 py-1 text-white bg-primary rounded-md text-sm font-medium">
                        DRIVER ON THE WAY
                    </span>
                    );
                case 'driver_reached':
                   return(
                        <span className="mx-3 px-2 py-1 text-white bg-yellow-600 rounded-md text-sm font-medium">
                        DRIVER REACHED
                    </span>
                    );
                case 'payment_requested':
                   return(
                        <span className="mx-3 px-2 py-1 text-white bg-green-600 rounded-md text-sm font-medium">
                        PAYMENT REQUESTED
                    </span>
                    );
                      case 'support_cancelled':
                   return(
                        <span className="mx-3 px-2 py-1 text-white bg-primary rounded-md text-sm font-medium">
                        SUPPORT CANCELLED
                    </span>
                    );
            default:
                return null;
        }
    };

    // modal data
    const [isOpen, setIsOpen] = useState(false);

    const serviceDisplayNames = {
        DRIVER: "Acting Driver",
        RIDES: "Local Rides",
        RENTAL_DROP_TAXI: "Drop Taxi",
        RENTAL_HOURLY_PACKAGE: "Hourly Package",
        RENTAL: "Outstation",
        AUTO: "Auto",
        PARCEL: "Parcel",
    };

    return (
        <div className='flex flex-row space-x-6 justify-between w-full'>
            <div className='w-full'>
                <div className='py-2  rounded-xl flex justify-between bg-white mb-2'>
                    {customerData && (
                        <div className="p-2 flex w-[40%] flex-col relative">
                            <input
                                type="text"
                                className="relative w-full py-2 px-8 border  rounded-xl text-sm bg-gray-100 pr-10"
                                placeholder="Search by customer number or booking ID"
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    searchBookings(e.target.value);
                                }}
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
                            </div>
                            {(searchText || searchBookingId) && (
                                <button
                                    type="button"
                                    // className="bg-white text-gray-500 hover:text-gray-700"
                                    aria-label="Clear search"
                                    onClick={() => { setSearchText(''); 
                                                    searchBookings('');
                                                    setSearchBookingId(''); 
                                                    setSelectedCustomer(0);
                                                    setSearchResults([]); 
                                                    
                                                    localStorage.removeItem('bookingSearchId');
                                                   if (refreshFn) refreshFn();
                                                   
                                                }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    X
                                </button>
                            )}
                            {searchResults.length > 0 && (
                                <ul className="absolute top-full left-0 w-full border rounded-lg bg-white mt-2 max-h-60 overflow-y-auto z-10">
                                    {searchResults.map((result, index) => (
                                        <li
                                            key={index}
                                            className="p-2 cursor-pointer hover:bg-gray-100"
                                            onClick={() => {
                                                if (result?.type == 'booking') {
                                                    setSelectedCustomer(0);
                                                    setSearchBookingId(result?.bookingNumber);
                                                    setSearchText(result?.bookingNumber);
                                                } else {
                                                    const label = [result?.firstName, result?.phoneNumber].filter(Boolean).join(' - ');
                                                    setSearchText(label.trim());
                                                    setSelectedCustomer(result?.id);
                                                    setSearchBookingId('');
                                                }
                                                setSearchResults([]);
                                            }}
                                        >
                                            {result?.type == 'booking' ? result?.bookingNumber : [result?.firstName, result?.phoneNumber].filter(Boolean).join(' - ')}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    {/* {customerData && <div className="p-2 flex w-[40%]">
                        <SearchableDropdown
                            searchVal={setCustomerNumber}
                            addVal={addCustomerNumber}
                            selected={editBooking?.customerId} 
                            options={customerData} 
                            onSelect={(val) => {
                                setSelectedCustomer(val.id);
                            }}
                            setSearchBookingId={(value) => {setSearchBookingId(value)}}
                        />
                    </div>} */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className={`relative rounded-xl px-6 py-2 mr-2 text-sm w-40 h-10 mt-2 ${ColorStyles.addButtonColor}`}
                    >
                        <div className="absolute inset-y-0 left-0 flex items-center  pointer-events-none px-3">
                            <PlusIcon className="w-4 h-4 font-medium text-white space-x-3" />
                        Add New Booking
                        </div>
                    </button>

                </div>
                <BookingsList onRegisterRefresh={setRefreshFn}  customerId={selectedCustomer} searchBookingId={searchBookingId} setIsOpen={setIsOpen} bookingStage={bookingStage} onAssignDriver={onAssignDriver} onSelectBooking={onSelectBooking} type={props.typeProp} onTypeChange={handleTypeChange} />
            </div>
            <div>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 w-full" onClick={() => {
                        setIsOpen(false)
                        onConfirmBooking()
                        setSelectedCustomer(0);
                        setEditBookingView();
                        setEditBooking();
                        setQuoteDetails();
                        setSearchBookingId('')
                    }}>
                        <div className="bg-black-gray-500 rounded-2xl  h-screen p-2 w-[75%]  shadow-lg relative" onClick={(e) => e.stopPropagation()}>
                                <div className='justify-end items-end  absolute -right-6'>
                                    <button
                                        onClick={
                                            () => {
                                                setIsOpen(false);
                                                onConfirmBooking();
                                                setSelectedCustomer(0);
                                                setEditBookingView();
                                                setEditBooking();
                                                setQuoteDetails();
                                                setSearchBookingId('');
                                            }
                                        }
                                        className="rounded-3xl  p-2 bg-surface-muted"
                                    >
                                        X
                                    </button>
                                </div>
                            <div className="flex-1 bg-surface-muted rounded-xl max-h-screen overflow-y-auto overflow-x-hidden shadow p-4">
                                {/* max-h-screen overflow-y-auto shadow p-4 */}

                                {!showQuickCreateCustomer && !editBookingView && <div className='text-2xl font-bold mb-8'>
                                    <Typography variant="h5" className='text-gray-900'>
                                        {/* ${bookingData?.Customer?.firstName ? `- ${bookingData?.Customer?.firstName}` : ''} */}
                                        <div className="flex items-center">
                                            {bookingView ? (
                                                <>
                                                    {`Booking Details - ${bookingData?.bookingNumber}`}
                                                    {bookingData?.status && getStatusDisplay(bookingData.status)}
                                                </>
                                            ) : (bookingStage === 0 ? 'New Booking' :  bookingStage === 1 ? 'New Booking' :  bookingData?.requestType === 'REQUEST_ALL' ? `Request Cab - ${bookingData?.bookingNumber}` :  bookingData?.serviceType === 'RENTAL' ? `Assign Cab - ${bookingData?.bookingNumber}` : `Assign Captain - ${bookingData?.bookingNumber}`)}
                                        </div>
                                    </Typography>
                                </div>}
                                {showQuickCreateCustomer && <CustomerAdd isQuickCreate={true} customerNumber={customerNumber} />}
                                {!showQuickCreateCustomer && !bookingView && <>
                                    {(bookingStage === 0 || bookingStage === 1) && <Formik
                                        initialValues={initialValues}
                                        onSubmit={async (values, formikBag) => {
                                            setFormikActions(formikBag); // Store Formik actions for modals
                                            if (values.submitType === "rides") {
                                                await onRideSubmitHandler(values, formikBag);
                                            } else {
                                                await onSubmitHandler(values);
                                            }
                                            setLoading(true);
                                            setRange({});
                                            setLoading(false);
                                            setQuoteDetails();
                                            setSelectedCustomer(0);
                                            setSearchBookingId('');
                                        }}
                                        validationSchema={BOOKING_DETAILS_SCHEMA}
                                        enableReinitialize={true}
                                    >
                                       {({ handleSubmit, values, setFieldValue, isValid, dirty, handleChange, errors }) => {
                                                
                                                    useLuggageAndSeaterLogic(values.carType, setFieldValue);
                                        useEffect(() => {
                                        if (values.serviceType === 'RENTAL_HOURLY_PACKAGE' && values.pickupLocation?.lat && values.pickupLocation?.lng) {
                                            zoneCheckUpFun(values).then(zoneData => {
                                            if (zoneData.success && zoneData.serviceArea) {
                                                const newZone = zoneData.serviceArea.name;
                                                const selectedArea = serviceAreas.find(area => area.name === newZone);
                                                
                                                // Only fetch package list and reset packageSelected if the zone has changed
                                                if (selectedArea && selectedArea.id !== parseInt(selectedAreaId)) {
                                                setSelectedAreaId(selectedArea.id);
                                                setFieldValue('serviceTypeArea', selectedArea.id);
                                                getPackageListDetails(values.serviceType, newZone);
                                                setFieldValue('packageSelected', ''); // Reset only if zone changes
                                                }
                                            } else {
                                                setPackageTypeSelectedData([]);
                                                setFieldValue('packageSelected', '');
                                            }
                                            });
                                        }
                                        }, [values.serviceType, values.pickupLocation?.lat, values.pickupLocation?.lng, selectedAreaId, serviceAreas, getPackageListDetails, setFieldValue]);

                                                    return (
                                                        <Form>


                                                {customerData  && !editBookingView && <div className="p-2 flex">
                                                   <SearchableDropdown 
                                                        searchVal={setCustomerNumber} 
                                                        addVal={addCustomerNumber} 
                                                        selected={selectedCustomer} // Use selectedCustomer instead of editBooking?.customerId
                                                        options={customerData} 
                                                        onSelect={(val) => {
                                                            setFieldValue('customerId', val);
                                                            setSelectedCustomer(val.id);
                                                        }}
                                                    />

                                                    {!editBookingView && <Button
                                                        className="ml-3 w-1/2"
                                                        fullWidth
                                                        color="blue"
                                                        onClick={() => { setShowQuickCreateCustomer(true) }}>
                                                        Add New
                                                    </Button>}
                                                </div>}
                                                {!editBookingView && ( <div className="flex-1 mb-4">
                                                        <div>
                                                            <Typography variant="h6" className="mb-2">
                                                                Service Pickup Area
                                                            </Typography>
                                                           <Field
                                                                as="select"
                                                                name="serviceTypeArea"
                                                                className="p-2 w-full rounded-xl border-2 border-gray-300"
                                                                onChange={(e) => {
                                                                    const selectedValue = e.target.value;
                                                                    // console.log('Selected area value:', selectedValue);
                                                                    setFieldValue('serviceTypeArea', selectedValue, false);
                                                                    setSelectedAreaId(selectedValue);

                                                                    // Fetch new packages for the current serviceType without resetting fields
                                                                    if (values.serviceType) {
                                                                    const selectedArea = serviceAreas.find((area) => area.id === parseInt(selectedValue));
                                                                    const zone = selectedArea ? selectedArea.name : '';
                                                                    getPackageListDetails(values.serviceType, zone);
                                                                    }

                                                                    setFieldValue('serviceTypeArea', selectedValue, true);
                                                                }}
                                                                >
                                                                <option value="" label="Select a Service Pickup Area" />
                                                                {serviceAreas.map((area) => (
                                                                    <option key={area.id} value={area.id}>
                                                                    {area.name}
                                                                    </option>
                                                                ))}
                                                            </Field>
                                                            
                                                            <ErrorMessage name="serviceTypeArea" component="div" className="text-red-500 text-sm" />
                                                        </div>
                                                    </div>
                                                )}
                                                {!editBookingView && ( <div className="flex-1 mb-4">
                                                    <div>
                                                        <Typography variant="h6" className="mb-2">
                                                            Service Type
                                                        </Typography>
                                                        <Field as="select" name="serviceType" className="p-2 w-full rounded-xl border-2 border-gray-300" onChange={(e) => {
                                                                    const selectedValue = e.target.value;
                                                                    // console.log('Selected service value:', selectedValue);
                                                                    setFieldValue('serviceType', selectedValue, false);
                                                                    setCurrentServiceType(selectedValue);
                                                                    resetPackageValues(setFieldValue, selectedValue);
                                                                    setFieldValue('serviceType', selectedValue, true);
                                                                }}
                                                                disabled={!selectedAreaId}
                                                        >
                                                            <option value="" label="Service Type" />
                                                            {services.map((service) => (
                                                                <option key={service} value={service}>
                                                                    {serviceDisplayNames[service] || service}
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
                                                    </div>
                                                </div>)}
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
                                                            <option value="Existing Customer">Existing Customer</option>
                                                            <option value="Referral">Referral</option>
                                                            <option value="Reddit">Reddit</option>
                                                            <option value="Offline Ads">Offline Ads</option>
                                                            <option value="Others">Others</option>
                                                        </Field>
                                                       {(values.sourceType === "Offline Ads" || values.sourceType === "Others") && (
                                                            <Field
                                                                type="text"
                                                                name="otherSourceType"
                                                                placeholder="Please specify the source"
                                                                className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm 
                                                                focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 mt-2"
                                                            />
                                                            )}

                                                        <ErrorMessage name="sourceType" component="div" className="text-red-500 text-sm" />
                                                {values.sourceType === "Others" && (
                                                    <ErrorMessage name="otherSourceType" component="div" className="text-red-500 text-sm" />
                                                )}
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
                                                                 onClick={(e) => {
                                                                if (e.target.showPicker) e.target.showPicker();
                                                                    }}
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
                                                                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
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
                                                            <Field as="select" disabled={bookingStage === 1} name="packageSelected" className="p-2 w-full rounded-xl border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50" value={values.packageSelected}
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
                                                <div className='grid grid-cols-1'>
                                                    {(values.tripType || values.serviceType == 'RIDES' || values.serviceType == 'RENTAL' || values.serviceType == 'RENTAL_HOURLY_PACKAGE') && 
                                                    (<div className="p-2 space-y-2">
                                                        <label className="block text-sm font-medium text-black-700">
                                                            Customer Pickup Location <span className="text-red-500">*</span>
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
                                                                        onClick={() => handleSelectLocation(suggestion, true, null, setFieldValue,values)}
                                                                    >
                                                                        {suggestion}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        <ErrorMessage name="pickupAddress" component="div" className="text-red-500 text-sm" />
                                                    </div>
                                                )}
                                                    <div className="p-2 space-y-2 space-x-3">
                                                        {((values.packageSelected && values.tripType == "Local" && values.serviceType !== 'RENTAL_HOURLY_PACKAGE') || (values.packageSelected && values.tripType == "Round Trip" && values.serviceType !== 'CAR_WASH') || (values.packageTypeSelected == 'Outstation') || (values.serviceType == 'RIDES')) && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-black-700">Drop Location<span className="text-red-500">*</span></label>
                                                                <Field
                                                                    type="text"
                                                                    name="dropAddress"
                                                                    className="p-2  mt-2 w-full rounded-xl border-2 border-gray-300"
                                                                    placeholder="Enter drop location"
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
                                                                                    handleSelectLocation(suggestion, false, null, setFieldValue,values);
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
                                                   {(values.serviceType === 'DRIVER' || values.serviceType === 'RENTAL' || values.serviceType === 'RENTAL_HOURLY_PACKAGE' || values.serviceType === 'RENTAL_DROP_TAXI' ? 'visible' : '') && (
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
                                                                            value={values.luggage}
                                                                        />
                                                                        <ErrorMessage name="luggage" component="div" className="text-red-500 text-sm" />
                                                                    </div>
                                                                )}
                                                                {(values.serviceType === 'DRIVER' || values.serviceType === 'RENTAL' || values.serviceType === 'RENTAL_HOURLY_PACKAGE' || values.serviceType === 'RENTAL_DROP_TAXI' ? 'visible' : '') && (
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
                                                                            value={values.seaterCapacity}
                                                                        />
                                                                       
                                                                        <ErrorMessage name="seater" component="div" className="text-red-500 text-sm" />
                                                                    </div>
                                                                )}
                                                    {(values.serviceType === 'RENTAL' || values.serviceType === 'RENTAL_DROP_TAXI' || values.serviceType === 'RIDES') && (
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
                                                                    searchLocations(e.target.value, false,'driver');
                                                                }}
                                                            />
                                                            {driverSuggestions.length > 0 && (
                                                                <ul className="border rounded-lg bg-white mt-2">
                                                                    {driverSuggestions.map((suggestion, index) => (
                                                                        <li
                                                                            key={index}
                                                                            className="p-2 cursor-pointer hover:bg-gray-100"
                                                                            onClick={() => handleSelectLocation(suggestion, false, 'driver', setFieldValue,values)}
                                                                        >
                                                                            {suggestion}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>)}
                                                </div>
                                              {values.serviceType == 'DRIVER' && values.packageTypeSelected !== 'Outstation' && quoteDetails && (
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
                                                            <div className="flex justify-between">
                                                                                <Typography color="gray" variant="h6">Car Type:</Typography>
                                                                                <Typography>
                                                                                    {quoteDetails.amount?.carType || ''}
                                                                                </Typography>
                                                                            </div>
                                                                        <div className="flex justify-between">
                                                                        <Typography color="gray" variant="h6">Estimated Fare</Typography>
                                                                        <Typography>
                                                                            ₹{(() => {
                                                                            const selectedPackage = packageTypeSelectedData.find(pkg => pkg.id === Number(values.packageSelected));
                                                                            if (!selectedPackage) return "";

                                                                            switch (values.carType?.toUpperCase()) {
                                                                                case "MINI":
                                                                                return selectedPackage.price || "";
                                                                                case "SEDAN":
                                                                                return selectedPackage.price || "";
                                                                                case "SUV":
                                                                                return selectedPackage.price || "";
                                                                                case "MUV":
                                                                                return selectedPackage.priceMVP || "";
                                                                                default:
                                                                                return "";
                                                                            }
                                                                            })()}
                                                                        </Typography>
                                                                        </div>
                                                                    </div>
                                                                    </div>
                                                                </Card>
                                                                )}
                                                    {quoteDetails && (values.serviceType !== 'DRIVER' || (values.serviceType === 'DRIVER' && values.packageTypeSelected === 'Outstation')) && 
                                                    <Card className="my-6">
                                                        <div className="border rounded-xl bg-gray-200 p-4">
                                                            <h2 className="text-2xl font-bold text-center">Estimated Price Details</h2>
                                                            <hr className="my-2 border border-black" />
                                                            <div className="mt-4">
                                                                <>
                                                                    {values?.serviceType === 'RENTAL_HOURLY_PACKAGE' ? (
                                                                        <div className="space-y-3">
                                                                            <div className="flex justify-between">
                                                                                <Typography color="gray" variant="h6">Package Period:</Typography>
                                                                                <Typography>
                                                                                    {quoteDetails.amount?.packageDetails?.period || ''} hours
                                                                                </Typography>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <Typography color="gray" variant="h6">Car Type:</Typography>
                                                                                <Typography>
                                                                                    {quoteDetails.amount?.carType || ''}
                                                                                </Typography>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <Typography color="gray" variant="h6">Package Price:</Typography>
                                                                                <Typography>
                                                                                    ₹{(() => {
                                                                                        const selectedPackage = packageTypeSelectedData.find(pkg => pkg.id === Number(values.packageSelected));
                                                                                        if (!selectedPackage) return "";
                                                                                        switch (quoteDetails.amount?.carType?.toUpperCase()) {
                                                                                            case "MINI": return selectedPackage.price || "";
                                                                                            case "SEDAN": return selectedPackage.priceSedan || "";
                                                                                            case "SUV": return selectedPackage.priceSuv || "";
                                                                                            case "MUV": return selectedPackage.priceMVP || "";
                                                                                            default: return "";
                                                                                        }
                                                                                    })()}
                                                                                </Typography>
                                                                            </div>
                                                                            {quoteDetails.discount?.percentage > 0 && (
                                                                                <>
                                                                                    <div className="flex justify-between">
                                                                                        <Typography color="gray" variant="h6">Discount Applied:</Typography>
                                                                                        <Typography>
                                                                                            {quoteDetails.discount?.percentage} %
                                                                                        </Typography>
                                                                                    </div>
                                                                                    <div className="flex justify-between">
                                                                                        <Typography color="gray" variant="h6">Kilometer :</Typography>
                                                                                        <Typography>{quoteDetails?.amount?.packageDetails?.kilometer} Kms</Typography>
                                                                                    </div>
                                                                                    <div className="flex justify-between">
                                                                                        <Typography color="gray" variant="h6">Total Estimated Fare:</Typography>
                                                                                        <Typography className='font-roboto-medium text-lg text-gray-900'>
                                                                                            {/* ₹ {(quoteDetails.amount?.packageDetails?.price) - (quoteDetails.amount?.packageDetails?.price * quoteDetails?.discount?.percentage / 100)} */}
                                                                                            ₹ {(() => {
                                                                                                const carType = quoteDetails?.amount?.carType?.toUpperCase();
                                                                                                const pkg = quoteDetails?.amount?.packageDetails;
                                                                                                const price = carType === 'MINI' ? Number(pkg?.price) :
                                                                                                            carType === 'MUV' ? Number(pkg?.priceMVP) :
                                                                                                            carType === 'SUV' ? Number(pkg?.priceSuv) :
                                                                                                            carType === 'SEDAN' ? Number(pkg?.priceSedan) : 0;
                                                                                                return price ? (price - (price * (Number(quoteDetails?.discount?.percentage) || 0) / 100)).toFixed(2) : 'N/A';
                                                                                            })()}
                                                                                            {/* {(() => {
                                                                                                const packagePrice = Number(quoteDetails.amount?.packageDetails?.price) || 0;
                                                                                                const discountPercentage = Number(quoteDetails.discount?.percentage) || 0;
                                                                                                return packagePrice - (packagePrice * discountPercentage / 100);
                                                                                            })()} */}
                                                                                        </Typography>
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                    <div className="grid grid-cols-2 justify-between">
                                                                          {values?.serviceType !== 'DRIVER' && values?.serviceType !== 'RENTAL_DROP_TAXI' && (
                                                                            <>
                                                                        <Typography color="gray" variant="h6">Per Km Rate</Typography>
                                                                        <Typography>
                                                                            ₹ {quoteDetails.amount?.kilometerPriceVal}
                                                                        </Typography></>)}
                                                                        {values?.serviceType !== 'DRIVER' && ( <>
                                                                        <Typography color="gray" variant="h6">Pick up to Drop  Kilometer + Driver Km For Pickup Location</Typography>
                                                                        <Typography>                                                                            
                                                                            {((quoteDetails.amount?.estimatedDistance)
                                                                            - 
                                                                            Number(quoteDetails.amount?.driverWithin)) 
                                                                            + 
                                                                            (Number(quoteDetails.amount?.baseKm))
                                                                            } Kms + {quoteDetails.amount?.driverWithin} Kms
                                                                        </Typography></>)}
                                                                        { values?.serviceType === 'RIDES' && ( <>
                                                                        
                                                                        <Typography color="gray" variant="h6">Estimate Time</Typography>
                                                                             
                                                                        <Typography>
                                                                            {quoteDetails.amount?.displayTime}
                                                                        </Typography>
                                                                        </>)}
                                                                        {values?.serviceType === "RENTAL_DROP_TAXI"  && ( <>
                                                                        <Typography color="gray" variant="h6">Estimate Time</Typography>
                                                                        <Typography>
                                                                            {quoteDetails.amount?.hoursEstimated}
                                                                        </Typography>
                                                                        </>)}
                                                                        {values?.serviceType === "RENTAL"  && ( <>
                                                                        <Typography color="gray" variant="h6">Estimate Time</Typography>
                                                                        <Typography>
                                                                          {minsToHHMM(quoteDetails.amount?.distanceEstimated)}
                                                                        </Typography>
                                                                        </>)}
                                                                      
                                                                        <Typography color="gray" variant="h6">Base Fare upto {quoteDetails.amount?.baseKm} Kilometer</Typography>
                                                                        <Typography>
                                                                            ₹ {quoteDetails.amount?.baseFare}
                                                                        </Typography>
                                                                        
                                                                        {/* {quoteDetails.amount.driverWithin > 0 && values.serviceType !== 'DRIVER' &&
                                                                        <>
                                                                        <Typography color="gray" variant="h6">Driver Km For Pickup Location</Typography>
                                                                        <Typography>
                                                                            {quoteDetails.amount.driverWithin + ' Km'}
                                                                        </Typography>
                                                                        </>
                                                                        } */}
                                                                        {(values?.serviceType === "RENTAL" || values?.serviceType === "RENTAL_DROP_TAXI" || values?.serviceType === "RENTAL_HOURLY_PACKAGE") && (
                                                                            <>
                                                                        <Typography color="gray" variant="h6">Car Type:</Typography>
                                                                        <Typography>
                                                                            {quoteDetails.amount?.carType || ''}
                                                                        </Typography>   
                                                                        </>)}
                                                                        
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
                                                                                    ₹ { (quoteDetails.amount?.estimatedPrice) - ( quoteDetails.amount?.estimatedPrice * quoteDetails.discount?.percentage/100) }
                                                                            </Typography>

                                                                        </>}
                                                                        
                                                                        
                                                                        
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
                                                                    )}
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
                                                {values.serviceType === 'RENTAL_HOURLY_PACKAGE' && values.packageSelected && (
                                                    <div className="mb-5 space-y-4 shadow-md shadow-gray-700 bg-white rounded-xl p-4">
                                                        <Typography className="font-roboto-medium text-lg text-gray-900">
                                                            Things to Know Before You Confirm:
                                                        </Typography>
                                                        <div className="space-y-2">
                                                            <Typography className=" text-sm text-gray-700">
                                                                • Toll, parking, permit charges, and state taxes are excluded.
                                                            </Typography>
                                                            <Typography className=" text-sm text-gray-700">
                                                                • For every additional 15 minutes after <span className="font-bold text-black">{packageTypeSelectedData.find(pkg => pkg.id === Number(values.packageSelected))?.period || ''} hours, ₹{(() => {
                                                                    const selectedPackage = packageTypeSelectedData.find(pkg => pkg.id === Number(values.packageSelected));
                                                                    return selectedPackage ? (
                                                                        values.carType === 'Mini' ? selectedPackage.additionalMinCharge :
                                                                            values.carType === 'Sedan' ? selectedPackage.additionalMinChargeSedan :
                                                                                values.carType === 'SUV' ? selectedPackage.additionalMinChargeSuv :
                                                                                    selectedPackage.additionalMinChargeMVP
                                                                    ) : '';
                                                                })()}</span> will be charged.
                                                            </Typography>
                                                            <Typography className=" text-sm text-gray-700">
                                                                • For every extra kilometer <span className="font-bold text-black">₹{(() => {
                                                                    const selectedPackage = packageTypeSelectedData.find(pkg => pkg.id === Number(values.packageSelected));
                                                                    return selectedPackage ? (
                                                                        values.carType === 'Mini' ? selectedPackage.extraKilometerPrice :
                                                                            values.carType === 'Sedan' ? selectedPackage.extraKilometerPriceSedan :
                                                                                values.carType === 'SUV' ? selectedPackage.extraKilometerPriceSuv :
                                                                                    selectedPackage.extraKilometerPriceMVP
                                                                    ) : '';
                                                                })()}</span> will be charged.
                                                            </Typography>
                                                            <Typography className=" text-sm text-gray-700">
                                                                • Night charge of <span className="font-bold text-black">₹{packageTypeSelectedData.find(pkg => pkg.id === Number(values.packageSelected))?.nightCharge || ''}</span> will be charged after {convertTimeFormat(packageTypeSelectedData.find(pkg => pkg.id === Number(values.packageSelected))?.nightHoursFrom || '')}.
                                                            </Typography>
                                                        </div>
                                                        <div className="border border-gray-300 bg-yellow-600 rounded-xl p-2">
                                                            <Typography
                                                                className=" text-center text-sm text-gray-700"
                                                            >
                                                                {BOOKING_TERMS_AND_CONDITIONS}
                                                            </Typography>
                                                        </div>
                                                    </div>

                                                )}
                                                {values.serviceType == 'RENTAL_DROP_TAXI' && quoteDetails && (
                                                    <div className="mb-5 space-y-4 shadow-md shadow-gray-700 bg-white rounded-xl p-4">
                                                        <Typography className="font-roboto-medium text-lg text-gray-900">
                                                            Things to Know Before You Confirm:
                                                        </Typography>
                                                        <div className="space-y-2">
                                                            <Typography className="text-sm text-gray-700">
                                                                • Toll, parking, permit charges, and state taxes are excluded.
                                                            </Typography>
                                                            <Typography className="text-sm text-gray-700">
                                                                • For Every extra kilometer <span className="font-bold text-black">₹{quoteDetails.amount?.extraKmPrice || ''}</span> will be charged.
                                                            </Typography>
                                                            <Typography className="text-sm text-gray-700">
                                                                • A Driver starting  Points <span className="font-bold text-black">{quoteDetails.amount?.driverWithin || ''}</span> Kms.
                                                            </Typography>
                                                            {quoteDetails.amount?.driverCharge > 0 && (
                                                            <Typography className=" text-sm text-gray-700">
                                                                • Driver charge <span className="font-bold text-black">₹{quoteDetails.amount?.driverCharge || '0'}</span>
                                                            </Typography>
                                                            )}
                                                            {quoteDetails.amount?.extraNightCharge > 0 && (
                                                             <Typography className="text-sm text-gray-700">
                                                                • Night Charge of <span className="font-bold text-black">₹{quoteDetails.amount?.extraNightCharge}</span> applies if the trip extends past{' '}
                                                            </Typography>
                                                            )}                                                            
                                                            {quoteDetails.amount?.rideSurchargeAmount > 0 && (
                                                                <Typography className=" text-sm text-gray-700">
                                                                    • A surcharge of <span className="font-bold text-black">₹{quoteDetails.amount?.rideSurchargeAmount}</span> applies for prime locations.
                                                                </Typography>
                                                            )}
                                                        </div>
                                                        <div className="border border-gray-300 bg-yellow-600 rounded-xl p-2">
                                                            <Typography
                                                                className="text-center text-sm text-gray-700"
                                                            >
                                                                {BOOKING_TERMS_AND_CONDITIONS}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                )}

                                                 {values.serviceType == 'RENTAL' && quoteDetails && (
                                                    <div className="mb-5 space-y-4 shadow-md shadow-gray-700 bg-white rounded-xl p-4">
                                                        <Typography className="font-medium text-lg text-gray-900">
                                                            Things to Know Before You Confirm:
                                                        </Typography>
                                                        <div className="space-y-2">
                                                            <Typography className=" text-sm text-gray-700">
                                                                • Toll, parking, permit charges, and state taxes are excluded.
                                                            </Typography>
                                                            <Typography className=" text-sm text-gray-700">
                                                                • For every extra kilometer <span className="font-bold text-black">₹{quoteDetails.amount?.extraKmPrice || ''}</span> will be charged.  
                                                            </Typography>
                                                            <Typography className=" text-sm text-gray-700">
                                                                • A Driver starting  Points <span className="font-bold text-black">{quoteDetails.amount?.driverWithin || '2'}</span> Kms.
                                                            </Typography>
                                                            {quoteDetails.amount?.driverCharge > 0 && (
                                                            <Typography className=" text-sm text-gray-700">
                                                                • Driver charge <span className="font-bold text-black">₹{quoteDetails.amount?.driverCharge || '0'}</span>.
                                                            </Typography>
                                                            )}
                                                            {quoteDetails.amount?.extraNightCharge > 0 && (
                                                             <Typography className="text-sm text-gray-700">
                                                                • Night Charge of <span className="font-bold text-black">₹ {quoteDetails.amount?.extraNightCharge}</span> applies if the trip extends past{' '}.
                                                            </Typography>
                                                            )}
                                                            {quoteDetails.amount?.rideSurchargeAmount > 0 && (
                                                                <Typography className=" text-sm text-gray-700">
                                                                    • A surcharge of <span className="font-bold text-black">₹{quoteDetails.amount?.rideSurchargeAmount}</span> applies for prime locations.
                                                                </Typography>
                                                            )}
                                                        </div>
                                                        <div className="border border-gray-300 bg-yellow-600 rounded-xl p-2">
                                                            <Typography
                                                                className=" text-center text-sm text-gray-700"
                                                            >
                                                                {BOOKING_TERMS_AND_CONDITIONS}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* <div>Form Errors (Debug):</div><div>{JSON.stringify(errors, null, 2)}</div> */}

                                                {values.packageTypeSelected == 'Outstation' && values.dropLocation && values.pickupLocation &&
                                                    <Button fullWidth className='my-6 mx-2' onClick={() => getQuoteOutstationDetails(values)}>
                                                        Check Estimated Price
                                                    </Button>
                                                }

                                                {values.serviceType == 'RIDES' && values.dropLocation && values.pickupLocation &&
                                                    <Button fullWidth className='my-6 mx-2' onClick={() => getQuoteRides(values, setFieldValue)}>
                                                        Check Estimated Price
                                                    </Button>
                                                }

                                                {values.serviceType == 'RENTAL_HOURLY_PACKAGE' && values.pickupLocation && values.packageSelected &&
                                                    <Button fullWidth className='my-6 mx-2' onClick={() => getQuoteRides(values, setFieldValue)}>
                                                        Check Estimated Price
                                                    </Button>
                                                }
                                                {values.serviceType == 'DRIVER' && values.packageTypeSelected == 'Local' && values.pickupLocation && values.packageSelected &&
                                                    <Button fullWidth className='my-6 mx-2' onClick={() => getQuoteRides(values, setFieldValue)}>
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
                                                        validationCheckForDriver(values) ||
                                                        !quoteDetails
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
                                                        disabled={!(values.pickupAddress && values.dropAddress && selectedCustomer&& quoteDetails )||isButtonDisabled}
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
                                                                validationCheckForDriverRental(values) ||
                                                        !quoteDetails
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
                                                                !values.pickupAddress ||
                                                        !quoteDetails
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
                                                                !values.dropAddress ||
                                                                !quoteDetails
                                                            }
                                                            className={`my-6 mx-2 ${ColorStyles.continueButtonColor}`}
                                                        >
                                                            Continue
                                                        </Button>
                                                    }
                                                </div>
                                           </Form>
                                                    );
                                                }}
                                            </Formik>
                                        }
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
                <DistanceExceedModal isVisible={dropTaxiDistanceExceedModal} onClose={() => { setDropTaxiDistanceExceedModal(false); formikActions.setFieldValue?.('dropAddress', ''); formikActions.setFieldValue?.('pickupAddress', '');}}title="Going a bit far?" content="You can choose Outstation within 300km only for the DropTaxi service."/>
                <DistanceExceedModal isVisible={distanceExceedModal} onClose={() => { setDistanceExceedModal(false); formikActions.setFieldValue?.('dropAddress', ''); formikActions.setFieldValue?.('pickupAddress', '');}} title="Going a bit far?" content="Rides above 10 km are allowed only through DropTaxi or Outstation service." />
                <DistanceExceedModal isVisible={cityLimitExceedModal} onClose={() => { setCityLimitExceedModal(false); formikActions.setFieldValue?.('dropAddress', ''); formikActions.setFieldValue?.('pickupAddress', ''); }} title="Oops!" content="We currently serve only Vellore, Kanchipuram, Tiruvannamalai. Try another pickup location nearby." />
                {/* <DistanceExceedModal isVisible={zoneErrorModal.show} onClose={() => { setZoneErrorModal({ show: false }); formikActions.setFieldValue?.('pickupAddress', ''); }} title={zoneErrorModal.title} content={zoneErrorModal.text} /> */}
            </div>
        </div>
    );
};

export default Booking; 