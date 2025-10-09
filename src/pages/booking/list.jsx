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
    IconButton,
    Spinner,
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
} from "@material-tailwind/react";
import { FaArrowRight, FaFilter, FaChartBar, FaClipboardList, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaUsers, FaSync } from 'react-icons/fa';
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, BOOKING_STATUS, ColorStyles } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import moment from "moment";
// import DateRangeFilter from './DateRangeFilter';

export function BookingsList({ customerId = 0, searchBookingId = '', bookingStage, onAssignDriver, onSelectBooking, type, setIsOpen = false, onTypeChange }) {
    const navigate = useNavigate();
    const [bookingsList, setBookingsList] = useState([]);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [activeTab, setActiveTab] = useState("ALL_BOOKINGS");
    const [statusFilter, setStatusFilter] = useState(['All']);
    const [serviceTypeFilter, setServiceTypeFilter] = useState(['All']);
    const [sourceFilter, setSourceFilter] = useState(['All']);
    const [tripCoordinatorFilter, setTripCoordinatorFilter] = useState(['All']);
    const [showPickedBooking, setShowPickedBooking] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 15,
    });
    const [nameSortConfig, setNameSortConfig] = useState({ key: 'firstName', direction: 'ascending' });
    const [loading, setLoading] = useState(true);
    const [loadingStates, setLoadingStates] = useState({});
    const [userId, setUserId] = useState(null);  
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedBookingForReassign, setSelectedBookingForReassign] = useState(null);
    const [counts, setCounts] = useState({ endedCount: "0", quotedCount: "0", totalBookingCount: "0", confirmedCount: "0", supportCount:"0" });
    const [dateFilter, setDateFilter] = useState('All');
    const [customDateFrom, setCustomDateFrom] = useState('');
    const [customDateTo, setCustomDateTo] = useState('');
    const [isManualDateFilter, setIsManualDateFilter] = useState(false);
    const [effectiveSearchId, setEffectiveSearchId] = useState(searchBookingId);
    const [onlineDrivers, setOnlineDrivers] = useState([]);
    const [selectedHour, setSelectedHour] = useState(moment().hour()); 
    const [selectedDriver, setSelectedDriver] = useState(null); 
    const [selectedTime, setSelectedTime] = useState(moment().format(' hh:mm A')); 
    const [totalDriverCount, setTotalDriverCount] = useState(0);
    const [showDriverHours, setShowDriverHours] = useState(false);
    const [isCustomDatePopoverOpen, setIsCustomDatePopoverOpen] = useState(false);
    

useEffect(() => {
  const storedUser = localStorage.getItem('loggedInUser');
  if (storedUser) {
    const userData = JSON.parse(storedUser);     
    setUserId(userData.id); 
  } else {
    console.warn('No loggedInUser found in localStorage');
  }
}, []);

useEffect(() => {
  if (onlineDrivers.length > 0) {
    const driverData = onlineDrivers.find(driver => {
      const driverTime = moment(driver.date_time).hour();
      return driverTime === selectedHour;
    });
    setSelectedDriver(driverData || { count: 0 });
    // Keep initial time as 12:08 unless a box is clicked
  } else {
    setSelectedDriver({ count: 0 });
  }
}, [onlineDrivers, selectedHour]);
    useEffect(() => {
        const stored = localStorage.getItem('bookingSearchId') || '';
        const newEffective = searchBookingId || stored;
        setEffectiveSearchId(newEffective);
        if (newEffective) {
            localStorage.setItem('bookingSearchId', newEffective);
        } else if (!searchBookingId) {
            localStorage.removeItem('bookingSearchId');
        }
    }, [searchBookingId]);
    const handleToggleDriverHours = () => {
  setShowDriverHours(true);
};
    
    const handleHourSelect = (hour) => {
  setSelectedHour(hour);
  const driverData = onlineDrivers.find(driver => moment(driver.date_time).hour() === hour);
  setSelectedDriver(driverData || { count: 0 });
  setSelectedTime(driverData ? moment(driverData.date_time).format(' hh:mm A') : moment().format(' hh:mm A'));
  setShowDriverHours(false); // Hide the popup after selection
};

