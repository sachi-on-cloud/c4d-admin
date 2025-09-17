import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Alert,
  Spinner,
} from "@material-tailwind/react";
import { FaCalendarAlt, FaFilter } from 'react-icons/fa';
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';

// Debounce function to delay search execution
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export function CustomerFilterView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [customers, setCustomers] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
    search: '',
  });
  const [dateFilter, setDateFilter] = useState('All');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [isManualDateFilter, setIsManualDateFilter] = useState(false);

 

  const fetchCustomers = async (page = 1, searchQuery = '', startDate = '', endDate = '', showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const queryParams = {
        page,
        limit: pagination.itemsPerPage,
     
      };

      // Add date parameters if they exist
      if (startDate) {
        queryParams.startDate = startDate;
      }
      if (endDate) {
        queryParams.endDate = endDate;
      }

      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_ALL_CUSTOMERS_FILTER, queryParams);
      if (data?.success) {
        setCustomers(data?.data || []);
        setPagination({
          currentPage: page,
          totalPages: data?.pagination?.totalPages || 1,
          totalItems: data?.pagination?.totalItems || 0,
          itemsPerPage: data?.pagination?.itemsPerPage || 15,
         
        });
      } else {
        setAlert({
          message: 'Failed to fetch customers. Please try again.',
          color: 'red',
        });
        setTimeout(() => setAlert(null), 5000);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setAlert({
        message: 'An error occurred while fetching customers.',
        color: 'red',
      });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const getCustomers = useCallback(
    debounce((searchQuery) => {
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
        search: searchQuery,
      }));
      fetchCustomers(1, searchQuery, '', '', true);
    }, 500),
    [pagination.itemsPerPage]
  );

  // Handle date filter change
  const handleDateFilter = () => {
    setIsManualDateFilter(true);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));

    let startDate = '';
    let endDate = '';

    if (dateFilter === 'All') {
      startDate = '';
      endDate = '';
    } else if (dateFilter === 'Today') {
      const today = moment().format('YYYY-MM-DD');
      startDate = today;
      endDate = today;
    } else if (dateFilter === 'Tomorrow') {
      const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
      startDate = tomorrow;
      endDate = tomorrow;
    } else if (dateFilter === 'Last 7 days') {
      startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
      endDate = moment().format('YYYY-MM-DD');
    } else if (dateFilter === 'Custom date') {
      startDate = customDateFrom;
      endDate = customDateTo;
    }

    fetchCustomers(1, pagination.search, startDate, endDate, true);
  };

  useEffect(() => {
    if (isManualDateFilter) {
      setIsManualDateFilter(false);
      return;
    }

    fetchCustomers(pagination.currentPage, pagination.search, '', '', true);

    // Handle success alerts for customer added/updated
    if (location.state?.customerAdded || location.state?.customerUpdated) {
      const action = location.state.customerAdded ? 'added' : 'updated';
      setAlert({
        message: `${location.state.customerName} ${action} successfully!`,
        color: 'blue',
      });
      setTimeout(() => {
        setAlert(null);
      }, 5000);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, pagination.currentPage, pagination.search]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
      let startDate = '';
      let endDate = '';

      if (dateFilter === 'Today') {
        const today = moment().format('YYYY-MM-DD');
        startDate = today;
        endDate = today;
      } else if (dateFilter === 'Tomorrow') {
        const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
        startDate = tomorrow;
        endDate = tomorrow;
      } else if (dateFilter === 'Last 7 days') {
        startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
        endDate = moment().format('YYYY-MM-DD');
      } else if (dateFilter === 'Custom date') {
        startDate = customDateFrom;
        endDate = customDateTo;
      }

      fetchCustomers(page, pagination.search, startDate, endDate, true);
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
          className={`mx-1 ${ColorStyles.bgColor} text-white`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    return buttons;
  };

  const formatPhoneNumber = (phoneNumber) => {
    if (phoneNumber) {
      return phoneNumber.startsWith("+91") ? phoneNumber : `+91${phoneNumber}`;
    }
    return '';
  };

  return (
    <div className="mb-8 mt-14 flex flex-col gap-12">
      {alert && (
        <div className="mb-2">
          <Alert color={alert.color} className="py-3 px-6 rounded-xl">
            {alert.message}
          </Alert>
        </div>
      )}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-primary w-5 h-5" />
            <Typography variant="h6" className="text-gray-800 font-semibold">
              Date Filter
            </Typography>
          </div>

          {/* Date Filter Options */}
          <div className="flex flex-wrap gap-3">
            {['All', 'Today', 'Last 7 days', 'Custom date'].map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dateFilter"
                  value={option}
                  checked={dateFilter === option}
                  onChange={(e) => {
                    const selectedFilter = e.target.value;
                    setDateFilter(selectedFilter);

                    if (selectedFilter !== 'Custom date') {
                      setIsManualDateFilter(true);
                      setPagination((prev) => ({ ...prev, currentPage: 1 }));

                      let startDate = '';
                      let endDate = '';

                      if (selectedFilter === 'All') {
                        startDate = '';
                        endDate = '';
                      } else if (selectedFilter === 'Today') {
                        const today = moment().format('YYYY-MM-DD');
                        startDate = today;
                        endDate = today;
                      } 
                      else if (selectedFilter === 'Tomorrow') {
                        const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
                        startDate = tomorrow;
                        endDate = tomorrow;
                      } 
                      else if (selectedFilter === 'Last 7 days') {
                        startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
                        endDate = moment().format('YYYY-MM-DD');
                      }

                      fetchCustomers(1, pagination.search, startDate, endDate, true);
                    }
                  }}
                  className="text-primary"
                />
                <Typography variant="small" className="text-gray-700">
                  {option}
                </Typography>
              </label>
            ))}
          </div>

          {/* Custom Date Inputs */}
          {dateFilter === 'Custom date' && (
            <div className="flex items-center gap-3 ml-4">
              <div className="flex items-center gap-2">
                <Typography variant="small" className="text-gray-600">
                  From:
                </Typography>
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  max={customDateTo || undefined}
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
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  min={customDateFrom || undefined}
                />
              </div>
            </div>
          )}

          {/* Search Button */}
          <Button
            size="sm"
            className="bg-primary text-white hover:bg-primary-600 flex items-center gap-2"
            onClick={handleDateFilter}
            disabled={dateFilter === 'Custom date' && (!customDateFrom || !customDateTo)}
          >
            <FaFilter className="w-4 h-4" />
            Search
          </Button>
        </div>
      </div>
      <Card>
        {customers.length > 0 ? (
          <>
            <CardHeader variant="gradient" className={`mb-8 p-6 rounded-xl ${ColorStyles.bgColor}`}>
              <Typography variant="h6" color="white">
                Customers List
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Name", "Created Date", "Phone Number",'source'].map((el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase text-black"
                        >
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="py-3 px-5">
                        <div className="flex justify-center items-center">
                          <Spinner className="h-12 w-12" />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    customers.map(({ id, firstName, phoneNumber, created_at,source }, key) => {
                      const className = `py-3 px-5 ${
                        key === customers.length - 1 ? '' : 'border-b border-blue-gray-50'
                      }`;

                      return (
                        <tr key={id}>
                          <td className={className}>
                            <div className="flex items-center gap-4">
                              <div onClick={() => navigate(`/dashboard/customers/details/${id}`)}>
                                <Typography
                                  variant="small"
                                  color="blue"
                                  className="font-semibold underline cursor-pointer"
                                >
                                  {firstName} 
                                </Typography>
                              </div>
                            </div>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-black">
                              {created_at ? moment(created_at).format('DD-MM-YYYY') : 'N/A'}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-black">
                              {formatPhoneNumber(phoneNumber)}
                            </Typography>
                          </td>
                           <td className={className}>
                            <Typography className="text-xs font-semibold text-black">
                              {source || 'N/A'}
                            </Typography>
                          </td>
                        </tr>
                      );
                    })
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
                  {'<'}
                </Button>
                {generatePageButtons()}
                <Button
                  size="sm"
                  variant="text"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className="mx-1"
                >
                  {'>'}
                </Button>
              </div>
            </CardBody>
          </>
        ) : (
          <CardHeader variant="gradient" className={`mb-8 p-6 ${ColorStyles.bgColor}`}>
            <Typography variant="h6" color="white">
              No Customers
            </Typography>
          </CardHeader>
        )}
      </Card>
    </div>
  );
}

export default CustomerFilterView;