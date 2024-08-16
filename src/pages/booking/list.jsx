import React, { useEffect, useState } from 'react';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Chip
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, BOOKING_STATUS } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';

export function BookingsList({ customerId = 0, bookingStage, onAssignDriver }) {
    const navigate = useNavigate();
    const [bookingsList, setBookingsList] = useState([]);

    const location = useLocation();
    const paramsPassed = location.state;

    const getBookingsList = async () => {
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_BOOKINGS, {
            "customerId": customerId,
        });
        if (data?.success) {
            setBookingsList(data?.data);
        }
    };

    useEffect(() => {
        getBookingsList();
    }, [customerId, bookingStage]);

    const onEndTrip = async (bookingId, driverId) => {
        const reqBody = {
            status: BOOKING_STATUS.ENDED,
            bookingId: bookingId,
            driverId: driverId,
            driverStatus: 'ACTIVE'
        };
        const data = await ApiRequestUtils.update(API_ROUTES.UPATE_ADMIN_BOOKINGS, reqBody);
        if (data?.success) {
            navigate("/dashboard/booking");
        }
    }
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }
    return (
        <div className="flex flex-col bg-white rounded-xl" >
            <div className='px-3 py-3 mb-2'>
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
                                    {["Booking ID", "Service Type", "Driver Name", "Customer Name", "Date", "Created Date", "Status", ""].map((el) => (
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
                                    (data, key) => {
                                        const className = `p-3 ${key === bookingsList.length - 1
                                            ? "mb-4"
                                            : "border-b border-blue-gray-50"
                                            }`;

                                        return (
                                            <tr key={data?.id}>
                                                <td className={className}>
                                                    <div className="flex items-center">
                                                        <div onClick={() => navigate("/dashboard/confirm-booking", {
                                                            state: {
                                                                bookingId: data?.id,
                                                                customerId: data?.customerId,
                                                                edit: true
                                                            }
                                                        })}>
                                                            <Typography
                                                                variant="small"
                                                                color="blue"
                                                                className="font-semibold underline"
                                                            >
                                                                {data?.bookingNumber}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {data?.serviceType}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {data?.Driver?.firstName ? data?.Driver?.firstName : ''}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {data?.Customer?.firstName}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {formatDate(data?.date)}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {formatDate(data?.created_at)}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    {data?.status == "STARTED" ?
                                                        <Chip
                                                            variant="gradient"
                                                            color={"blue"}
                                                            value={"ON TRIP"}
                                                            className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                                        />
                                                        : data?.status == "ENDED" ?
                                                            <Chip
                                                                variant="gradient"
                                                                color={"green"}
                                                                value={"COMPLETED"}
                                                                className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                                            />
                                                            :
                                                            <Chip
                                                                variant="gradient"
                                                                // color={online ? "green" : "blue-gray"}
                                                                value={"INITIATED"}
                                                                className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                                            />
                                                    }
                                                </td>
                                                <td className={className}>
                                                    {data?.status === 'STARTED' &&
                                                        <Button
                                                            fullWidth
                                                            onClick={() => onEndTrip(data?.id, data?.Driver?.id)}
                                                            className="text-xs font-semibold text-white"
                                                        >
                                                            End Trip
                                                        </Button>
                                                    }
                                                    {data?.status === 'INITIATED' && !data?.Driver?.id &&
                                                        <Button
                                                            fullWidth
                                                            onClick={() => { onAssignDriver(data) }}
                                                            className="text-xs font-semibold text-white flex-wrap"
                                                        >
                                                            Assign Driver
                                                        </Button>
                                                    }
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
