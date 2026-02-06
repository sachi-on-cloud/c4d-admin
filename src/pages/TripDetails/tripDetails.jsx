import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { Button, Spinner, Popover, PopoverHandler, PopoverContent, Checkbox, Typography, Input } from '@material-tailwind/react';
import { FaFilter, FaChevronDown } from 'react-icons/fa';

const TripDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [tripTypeFilter, setTripTypeFilter] = useState(''); 

 
  const [vehicleNumberFilter, setVehicleNumberFilter] = useState('');
  const [tempVehicleFilter, setTempVehicleFilter] = useState('');

  
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [tempFromDate, setTempFromDate] = useState('');
  const [tempToDate, setTempToDate] = useState('');

  const [availableVehicles, setAvailableVehicles] = useState([]);

  const fetchTrips = async (page = 1, showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const queryParams = {
        page: page,
        limit: pagination.itemsPerPage,
      };
      if (fromDate) queryParams.fromDate = fromDate;
      if (toDate) queryParams.toDate = toDate;
      if (tripTypeFilter && tripTypeFilter !== 'All') queryParams.tripType = tripTypeFilter;
      if (vehicleNumberFilter) queryParams.carNumber = vehicleNumberFilter;

      const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DRIVER_TRIP_DETAILS, queryParams);
      const tripData = response?.data || [];

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
    fetchTrips(1, true);
  }, [fromDate, toDate, tripTypeFilter, vehicleNumberFilter, pagination.itemsPerPage]);

  useEffect(() => {
    if (pagination.currentPage > 1) {
      fetchTrips(pagination.currentPage, false);
    }
  }, [pagination.currentPage]);

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
      setDateFilterOpen(false);
    }
  };

  const clearDateFilter = () => {
    setTempFromDate('');
    setTempToDate('');
    setFromDate('');
    setToDate('');
    setDateFilterOpen(false);
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

  return (
    <div className="p-5 font-sans">
      <h2 className="text-2xl font-bold text-black">Trip Master Details</h2>
      {/* <div className="flex">
        <div className="mt-5 flex flex-wrap gap-5">
          <div className="bg-white p-4 rounded-lg shadow-md w-48">
            <div>Today’s KM</div>
            <div className="text-2xl font-bold">{summary.totalKm.toFixed(1)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md w-48">
            <div>Fuel Cost</div>
            <div className="text-2xl font-bold ">₹{summary.fuelCost.toFixed(2)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md w-48">
            <div>Permit Cost</div>
            <div className="text-2xl font-bold">₹{summary.permitCost.toFixed(2)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md w-48">
            <div>Toll Cost</div>
            <div className="text-2xl font-bold">₹{summary.tollCost.toFixed(2)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md w-48">
            <div>Total Fare</div>
            <div className="text-2xl font-bold">₹{summary.totalFare.toFixed(2)}</div>
          </div>
        </div>
        <div className="mt-5 ml-auto">
          <button
            onClick={() => navigate('/dashboard/tripDetails/add')}
            className="bg-primary-400 hover:bg-primary-500 text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            + Add New Trip
          </button>
        </div>
      </div> */}

      <div className="mt-5 bg-white p-4 rounded-lg shadow-md">
         <div className="flex justify-between items-center mb-4">
          <div>
        <h3 className="text-lg">Recent Trips</h3></div>
         <div>
          <button
            onClick={() => navigate('/dashboard/tripDetails/add')}
            className="bg-primary-400 hover:bg-primary-500 text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            + Add New Trip
          </button>
        </div>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Spinner className="h-12 w-12" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                 
                  <th className="p-2 text-left">
                    Date
                    <Popover open={dateFilterOpen} handler={setDateFilterOpen} placement="bottom-start">
                      <PopoverHandler>
                        <button 
                          onClick={() => setDateFilterOpen(prev => !prev)}
                          className="ml-2"
                        >
                          <FaChevronDown 
                            className={`text-black text-xs transition-transform duration-200 ${dateFilterOpen ? 'rotate-180' : ''}`} 
                          />
                        </button>
                      </PopoverHandler>
                      <PopoverContent className="p-5 w-60 z-50 shadow-2xl border border-gray-200 rounded-xl">
                        <div className="space-y-4">
                          <div className="flex items-center justify-center mt-2">
                            <label className="text-sm font-medium text-gray-700 mr-2">From </label>
                             <input
                              type="date"
                              value={tempFromDate}
                              onChange={(e) => setTempFromDate(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                              onClick={(e) => e.currentTarget.showPicker?.()}
                            />
                          </div>
                          <div className="flex items-center justify-center mt-2">
                            <label className="text-sm mr-5 font-medium text-gray-700">To </label>
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
                  <th className="p-2 text-left">Booking Id</th>
                 <th className="p-2 text-left">
                    <div className="flex items-center gap-1">
                      <span>Trip Type</span>
                      <Popover placement="bottom-start">
                        <PopoverHandler>
                          <button className="text-black">
                            <FaFilter className="text-xs" />
                          </button>
                        </PopoverHandler>
                        <PopoverContent className="p-2 z-50">
                          {['All', 'Internal', 'External'].map(type => (
                            <div key={type} className="flex items-center mb-2">
                              <Checkbox
                                color="blue"
                                checked={tripTypeFilter === '' ? type === 'All' : tripTypeFilter === type}
                                onChange={() => setTripTypeFilter(type === 'All' ? '' : type)}
                              />
                              <Typography className="ml-2 text-base text-black">{type}</Typography>
                            </div>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </th>

                  {/* Vehicle Number Column with Perfect Filter Alignment */}
<th className="p-2 text-left">
  <div className="flex items-center ">
    <span className="font-medium">Vehicle Number</span>
    
    <Popover placement="bottom-start">
      <PopoverHandler>
        <button className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 transition-colors">
          <FaFilter className="text-xs text-black" />
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
                }
              }}
              className="uppercase text-black p-2"
            />
            <Button
              size="sm"
              onClick={() => setVehicleNumberFilter(tempVehicleFilter.trim())}
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

                  <th className="p-2 text-left">Driver Name</th>
                  <th className="p-2 text-left">Start Point</th>
                  <th className="p-2 text-left">End Point</th>
                  <th className="p-2 text-left">KM</th>
                  <th className="p-2 text-left">Fare</th>
                </tr>
              </thead>
              <tbody>
                {trips.length === 0 && !error ? (
                  <tr>
                    <td colSpan="9" className="p-2 text-center">No trips available</td>
                  </tr>
                ) : (
                  trips.map((trip, index) => (
                    <tr key={index}>
                      <td className="p-2 whitespace-nowrap">{trip.tripDate || '-'}</td>
                      <td
                        onClick={() => navigate(`/dashboard/tripDetails/details/${trip.id}`)}
                        className="p-2 text-blue-500 font-semibold underline cursor-pointer"
                      >
                        {trip.BookingId || '-'}
                      </td>
                      <td className="p-2">{trip.tripType || '-'}</td>
                      <td className="p-2">{trip.Cab?.carNumber || '-'}</td>
                      <td className="p-2">{trip.Driver?.firstName || '-'}</td>
                      <td className="p-2">{trip.startAddress?.address || trip.startAddress || '-'}</td>
                      <td className="p-2">{trip.endAddress?.address || trip.endAddress || '-'}</td>
                      <td className="p-2">{((parseFloat(trip.endKm) || 0) - (parseFloat(trip.startKm) || 0)).toFixed(1) || '-'}</td>
                      <td className="p-2">₹{parseFloat(trip.tripFare) || '-'}</td>
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