const handleTabChange = (value) => {
    if (typeof value !== 'string') {
        console.warn('Unexpected value in handleTabChange:', value);
        return;
    }
    if (value !== activeTab) {
        // console.log('Tab changed to:', value);
        setActiveTab(value);
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
       setStatusFilter(['All']); // Reset status filter
        setSourceFilter(['All']); // Reset source filter
        // setStatusFilter(['All']); // Reset filters to avoid filtering out data
        // setServiceTypeFilter(['All']);
        // setSourceFilter(['All']);
        setTripCoordinatorFilter(['All']);
                setCustomDateFrom('');
                setCustomDateTo('');
                setDateFilter(value === 'TODAY' ? 'Today' : value === 'REMAINING' ? 'Future' : value === 'CUSTOM_DATE' ? 'Custom date' : 'All');

            if (value === 'CUSTOM_DATE') {
                setIsCustomDatePopoverOpen(true);
            } else {
                setIsCustomDatePopoverOpen(false);
            }
        }
    };

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
        else if (filterType === 'source') {
            setSourceFilter(prev => {
                if (value === 'All') {
                    return ['All'];
                } else {
                    const newFilter = prev.includes(value)
                        ? prev.filter(item => item !== value)
                        : [...prev.filter(item => item !== 'All'), value];
                    return newFilter.length === 0 ? ['All'] : newFilter;
                }
            })
        }         
        else if (filterType === 'tripCoordinator') {
            setTripCoordinatorFilter(prev => {
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
    const FilterPopover = ({ title, options, selectedFilters, onFilterChange, customContent }) => (
        <Popover placement="bottom-start">
            <PopoverHandler>
                <div className="flex items-center cursor-pointer">
                    <Typography variant="small" className="text-[11px] font-bold uppercase mr-1 text-white">
                        {title}
                    </Typography>
                    <FaFilter className="text-white text-xs" />
                </div>
            </PopoverHandler>
            <PopoverContent className="p-2 z-10">
                {customContent ? (
                    customContent
                ) : (
                    options.map((option) => (
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
                    ))
                )}
            </PopoverContent>
        </Popover>
    );

    const location = useLocation();
    const paramsPassed = location.state;

    useEffect(() => {
        if (activeTab && onTypeChange) {
            onTypeChange(activeTab);
        }
    }, [activeTab ,onTypeChange]);

    const getBookingsList = async (page = 1) => {
        setLoading(true);
    try {
        const filterType = {
            type: activeTab,
            status: statusFilter.includes('COMPLETED') ? ['ENDED'] : statusFilter.filter(s => s !== 'COMPLETED'),
            source: sourceFilter,
            tripCoordinator: tripCoordinatorFilter,
            tripStatus: statusFilter.includes('COMPLETED') ? true : statusFilter.includes('ENDED') ? false : undefined,
        };
        
        // Calculate startDate and endDate based on dateFilter
        let startDate = '';
        let endDate = '';
        if (dateFilter === 'All') {
            const all = moment().format('YYY-MM-DD');
            startDate = "";
            endDate = "";
        }
        else if (dateFilter === 'Today') {
            const today = moment().format('YYYY-MM-DD');
            startDate = today;
            endDate = today;
        } else if (dateFilter === 'Future') {
            const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
            startDate = tomorrow;
            endDate = "";
        } else if (dateFilter === 'Last 7 days') {
            startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
            endDate = moment().format('YYYY-MM-DD');
        } else if (dateFilter === 'Custom date') {
            startDate = customDateFrom;
            endDate = customDateTo;
        }
        
        const queryParams = {
            "customerId": customerId,
            'type': type ? type : '',
            'page': page,
            'limit': pagination.itemsPerPage,
            'filterType': JSON.stringify(filterType),
            'bookingNumber': effectiveSearchId,
        };
        
        // Add date parameters if they exist
        if (startDate) {
            queryParams.startDate = startDate;
        }
        if (endDate) {
            queryParams.endDate = endDate;
        }
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_BOOKINGS, queryParams);
        if (data?.success) {
            if (data?.data?.length > 0) {
            setBookingsList(data?.data);
            setPagination({
                currentPage: data?.pagination?.currentPage || 1,
                totalPages: data?.pagination?.totalPages || 1,
                totalItems: data?.pagination?.totalItems || 0,
                itemsPerPage: data?.pagination?.itemsPerPage || 20,
            });
                setCounts(data?.counts || { endedCount: "0", quotedCount: "0", totalBookingCount: "0", confirmedCount: "0", supportCount: "0" });
                setOnlineDrivers(data?.onlineDrivers || []);
                setTotalDriverCount(data?.totalDrivers || 0);
                setSelectedBookingId(null);
            } 
            else {
                setBookingsList([]);
                setOnlineDrivers([]);
                setCounts({ endedCount: "0", quotedCount: "0", totalBookingCount: "0", confirmedCount: "0", supportCount: "0" });
            }
        } 
        else {
            console.error('API request failed:', data?.message);
            setBookingsList([]);
            setOnlineDrivers([]);
            setCounts({ endedCount: "0", quotedCount: "0", totalBookingCount: "0", confirmedCount: "0", supportCount: "0" });
        }
    } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookingsList([]);
        setOnlineDrivers([]);
        setCounts({ endedCount: "0", quotedCount: "0", totalBookingCount: "0", confirmedCount: "0", supportCount: "0" });
    } finally {
        setLoading(false);
        }
    };

            const handleOnClick = async (bookingId) => {
            if (!userId) {
                console.error('No userId available');
                return;
            }
            try {
                setLoadingStates(prev => ({ ...prev, [bookingId]: true }));
                const data = await UpdateOwnerShip(bookingId, userId);
                if (data?.success) {
                    await getBookingsList(pagination.currentPage);
                }
            } catch (error) {
                console.error('Error updating ownership:', error);
                setLoadingStates(prev => ({ ...prev, [bookingId]: false }));
            }
            };

            const UpdateOwnerShip = async (bookingId, userId) => {
                try {
                const data = await ApiRequestUtils.update(API_ROUTES.PUT_OWNER_SHIP, {
                    bookingId,
                    userId,
                });
                // console.log('UpdateOwnerShip API response:', data);
                setLoadingStates(prev => ({ ...prev, [bookingId]: false }));
                return data;
                } catch (error) {
                console.error('UpdateOwnerShip Error:', error);
                setLoadingStates(prev => ({ ...prev, [bookingId]: false }));
                }
            };
  
    useEffect(() => {
        // Skip automatic API call if we're in the middle of a manual date filter operation
        if (isManualDateFilter) {
            setIsManualDateFilter(false);
            return;
        }
        
        getBookingsList(pagination.currentPage);
        // const intervalId = setInterval(() => {
        //     getBookingsList(pagination.currentPage);
        // }, 10000);

        // return () => clearInterval(intervalId);
    }, [customerId, effectiveSearchId, bookingStage, type, pagination.currentPage, activeTab, statusFilter, sourceFilter, tripCoordinatorFilter, dateFilter, customDateFrom, customDateTo]);

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
    const onRequestDriverHandler = (data, requestDriver) => {
        setShowPickedBooking(data?.id);
        data.requestType = requestDriver;
        onAssignDriver(data);
        setSelectedBookingId(data.id);
        setIsOpen(true)
    };

    const handleBookingSelect = (data) => {
        setSelectedBookingId(data.id);
        onSelectBooking(data);
        setIsOpen(true)
    }

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }
    const handleSort = (key) => {
        let direction = 'ascending';
        let isNameSort = key === 'firstName';

        if (isNameSort) {
            if (nameSortConfig.key === key && nameSortConfig.direction === 'ascending') {
                direction = 'descending';
            }
            setNameSortConfig({ key, direction });
        } else {
            if (sortConfig.key === key && sortConfig.direction === 'ascending') {
                direction = 'descending';
            }
            setSortConfig({ key, direction });
        }

        const sortedBookings = [...bookingsList].sort((a, b) => {
            if (key === 'created_at') {
                return direction === 'ascending'
                    ? new Date(a[key]) - new Date(b[key])
                    : new Date(b[key]) - new Date(a[key]);
            } else if (key === 'firstName') {
                const aValue = a.Customer?.firstName?.toLowerCase() || '';
                const bValue = b.Customer?.firstName?.toLowerCase() || '';
                if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
                return 0;
            }
            return 0;
        });
        setBookingsList(sortedBookings);
    };
    const tripCoordinatorOptions = [
        { value: 'All', label: 'All' },
        ...[...new Set(
            bookingsList
                .filter(booking => booking.User?.id && booking.User?.name)
                .map(booking => JSON.stringify({ id: booking.User.id, name: booking.User.name })) // Stringify to ensure uniqueness
        )]
            .map(str => JSON.parse(str))
            .map(user => ({ value: user.id, label: user.name })),
    ];
    const tabs = [
        { label: 'All Bookings', value:'ALL_BOOKINGS'},
        // { label: 'Past', value:'PAST'},
        { label: 'Today', value: 'TODAY' },
        { label: 'Future', value: 'REMAINING' },
        { label: 'Custom date', value: 'CUSTOM_DATE' },
    ];

    const handleRefresh = () => {
        // Set manual filter flag to prevent useEffect conflicts
        setIsManualDateFilter(true);
        
        // Reset all filters to their default state
        setStatusFilter(['All']);
        setSourceFilter(['All']);
        setTripCoordinatorFilter(['All']);
        setServiceTypeFilter(['All']);
        setDateFilter('All');
        setCustomDateFrom('');
        setCustomDateTo('');
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
        setEffectiveSearchId('');
        localStorage.removeItem('bookingSearchId');
        triggerFilteredAPICall('', '', 1, ['All'], ['All'], ['All'], ['All'], '');
    };

