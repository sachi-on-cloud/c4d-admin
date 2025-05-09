import React, { useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Chip,
    Button
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import DriverSearch from '@/components/DriverSearch';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';


export function SearchDrivers(props) {
    const [drivers, setDrivers] = useState([]);
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [loading, setLoading] = useState(false);
    const [loadingRides, setLoadingRides] = useState(false);

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
                        return regex.test(option.firstName);
                    }
                });
                setDrivers(filtredOptions);
            }else if(props.bookingData.serviceType === 'RIDES'){
                setLoadingRides(true);
                try{
                    let data = { 
                        'bookingId': props.bookingData.id,
                        'customerId': props.bookingData.CustomerId 
                    }
                    let requestDriver = await ApiRequestUtils.post(API_ROUTES.GET_RIDES_CAB_DRIVERS,data);
                    if(requestDriver?.success){
                        setDrivers([]);
                        setTimeout(async () => {
                            console.log("30 seconds passed. Checking driver availability...");
                            let checkDriverStatus = await ApiRequestUtils.get(API_ROUTES.RIDES_DRIVER_LIST+'/'+props.bookingData.id);
                            if (checkDriverStatus?.data?.length > 0) {
                                const formattedDrivers = checkDriverStatus.data.map((item) => ({
                                    id: item.cabId,
                                    name: item.Driver?.firstName || 'N/A',
                                    status: item.Shift?.availability === "AVAILABLE" ? "ACTIVE" : "INACTIVE",
                                    carType: item.Driver?.Cab?.carType || '',
                                    phoneNumber: item.Driver?.phoneNumber || '',
                                    priceOffered: item.offerPrice || item.driverPrice || 0,
                                    tripCount: item.Driver?.totalRides || 0,
                                    Drivers: [{ id: item.DriverId }],
                                    fullData: item,
                                }));
                                setDrivers(formattedDrivers);
                            } else {
                                console.log("No driver found.");
                                setDrivers([]);
                            }
                            setLoadingRides(false);
                        }, 30000);
                    }else{
                        setLoadingRides(false);
                        setLoading(false);
                    }
                } catch(error){
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
                    let filteredDrivers = driverData.map((val)=>({...val,fullData: val}))
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
        if(service === "RENTAL")
            {
            const reqBody = {
                bookingId: props?.bookingData?.id,
                driverId: cabDriverId,
                type: 'REQUEST_DRIVER',
                package: props?.bookingData?.packageId,
            }
            let data = await ApiRequestUtils.post(API_ROUTES.RENTAL_REQUEST, reqBody);
            console.log("DATADINREQUET",data);
            if (data?.success) {
                props?.onNext();
            }
        } else if(service != "RIDES"){
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
        }else if(service == "RIDES"){
            const reqBody = {
                bookingId:fullData.BookingId,
                status: 'BOOKING_ACCEPTED',
                driverId: cabDriverId,
                shiftId: fullData.ShiftId,
                cabId: driverId,
                offerPrice: fullData.offerPrice,
                estimatedDistance: fullData.estimatedDistance,
                estimatedMin: fullData.estimatedMin,
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
                    const formattedDrivers = checkDriverStatus.data.map((item) => ({
                        id: item.cabId,
                        name: item.Driver?.firstName || 'N/A',
                        status: item.Shift?.availability === "AVAILABLE" ? "ACTIVE" : "INACTIVE",
                        carType: item.Driver?.Cab?.carType || '',
                        phoneNumber: item.Driver?.phoneNumber || '',
                        priceOffered: item.offerPrice || item.driverPrice || 0,
                        tripCount: item.Driver?.totalRides || 0,
                        Drivers: [{ id: item.DriverId }],
                    }));
                    setDrivers(formattedDrivers);
                } else {
                    setDrivers([]);
                    console.log("No drivers found.");
                }
            }
        }
    };

    return (
        <>
            {props?.bookingData?.serviceType === 'DRIVER' &&
                <div className="flex flex-col w-full gap-y-4">
                    {/* <DriverSearch onSearch={getDriversList} /> */}
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
                                            {["Name", "Phone Number", "Distance", "Local Count", "Outstation Count", "Status","Assign/ReAssign"].map((el) => (
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
                                            ({ id, firstName, name, status, phoneNumber, distance, localCount, outstationCount, Drivers }, key) => {
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
                <div className="flex flex-col w-full gap-y-4">
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
                                            {["Name", "Phone Number", "Cab Type", "Price Offered", "Local Count" , "Outstation Count",  "Status", "Assign/Reassign"].map((el) => ( //"Trip Count",
                                                <th
                                                    key={el}
                                                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                                >
                                                    <Typography
                                                        variant="small"
                                                        className="text-[11px] font-bold uppercase text-blue-gray-400 flex items-center cursor-pointer"
                                                    >
                                                        {el}
                                                    </Typography>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {drivers.map(
                                            ({ id, name, status, carType, priceOffered, outstationCount,intercityCount, tripCount, phoneNumber, Drivers, fullData }, key) => {
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
                                                                {phoneNumber}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {carType}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {priceOffered}
                                                            </Typography>
                                                        </td>

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

                                                        {/* <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {tripCount}
                                                            </Typography>
                                                        </td> */}
                                                        <td className={className}>
                                                            <Chip
                                                                variant="ghost"
                                                                color={status === "ACTIVE" ? "green" : "blue-gray"}
                                                                value={status === "ACTIVE" ? "Available" : "Not Available"}
                                                                className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                                            />
                                                        </td>
                                                        <td className={className}>
                                                            <Button
                                                                as="a"
                                                                onClick={() => {onAssignDriver(props?.bookingData?.serviceType, id, props?.bookingData?.serviceType == 'DRIVER' ? 0 : Drivers[0]?.id, fullData) }}
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
