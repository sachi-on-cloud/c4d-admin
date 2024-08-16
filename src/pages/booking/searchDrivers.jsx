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
import { API_ROUTES, BOOKING_STATUS } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';
import DriverSearch from '@/components/DriverSearch';


export function SearchDrivers(props) {
    const [drivers, setDrivers] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const paramsPassed = location.state;

    const getDriversList = async (searchQuery) => {
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
            const data = await ApiRequestUtils.get(API_ROUTES.GET_DRIVERS + props?.bookingData?.packageId);
            if (data?.success) {
                setDrivers(data?.data);
            }
        }
    };
    useEffect(() => {
        if (props?.bookingData) {
            getDriversList();
        }
    }, []);

    const onAssignDriver = async (driverId) => {
        const reqBody = {
            bookingId: props?.bookingData?.id,
            driverId: driverId
        };
        const data = await ApiRequestUtils.update(API_ROUTES.UPATE_ADMIN_BOOKINGS, reqBody, props?.bookingData?.customerId);
        if (data?.success) {
            props?.onNext();
        }
    }
    return (
        <div className="flex flex-col w-full gap-y-4">
            <DriverSearch onSearch={getDriversList} />
            <Card>
                {drivers.length > 0 ? (
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2 max-h-screen">
                        <table className="w-full table-auto">
                            <thead>
                                <tr>
                                    {["Name", "Phone Number", "Status"].map((el) => (
                                        <th
                                            key={el}
                                            className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                        >
                                            <Typography
                                                variant="small"
                                                className="text-[11px] font-bold uppercase text-blue-gray-400"
                                            >
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {drivers.map(
                                    ({ id, firstName, status, phoneNumber, email }, key) => {
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
                                                                {firstName}
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
                                                        onClick={() => { onAssignDriver(id) }}
                                                        className="text-xs font-semibold text-white"
                                                    >
                                                        Assign Driver
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
                    Assign Driver Later
                </Button>
            </div>
        </div >
    );
}

export default SearchDrivers;
