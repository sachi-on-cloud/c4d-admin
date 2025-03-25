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

    const getDriversList = async (searchQuery = '') => {
        setLoading(true);
        try {
            if (searchQuery !== '') {
                const isNumeric = /^\d+$/.test(searchQuery);

                // Form a regex pattern based on the input
                const pattern = isNumeric ? `^\\+91${searchQuery}` : searchQuery;

                // Create a regex for filtering
                const regex = new RegExp(pattern, 'i'); // 'i' for case-insensitive

                // Filter options based on input type
                const filtredOptions = drivers.filter((option) => {
                    if (isNumeric) {
                        return regex.test(option.phoneNumber);
                    } else {
                        return regex.test(option.firstName);
                    }
                });
                setDrivers(filtredOptions);
            } else {
                let data;
                if (props.bookingData.serviceType === 'DRIVER') {
                    let api = API_ROUTES.GET_DRIVERS_PACKAGE;
                    let queryObj = {
                        latitude: props?.bookingData?.pickupLat,
                        longitude: props?.bookingData?.pickupLong,
                        type: props?.bookingData?.packageType,
                    }
                    // props.bookingData.serviceType == "CAB" ? queryObj.cabType = props.bookingData.cabType : "";
                    data = await ApiRequestUtils.getWithQueryParam(api, queryObj);
                } else {
                    data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_CABS_PACKAGE, {
                        latitude: props?.bookingData?.pickupLat,
                        longitude: props?.bookingData?.pickupLong,
                    });
                }

                // let data;
                // if (props.bookingData.serviceType == "CAB") {
                //     data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_CABS_PACKAGE + props?.bookingData?.packageId, {
                //         latitude: props?.bookingData?.pickupLat,
                //         longitude: props?.bookingData?.pickupLong,
                //         type: props.bookingData.packageType
                //     });
                // } else {
                //     data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DRIVERS_PACKAGE + props?.bookingData?.packageId, {
                //         latitude: props?.bookingData?.pickupLat,
                //         longitude: props?.bookingData?.pickupLong,
                //         type: props.bookingData.packageType
                //     });
                // }
                if (data?.success) {
                    setDrivers(data?.data);
                }
                // console.log("driverdata", data);
                if (data?.success) {
                    setDrivers(data?.data);
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
            // Handle null or undefined values
            if (!a[field] && !b[field]) return 0;
            if (!a[field]) return 1;
            if (!b[field]) return -1;

            // Convert to numbers for numeric fields
            const aValue = ['intercityCount', 'outstationCount', 'distance'].includes(field)
                ? Number(a[field])
                : a[field];
            const bValue = ['intercityCount', 'outstationCount', 'distance'].includes(field)
                ? Number(b[field])
                : b[field];

            // Sort based on direction
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

    const onAssignDriver = async (service, driverId, cabDriverId) => {
        const reqBody = {
            bookingId: props?.bookingData?.id,
        };
        //service == "CAB" ? reqBody.cabId = driverId : reqBody.driverId = driverId;
        if (service == "CAB") {
            reqBody.cabId = driverId;
            reqBody.driverId = cabDriverId;
        } else {
            reqBody.driverId = driverId;
        }
        const data = await ApiRequestUtils.update(API_ROUTES.UPATE_ADMIN_BOOKINGS, reqBody, props?.bookingData?.customerId);
        if (data?.success) {
            props?.onNext();
        }
    }
    return (
        <>
            {props?.bookingData?.serviceType === 'DRIVER' &&
                <div className="flex flex-col w-full gap-y-4">
                    {/* <DriverSearch onSearch={getDriversList} /> */}
                    <Card>
                        {loading ? (
                            <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                                <Typography variant="h6" color="white">
                                    {`Loading drivers....`}
                                </Typography>
                            </CardHeader>
                        ) : drivers.length > 0 ? (
                            <CardBody className="overflow-x-auto overflow-y-auto max-w-[500px] px-0 pt-0 pb-2">
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr>
                                            {["Name", "Phone Number", "Distance", "Local Count", "Outstation Count", "Status"].map((el) => (
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
                                                                variant="gradient"
                                                                color={status === "ACTIVE" ? "green" : "blue-gray"}
                                                                value={status === "ACTIVE" ? "Available" : "Not Available"}
                                                                className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                                            />
                                                        </td>
                                                        <td className={className}>
                                                            {status === "ACTIVE" && <Button
                                                                as="a"
                                                                onClick={() => { onAssignDriver(props?.bookingData?.serviceType, id, props?.bookingData?.serviceType == 'DRIVER' ? 0 : Drivers[0]?.id) }}
                                                                className="text-xs font-semibold text-white"
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
                            <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
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
                            className='text-white border-2 bg-black rounded-xl'
                        >
                            {props?.bookingData?.serviceType !== "DRIVER" ? "Assign Cab Later" : "Assign Captain Later"}
                        </Button>
                    </div>
                </div >
            }
            {props?.bookingData?.serviceType != 'DRIVER' &&
                <div className="flex flex-col w-full gap-y-4">
                    <Card>
                        {loading ? (
                            <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                                <Typography variant="h6" color="white">
                                    {`Loading cabs....`}
                                </Typography>
                            </CardHeader>
                        ) : drivers.length > 0 ? (
                            <CardBody className="overflow-x-auto overflow-y-auto max-w-[390px] px-0 pt-0 pb-2">
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr>
                                            {["Name", "Phone Number", "Cab Type", "Price Offered", "Trip Count", "Status", "Assign/Reassign"].map((el) => (
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
                                            ({ id, name, status, carType, priceOffered, tripCount, phoneNumber }, key) => {
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
                                                                {tripCount}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Chip
                                                                variant="gradient"
                                                                color={status === "ACTIVE" ? "green" : "blue-gray"}
                                                                value={status === "ACTIVE" ? "Available" : "Not Available"}
                                                                className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                                            />
                                                        </td>
                                                        <td className={className}>
                                                            <Button
                                                                as="a"
                                                                onClick={() => { onAssignDriver(props?.bookingData?.serviceType, id, props?.bookingData?.serviceType == 'DRIVER' ? 0 : Drivers[0]?.id) }}
                                                                className="text-xs font-semibold text-white"
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
                            <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
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
                            className='text-white border-2 bg-black rounded-xl'
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
