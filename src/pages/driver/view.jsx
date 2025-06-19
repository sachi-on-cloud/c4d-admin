import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Alert,
  Popover,
  PopoverHandler,
  PopoverContent,
  Checkbox,
  Button,
  Spinner,
} from "@material-tailwind/react";
import { FaFilter } from 'react-icons/fa';
import moment from "moment";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';
import DriverSearch from '@/components/DriverSearch';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export function DriverView() {
  const [drivers, setDrivers] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [alert, setAlert] = useState(false);
  const [statusFilter, setStatusFilter] = useState(['All']);
  const [serviceTypeFilter, setServiceTypeFilter] = useState(['All']);
  const [documentTypeFilter, setDocumentTypeFilter] = useState(['All'])
  const [sourceFilter,setSourceFilter] = useState(['All'])
  const [subscriptionStatusFilter,setsubscriptionStatusFilter] = useState(['All'])
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    search: '',
        }); 

  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
  // const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const paramsPassed = location.state;

  const navigate = useNavigate();

  const fetchDrivers = async (page = 1, searchQuery = '', showLoader = true) => {
    try {
      //if (showLoader) setLoading(true);
    const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_ALL_DRIVERS, {
        page,
        limit: pagination.itemsPerPage,
        search: searchQuery.trim(),
    });
    if (data?.success) {
      setDrivers(data?.data);
      setAllDrivers(data?.data);
      setPagination({
          currentPage: page,
          totalPages: data?.pagination?.totalPages || 1,
          totalItems: data?.pagination?.totalItems || 0,
          itemsPerPage: data?.pagination?.itemsPerPage || 10,
          search: searchQuery.trim(),
        });
      } 
    } catch (err) {
      setDrivers([]);
      setAllDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const getDrivers = useCallback(
    debounce((searchQuery) => {
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
        search: searchQuery,
      }));
      fetchDrivers(1, searchQuery, false);
    }, 1000),
    [pagination.itemsPerPage]
  );

  function formatPhoneNumber(phoneNumber) {
    if(phoneNumber){if (phoneNumber.startsWith("+91")) {
      return phoneNumber;
    }
    return `+91${phoneNumber}`;}
  }
  const updateDrivers = async (driverId, status) => {
    let driverData = {
      driverId,
      status: status == "ACTIVE" ? "NOT_ACTIVE" : "ACTIVE"
    };
    const data = await ApiRequestUtils.update(API_ROUTES.UPDATE_DRIVERS, driverData);
    fetchDrivers('');
  };

  useEffect(() => {
    fetchDrivers(pagination.currentPage, pagination.search);
  }, [pagination.currentPage, pagination.itemsPerPage]);

  // useEffect(() => {
  //   getDrivers('');
  //   if (paramsPassed?.driverAdded || paramsPassed?.driverUpdated) {
  //     setAlert(true);
  //     setTimeout(() => {
  //       setAlert(false);
  //     }, 2000);
  //   }
  // }, [])

  // useEffect(() => {
  //   getDrivers(searchQuery.trim());
  // }, [searchQuery]);

  const handleFilterChange = (filterType, value) => {
    console.log('filterType, value :', filterType, value)
    if (filterType === 'availableStatus') {
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
    }
    else if (filterType === 'subscriptionStatus') {
      setsubscriptionStatusFilter(prev => {
        if (value === 'All') {
          return ['All'];
        }
        else {
          const newFilter = prev.includes(value)
            ? prev.filter(item => item !== value)
            : [...prev.filter(item => item !== 'All'), value];
          return newFilter.length === 0 ? ['All'] : newFilter;
        }
      })
    } 
    else if(filterType === "source")
      {
        setSourceFilter(prev => {
          if( value === 'All')
          {
            return ['All']
          }
          else{
            const newFilter = prev.includes(value)
            ? prev.filter(item => item !== value)
            : [...prev.filter(item => item !== 'All'), value];
          return newFilter.length === 0 ? ['All'] : newFilter;
          }
        })
      }
    
    else if (filterType === 'documentStatus') {
      setDocumentTypeFilter(prev => {
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
          <Typography variant="small" className={`text-[11px] font-bold uppercase mr-1 ${ColorStyles.PopoverHandlerText}`}>
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

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedDrivers = [...drivers].sort((a, b) => {
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

    setDrivers(sortedDrivers);
  };

  return (
    <div className="mb-8 flex flex-col gap-12">
      {alert && <div className='mb-2'>
        <Alert
          color='blue'
          className='py-3 px-6 rounded-xl'
        >
          {paramsPassed?.driverName} {paramsPassed?.driverAdded ? 'added' : 'updated'} successfully!
        </Alert>
      </div>}
      <DriverSearch onSearch={getDrivers} />
      <Card>
        {drivers.length > 0 ? (
          <>
            <CardHeader variant="gradient" className={`mb-8 p-6 flex-1 justify-between items-center ${
              ColorStyles.bgColor
            }`}>
              <Typography variant="h6" color="white">
                Drivers List
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('created_at')} className="border-b border-blue-gray-50 py-3 px-5 text-left cursor-pointer flex items-center">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-black">Created Date</Typography>
                      {sortConfig.key === 'created_at' && (sortConfig.direction === 'ascending' ? <ChevronUpIcon className="w-5 h-5 mx-1 justify-center items-center text-black" /> : <ChevronDownIcon className="w-5 h-5 ml-1" />)}
                    </th>
                    {/* <th onClick={() => handleSort('firstName')} className="border-b border-blue-gray-50 py-3 px-5 text-left cursor-pointer">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">Driver Name</Typography>
                      {sortConfig.key === 'firstName' && (sortConfig.direction === 'ascending' ? <ChevronUpIcon className="w-5 h-5 ml-1" /> : <ChevronDownIcon className="w-5 h-5 ml-1" />)}
                    </th> */}
                    {["Driver Name","Phone Number", "Local", "Outstation", "Source", "Service Type", "Available Status", "subscription Status", "KYC Status"].map((el) => (
                      <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      {el === "Available Status" ? (
                        <FilterPopover
                          title={el}
                          options={[
                            { value: "All", label: "All" },
                            { value: "ACTIVE", label: "Online" },
                            { value: "IN_ACTIVE", label: "Offline" }
                          ]}
                          selectedFilters={statusFilter}
                          onFilterChange={(value) => handleFilterChange("availableStatus", value)}
                        />
                      ) : el === "Source" ? (
                        <FilterPopover 
                        title = {el}
                        options={[
                          {value:"All" ,label:"All"},
                          {value: "Mobile App" , label:"mobile app"},
                          {value: "Walk In", label:"walk in"},
                          {value: "Call", label:"call"},
                          {value: "Website", label:"web site"},
                        ]}
                        selectedFilters={sourceFilter}
                        onFilterChange={(value) => handleFilterChange("source", value)}
                        />
                    ) : el === "subscription Status" ? (
                      <FilterPopover title={el}
                        options={[
                          { value: "All", label: "All" },
                          { value: "IN_ACTIVE", label: "Offline" },
                          { value: "ACTIVE", label: "Online" }
                        ]}
                        selectedFilters={subscriptionStatusFilter}
                        onFilterChange={(value) => handleFilterChange("subscriptionStatus", value)}
                      />
                    ): el === "KYC Status" ? (
                        <FilterPopover
                          title={el}
                          options={[
                            { value: "All", label: "All" },
                            { value: "PENDING", label: "Pending" },
                            { value: "PENDING UPLOAD", label: "Pending Upload" },
                            { value: "PENDING VERIFICATION", label: "Pending Verified" },
                            { value: "VERIFIED", label: "Verified" },
                            { value: "DECLINED", label: "Declined" }
                          ]}
                          selectedFilters={documentTypeFilter}
                          onFilterChange={(value) => handleFilterChange("documentStatus", value)}
                        />
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
                        <td colSpan={9} className="py-3 px-5">
                          <div className="flex justify-center items-center">
                            <Spinner className="h-12 w-12" />
                          </div>
                        </td>
                      </tr>
                    ) : (
                      drivers.filter(driver =>
                      (statusFilter.includes('All') || statusFilter.includes(driver?.status)) && 
                      (sourceFilter.includes('All') || sourceFilter.includes(driver.source)) &&
                      (subscriptionStatusFilter.includes('All') || subscriptionStatusFilter.includes(driver?.subscriptionStatus)) && 
                      (documentTypeFilter.includes('All') || documentTypeFilter.includes(driver?.documentStatus?.status) )
                    ).map(
                      ({ id, firstName, lastName, phoneNumber, email, status, localCount, outstationCount, curAddress, source, driverType, created_at, subscriptionStatus, documentStatus}, key) => {
                        const className = `py-3 px-5 ${key === drivers.length - 1
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
                              <div className="flex items-center gap-4">
                                <div onClick={() => navigate(`/dashboard/vendors/account/drivers/details/${id}`)}>
                                  <Typography
                                    variant="small"
                                    color="blue"
                                    className="font-semibold underline cursor-pointer"
                                  >
                                    {firstName}
                                  </Typography>
                                  {/* <Typography className="text-xs font-normal text-blue-gray-500">
                                  {email}
                                </Typography> */}
                                </div>
                              </div>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-semibold text-blue-gray-900">
                                {formatPhoneNumber(phoneNumber)}
                              </Typography>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-semibold text-blue-gray-900 ">
                                {localCount}
                              </Typography>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-semibold text-blue-gray-900">
                                {outstationCount}
                              </Typography>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-semibold text-blue-gray-900">
                                {source}
                              </Typography>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-semibold text-blue-gray-900">
                                {driverType}
                              </Typography>
                            </td>
                            <td className={className}>
                              <Chip
                                variant="ghost"
                                color={status == "ACTIVE" ? "green" : "black"}
                                value={status == "ACTIVE" ? "online" : "offline"}
                                className="py-0.5 px-2 text-[11px] font-medium w-fit"
                              />
                            </td>
                            <td className={className}>
                              <Chip
                                variant="ghost"
                                color={subscriptionStatus == "ACTIVE" ? "green" : subscriptionStatus == "BLOCKED" ? "red" : "black"}
                                value={subscriptionStatus}
                                className="py-0.5 px-2 text-[11px] font-medium w-fit"
                              />
                            </td>
                            <td className={className}>
                              <Chip
                                variant="ghost"
                                color={documentStatus?.status == "VERIFIED" ? "green" : documentStatus?.status == "DECLINED" ? "red" : "black"}
                                value={documentStatus?.status}
                                className="py-0.5 px-2 text-[11px] font-medium w-fit"
                              />
                            </td>
                            <div>
                            </div>
                          </tr>
                        );
                      }
                    ))}
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

          </>) : (
          <CardHeader variant="gradient" className={`mb-8 p-6  ${ColorStyles.bgColor}`}>
             {/* color="gray" */}
            <Typography variant="h6" color="white">
              No Drivers
            </Typography>
          </CardHeader>
        )}
      </Card>
    </div >
  );

}

export default DriverView;