//     // Date filtering implementation
//    const handleDateFilter = () => {
//     console.log('Date filter applied:', {
//         filter: dateFilter,
//         customFrom: customDateFrom,
//         customTo: customDateTo
//     });
    
//     if (dateFilter === 'Custom date' && (!customDateFrom || !customDateTo)) {
//         console.warn('Please select both From and To dates');
//         return;
//     }
    
//     setIsManualDateFilter(true);
//     setPagination((prev) => ({ ...prev, currentPage: 1 }));
//     triggerFilteredAPICall(customDateFrom, customDateTo, 1);
// };

    // Function to trigger API call with specific dates (bypasses state timing issues)
   const triggerFilteredAPICall = async (startDate, endDate, page = 1, statusFilterParam = statusFilter, sourceFilterParam = sourceFilter, tripCoordinatorFilterParam = tripCoordinatorFilter, serviceTypeFilterParam = serviceTypeFilter, effectiveSearchIdParam = effectiveSearchId) => {
        setLoading(true);
        
        // Clear existing data to show loading state
        setBookingsList([]);
        
        try {
            const filterType = {
                type: activeTab,
                status: statusFilterParam.includes('COMPLETED') ? ['ENDED'] : statusFilterParam.filter(s => s !== 'COMPLETED'),
                source: sourceFilterParam,
                tripCoordinator: tripCoordinatorFilterParam,
                tripStatus: statusFilterParam.includes('COMPLETED') ? true : statusFilterParam.includes('ENDED') ? false : undefined,
            };
            
            const queryParams = {
                "customerId": customerId,
                'type': type ? type : '',
                'page': page,
                'limit': pagination.itemsPerPage,
                'filterType': JSON.stringify(filterType),
                'bookingNumber': effectiveSearchIdParam,
            };
            
            // Add date parameters
            if (startDate) {
                queryParams.startDate = startDate;
            }
            if (endDate) {
                queryParams.endDate = endDate;
            }
            
            console.log('Triggering API call with dates:', { startDate, endDate, queryParams });
            
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_BOOKINGS, queryParams);
            if (data?.success) {
                if (data?.data?.length > 0) {
                    setBookingsList(data?.data);
                    setPagination({
                        currentPage: data?.pagination?.currentPage || 1,
                        totalPages: data?.pagination?.totalPages || 1,
                        totalItems: data?.pagination?.totalItems || 0,
                        itemsPerPage: data?.pagination?.itemsPerPage || 20,
                    });
                    setCounts(data?.counts || { endedCount: "0", quotedCount: "0", totalBookingCount: "0", confirmedCount: "0", supportCount:"0" });
                    setSelectedBookingId(null);
                } else {
                    setBookingsList([]);
                    setCounts({ endedCount: "0", quotedCount: "0", totalBookingCount: "0", confirmedCount: "0", supportCount:"0" });
                }
            } else {
                console.error('API request failed:', data?.message);
                setBookingsList([]);
                setCounts({ endedCount: "0", quotedCount: "0", totalBookingCount: "0", confirmedCount: "0", supportCount:"0" });
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookingsList([]);
            setCounts({ endedCount: "0", quotedCount: "0", totalBookingCount: "0", confirmedCount: "0", supportCount:"0" });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col bg-white rounded-xl shadow-lg" >
            {/* Status Cards Section */}
            <div className="w-full px-4 py-6 md:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                    {[
                    { key: 'totalBookingCount', label: 'Total Bookings', icon: FaChartBar, color: 'bg-blue-400 border border-white border-2', bgColor: 'bg-gradient-to-br from-blue-300 to-blue-800' },
                    { key: 'quotedCount', label: 'Quoted', icon: FaClipboardList, color: 'bg-yellow-400 border border-white border-2', bgColor: 'bg-gradient-to-br from-yellow-300 to-yellow-800' },
                    { key: 'confirmedCount', label: 'Confirmed', icon: FaCheckCircle, color: 'bg-purple-500 border border-white border-2', bgColor: 'bg-gradient-to-br from-purple-400 to-purple-800' },
                    { key: 'endedCount', label: 'Trip Completed', icon: FaCheckCircle, color: 'bg-green-500 border border-white border-2', bgColor: 'bg-gradient-to-br from-green-400 to-green-800' },
                    { key: 'supportCount', label: 'Support Cancelled', icon: FaClipboardList, color: 'bg-red-500 border border-white border-2', bgColor: 'bg-gradient-to-br from-red-400 to-red-800' },
                    ].map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                        <div
                        key={index}
                        className={`p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center ${item.bgColor}`}
                        >
                        <Typography variant="small" className="text-white font-medium mb-2">
                            {item.label}
                        </Typography>
                        <div className="flex flex-row items-center justify-between w-full space-x-4">
                            <div className="w-1/2">
                            <Typography variant="h3" className="font-bold text-white text-xl md:text-2xl">
                                {counts[item.key]}
                            </Typography>
                            </div>
                            <div className={`flex justify-center items-center w-12 h-12 md:w-14 md:h-14 rounded-full ${item.color}`}>
                            <IconComponent className="w-6 h-6 md:w-7 md:h-7 text-white" />
                            </div>
                        </div>
                        </div>
                    );
                    })}
                </div>
                </div>
                   {/* Added Driver Statistics UI from Reference Image */}
 <div className="w-full px-4  md:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h6" className="col-span-6 sm:col-span-12 text-gray-900">
          Hourly Online Drivers
        </Typography>
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={handleToggleDriverHours}
        >
          Select Slot
        </Button>
      </div>

      {showDriverHours && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-7xl ml-36">
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
        {Array.from({ length: 24 }, (_, i) => {
            const startHour = i;
            const endHour = (i + 1) % 24;
            const timeRange = `${String(startHour).padStart(2, '0')}:00 - ${String(endHour).padStart(2, '0')}:00`;
            const driverCount = onlineDrivers.find(driver => {
                const driverTime = moment(driver.date_time).hour();
                return driverTime === startHour;
            });

            return (
                <div
                    key={i}
                    className={`bg-gray-100 text-gray-800 p-2 rounded text-center cursor-pointer ${selectedHour === i ? 'border-2 border-black' : ''}`}
                    onClick={() => handleHourSelect(i)}
                  >
                    <Typography variant="small" className="text-xs font-bold mb-1">
                      {timeRange}
                    </Typography>
                    {/* <Typography variant="h5" className="font-extrabold text-base">
                      {driverCount ? driverCount.count : 0}
                    </Typography> */}
                  </div>
                );
              })}
            </div>
           <div className="flex justify-end mt-4">
      <Button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        onClick={() => setShowDriverHours(false)}
      >
        Close
      </Button>
    </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 mt-4 sm:grid-cols-3 gap-4">
        <div className="bg-blue-500 text-white p-4 rounded-lg text-center">
            <Typography variant="small" className="font-medium">Total Drivers</Typography>
            <Typography variant="h3" className="font-bold text-2xl">{totalDriverCount}</Typography>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg text-center">
            <Typography variant="small" className="font-medium">Online at {String(selectedHour).padStart(2, '0')}:00</Typography>
            <Typography variant="h3" className="font-bold text-2xl">{selectedDriver?.count || 0}</Typography>
            <Typography variant="small" className="mt-2 font-medium text-white">Last Updated: {selectedTime}</Typography>
        </div>
                </div>
                </div>
            <div className='px-3 py-3'>
                <Typography variant="h5" className='text-gray-900'>
                    {type == "" ? 'All Bookings' : type == "RENTAL" ? 'Rentals' : type == "RIDES" ? 'Rides' : type == "CAB" ? 'Cab' : type == "CAR_WASH" ? 'Car Wash' : type == 'DRIVER' ? 'Driver' : 'Bookings'}
                </Typography>
            </div>
            <Card>
                <div className='absolute right-10 -top-10'>
                    <button
                        className="bg-primary-400 hover:bg-primary-500 text-white px-4 py-2 rounded-2xl flex items-center gap-2"
                        onClick={handleRefresh}
                    >
                        <img src="/img/refresh.png" alt="Refresh" className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                </div>
                <CardBody>
                    <Tabs  value={activeTab} >
                        <TabsHeader className="bg-gray-300 z-0 mb-4">
                    <div className="flex w-full items-center">
                        <div className="flex w-full">
                            {tabs.map(({ label, value }) => (
                                <Tab
                                    key={value}
                                    value={value}
                                    onClick={() => handleTabChange(value)}
                                    className='cursor-pointer flex-1 text-center'
                                >
                    <div className="flex items-center">
                                    <Typography variant="small" className="font-bold">
                                        {label}
                                    </Typography>
                        {value === 'CUSTOM_DATE' && (
                            <Popover placement="bottom-start" open={isCustomDatePopoverOpen}>
                                <PopoverHandler>
                                    <div className="flex items-center cursor-pointer ml-2">
                                        <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                                    </div>
                                </PopoverHandler>
                                <PopoverContent className="p-4 z-10 bg-white shadow-lg rounded-lg">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2">
                                            <Typography variant="small" className="text-gray-600">
                                                From:
                                            </Typography>
                                            <input
                                                type="date"
                                                value={customDateFrom}
                                                onChange={(e) => setCustomDateFrom(e.target.value)}
                                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                                                // max={customDateTo || undefined}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Typography variant="small" className="text-gray-600">
                                                To:
                                            </Typography>
                                            <input
                                                type="date"
                                                value={customDateTo}
                                                onChange={(e) => setCustomDateTo(e.target.value)}
                                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                                className="px-3 py-1 ml-4 border border-gray-300 rounded-md text-sm"
                                                // min={customDateFrom || undefined}
                                            />
                                        </div>
                                        {/* <Button
                                            size="sm"
                                            className="bg-primary text-white hover:bg-primary-600 flex items-center gap-2"
                                            onClick={handleDateFilter}
                                            disabled={!customDateFrom || !customDateTo}
                                        >
                                            <FaFilter className="w-4 h-4" />
                                            Apply
                                        </Button> */}
                                    </div>
                                </PopoverContent>
                            </Popover>
                                )}
                    </div>
                </Tab>
            ))}
        </div>
                            </div>
                        </TabsHeader>
                        <TabsBody className='overflow-x-scroll px-0 pt-0 pb-2'>



                            
                            {loading ? (
                    <div className="flex justify-center items-center h-screen">
                        <Spinner className="h-12 w-12" />
                    </div>
                                    ) : bookingsList.length === 0 ? (
                            <Typography variant="h5" className='text-gray-900'>
                                No Bookings
                                {/* {activeTab} Bookings ({statusFilter ? ('status'): statusFilter.join(', ')}): {bookingsList.length} */}
                            </Typography>
                        ) : (
                            <>
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr>
                                            {["Booking ID", "Customer Name","Driver Name", "Source", "Booking Date", "Created Date", "Status","Trip Co-Ordinator", "Assign Captain"].map((el) => ( // , "Owner" => cd before Source Type

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
                                                                { value: 'CUSTOMER_CANCELLED', label: 'Customer Cancelled' },
                                                                { value: 'SUPPORT_CANCELLED', label: 'Support Cancelled' },
                                                                { value: 'COMPLETED', label: 'Completed' },
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
                                                            selectedFilters={sourceFilter}
                                                            onFilterChange={(value) => handleFilterChange('source', value)}
                                                        />
                                                    )
                                                        : el === "Customer Name" ? (
                                                            <div
                                                                onClick={() => handleSort('firstName')}
                                                                className="cursor-pointer flex items-center"
                                                            >
                                                                <Typography variant="small" className="text-[11px] font-bold uppercase text-white">
                                                                    Customer Name
                                                                </Typography>
                                                                {nameSortConfig.key === 'firstName' && (
                                                                    nameSortConfig.direction === 'ascending' ? (
                                                                        <ChevronUpIcon className="w-5 h-5 mx-1 text-white" />
                                                                    ) : (
                                                                        <ChevronDownIcon className="w-5 h-5 ml-1 text-white" />
                                                                    )
                                                                )}
                                                            </div>
                                                        ) : el === 'Driver Name' ? (
                                                            <div
                                                                onClick={() => handleSort('firstName')}
                                                                className="cursor-pointer flex items-center"
                                                            >
                                                                <Typography variant="small" className="text-[11px] font-bold uppercase text-white">
                                                                    Driver Name
                                                                </Typography>
                                                                {nameSortConfig.key === 'firstName' && (
                                                                    nameSortConfig.direction === 'ascending' ? (
                                                                        <ChevronUpIcon className="w-5 h-5 mx-1 text-white" />
                                                                    ) : (
                                                                        <ChevronDownIcon className="w-5 h-5 ml-1 text-white" />
                                                                    )
                                                                )}
                                                            </div>
                                                        ) :
                                                            // el === "Booking Date" ? (
                                                            //             <FilterPopover
                                                            //                 title={el}
                                                            //                 customContent={
                                                            //                    <DateRangeFilter onFilterChange={(values) => handleFilterChange('dateRange', values)} />
                                                            //                 }
                                                            //             />
                                                                el === "Trip Co-Ordinator" ? (
                                                                    <FilterPopover
                                                                        title={el}
                                                                        options={tripCoordinatorOptions}
                                                                        selectedFilters={tripCoordinatorFilter}
                                                                        onFilterChange={(value) => handleFilterChange('tripCoordinator', value)}
                                                                    />
                                                                ) : (
                                                                <Typography variant="medium" className="text-[11px] font-bold uppercase text-white">
                                                                    {el}
                                                                </Typography>
                                                            )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {showReassignModal && (
                                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                            <div className="bg-white/95 p-6 rounded-lg max-w-md w-full h-80">
                                            
                                            <Typography className="text-2xl font-extrabold text-center mb-1 mt-10 ">
                                                Are you sure you want to reassign? 
                                            </Typography>
                                            <div className="flex justify-center gap-3">
                                               
                                                <Button
                                                className={`${ColorStyles.bgStatusColor} text-white w-28 mt-14`}
                                                onClick={() => {
                                                    onRequestDriverHandler(selectedBookingForReassign, 'REQUEST_ALL');
                                                    setShowReassignModal(false);
                                                    setSelectedBookingForReassign(null);
                                                }}
                                                >
                                                Yes
                                                </Button>
                                                 <Button
                                                variant="outlined"
                                                onClick={() => { setShowReassignModal(false);
                                                                //  setSelectedBookingForReassign(null);
                                                                        }}
                                                className={" text-white w-28 mt-14 bg-black"}
                                                >
                                                No
                                                </Button>
                                            </div>
                                            </div>
                                        </div>
                                        
                                        )}
                                        {bookingsList
                                            .filter(booking =>
                                                (statusFilter.includes('All') ||
                                                (statusFilter.includes('COMPLETED') && booking.status === 'ENDED'  && booking.tripStatus === true) ||
                                                (statusFilter.includes('ENDED') && booking.status === 'ENDED' && booking.tripStatus === false) ||
                                                (statusFilter.includes(booking.status) && booking.status !== 'ENDED'))
                                                &&
                                                (serviceTypeFilter.includes('All') || serviceTypeFilter.includes(booking.serviceType)) &&
                                                (sourceFilter.includes('All') || sourceFilter.includes(booking.source)) &&
                                                (tripCoordinatorFilter.includes('All') || tripCoordinatorFilter.includes(booking.User?.id))
                                            )
                                            .map((data, key) => {
                                               const isSelected = data.id === selectedBookingId;
                                                    const className = `p-3 ${key === bookingsList.length - 1
                                                        ? "mb-4"
                                                        : "border-b border-blue-gray-50"} ${
                                                        data?.isSosCalled == true ? 'bg-red-500 text-white'
                                                        : isSelected ? 'bg-primary-50'
                                                        : "hover:bg-gray-50"
                                                    } transition-colors duration-200`;

                                                return (
                                                    <tr key={data?.id} className={className}>
                                                        <td className={className}>
                                                            <div className="flex items-center">
                                                                <div onClick={() => {
                                                                    handleBookingSelect(data);
                                                                    setIsOpen(true);
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
                                                            <div className="flex flex-col">
                                                                <Typography className="text-xs font-semibold text-blue-gray-900">
                                                                {data?.Customer?.firstName ? data?.Customer?.firstName : '-'}
                                                                </Typography>
                                                                <Typography className="text-xs font-semibold text-blue-gray-900">
                                                                {data?.Customer?.phoneNumber ? data?.Customer?.phoneNumber : '-'}
                                                                </Typography>
                                                            </div>
                                                            </td>
                                                        {/* <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-900">
                                                                {data?.Customer?.phoneNumber ? data?.Customer?.phoneNumber : '-'}
                                                            </Typography>
                                                        </td> */}
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
                                                        {/* <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-900">
                                                                {data?.sourceType ? data?.sourceType : '-'}
                                                            </Typography>
                                                        </td> */}
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-900">
                                                                {/* {formatDate(data?.fromDate) HH:mm:ss.SSSZ} */}
                                                                {moment(data?.fromDate).format('DD-MM-YYYY / hh:mm A')}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-900">
                                                                {moment(data?.created_at).format('DD-MM-YYYY / hh:mm A')}
                                                            </Typography>
                                                        </td>
                                                        {/* <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                            {data?.ownership === "ASSIGNED_TO_SUPPORT" ? (
                                                            <div>Assigned To Support</div>
                                                            ) : data?.ownership}

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
                                                        </td> */}
                                                        <td>
                                                            <Chip
                                                                variant="ghost"
                                                                // color={"blue"}
                                                              value={data?.status == "CONFIRMED" ? "BOOKING CONFIRMED" : data?.status === "ENDED" && data?.tripStatus === true ? "Completed" : data?.status}
                                                                className={`py-0.5 px-2 text-[11px] font-medium w-fit ${
                                                                    data?.status === "QUOTED" ? "bg-yellow-600 text-white ":
                                                                    data?.status === "REQUEST_DRIVER" ? "bg-orange-600 text-white" :
                                                                    data?.status === "CONFIRMED" ? "bg-green-600 text-white" : 
                                                                    data?.status === "BOOKING_ACCEPTED" ? "bg-green-600 text-white":
                                                                    data?.status === "CUSTOMER_CANCELLED" ? "bg-gray-600 text-white": 
                                                                    data?.status === "ENDED" ? "bg-green-600 text-white" :
                                                                    data?.status === "STARTED" ? "bg-primary   text-white":
                                                                    data?.status === "INITIATED"? "bg-gray-600   text-white":
                                                                    data?.status === "END_OTP" ? "bg-gray-600   text-white":
                                                                    data?.status ===  "DRIVER_ON_THE_WAY" ? "bg-primary   text-white":
                                                                    data?.status === "DRIVER_REACHED" ? "bg-yellow-600  text-white":
                                                                    data?.status === "PAYMENT_REQUESTED" ? "bg-green-600  text-white":
                                                                    "bg-primary  text-white"
                                                                    
                                                                }`}
                                                            />
                                                        </td>
                                                       <td className={className}>
                                                            {data?.userId ? (
                                                                <Typography className="text-xs font-semibold text-blue-gray-900">
                                                                {data?.User?.name}
                                                                </Typography>
                                                            ) : (
                                                                <Button
                                                                fullWidth
                                                                className="text-xs font-semibold text-white"
                                                                onClick={() => handleOnClick(data.id)}
                                                                disabled={loadingStates[data.id]}
                                                            >
                                                                {loadingStates[data.id] ? (
                                                                    <Spinner className="h-4 w-4" />
                                                                ) : (
                                                                    'Assign To Me'
                                                                )}
                                                                </Button>
                                                            )}
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
                                                                {([ 'CONFIRMED'].includes(data?.status) || (data?.status == "REQUEST_DRIVER" && (data?.serviceType == "RIDES" || data?.serviceType == "RENTAL" || data?.serviceType =="DRIVER"))) && data?.pickupLat && data?.pickupLong && (!data?.Driver?.id && !data?.Cab?.id) && 
                                                                <Button
                                                                    fullWidth
                                                                    onClick={() => onRequestDriverHandler(data, 'REQUEST_ALL')}
                                                                    className={`text-xs font-semibold text-blue-gray-900 flex-wrap mb-1 ${ColorStyles.bgStatusColor}`}
                                                                    disabled={data?.User == null}
                                                                >
                                                                    Request {data?.serviceType != "DRIVER" ? "Cab" : "Captain"}
                                                                </Button>
                                                            }
                                                            {([ 'CONFIRMED'].includes(data?.status) || (data?.status == "REQUEST_DRIVER" && (data?.serviceType == "RIDES" || data?.serviceType == "RENTAL" || data?.serviceType == "DRIVER"))) && data?.pickupLat && data?.pickupLong && (!data?.Driver?.id && !data?.Cab?.id) && // need to add permission from redux
                                                                <Button
                                                                    fullWidth
                                                                    onClick={() => onAssignDriverHandler(data)}
                                                                    className={`text-xs font-semibold text-blue-gray-900 flex-wrap ${ColorStyles.bgStatusColor}`}
                                                                    disabled={data?.User == null}
                                                                >
                                                                    Assign {data?.serviceType != "DRIVER" ? "Cab" : "Captain"}
                                                                </Button>
                                                            }
                                                            {(['QUOTED', 'CONFIRMED', 'BOOKING_ACCEPTED'].includes(data?.status)) && (data?.Driver?.id || data?.Cab?.id) && // need to add permission from redux
                                                                <Button
                                                                    fullWidth
                                                                    onClick={() => {
                                                                    setSelectedBookingForReassign(data);
                                                                    setShowReassignModal(true);
                                                                    }}
                                                                    className={`text-xs font-semibold text-blue-gray-900 flex-wrap ${ColorStyles.bgStatusColor}`}
                                                                    disabled={data?.User == null}
                                                                >
                                                                    ReAssign {data?.serviceType != "DRIVER" ? "Cab" : "Captain"}
                                                                </Button>
                                                            }
                                                            {data?.status === 'ASSIGNED_TO_SUPPORT' && data?.pickupLat && data?.pickupLong && (!data?.Driver?.id && !data?.Cab?.id) &&
                                                                <Button
                                                                    fullWidth
                                                                    onClick={() => onAssignDriverHandler(data)}
                                                                    className={`text-xs font-semibold text-blue-gray-900 flex-wrap ${ColorStyles.bgStatusColor}`}
                                                                    disabled={data?.User == null}
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
                        </TabsBody>
                    </Tabs>
                    </CardBody>
                </Card>
            
        </div>
    );
}

export default BookingsList;
