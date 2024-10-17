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
import { useLocation, useNavigate } from 'react-router-dom';
import DriverSearch from '@/components/DriverSearch';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';


export function SearchDrivers(props) {
    //console.log("val", props?.bookingData);
    const [drivers, setDrivers] = useState([]);
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const navigate = useNavigate();
    const location = useLocation();
    const paramsPassed = location.state;
    const [loading, setLoading] = useState(false);
    // const [bookingData, setBookingData] = useState(props?.bookingData);

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
                //console.log('PACKAGE ID :', props?.bookingData)
                let api = props.bookingData.serviceType == "CAB" ? API_ROUTES.GET_CABS_PACKAGE : API_ROUTES.GET_DRIVERS_PACKAGE;
                let data = await ApiRequestUtils.getWithQueryParam(api + props?.bookingData?.packageId, {
                    latitude: props?.bookingData?.pickupLat,
                    longitude: props?.bookingData?.pickupLong,
                    type: props.bookingData.packageType
                });
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
                console.log("driverdata", data);
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
        // console.log("BOOKINGDATA",props?.bookingData)
        if (props?.bookingData) {
            getDriversList();
        }
    }, [props.bookingData]);

    const onAssignDriver = async (service, driverId) => {

        const reqBody = {
            bookingId: props?.bookingData?.id,

        };
        service == "CAB" ? reqBody.cabId = driverId : reqBody.driverId = driverId;
        const data = await ApiRequestUtils.update(API_ROUTES.UPATE_ADMIN_BOOKINGS, reqBody, props?.bookingData?.customerId);
        if (data?.success) {
            props?.onNext();
        }
    }
    return (
        <div className="flex flex-col w-full gap-y-4">
            <DriverSearch onSearch={getDriversList} />
            <Card>
                {loading ? (
                    <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                        <Typography variant="h6" color="white">
                            Loading drivers...
                        </Typography>
                    </CardHeader>
                ) : drivers.length > 0 ? (
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2 max-h-screen">
                        <table className="w-full table-auto">
                            <thead>
                                <tr>
                                    {["Name", "Phone Number", "Distance", "Intercity Count", "Outstation Count", "Status"].map((el) => (
                                        <th
                                            key={el}
                                            className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                        >
                                            <Typography
                                                variant="small"
                                                className="text-[11px] font-bold uppercase text-blue-gray-400 flex items-center cursor-pointer"
                                                onClick={() => {
                                                    ['Intercity Count', 'Outstation Count', 'Distance'].includes(el) && handleSort(el === 'Intercity Count' ? 'intercityCount' : el === 'Distance' ? 'distance' : 'outstationCount')
                                                }}
                                            >
                                                {el}
                                                {['Intercity Count', 'Outstation Count', 'Distance'].includes(el) && <SortIcon field={el === 'Intercity Count' ? 'intercityCount' : el === 'Distance' ? 'distance' : 'outstationCount'} />}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {drivers.map(
                                    ({ id, firstName, name, status, phoneNumber, distance, intercityCount, outstationCount }, key) => {
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
                                                                {props.bookingData.serviceType == "CAB" ? name : firstName}
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
                                                        {distance ? `${Math.round(distance)} km` : 'Unknown'}
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
                                                        onClick={() => { onAssignDriver(props.bookingData.serviceType, id) }}
                                                        className="text-xs font-semibold text-white"
                                                    >
                                                        Assign Captain
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
                            No Drivers Near By
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
                    Assign Captain Later
                </Button>
            </div>
        </div >
    );
}

export default SearchDrivers;
