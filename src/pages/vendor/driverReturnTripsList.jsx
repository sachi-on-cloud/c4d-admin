import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Spinner,
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import { Link } from 'react-router-dom';
import moment from "moment";
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const DRIVER_RETURN_TRIP_VIEW_FILTERS_KEY = 'driverReturnTripViewFilters';

const isBrowser = () => typeof window !== 'undefined';

const getItemSafe = (key) => {
  if (!isBrowser()) return null;
  try {
    return sessionStorage.getItem(key);
  } catch (err) {
    console.error(`Error reading sessionStorage key "${key}":`, err);
    return null;
  }
};

const setItemSafe = (key, value) => {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(key, value);
  } catch (err) {
    console.error(`Error writing sessionStorage key "${key}":`, err);
  }
};

export function DriverReturnTripsList() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });

  const [pagination, setPagination] = useState(() => {
    const defaultPagination = {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 15,
    };
    const stored = getItemSafe(DRIVER_RETURN_TRIP_VIEW_FILTERS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...defaultPagination,
          currentPage: parsed.currentPage || 1,
        };
      } catch {
        return defaultPagination;
      }
    }
    return defaultPagination;
  });

  useEffect(() => {
    const data = {
      currentPage: pagination.currentPage,
    };

    setItemSafe(DRIVER_RETURN_TRIP_VIEW_FILTERS_KEY, JSON.stringify(data));
  }, [pagination.currentPage]);

  const fetchDrivers = async (page = 1, showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.DRIVER_RETURN_TRIP_DETAILS, {
        page,
        limit: pagination.itemsPerPage,
      });
      if (data?.success) {
        setAccounts(data?.data);
        setPagination({
          currentPage: page,
          totalPages: data?.pagination?.totalPages || 1,
          itemsPerPage: data?.pagination?.itemsPerPage || 15,
        });
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDrivers(pagination.currentPage, true);
  }, [pagination.currentPage]);
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
          className={`mx-1 ${ColorStyles.bgColor} text-white`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    return buttons;
  };
  function formatPhoneNumber(phoneNumber) {
    if (phoneNumber) {
      if (phoneNumber.startsWith("+91")) {
        return phoneNumber;
      }
      return `+91${phoneNumber}`;
    }
  }

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedAccounts = [...accounts].sort((a, b) => {
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
    setAccounts(sortedAccounts);
  };
  return (
    <div className="mb-8 py-4 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" className={`mb-8 p-6 flex-1 justify-between items-center rounded-xl
          ${ColorStyles.bgColor}`}>
          <div className='flex items-center justify-between w-full'>
            <Typography variant="h6" color="white">
              Return Trip Driver Details
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Created Date", "ID", "Driver Name", "Phone Number"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    {el === "Created Date" ? (
                      <div onClick={() => handleSort("created_at")} className="cursor-pointer flex items-center">    <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-black"
                      >
                        {el}
                      </Typography>
                        {sortConfig.key === "created_at" && (
                          sortConfig.direction === "ascending" ? (
                            <ChevronUpIcon className="w-4 h-4 ml-1 text-black" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4 ml-1 text-black" />
                          )
                        )}
                      </div>
                    ) : (
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-black"
                      >
                        {el}
                      </Typography>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-3 px-5">
                    <div className="flex justify-center items-center">
                      <Spinner className="h-12 w-12" />
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 px-5 text-center">
                    <Typography variant="small" className="font-semibold text-blue-gray-700">
                      No Records
                    </Typography>
                  </td>
                </tr>
              ) : (
                accounts.map(
                  ({ id, created_at, name, phoneNumber }, key) => {
                    const className = `py-3 px-5 ${key === accounts.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                      }`;

                    return (
                      <tr key={id}>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-900">
                            {moment(created_at).format("DD-MM-YYYY")}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-900">
                            {id}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="flex items-center gap-4">
                            <Link to={`/dashboard/vendors/account/details/${id}`}>
                              <Typography
                                variant="small"
                                color="blue"
                                className="font-semibold underline cursor-pointer"
                              >
                                {name}
                              </Typography>
                            </Link>
                          </div>
                        </td>
                      
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-900">
                            {formatPhoneNumber(phoneNumber)}
                          </Typography>
                        </td>
                       

                        

                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>

          {accounts.length > 0 && (
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
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default DriverReturnTripsList;
