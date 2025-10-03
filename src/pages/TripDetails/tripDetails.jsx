import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { Button, Spinner, Popover, PopoverHandler, PopoverContent, Checkbox, Typography } from '@material-tailwind/react';
import { FaFilter } from 'react-icons/fa';

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
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [tripTypeFilter, setTripTypeFilter] = useState(['All']); // Filter state for tripType

  const fetchTrips = async (page = 1, showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DRIVER_TRIP_DETAILS, {
        page: page,
        limit: pagination.itemsPerPage,
      });
      const tripData = response?.data;

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

      const sortedTrips = [...tripData].sort((a, b) => {
        const dateA = new Date(a.tripDate);
        const dateB = new Date(b.tripDate);
        return dateB - dateA;
      });
      setAllTrips(sortedTrips); // Store unfiltered trips
      setTrips(sortedTrips); // Initially set filtered trips to all trips

      // Use backend summary for overall totals (doesn't change on pagination)
      if (response.summary) {
        setSummary(response.summary);
      } else {
        // Fallback to client-side calculation only if no backend summary
        const summaryData = sortedTrips.reduce(
          (acc, trip) => ({
            totalKm: acc.totalKm + ((parseFloat(trip.endKm) || 0) - (parseFloat(trip.startKm) || 0)),
            fuelUsed: acc.fuelUsed + (parseFloat(trip.fuelQuantity) || 0),
            fuelCost: acc.fuelCost + (parseFloat(trip.fuelCost) || 0),
            totalFare: acc.totalFare + (parseFloat(trip.tripFare) || 0),
            profit: acc.profit + (parseFloat(trip.profit) || 0),
          }),
          { totalKm: 0, fuelUsed: 0, fuelCost: 0, totalFare: 0, profit: 0 }
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
    fetchTrips(pagination.currentPage, true);
  }, [location, pagination.currentPage, pagination.itemsPerPage]);

  // Apply frontend filtering based on tripTypeFilter (client-side, doesn't affect backend summary)
  useEffect(() => {
    if (tripTypeFilter.includes('All')) {
      setTrips(allTrips);
    } else {
      const filteredTrips = allTrips.filter((trip) =>
        tripTypeFilter.includes(trip.tripType || 'N/A')
      );
      setTrips(filteredTrips);
    }
    // Do not update summary here - keep backend overall summary unchanged
  }, [tripTypeFilter, allTrips]);

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

  const handleTripTypeFilterChange = (value) => {
  if (value === 'All') {
    setTripTypeFilter(['All']);
  } else {
    setTripTypeFilter([value]);
  }
};

  const FilterPopover = ({ title, options, selectedFilters, onFilterChange }) => (
  <Popover placement="bottom-start">
    <PopoverHandler>
      <div className="flex items-center cursor-pointer">
        <Typography
          variant="small"
          className="font-bold text-[16px] text-grey mr-1"
        >
          {title}
        </Typography>
        <FaFilter className="text-black text-xs" />
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

  return (
    <div className="p-5 font-sans">
      <h2 className="text-2xl text-primary-400">Trip Master</h2>
      <div className="flex">
        <div className="mt-5 flex flex-wrap gap-5">
          <div className="bg-white p-4 rounded-lg shadow-md w-48">
            <div>Today’s KM</div>
            <div className="text-2xl font-bold">{summary.totalKm.toFixed(1)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md w-48">
            <div>Fuel Cost</div>
            <div className="text-2xl font-bold text-red-500">₹{summary.fuelCost.toFixed(2)}</div>
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
      </div>

      <div className="mt-5 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg">Recent Trips</h3>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Spinner className="h-12 w-12" />
          </div>
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Booking Id</th>
                  <th className="p-2 text-left">
                    <FilterPopover 
                      title="Trip Type"
                      options={[
                        { value: 'All', label: 'All' },
                        { value: 'Internal', label: 'Internal' },
                        { value: 'External', label: 'External' },
                      ]}
                      selectedFilters={tripTypeFilter}
                      onFilterChange={handleTripTypeFilterChange}
                    />
                  </th>
                  <th className="p-2 text-left">Vehicle Number</th>
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
                      <td className="p-2 whitespace-nowrap">{trip.tripDate || 'N/A'}</td>
                      <td
                        onClick={() => navigate(`/dashboard/tripDetails/details/${trip.id}`)}
                        className="p-2 text-blue-500 font-semibold underline cursor-pointer"
                      >
                        {trip.BookingId || 'N/A'}
                      </td>
                      <td className="p-2">{trip.tripType || 'N/A'}</td>
                      <td className="p-2">{trip.Cab?.carNumber || 'N/A'}</td>
                      <td className="p-2">{trip.Driver?.firstName || 'N/A'}</td>
                      <td className="p-2">{trip.startAddress?.address || trip.startAddress || 'N/A'}</td>
                      <td className="p-2">{trip.endAddress?.address || trip.endAddress || 'N/A'}</td>
                      <td className="p-2">{((parseFloat(trip.endKm) || 0) - (parseFloat(trip.startKm) || 0)).toFixed(1) || 'N/A'}</td>
                      <td className="p-2">₹{parseFloat(trip.tripFare) || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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