import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Spinner,
} from '@material-tailwind/react';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export function ParcelView({ type, ownerName, id }) {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
    search: '',
  });

  const fetchParcelAccounts = useCallback(
    async (page = 1, search = '', showLoader = false) => {
      if (showLoader) setLoading(true);
      try {
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_ALL_PARCEL, {
          page,
          limit: pagination.itemsPerPage,
          search: search.trim(),
        });
        if (data?.success) {
          setAccounts(data?.data || []);
          setPagination((prev) => ({
            ...prev,
            currentPage: page,
            totalPages: data?.pagination?.totalPages || 1,
            totalItems: data?.pagination?.totalItems || 0,
            itemsPerPage: data?.pagination?.itemsPerPage || 15,
            search: search.trim(),
          }));
        } else {
          console.error('API request failed:', data?.message);
        }
      } catch (error) {
        console.error('Error fetching parcel accounts:', error);
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [pagination.itemsPerPage]
  );

  const debouncedFetch = useCallback(
    debounce((search) => {
      fetchParcelAccounts(1, search, true);
    }, 500), // Reduced debounce delay for better UX
    [fetchParcelAccounts]
  );

  useEffect(() => {
    // Initial fetch and page change
    fetchParcelAccounts(pagination.currentPage, pagination.search, true);
  }, [pagination.currentPage, fetchParcelAccounts]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
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
          className={`mx-1 ${ColorStyles.bgColor} text-white`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    return buttons;
  };

  return (
    <div className="flex flex-col gap-12 mt-6">
      <div className="p-4  border border-gray-300 rounded-lg shadow-sm">
        <div className="relative flex-grow max-w-[500px]">
          <input
            type="text"
            className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search parcel"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              debouncedFetch(e.target.value);
            }}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : accounts.length > 0 ? (
          <>
            <CardHeader
              variant="gradient"
              className={`mb-8 p-6 flex justify-between items-center rounded-xl ${ColorStyles.bgColor}`}
            >
              <Typography variant="h6" color="white">
                Bike details List
              </Typography>
              {type === 'Parcel' && (
                <div>
                  <Button
                    className={`text-white ${ColorStyles.addButtonColor}`}
                    onClick={() =>
                      navigate('/dashboard/vendors/account/parcel/allVehicles/add', {
                        state: {
                          ownerName,
                          type: 'Parcel',
                          accountId: id,
                        },
                      })
                    }
                  >
                    Add new Bike
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Name","company","vehicleType","vehicleNumber"].map((el) => (
                      <th key={el} className="border-b border-gray-50 text-left py-3 px-5">
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
                  {accounts.map(
                    (
                      {
                        id,
                        name,
                        company,
                        vehicleType,
                        vehicleNumber
                      },
                      key
                    ) => {
                      const className = `py-3 px-5 ${
                        key === accounts.length - 1 ? '' : 'border-b border-blue-gray-50'
                      }`;
                      return (
                        <tr key={id}>
                          <td className={className}>
                            
                              <Link
                                to={`/dashboard/vendors/account/parcel/allVehicles/details/${id}`}
                                className="font-semibold underline cursor-pointer text-blue-600"
                              >
                                {name}
                              </Link>
                            
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-900">
                              {company}
                              </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-900">
                              {vehicleType}
                              </Typography>
                          </td>
                           <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-900">
                              {vehicleNumber}
                              </Typography>
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
          <CardBody>
            <Typography variant="h6" color="gray" className="text-center">
              No parcel accounts found
            </Typography>
          </CardBody>
        )}
      </Card>
    </div>
  );
}

export default ParcelView;