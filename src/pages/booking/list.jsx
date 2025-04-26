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
import { API_ROUTES, BOOKING_STATUS, ColorStyles } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

export function BookingsList({ customerId = 0, bookingStage, onAssignDriver, onSelectBooking, type, setIsOpen=false}) {
    const navigate = useNavigate();
    const [bookingsList, setBookingsList] = useState([]);
    const [selectedBookingId, setSelectedBookingId] = useState(null);

    const [statusFilter, setStatusFilter] = useState(['All']);
    const [serviceTypeFilter, setServiceTypeFilter] = useState(['All']);
    const [showPickedBooking, setShowPickedBooking] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
    });

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
                    <Typography variant="small"  className={`text-[11px] font-bold uppercase mr-1 ${ColorStyles.PopoverHandlerText}`}>
                        {title}
                    </Typography>
                    <FaFilter className="text-white text-xs" />
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

    const getBookingsList = async (page = 1) => {
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_BOOKINGS, {
            "customerId": customerId,
            'type': type ? type : '',
            'page': page,
            'limit': pagination.itemsPerPage,
        });
        if (data?.success) {
            setBookingsList(data?.data);
            setSelectedBookingId(null);
            setPagination({
                currentPage: data?.pagination?.currentPage || 1,
                totalPages: data?.pagination?.totalPages || 1,
                totalItems: data?.pagination?.totalItems || 0,
                itemsPerPage: data?.pagination?.itemsPerPage || 20,
            })
        }
    };

    useEffect(() => {
        getBookingsList(pagination.currentPage);
    }, [customerId, bookingStage, type, pagination.currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            setPagination((prev) => ({ ...prev, currentPage: page }));
        }
    };

    const generatePageButtons = () => {
        const buttons = [];
        const maxVisible = 5;
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <Button
                    key={i}
                    size="sm"
                    variant={i === pagination.currentPage ? "filled" : "outlined"}
                    className={`mx-1 ${ColorStyles.bgColor} text-white`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Button>
            );
        }
        return buttons;
    };

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
        setIsOpen(true)
    };

    const handleBookingSelect = (data) => {
        setSelectedBookingId(data.id);
        onSelectBooking(data);
        setIsOpen(true)
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
    
        const sortedDrivers = [...bookingsList].sort((a, b) => {
          if (key === 'created_at') {
            return direction === 'ascending'
              ? new Date(a[key]) - new Date(b[key])
              : new Date(b[key]) - new Date(a[key]);
          } else {
            const aValue = a[key]?.toLowerCase() || '';
            const bValue = b[key]?.toLowerCase() || '';
            if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
            return 0;
          }
        });
    
        setBookingsList(sortedDrivers);
      };
      
    return (
        <div className="flex flex-col bg-white rounded-xl" >
            <div className='px-3 py-3 mb-2'>
                <Typography variant="h5" color='#000000'>
                    {type == "" ? 'All Bookings' : type == "RENTAL" ? 'Rentals' : type == "RIDES" ? 'Rides' : type == "CAB" ? 'Cab' : type == "CAR_WASH" ? 'Car Wash' : type == 'DRIVER' ? 'Driver' : ''}
                </Typography>
            </div>
            <Card>
                <CardBody> 
                    {/* className="overflow-y-scroll overflow-x-auto max-h-screen" */}
                    {bookingsList.length === 0 ? (
                        <Typography variant="h5" color='#000000'>
                            No Bookings
                        </Typography>
                    ) : (
                        <>
                            <table className="w-full table-auto">
                                <thead>
                                    <tr>
                                        {["Booking ID", "Customer Name", "Driver Name", "Source", "Booking Date", "Created Date", "Status", "Assign Captain"].map((el) => ( // , "Owner" => cd before
                                            
                                            <th
                                                key={el}
                                                className={`border-b border-blue-gray-50 py-3 px-5 text-left ${ColorStyles.bgColor}`}
                                            >
                                                {el === "Service Type" && type === "" ? (
                                                    <FilterPopover
                                                        title={el}
                                                        options={[
                                                            { value: 'All', label: 'All' },
                                                            { value: 'DRIVER', label: 'Acting Driver' },
                                                            { value: 'CAR_WASH', label: 'Car Wash' },
                                                            { value: 'CAB', label: 'Cab' }
                                                        ]}
                                                        selectedFilters={serviceTypeFilter}
                                                        onFilterChange={(value) => handleFilterChange('serviceType', value)}
                                                    />
                                                ) : el === "Created Date" ? (
                                                    <th
                                                      onClick={() => handleSort('created_at')}
                                                      className="border-blue-gray-50 py-3 text-left cursor-pointer flex items-center"
                                                    >
                                                      <Typography variant="small" className="text-[11px] font-bold uppercase text-white">
                                                        Created Date
                                                      </Typography>
                                                      {sortConfig.key === 'created_at' && (
                                                        sortConfig.direction === 'ascending' ? (
                                                          <ChevronUpIcon className="w-5 h-5 mx-1 text-white" />
                                                        ) : (
                                                          <ChevronDownIcon className="w-5 h-5 ml-1 text-white" />
                                                        )
                                                      )}
                                                    </th>
                                                  ) : el === "Status" ? (
                                                        <FilterPopover
                                                            title={el}
                                                            options={[
                                                                { value: 'All', label: 'All' },
                                                                { value: 'QUOTED', label: 'Quoted' },
                                                                { value: 'CONFIRMED', label: 'Booking Confirmed' },
                                                                { value: 'REQUEST_DRIVER', label: 'Request Driver' },
                                                                { value: 'STARTED', label: 'Started' },
                                                                { value: 'ENDED', label: 'Ended' },
                                                                { value: 'CANCELLED', label: 'Cancelled' },
                                                            ]}
                                                            selectedFilters={statusFilter}
                                                            onFilterChange={(value) => handleFilterChange('status', value)}
                                                        />
                                                    ) : el === "Source" ? (
                                                        <FilterPopover
                                                            title={el}
                                                            options={[
                                                                { value: 'All', label: 'All' },
                                                                { value: 'Walk In', label: 'Walk In' },
                                                                { value: 'Mobile App', label: 'Mobile App' },
                                                                { value: 'Website', label: 'Website' },
                                                                { value: 'Call', label: 'Call' },
                                                            ]}
                                                            selectedFilters={statusFilter}
                                                            onFilterChange={(value) => handleFilterChange('status', value)}
                                                        />
                                                    )
                                                        : (
                                                            <Typography variant="medium" className="text-[11px] font-bold uppercase text-white">
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
                                                            <div onClick={() => {handleBookingSelect(data);
                                                                setIsOpen(true)
                                                            }}>
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
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-900">
                                                            {data?.Customer?.firstName ? data?.Customer?.firstName : '-'}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-900">
                                                            {data?.Driver?.firstName ? data?.Driver?.firstName : '-'}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-900">
                                                            {data?.source ? data?.source : '-'}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-900">
                                                            {formatDate(data?.fromDate)}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-900">
                                                            {formatDate(data?.created_at)}
                                                        </Typography>
                                                    </td>
                                                    {/* <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {data?.ownership === "ASSIGNED_TO_SUPPORT" ? (
                                                        <div>Assigned To Support</div>
                                                        ) : data?.ownership}

                                                        </Typography>
                                                        </td> */}
                                                    {/* <td className={className}>
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
                                                    </td> */}
                                                    <td>
                                                        <Chip
                                                            variant="text"
                                                            // color={"blue"}
                                                            value={data?.status == "CONFIRMED" ? "BOOKING CONFIRMED" : data?.status}
                                                            className={`py-0.5 px-2 text-[11px] font-medium w-fit ${ColorStyles.bgStatusColor}`}
                                                        />
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
                                                        {(['INITIATED', 'QUOTED', 'CONFIRMED'].includes(data?.status) || (data?.status == "REQUEST_DRIVER" && data?.serviceType == "RIDES")) && data?.pickupLat && data?.pickupLong && (!data?.Driver?.id && !data?.Cab?.id) && // need to add permission from redux
                                                            <Button
                                                                fullWidth
                                                                onClick={() => onAssignDriverHandler(data)}
                                                                className={`text-xs font-semibold text-blue-gray-900 flex-wrap ${ColorStyles.bgStatusColor}`}
                                                            >
                                                                Assign {data?.serviceType != "DRIVER" ? "Cab" : "Captain"}
                                                            </Button>
                                                        }
                                                        {data?.status === 'ASSIGNED_TO_SUPPORT' && data?.pickupLat && data?.pickupLong && (!data?.Driver?.id && !data?.Cab?.id) &&
                                                            <Button
                                                                fullWidth
                                                                onClick={() => onAssignDriverHandler(data)}
                                                                className={`text-xs font-semibold text-blue-gray-900 flex-wrap ${ColorStyles.bgStatusColor}`}
                                                            >
                                                                Assign {data?.serviceType != "DRIVER" ? "Cab" : "Captain"}
                                                            </Button>
                                                        }
                                                    </td>
                                                </tr>
                                            );
                                        }
                                        )}
                                </tbody>
                            </table>
                            <div className="flex items-center justify-center mt-4">
                                <Button
                                    size="sm"
                                    variant="text"
                                    disabled={pagination.currentPage === 1}
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    className="mx-1"
                                >
                                    {"<"}
                                </Button>
                                {generatePageButtons()}
                                <Button
                                    size="sm"
                                    variant="text"
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    className="mx-1"
                                >
                                    {">"}
                                </Button>
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}

export default BookingsList;
