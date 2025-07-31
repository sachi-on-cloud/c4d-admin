import React, { useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Chip,
    Button,
    Checkbox,
    Popover,
    PopoverHandler,
    PopoverContent,
    Progress,
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import DriverSearch from '@/components/DriverSearch';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import ConfirmBooking from './confirmBooking';
import { ColorStyles } from '@/utils/constants';
import { FaFilter } from 'react-icons/fa';
import { Spinner } from "@material-tailwind/react";

export function SearchDrivers(props) {
    const [drivers, setDrivers] = useState([]);
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [loading, setLoading] = useState(false);
    const [loadingRides, setLoadingRides] = useState(false);
    const [statusCheckedDriverIds, setStatusCheckedDriverIds] = useState([]);
    const [checkingStatusDriverIds, setCheckingStatusDriverIds] = useState([]);
    const [cabTypeFilter, setCabTypeFilter] = useState(['All']);
    const [checkingAllStatus, setCheckingAllStatus] = useState(false);

    const checkPresence = async (driverId, rowId) => {
        setCheckingStatusDriverIds((prev) => [...prev, driverId]);

        try {
            const result = await ApiRequestUtils.post(API_ROUTES.CHECK_PRESENCE, { driverId });

            setTimeout(async () => {
                await getDriversList();
                setCheckingStatusDriverIds(prev => prev.filter(id => id !== driverId));
                setStatusCheckedDriverIds(prev => [...prev, driverId]);
            }, 30000);
        } catch (error) {
            console.error("Error checking presence:", error);
            setCheckingStatusDriverIds(prev => prev.filter(id => id !== driverId));
        }
    };

    const checkAllStatus = async () => {
        const driversToCheck = drivers.filter(
            (driver) => 
                driver.Drivers?.length > 0 && 
                !statusCheckedDriverIds.includes(driver.Drivers[0]?.id) &&
                driver.status === "ACTIVE"
        );

        if (driversToCheck.length === 0) {
            console.log("No drivers available to check status");
            return;
        }

        setCheckingAllStatus(true);
        setCheckingStatusDriverIds(driversToCheck.map(d => d.Drivers[0].id));
        
        try {
            await Promise.all(driversToCheck.map(driver => 
                ApiRequestUtils.post(API_ROUTES.CHECK_PRESENCE, { driverId: driver.Drivers[0].id })
            ));

            setTimeout(async () => {
                await getDriversList();
                setStatusCheckedDriverIds(prev => [
                    ...prev,
                    ...driversToCheck.map(d => d.Drivers[0].id)
                ]);
                setCheckingStatusDriverIds([]);
                setCheckingAllStatus(false);
            }, 30000);
        } catch (error) {
            console.error("Error checking presence:", error);
            setCheckingStatusDriverIds([]);
            setCheckingAllStatus(false);
        }
    };
    const AnimatedProgress = ({ duration = 30000 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrameId = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [duration]);

  return <Progress value={progress} size="sm" color="blue" className="w-16 inline-block ml-1" />;
};


    const getDriversList = async (searchQuery = '') => {
        setLoading(true);
        try {
            if (searchQuery !== '') {
                const isNumeric = /^\d+$/.test(searchQuery);
                const pattern = isNumeric ? `^\\+91${searchQuery}` : searchQuery;
                const regex = new RegExp(pattern, 'i');
                const filtredOptions = drivers.filter((option) => {
                    if (isNumeric) {
                        return regex.test(option.phoneNumber);
                    } else {
                        const nameField = props.bookingData.serviceType === 'DRIVER' ? option.firstName : option.name;
                        return regex.test(nameField);
                    }
                });
                setDrivers(filtredOptions);
            } else if (props.bookingData.serviceType === 'RIDES' && props.bookingData.requestType == 'REQUEST_ALL') {
                setLoadingRides(true);
                try {
                    let data = {
                        'bookingId': props.bookingData.id,
                        'customerId': props.bookingData.CustomerId
                    }
                    let requestDriver = await ApiRequestUtils.post(API_ROUTES.GET_RIDES_CAB_DRIVERS, data);
                    if (requestDriver?.success) {
                        setDrivers([]);
                        setTimeout(async () => {
                            console.log("30 seconds passed. Checking driver availability...");
                            let checkDriverStatus = await ApiRequestUtils.get(API_ROUTES.RIDES_DRIVER_LIST + '/' + props.bookingData.id);
                            if (checkDriverStatus?.data?.length > 0) {
                                const formattedDrivers = checkDriverStatus.data.map((item) => ({
                                    id: item.cabId,
                                    name: item.Driver?.Cab?.name || 'N/A',
                                    driverName: item.Driver?.firstName || 'N/A',
                                    status: item.Shift?.availability === "AVAILABLE" ? "ACTIVE" : "INACTIVE",
                                    carType: item.Driver?.Cab?.carType || '',
                                    phoneNumber: item.Driver?.phoneNumber || '',
                                    priceOffered: item.offerPrice || item.driverPrice || 0,
                                    tripCount: item.Driver?.totalRides || 0,
                                    Drivers: [{ id: item.DriverId }],
                                    fullData: item,
                                    curAddress: item.Shift?.curAddress?.name || '',
                                    travelDistance: item.travelDistance || '',
                                    travelDuration: item.travelDuration || 0,
                                    intercityCount: item.localCount || 0,
                                    outstationCount: item.outstationCount || 0,
                                }));
                                console.log("Formatted Drivers:", formattedDrivers);
                                setDrivers(formattedDrivers);
                            } else {
                                console.log("No driver found.");
                                setDrivers([]);
                            }
                            setLoadingRides(false);
                        }, 30000);
                    } else {
                        setLoadingRides(false);
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Error in sendDriverRequest:", error);
                }
            } else if (props.bookingData.serviceType === 'RENTAL' && props.bookingData.requestType == 'REQUEST_ALL') {
                setLoadingRides(true);
                try {
                    let data = {
                        bookingId: props.bookingData.id,
                        customerId: props.bookingData.CustomerId,
                        lat: props?.bookingData?.pickupLat,
                        long: props?.bookingData?.pickupLong,
                        distance: 0,
                        type: "Both",
                        packageId: props?.bookingData?.packageId,
                    }
                    let requestDriver = await ApiRequestUtils.post(API_ROUTES.GET_RENTAL_CAB_DRIVERS, data);
                    if (requestDriver?.success) {
                        setDrivers([]);
                        setTimeout(async () => {
                            console.log("30 seconds passed. Checking driver availability...");
                            let checkDriverStatus = await ApiRequestUtils.get(API_ROUTES.RIDES_DRIVER_LIST + '/' + props.bookingData.id);
                            if (checkDriverStatus?.data?.length > 0) {
                                const formattedDrivers = checkDriverStatus.data.map((item) => ({
                                    id: item.Driver?.Cab?.id,
                                    name: item.Driver?.Cab?.name || 'N/A',
                                    driverName: item.Driver?.firstName || 'N/A',
                                    status: item.Shift?.availability === "AVAILABLE" ? "ACTIVE" : "INACTIVE",
                                    carType: item.Driver?.Cab?.carType || '',
                                    phoneNumber: item.Driver?.phoneNumber || '',
                                    priceOffered: item.offerPrice || item.driverPrice || 0,
                                    tripCount: item.Driver?.totalRides || 0,
                                    Drivers: [{ id: item.DriverId }],
                                    fullData: item,
                                    curAddress: item.Shift?.curAddress?.name || '',
                                    travelDistance: item.travelDistance || '',
                                    travelDuration: item.travelDuration || 0,
                                    intercityCount: item.localCount || 0,
                                    outstationCount: item.outstationCount || 0,
                                }));
                                setDrivers(formattedDrivers);
                            } else {
                                console.log("No driver found.");
                                setDrivers([]);
                            }
                            setLoadingRides(false);
                        }, 30000);
                    } else {
                        setLoadingRides(false);
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Error in sendDriverRequest:", error);
                }
            } else {
                let data;
                if (props.bookingData.serviceType === 'DRIVER') {
                    let api = API_ROUTES.GET_DRIVERS_PACKAGE;
                    let queryObj = {
                        latitude: props?.bookingData?.pickupLat,
                        longitude: props?.bookingData?.pickupLong,
                        type: props?.bookingData?.packageType,
                    }
                    data = await ApiRequestUtils.getWithQueryParam(api, queryObj);
                } else {
                    data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_CABS_PACKAGE, {
                        latitude: props?.bookingData?.pickupLat,
                        longitude: props?.bookingData?.pickupLong,
                    });
                }
                if (data?.success) {
                    let driverData = data?.data
                    let filteredDrivers = driverData.map((val) => ({ ...val, fullData: val }))
                    setDrivers(filteredDrivers);
                } else {
                    setDrivers([]);
                }
            }
        } catch (error) {
            console.error("Error fetching drivers:", error);
            setDrivers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);

        const sortedDrivers = [...drivers].sort((a, b) => {
            if (!a[field] && !b[field]) return 0;
            if (!a[field]) return 1;
            if (!b[field]) return -1;

            const aValue = ['intercityCount', 'outstationCount', 'distance'].includes(field)
                ? Number(a[field])
                : a[field];
            const bValue = ['intercityCount', 'outstationCount', 'distance'].includes(field)
                ? Number(b[field])
                : b[field];

            if (newDirection === 'asc') {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        });

        setDrivers(sortedDrivers);
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />;
    };

    useEffect(() => {
        if (props?.bookingData) {
            getDriversList();
        }
    }, [props.bookingData]);

    const onAssignDriver = async (service, driverId, cabDriverId, fullData) => {
        if (service == "RENTAL" && props?.bookingData?.requestType == 'REQUEST_ALL') {
            const reqBody = {
                bookingId: fullData.BookingId,
                status: 'BOOKING_ACCEPTED',
                driverId: cabDriverId,
                shiftId: fullData.ShiftId,
                cabId: driverId,
                offerPrice: fullData.offerPrice,
                estimatedDistance: fullData.estimatedDistance,
                estimatedMin: fullData.estimatedMin,
                packageId: fullData.package,
            };
            const data = await ApiRequestUtils.update(API_ROUTES.CONFIRM_RENTAL_BOOKING, reqBody);
            if (data?.success) {
                props?.onNext();
            } else if (
                data?.code === 403 &&
                data?.error === "Selected Cab is not available. Please choose another Cab."
            ) {
                const updatedDriverList = await ApiRequestUtils.get(`${API_ROUTES.RIDES_DRIVER_LIST}/${bookingId}`);
                if (updatedDriverList?.data?.length > 0) {
                    const formattedDrivers = updatedDriverList.data.map((item) => ({
                        id: item.Driver?.Cab?.id,
                        name: item.Driver?.firstName || 'N/A',
                        status: item.Shift?.availability === "AVAILABLE" ? "ACTIVE" : "INACTIVE",
                        carType: item.Driver?.Cab?.carType || '',
                        phoneNumber: item.Driver?.phoneNumber || '',
                        priceOffered: item.offerPrice || item.driverPrice || 0,
                        tripCount: item.Driver?.totalRides || 0,
                        Drivers: [{ id: item.DriverId }],
                        intercityCount: item.localCount || 0,
                        outstationCount: item.outstationCount || 0,
                    }));
                    setDrivers(formattedDrivers);
                } else {
                    setDrivers([]);
                    console.log("No drivers found.");
                }
            }
        } else if (service === "RENTAL") {
            const reqBody = {
                bookingId: props?.bookingData?.id,
                driverId: cabDriverId,
                type: 'REQUEST_DRIVER',
                package: props?.bookingData?.packageId,
                from: 'WEBPORTAL',
            }
            let data = await ApiRequestUtils.post(API_ROUTES.RENTAL_REQUEST, reqBody);
            if (data?.success) {
                props?.onNext();
            }
        } else if (service != "RIDES") {
            const reqBody = {
                bookingId: props?.bookingData?.id,
            };
            if (service == "RIDES" || service == "RENTAL") {
                reqBody.cabId = driverId;
                reqBody.driverId = cabDriverId;
            } else {
                reqBody.driverId = driverId;
            }
            const data = await ApiRequestUtils.update(API_ROUTES.UPATE_ADMIN_BOOKINGS, reqBody, props?.bookingData?.customerId);
            if (data?.success) {
                props?.onNext();
            }
        } else if (service == "RIDES") {
            const reqBody = {
                bookingId: props?.bookingData.id,
                status: 'BOOKING_ACCEPTED',
                driverId: cabDriverId,
                shiftId: fullData.Shifts[0].id,
                cabId: driverId,
                offerPrice: fullData.offerPrice || 0,
                estimatedDistance: fullData.travelDistance,
                estimatedMin: fullData.travelDuration,
            };
            const data = await ApiRequestUtils.update(API_ROUTES.CONFIRM_RIDES_BOOKING, reqBody);
            if (data?.success) {
                props?.onNext();
            } else if (
                data?.code === 403 &&
                data?.error === "Selected Cab is not available. Please choose another Cab."
            ) {
                const updatedDriverList = await ApiRequestUtils.get(`${API_ROUTES.RIDES_DRIVER_LIST}/${bookingId}`);
                if (updatedDriverList?.data?.length > 0) {
                    const formattedDrivers = updatedDriverList.data.map((item) => ({
                        id: item.cabId,
                        name: item.Driver?.firstName || 'N/A',
                        status: item.Shift?.availability === "AVAILABLE" ? "ACTIVE" : "INACTIVE",
                        carType: item.Driver?.Cab?.carType || '',
                        phoneNumber: item.Driver?.phoneNumber || '',
                        priceOffered: item.offerPrice || item.driverPrice || 0,
                        tripCount: item.Driver?.totalRides || 0,
                        Drivers: [{ id: item.DriverId }],
                        intercityCount: item.localCount || 0,
                        outstationCount: item.outstationCount || 0,
                    }));
                    setDrivers(formattedDrivers);
                } else {
                    setDrivers([]);
                    console.log("No drivers found.");
                }
            }
        }
    };

    const handleFilterChange = (filterType, value) => {
        if (filterType === 'carType') {
            setCabTypeFilter(prev => {
                const newFilter = value === 'All'
                    ? ['All']
                    : prev.includes(value)
                        ? prev.filter(item => item !== value)
                        : [...prev.filter(item => item !== 'All'), value];
                return newFilter.length === 0 ? ['All'] : newFilter;
            });
        }
    };

    const FilterPopover = ({ title, options, selectedFilters, onFilterChange }) => (
        <Popover placement="bottom-start">
            <PopoverHandler>
                <div className="flex items-center cursor-pointer">
                    <Typography variant="small" className="text-[11px] font-bold uppercase mr-1 text-blue-gray-400">
                        {title}
                    </Typography>
                    <FaFilter className="text-gray-600 text-xs" />
                </div>
            </PopoverHandler>
            <PopoverContent className="p-2 z-50 bg-white shadow-lg">
                {options.map((option) => (
                    <div key={option.value} className="flex items-center mb-2">
                        <Checkbox
                            color="blue"
                            checked={selectedFilters.includes(option.value)}
                            onChange={() => onFilterChange('carType', option.value)}
                        />
                        <Typography color="blue-gray" className="font-medium ml-2">
                            {option.label}
                        </Typography>
                    </div>
                ))}
            </PopoverContent>
        </Popover>
    );

    return (
        <>
            <ConfirmBooking bookingData={props.bookingData} hideAllNewButton={true} />
            {props?.bookingData?.serviceType === 'DRIVER' &&
                <div className="flex flex-col w-full gap-y-4">
                    <Card>
                        {loading ? (
                            <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                                <Typography variant="h6" color="white">
                                    {`Loading drivers....`}
                                </Typography>
                            </CardHeader>
                        ) : drivers.length > 0 ? (
                            <CardBody className="overflow-x-auto overflow-y-auto px-0 pt-0 pb-2">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            {["Name", "Phone Number", "Current Address", "Distance", "Local Count", "Outstation Count", "Status", "Assign/ReAssign"].map((el) => (
                                                <th
                                                    key={el}
                                                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                                >
                                                    <Typography
                                                        variant="small"
                                                        className="text-[11px] font-bold uppercase text-blue-gray-400 flex items-center cursor-pointer"
                                                        onClick={() => {
                                                            ['Local Count', 'Outstation Count', 'Distance'].includes(el) && handleSort(el === 'Local Count' ? 'localCount' : el === 'Distance' ? 'distance' : 'outstationCount')
                                                        }}
                                                    >
                                                        {el}
                                                        {['Local Count', 'Outstation Count', 'Distance'].includes(el) && <SortIcon field={el === 'Local Count' ? 'localCount' : el === 'Distance' ? 'distance' : 'outstationCount'} />}
                                                    </Typography>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {drivers.map(
                                            ({ id, firstName, name, Shifts, curAddress, status, phoneNumber, distance, localCount, outstationCount, Drivers }, key) => {
                                                const className = `py-3 px-5 ${key === drivers.length - 1
                                                    ? ""
                                                    : "border-b border-blue-gray-50"
                                                    }`;

                                                return (
                                                    <tr key={id}>
                                                        <td className={className}>
                                                            <div className="flex items-center gap-4">
                                                                <div>
                                                                    <Typography
                                                                        variant="small"
                                                                        color="blue-gray"
                                                                        className="font-semibold"
                                                                    >
                                                                        {props?.bookingData?.serviceType == "CAB" ? name : firstName}
                                                                    </Typography>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {(props?.bookingData?.serviceType === "CAB" && Drivers?.[0]?.phoneNumber) ? Drivers?.[0]?.phoneNumber : phoneNumber}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className='text-xs font-semibold text-blue-gray-600'>
                                                                {Shifts?.[0]?.curAddress?.name || curAddress?.name}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {(props?.bookingData?.serviceType == "CAB" && Drivers?.[0]?.distance) ? `${Math.round(Drivers?.[0]?.distance)} km` : distance ? `${Math.round(distance)} km` : 'Unknown'}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {localCount}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {outstationCount}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Chip
                                                                variant="ghost"
                                                                color={status === "ACTIVE" ? "green" : "blue-gray"}
                                                                value={status === "ACTIVE" ? "Available" : "Not Available"}
                                                                className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                                            />
                                                            {status === 'ACTIVE' &&  props.bookingData.requestType !== 'REQUEST_ALL' &&
                                                                !statusCheckedDriverIds.includes(Drivers?.[0]?.id) && (
                                                                    checkingStatusDriverIds.includes(Drivers?.[0]?.id) ? (
                                                                       <AnimatedProgress duration={30000} />
                                                                    ) : (
                                                                        <Typography
                                                                            className="text-xs font-semibold text-blue-900 underline cursor-pointer"
                                                                            onClick={() => checkPresence(Drivers[0].id, id)}
                                                                        >
                                                                            Check Status
                                                                        </Typography>
                                                                    )
                                                                )}
                                                        </td>
                                                        <td className={className}>
                                                            {status === "ACTIVE" && <Button
                                                                as="a"
                                                                onClick={() => { onAssignDriver(props?.bookingData?.serviceType, id, props?.bookingData?.serviceType == 'DRIVER' ? 0 : Drivers[0]?.id) }}
                                                                className="text-xs font-semibold text-white bg-[#1A73E8]"
                                                            >
                                                                {props?.bookingData?.serviceType !== "DRIVER" ? "Assign Cab" : "Assign Captain"}
                                                            </Button>}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </CardBody>) : (
                            <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                                <Typography variant="h6" color="white">
                                    {`No ${props?.bookingData?.serviceType == "CAB" ? 'cabs' : 'drivers'} Near By`}
                                </Typography>
                            </CardHeader>
                        )}
                    </Card>
                    <div className=''>
                        <Button
                            fullWidth
                            onClick={() => { props?.onNext() }}
                            className='text-white border-2 bg-[#1A73E8] rounded-xl'
                        >
                            {props?.bookingData?.serviceType !== "DRIVER" ? "Assign Cab Later" : "Assign Captain Later"}
                        </Button>
                    </div>
                </div >
            }
            {props?.bookingData?.serviceType != 'DRIVER' &&
                <div className="flex flex-col w-full">
                    <div className="flex justify-end mb-4">
                        <Button
                            color="red"
                            size="sm"
                            className="w-36"
                            onClick={checkAllStatus}
                            disabled={checkingAllStatus}
                        >
                            {checkingAllStatus ? (
                                <div className="flex items-center justify-center">
                                    <Spinner className="h-4 w-4 mr-2" />
                                     {/* <AnimatedProgress duration={30000} /> */}
                                    Checking...
                                </div>
                            ) : "Check All Status"}
                        </Button>
                    </div>
                    <Card>
                        {loadingRides ? (
                            <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                                <Typography variant="h6" color="white">
                                    Requesting nearby drivers. Please wait 30 seconds...
                                </Typography>
                            </CardHeader>
                        ) : loading ? (
                            <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                                <Typography variant="h6" color="white">
                                    Loading cabs...
                                </Typography>
                            </CardHeader>
                        ) : drivers.length > 0 ? (
                            <CardBody className="overflow-x-auto overflow-y-auto w-full px-0 pt-0 pb-2">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            {["Cab Name", "Driver Name", "Phone Number", "Current Address", "Cab Type",
                                                ...(props.bookingData?.requestType == 'REQUEST_ALL' ? ["Driver Offered"] : []),
                                                "Local Count", "Outstation Count", "Status", "Travel Distance", "Travel Duration", "Assign/Reassign"].map((el) => (
                                                    <th
                                                        key={el}
                                                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                                    >
                                                        {el === "Cab Type" ? (
                                                            <FilterPopover
                                                                title={el}
                                                                options={[
                                                                        { value: "All", label: "All" },
                                                                    { value: "MINI", label: "Mini" },
                                                                    { value: "Sedan", label: "Sedan" },
                                                                    { value: "SUV", label: "Suv" },
                                                                    { value: "MUV", label: "Muv" },
                                                                ]}
                                                                selectedFilters={cabTypeFilter}
                                                                onFilterChange={handleFilterChange}
                                                            />
                                                        ) : (
                                                            <Typography
                                                                variant="small"
                                                                className="text-[11px] font-bold uppercase text-blue-gray-400 flex items-center cursor-pointer"
                                                            >
                                                                {el}
                                                            </Typography>
                                                        )}
                                                    </th>
                                                ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {drivers.filter(driver => cabTypeFilter.includes('All') || cabTypeFilter.includes(driver.carType)).map(
                                            ({ id, name, status, carType, Shifts, priceOffered, curAddress, outstationCount, intercityCount, travelDistance, travelDuration, driverName, tripCount, firstName, phoneNumber, Drivers, fullData }, key) => {
                                                const className = `py-3 px-5 ${key === drivers.length - 1
                                                    ? ""
                                                    : "border-b border-blue-gray-50"
                                                    }`;

                                                return (
                                                    <tr key={id}>
                                                        <td className={className}>
                                                            <div className="flex items-center gap-4">
                                                                <div>
                                                                    <Typography
                                                                        variant="small"
                                                                        color="blue-gray"
                                                                        className="font-semibold"
                                                                    >
                                                                        {name}
                                                                    </Typography>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {(Drivers?.[0]?.firstName) ? Drivers?.[0]?.firstName : firstName || driverName}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {(Drivers?.[0]?.phoneNumber) ? Drivers?.[0]?.phoneNumber : phoneNumber}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {(Shifts?.[0]?.curAddress?.name || curAddress?.name) || curAddress}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {carType}
                                                            </Typography>
                                                        </td>
                                                        {props.bookingData.requestType == 'REQUEST_ALL' &&
                                                            <td className={className}>
                                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                    {priceOffered}
                                                                </Typography>
                                                            </td>
                                                        }
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {intercityCount}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {outstationCount}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Chip
                                                                variant="ghost"
                                                                color={status === "ACTIVE" ? "green" : "blue-gray"}
                                                                value={status === "ACTIVE" ? "Available" : "Not Available"}
                                                                className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                                            />
                                                            {status === 'ACTIVE' &&  props.bookingData.requestType !== 'REQUEST_ALL' &&
                                                                !statusCheckedDriverIds.includes(Drivers?.[0]?.id) && (
                                                                    checkingStatusDriverIds.includes(Drivers?.[0]?.id) ? (
                                                                        <AnimatedProgress duration={30000} />
                                                                    ) : (
                                                                        <Typography
                                                                            className="text-xs font-semibold text-blue-900 underline cursor-pointer"
                                                                            onClick={() => checkPresence(Drivers[0].id, id)}
                                                                        >
                                                                            Check Status
                                                                        </Typography>
                                                                    )
                                                                )}
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {travelDistance}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {travelDuration} Min.
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Button
                                                                as="a"
                                                                onClick={() => { onAssignDriver(props?.bookingData?.serviceType, id, props?.bookingData?.serviceType == 'DRIVER' ? 0 : Drivers[0]?.id, fullData) }}
                                                                className="text-xs font-semibold text-white bg-[#1A73E8]"
                                                            >
                                                                Assign Cab
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </CardBody>) : (
                            <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                                <Typography variant="h6" color="white">
                                    {`No ${props?.bookingData?.serviceType == "DRIVER" ? 'drivers' : 'cabs'} Near By`}
                                </Typography>
                            </CardHeader>
                        )}
                    </Card>
                    <div className=''>
                        <Button
                            fullWidth
                            onClick={() => { props?.onNext() }}
                            className='text-white border-2 bg-[#1A73E8] rounded-xl'
                        >
                            {props?.bookingData?.serviceType !== "DRIVER" ? "Assign Cab Later" : "Assign Captain Later"}
                        </Button>
                    </div>
                </div >
            }
        </>
    );
}

export default SearchDrivers;