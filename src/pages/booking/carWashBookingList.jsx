import React, { useEffect, useState } from 'react';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Chip,
    Popover,
    PopoverHandler,
    PopoverContent,
    Checkbox,
    IconButton
} from "@material-tailwind/react";
import { FaArrowRight, FaFilter } from 'react-icons/fa';
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, BOOKING_STATUS } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';

export function CarWashBookingsList({ customerId = 0, bookingStage, onAssignDriver, onSelectBooking }) {
    const navigate = useNavigate();
    const [bookingsList, setBookingsList] = useState([]);
    const [selectedBookingId, setSelectedBookingId] = useState(null);

    const [statusFilter, setStatusFilter] = useState(['All']);
    const [serviceTypeFilter, setServiceTypeFilter] = useState(['All']);
    const [showPickedBooking, setShowPickedBooking] = useState(0);

    const handleFilterChange = (filterType, value) => {
        if (filterType === 'status') {
            setStatusFilter(prev => {
                if (value === 'All') {
                    return ['All'];
                } else {
                    const newFilter = prev.includes(value)
                        ? prev.filter(item => item !== value)
                        : [...prev.filter(item => item !== 'All'), value];
                    return newFilter.length === 0 ? ['All'] : newFilter;
                }
            });
        } else if (filterType === 'serviceType') {
            setServiceTypeFilter(prev => {
                if (value === 'All') {
                    return ['All'];
                } else {
                    const newFilter = prev.includes(value)
                        ? prev.filter(item => item !== value)
                        : [...prev.filter(item => item !== 'All'), value];
                    return newFilter.length === 0 ? ['All'] : newFilter;
                }
            });
        }
    };
    const FilterPopover = ({ title, options, selectedFilters, onFilterChange }) => (
        <Popover placement="bottom-start">
            <PopoverHandler>
                <div className="flex items-center cursor-pointer">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400 mr-1">
                        {title}
                    </Typography>
                    <FaFilter className="text-blue-gray-400 text-xs" />
                </div>
            </PopoverHandler>
            <PopoverContent className="p-2">
                {options.map((option) => (
                    <div key={option.value} className="flex items-center mb-2">
                        <Checkbox
                            color="blue"
                            checked={selectedFilters.includes(option.value)}
                            onChange={() => onFilterChange(option.value)}
                        />
                        <Typography color="blue-gray" className="font-medium ml-2">
                            {option.label}
                        </Typography>
                    </div>
                ))}
            </PopoverContent>
        </Popover>
    );

    const location = useLocation();
    const paramsPassed = location.state;

    const getBookingsList = async () => {
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_BOOKINGS, {
            "customerId": customerId,
        });
        if (data?.success) {
            setBookingsList(data?.data);
            setSelectedBookingId(null)
        }
    };

    useEffect(() => {
        //console.log("LLIISST", bookingStage);
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
    const onAssignDriverHandler = (data) => {
        setShowPickedBooking(data?.id);
        onAssignDriver(data);
        setSelectedBookingId(data.id);
    };

    const handleBookingSelect = (data) => {
        setSelectedBookingId(data.id);
        onSelectBooking(data);
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
                    Car Wash Bookings List
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
                                    {["Booking ID", /*"Service Type",*/ "Customer Name", "Driver Name", "Booking Date", "Created Date", "Status", "", ""].map((el) => (
                                        <th
                                            key={el}
                                            className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                        >
                                            {el === "Status" ? (
                                                <FilterPopover
                                                    title={el}
                                                    options={[
                                                        { value: 'All', label: 'All' },
                                                        { value: 'INITIATED', label: 'Initiated' },
                                                        { value: 'STARTED', label: 'Started' },
                                                        { value: 'ENDED', label: 'Ended' },
                                                        { value: 'CANCELLED', label: 'Cancelled' },
                                                    ]}
                                                    selectedFilters={statusFilter}
                                                    onFilterChange={(value) => handleFilterChange('status', value)}
                                                />
                                            ) : (
                                                <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                                                    {el}
                                                </Typography>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {bookingsList
                                    .filter(booking =>
                                        (statusFilter.includes('All') || statusFilter.includes(booking.status)) &&
                                        (serviceTypeFilter.includes('All') || serviceTypeFilter.includes(booking.serviceType))
                                    )
                                    .map((data, key) => {
                                        const isSelected = data.id === selectedBookingId;
                                        const className = `p-3 ${key === bookingsList.length - 1
                                            ? "mb-4"
                                            : "border-b border-blue-gray-50"} ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors duration-200`;
                                            
                                        return (
                                            <tr key={data?.id} className={className}>
                                                <td className={className}>
                                                    <div className="flex items-center">
                                                        <div onClick={() => handleBookingSelect(data)}>
                                                            <Typography
                                                                variant="small"
                                                                color="blue"
                                                                className="font-semibold underline cursor-pointer"
                                                            >
                                                                {data?.bookingNumber}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {data?.serviceType === 'DRIVER' ? 'ACTING DRIVER' : data?.serviceType}
                                                    </Typography>
                                                </td> */}
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {data?.Customer?.firstName}
                                                    </Typography>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {data?.Customer?.phoneNumber}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {data?.serviceType === "CAB" ? data?.Cab?.name : data?.serviceType == "DRIVER" || data?.serviceType == "CAR_WASH" ? data?.Driver?.firstName : ''}
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
                                                            : data?.status == "CANCELLED" ?
                                                                <Chip
                                                                    variant="gradient"
                                                                    color={"red"}
                                                                    value={"CANCELLED"}
                                                                    className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                                                />
                                                                : data?.status == "INITIATED" && (data?.Driver?.id || data?.Cab?.id) ?
                                                                    < Chip
                                                                        variant="gradient"
                                                                        value={"BOOKED"}
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
                                                    {/* {data?.status === 'STARTED' &&
                                                        <Button
                                                            fullWidth
                                                            onClick={() => onEndTrip(data?.id, data?.Driver?.id)}
                                                            className="text-xs font-semibold text-white"
                                                        >
                                                            End Trip
                                                        </Button>
                                                    } */}
                                                    {data?.status === 'INITIATED' && data?.pickupLat && data?.pickupLong && (!data?.Driver?.id && !data?.Cab?.id) &&
                                                        <Button
                                                            fullWidth
                                                            onClick={() => onAssignDriverHandler(data)}
                                                            className="text-xs font-semibold text-white flex-wrap"
                                                        >
                                                            Assign {data?.serviceType == "CAB" ? "Cab" : "Captain"}
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

export default CarWashBookingsList;
