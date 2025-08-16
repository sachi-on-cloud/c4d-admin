import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import React, { useState, useEffect } from 'react';

const tabs = ['Daily', 'Weekly', 'Monthly'];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('Weekly');
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0]); // Adjusted to ISO format
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]); // Adjusted to ISO format
  const [vehicleFilter, setVehicleFilter] = useState('All Vehicles');
  const [driverFilter, setDriverFilter] = useState('All Drivers');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleExportCSV = () => {
    alert('Exporting CSV... (Implement CSV export logic here)');
  };

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          limit: 10,
          fromDate,
          toDate,
          cabId: vehicleFilter === 'All Vehicles' ? '' : vehicleFilter,
          driverId: driverFilter === 'All Drivers' ? '' : driverFilter,
        };
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_TRIP_REPORTS, params);

        // Transform API data to match component expectations
        const transformedTrips = data.data.map(trip => ({
          date: trip.tripDate,
          vehicle: trip.Cab?.name || 'Unknown',
          driver: trip.Driver?.firstName || 'Unknown',
          route: `${trip.startAddress.address} - ${trip.endAddress.address}`,
          km: parseFloat(trip.totalKm),
          fuel: parseFloat(trip.fuelQuantity),
          cost: parseFloat(trip.fuelCost),
          fare: parseFloat(trip.tripFare),
          profit: parseFloat(trip.profit),
        }));

        setTrips(transformedTrips);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        setError('Failed to fetch trips: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [fromDate, toDate, vehicleFilter, driverFilter, activeTab, currentPage]);

  // Calculate summary from trips
  const summary = {
    totalTrips: trips.length,
    totalKm: trips.reduce((sum, trip) => sum + (trip.km || 0), 0),
    fuelUsed: trips.reduce((sum, trip) => sum + (trip.fuel || 0), 0),
    fuelCost: trips.reduce((sum, trip) => sum + (trip.cost || 0), 0),
    totalFare: trips.reduce((sum, trip) => sum + (trip.fare || 0), 0),
    profitLoss: trips.reduce((sum, trip) => sum + (trip.profit || 0), 0),
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow">
        <div className="border-b border-gray-200 mb-6">
          <div className="px-6 py-4">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === 'Daily') {
                      setFromDate(new Date().toISOString().split('T')[0]); // Today's date
                      setToDate(new Date().toISOString().split('T')[0]); // Today's date
                    } else if (tab === 'Weekly') {
                      setFromDate(new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0]); // 7 days ago
                      setToDate(new Date().toISOString().split('T')[0]);
                    } else if (tab === 'Monthly') {
                      setFromDate(new Date(new Date().setDate(1)).toISOString().split('T')[0]); // First day of the month
                      setToDate(new Date(new Date().setMonth(new Date().getMonth() + 1, 0)).toISOString().split('T')[0]); // Last day of the month
                    }
                    setCurrentPage(1); // Reset to first page when changing tabs
                  }}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vehicle</label>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            >
              <option>All Vehicles</option>
              <option value="86">Vehicle 1</option>
              <option value="83">Vehicle 2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Driver</label>
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            >
              <option>All Drivers</option>
              <option value="99">Driver 1</option>
              <option value="71">Driver 2</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="p-2 border border-gray-200 text-center">Trips: {summary.totalTrips}</div>
          <div className="p-2 border border-gray-200 text-center">Total KM: {summary.totalKm.toFixed(1)}</div>
          <div className="p-2 border border-gray-200 text-center">Fuel Used: {summary.fuelUsed.toFixed(1)}</div>
          <div className="p-2 border border-gray-200 text-center">Fuel Cost: ₹{summary.fuelCost.toFixed(2)}</div>
          <div className="p-2 border border-gray-200 text-center">Total Fare: ₹{summary.totalFare.toFixed(2)}</div>
          <div className="p-2 border border-gray-200 text-center">Profit/Loss: ₹{summary.profitLoss.toFixed(2)}</div>
        </div>
        <div className="weekly-report">
          <h3 className="text-lg font-semibold mb-4">{activeTab} Report</h3>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-2">Date</th>
                    <th className="border border-gray-200 p-2">Vehicle</th>
                    <th className="border border-gray-200 p-2">Driver</th>
                    <th className="border border-gray-200 p-2">Route</th>
                    <th className="border border-gray-200 p-2">KM</th>
                    <th className="border border-gray-200 p-2">Fuel</th>
                    <th className="border border-gray-200 p-2">Cost</th>
                    <th className="border border-gray-200 p-2">Fare</th>
                    <th className="border border-gray-200 p-2">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="border border-gray-200 p-2 text-center text-gray-500">
                        No trips found for the selected criteria
                      </td>
                    </tr>
                  ) : (
                    trips.map((trip, index) => (
                      <tr key={index}>
                        <td className="border border-gray-200 p-2">{trip.date || '-'}</td>
                        <td className="border border-gray-200 p-2">{trip.vehicle || '-'}</td>
                        <td className="border border-gray-200 p-2">{trip.driver || '-'}</td>
                        <td className="border border-gray-200 p-2">{trip.route || '-'}</td>
                        <td className="border border-gray-200 p-2">{trip.km.toFixed(1)}</td>
                        <td className="border border-gray-200 p-2">{trip.fuel.toFixed(1)}</td>
                        <td className="border border-gray-200 p-2">₹{trip.cost.toFixed(2)}</td>
                        <td className="border border-gray-200 p-2">₹{trip.fare.toFixed(2)}</td>
                        <td className="border border-gray-200 p-2">₹{trip.profit.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
        <button
          onClick={handleExportCSV}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          Export to CSV
        </button>
      </div>
    </div>
  );
};

export default Reports;