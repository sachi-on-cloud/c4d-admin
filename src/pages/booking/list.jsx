import React, { useEffect, useState } from 'react';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Chip
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';

export function BookingsList() {
    const navigate = useNavigate();
    const [bookingsList, setBookingsList] = useState([]);

    const location = useLocation();
    const paramsPassed = location.state;

    const getBookingsList = async () => {
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_BOOKINGS, {
            "customerId": 0,
        });
        if (data?.success) {
            setBookingsList(data?.data);
        }
    };

    useEffect(() => {
        getBookingsList();
    }, []);
    return (
        <div className="flex flex-col rounded-xl">
            <div className='mb-2'>
                <Typography variant="h5" color='#000000'>
                    Bookings List
                </Typography>
            </div>
            <Card>
                <CardBody className="overflow-x-scroll overflow-y-auto max-h-screen">
                    {bookingsList.length === 0 ? (
                        <Typography variant="h5" color='#000000'>
                            No Bookings
                        </Typography>
                    ) : (
                        <table className="w-full table-auto">
                            <thead>
                                <tr>
                                    {["Booking ID", "Service Type", "Driver Name", "Status", ""].map((el) => (
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
                                {bookingsList.map(
                                    ({ id, serviceType, Driver, status, email }, key) => {
                                        const className = `p-3 ${key === bookingsList.length - 1
                                            ? ""
                                            : "border-b border-blue-gray-50"
                                            }`;

                                        return (
                                            <tr key={id}>
                                                <td className={className}>
                                                    <div className="flex items-center">
                                                        <div>
                                                            <Typography
                                                                variant="small"
                                                                color="blue-gray"
                                                                className="font-semibold"
                                                            >
                                                                {id}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {serviceType}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {Driver?.firstName}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Chip
                                                        variant="gradient"
                                                        // color={online ? "green" : "blue-gray"}
                                                        value={status}
                                                        className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                                    />
                                                </td>
                                                <td className={className}>
                                                    <Button
                                                        as="a"
                                                        onClick={() => { alert("hi"); }}
                                                        className="text-xs font-semibold text-white mr-3"
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        as='a'
                                                        onClick={() => navigate(`/dashboard/customers/edit/${id}`)}
                                                        className="text-xs font-semibold text-white"
                                                    >
                                                        Edit
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>)}
                </CardBody>
            </Card>
        </div>
    );
}

export default BookingsList;
