import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { Button, Spinner, Popover, PopoverHandler, PopoverContent, Checkbox, Typography, Input } from '@material-tailwind/react';
import { FaFilter, FaChevronDown } from 'react-icons/fa';
import moment from 'moment';

const TripDetails = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFromDate = searchParams.get('fromDate') || '';
  const initialToDate = searchParams.get('toDate') || '';
  const initialTripType = searchParams.get('tripType') || '';
  const initialCarNumber = searchParams.get('carNumber') || '';
  const initialPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const [trips, setTrips] = useState([]);
  const [allTrips, setAllTrips] = useState([]); // Store unfiltered trips
  const [summary, setSummary] = useState({
    totalKm: 0,
    fuelUsed: 0,
    fuelCost: 0,
    totalFare: 0,
    profit: 0,
    tollCost: 0,
    permitCost: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
  });

  
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [tripTypeFilter, setTripTypeFilter] = useState(initialTripType); 

 
  const [vehicleNumberFilter, setVehicleNumberFilter] = useState(initialCarNumber);
  const [tempVehicleFilter, setTempVehicleFilter] = useState(initialCarNumber);

  
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [tempFromDate, setTempFromDate] = useState('');
  const [tempToDate, setTempToDate] = useState('');

  const [availableVehicles, setAvailableVehicles] = useState([]);

  const getNextDateString = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    utcDate.setUTCDate(utcDate.getUTCDate() + 1);
    return utcDate.toISOString().slice(0, 10);
  };

  const normalizeDateString = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  };

  const fetchTrips = async (page = 1, showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const baseQueryParams = {
        page,
        limit: pagination.itemsPerPage,
      };
      if (fromDate) baseQueryParams.fromDate = fromDate;
      if (toDate) baseQueryParams.toDate = toDate;
      if (tripTypeFilter && tripTypeFilter !== 'All') baseQueryParams.tripType = tripTypeFilter;
      if (vehicleNumberFilter) baseQueryParams.carNumber = vehicleNumberFilter;

      let response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DRIVER_TRIP_DETAILS, baseQueryParams);
      let tripData = Array.isArray(response?.data) ? response.data : [];

      // Narrow fallback for APIs that treat toDate as end-exclusive.
      if (fromDate && toDate && tripData.length === 0) {
        const fallbackParams = {
          ...baseQueryParams,
          toDate: getNextDateString(toDate),
        };
        const fallbackResponse = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DRIVER_TRIP_DETAILS, fallbackParams);
        const fallbackTrips = Array.isArray(fallbackResponse?.data) ? fallbackResponse.data : [];

        if (fallbackTrips.length > 0) {
          response = fallbackResponse;
          tripData = fallbackTrips.filter((trip) => {
            const tripDate = normalizeDateString(trip?.tripDate);
            if (!tripDate) return true;
            return (!fromDate || tripDate >= fromDate) && (!toDate || tripDate <= toDate);
          });
        }
      }

      if (!Array.isArray(tripData)) {
        setError('Unexpected data format from server.');
        setTrips([]);
        setAllTrips([]);
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
        }));
        return;
      }

      const sortedTrips = [...tripData].sort((a, b) => new Date(b.tripDate) - new Date(a.tripDate));
      setAllTrips(sortedTrips);
      setTrips(sortedTrips);

      const vehicles = [...new Set(tripData.map(t => t.Cab?.carNumber).filter(Boolean))].sort();
      setAvailableVehicles(vehicles);

      if (response.summary) {
        setSummary({
          totalKm: response.summary.totalKm || 0,
          fuelUsed: response.summary.fuelUsed || 0,
          fuelCost: response.summary.fuelCost || 0,
          totalFare: response.summary.totalFare || 0,
          profit: response.summary.profit || 0,
          tollCost: response.summary.tollCost || 0, // Use backend tollCost
          permitCost: response.summary.permitCost || 0, // Use backend permitCost
        });
      } else {
        // Fallback to client-side calculation only if no backend summary
        const summaryData = sortedTrips.reduce(
          (acc, trip) => ({
            totalKm: acc.totalKm + ((parseFloat(trip.endKm) || 0) - (parseFloat(trip.startKm) || 0)),
            fuelUsed: acc.fuelUsed + (parseFloat(trip.fuelQuantity) || 0),
            fuelCost: acc.fuelCost + (parseFloat(trip.fuelCost) || 0),
            totalFare: acc.totalFare + (parseFloat(trip.tripFare) || 0),
            profit: acc.profit + (parseFloat(trip.profit) || 0),
            tollCost: acc.tollCost + (parseFloat(trip.tollCost) || 0), // Calculate tollCost
            permitCost: acc.permitCost + (parseFloat(trip.permitCost) || 0), // Calculate permitCost
          }),
          { totalKm: 0, fuelUsed: 0, fuelCost: 0, totalFare: 0, profit: 0, tollCost: 0, permitCost: 0 }
        );
        setSummary(summaryData);
      }

      setError('');
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalPages: response?.pagination?.totalPages || 1,
        totalItems: response?.pagination?.totalItems || tripData.length,
      }));
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to fetch trips. Please try again.');
      setTrips([]);
      setAllTrips([]);
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(pagination.currentPage, pagination.currentPage === 1);
  }, [fromDate, toDate, tripTypeFilter, vehicleNumberFilter, pagination.itemsPerPage, pagination.currentPage]);

  useEffect(() => {
    const params = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (tripTypeFilter) params.tripType = tripTypeFilter;
    if (vehicleNumberFilter) params.carNumber = vehicleNumberFilter;
    if (pagination.currentPage > 1) params.page = String(pagination.currentPage);
    setSearchParams(params, { replace: true });
  }, [fromDate, toDate, tripTypeFilter, vehicleNumberFilter, pagination.currentPage, setSearchParams]);

  // Sync temp dates when popup opens
  useEffect(() => {
    if (dateFilterOpen) {
      setTempFromDate(fromDate);
      setTempToDate(toDate);
    }
  }, [dateFilterOpen, fromDate, toDate]);

  const applyDateFilter = () => {
    if (tempFromDate && tempToDate) {
      setFromDate(tempFromDate);
      setToDate(tempToDate);
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      setDateFilterOpen(false);
    }
  };

  const clearDateFilter = () => {
    setTempFromDate('');
    setTempToDate('');
    setFromDate('');
    setToDate('');
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setSearchParams({}, { replace: true });
    setDateFilterOpen(false);
  };

  const clearAllFilters = () => {
    setTempFromDate('');
    setTempToDate('');
    setFromDate('');
    setToDate('');
    setTripTypeFilter('');
    setVehicleNumberFilter('');
    setTempVehicleFilter('');
    setDateFilterOpen(false);

    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setSearchParams({}, { replace: true });
  };

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
          variant={i === pagination.currentPage ? 'filled' : 'outlined'}
          className={`mx-1 ${ColorStyles.bgColor} ${i === pagination.currentPage ? 'text-white' : 'text-white'}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    return buttons;
  };

  const hasActiveFilters = Boolean(fromDate || toDate || tripTypeFilter || vehicleNumberFilter);
  const currentListPath = `/dashboard/tripDetails${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`;

  return (
    <div className="p-2"> 
    <h2 className="text-xl font-bold text-black">Trip Master Details</h2>
      <div className="mt-3 bg-white p-2 rounded-lg shadow-md">
        <div className='flex justify-between items-center'>
          <div>
            {hasActiveFilters && (
          <button
                type="button"
            onClick={clearAllFilters}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer"
          >
          Clear Filters
          </button>
            )}
        </div>
          <Link
            to={'/dashboard/tripDetails/add'}
            className="bg-primary-500 hover:bg-primary-500 text-white px-4 py-2 rounded-lg cursor-pointer inline-block"
          >
            + Add New Trip
          </Link>
        </div>
        <div className="flex justify-between items-center mb-4">
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Spinner className="h-12 w-12" />
          </div>
        ) : (
          <>
          <div className='overflow-x-scroll px-0 pt-0 pb-2'>
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-primary-600 text-white pb-2 font-semibold">
                  <th className="px-3 py-3 text-left text-sm whitespace-nowrap lg:sticky lg:left-0 lg:z-20 bg-primary-600 min-w-[140px] lg:border-r lg:border-primary-500">
                    Booking Date
                    <Popover open={dateFilterOpen} handler={setDateFilterOpen} placement="bottom-start">
                      <PopoverHandler>
                        <button
                          onClick={() => setDateFilterOpen(prev => !prev)}
                          className="ml-2"
                        >
                          <FaChevronDown
                            className={`text-white text-sm transition-transform duration-200 ${dateFilterOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </PopoverHandler>
                      <PopoverContent className="p-5 w-60 z-50 shadow-2xl border border-gray-200 rounded-xl">
                        <div className="space-y-4">
                          <div className="flex items-center justify-center mt-2">
                            <label className="text-sm font-semibold text-gray-700 mr-2">From </label>
                            <input
                              type="date"
                              value={tempFromDate}
                              onChange={(e) => setTempFromDate(e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                              onClick={(e) => e.currentTarget.showPicker?.()}
                            />
                          </div>
                          <div className="flex items-center justify-center mt-2">
                            <label className="text-sm mr-5 font-semibold text-gray-700">To </label>
                            <input
                              type="date"
                              value={tempToDate}
                              onChange={(e) => setTempToDate(e.target.value)}
                              onClick={(e) => e.currentTarget.showPicker?.()}
                               className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                             
                             
                            />
                          </div>
                          <div className="flex gap-3 pt-1">
                            <Button
                              size="sm"
                              onClick={applyDateFilter}
                              disabled={!tempFromDate || !tempToDate}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                              Apply
                            </Button>
                            <Button
                              size="sm"
                              variant="outlined"
                              onClick={clearDateFilter}
                              className="flex-1"
                            >
                              Clear
                            </Button>
                          </div>
                          
                        </div>
                      </PopoverContent>
                    </Popover>
                  </th>
                  <th className="px-3 py-3 text-left text-sm whitespace-nowrap lg:sticky lg:left-[140px] lg:z-20 bg-primary-600 min-w-[180px] lg:border-r lg:border-primary-500">Booking Id</th>
                  <th className="px-3 py-3 text-left text-sm whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span>Trip Type</span>
                      <Popover placement="bottom-start">
                        <PopoverHandler>
                          <button className="text-white">
                            <FaFilter className="text-sm" />
                          </button>
                        </PopoverHandler>
                        <PopoverContent className="p-2 z-50">
                          {['All', 'Internal', 'External'].map(type => (
                            <div key={type} className="flex items-center mb-2">
                              <Checkbox
                                color="blue"
                                checked={tripTypeFilter === '' ? type === 'All' : tripTypeFilter === type}
                                onChange={() => {
                                  setTripTypeFilter(type === 'All' ? '' : type);
                                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                                }}
                              />
                              <Typography className="ml-2 text-base text-black">{type}</Typography>
                            </div>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left text-sm whitespace-nowrap">Create Date</th>

                  {/* Vehicle Number Column with Perfect Filter Alignment */}
<th className="px-3 py-3 text-left text-sm whitespace-nowrap">
  <div className="flex items-center ">
    <span className="font-semibold">Vehicle Number</span>

    <Popover placement="bottom-start">
      <PopoverHandler>
        <button className="flex items-center justify-center w-6 h-6 rounded hover:bg-primary-600 transition-colors">
          <FaFilter className="text-sm text-white" />
        </button>
      </PopoverHandler>

      <PopoverContent className="w-66 p-4 z-50 shadow-2xl border border-gray-200">
        <div className="space-y-4">
          {/* Search Box */}
          <div className="flex gap-2">
            <input
              
              placeholder="Ex: TN01AG2277"
              value={tempVehicleFilter}
              onChange={(e) => setTempVehicleFilter(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setVehicleNumberFilter(tempVehicleFilter.trim());
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }
              }}
              className="uppercase text-black p-2"
            />
            <Button
              size="sm"
              onClick={() => {
                setVehicleNumberFilter(tempVehicleFilter.trim());
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="whitespace-nowrap"
            >
              Apply
            </Button>
            {vehicleNumberFilter && (
              <Button
                size="sm"
                variant="outlined"
                color="red"
                onClick={() => {
                  setVehicleNumberFilter('');
                  setTempVehicleFilter('');
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
              >
                X
              </Button>
            )}
          </div>

          {/* No vehicles message */}
          {availableVehicles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No vehicles found for the selected date range
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  </div>
</th>

                  <th className="px-3 py-3 text-left text-sm whitespace-nowrap">Driver Name</th>
                  <th className="px-3 py-3 text-left text-sm whitespace-nowrap">Start Point</th>
                  <th className="px-3 py-3 text-left text-sm whitespace-nowrap">End Point</th>
                  <th className="px-3 py-3 text-left text-sm whitespace-nowrap">KM</th>
                  <th className="px-3 py-3 text-left text-sm whitespace-nowrap">Fare</th>
                </tr>
              </thead>
              <tbody>
                {trips.length === 0 && !error ? (
                  <tr>
                    <td colSpan="10" className="px-3 py-4 text-center">No trips available</td>
                  </tr>
                ) : (
                  trips.map((trip, index) => (
                    <tr key={index}  className='border-b border-blue-gray-50'>
                      <td className="px-3 py-3 text-sm text-blue-gray-900 lg:sticky lg:left-0 lg:z-10 bg-white min-w-[140px]">
                        {trip?.tripDate ? moment(trip.tripDate).format("DD-MM-YYYY") : '-'}
                      </td>
                      <td
                        className="px-3 py-3 text-sm text-blue-500 font-semibold underline cursor-pointer lg:sticky lg:left-[140px] lg:z-10 bg-white min-w-[180px]"
                      >
                        <Link
                          to={`/dashboard/tripDetails/details/${trip.id}`}
                          state={{ fromPath: currentListPath }}
                        >
                        {trip.bookingId || trip.BookingId || trip.Booking?.bookingNumber || '-'}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-sm  text-blue-gray-900">{trip.tripType || '-'}</td>
                      <td className="px-3 py-3 text-sm  text-blue-gray-900">{trip.created_at || trip.createdAt ? moment(trip.created_at || trip.createdAt).format("DD-MM-YYYY") : '-'}</td>
                      <td className="px-3 py-3 text-sm  text-blue-gray-900">{trip.Cab?.carNumber || '-'}</td>
                      <td className="px-3 py-3 text-sm  text-blue-gray-900">{trip.Driver?.firstName || '-'}</td>
                      <td className="px-3 py-3 text-sm text-blue-gray-900">
                        <textarea
                          rows={4}
                          readOnly
                          value={trip.startAddress?.address || trip.startAddress || '-'}
                          className="w-56 min-w-[300px] resize-none rounded-md border border-blue-gray-100 bg-blue-gray-50/30 p-2 text-sm text-blue-gray-900"
                        />
                      </td>
                      <td className="px-3 py-3 text-sm text-blue-gray-900">
                        <textarea
                          rows={4}
                          readOnly
                          value={trip.endAddress?.address || trip.endAddress || '-'}
                          className="w-56 min-w-[300px] resize-none rounded-md border border-blue-gray-100 bg-blue-gray-50/30 p-2 text-sm text-blue-gray-900"
                        />
                      </td>
                      <td className="px-3 py-3 text-sm  text-blue-gray-900">
                        {(
                          Number.isFinite(Number(trip.totalKm))
                            ? Number(trip.totalKm)
                            : (parseFloat(trip.endKm) || 0) - (parseFloat(trip.startKm) || 0)
                        ).toFixed(1)}
                      </td>
                      <td className="px-3 py-3 text-sm  text-blue-gray-900">₹{parseFloat(trip.tripFare) || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
            {trips.length > 0 && (
              <div className="flex items-center justify-center mt-4">
                <Button
                  size="sm"
                  variant="text"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className="mx-1 text-gray-700"
                >
                  {'<'}
                </Button>
                {generatePageButtons()}
                <Button
                  size="sm"
                  variant="text"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className="mx-1 text-gray-700"
                >
                  {'>'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TripDetails;