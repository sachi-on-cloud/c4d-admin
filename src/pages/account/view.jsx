import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Checkbox,
  Alert,
  Chip,
  Popover,
  PopoverHandler,
  PopoverContent,
  Spinner,
} from "@material-tailwind/react";
import AccountSearch from "@/components/AccountSearch";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';
import moment from "moment";
import { FaFilter } from 'react-icons/fa';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export function AccountView() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [alert, setAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });  
  const [statusFilter, setStatusFilter] = useState(['All']); 
  const [serviceTypeFilter,setServiceTypeFilter] = useState(['All']) 
  const [documentTypeFilter, setDocumentTypeFilter] = useState(['All']) 
  const [availableStatusFilter,setavailableStatusFilter] = useState(['All']) 
  const [sourceFilter,setSourceFilter] = useState(['All'])

  const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        search: '',
      }); 

  const fetchAccounts = async (page = 1, searchQuery = '', showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_ALL_ACCOUNTS, {
        page,
        limit: pagination.itemsPerPage,
        search: searchQuery.trim(),
      });
      if (data?.success) {
        setAccounts(data?.data);
        setAllAccounts(data?.data);
        setPagination({
          currentPage: page,
          totalPages: data?.pagination?.totalPages || 1,
          totalItems: data?.pagination?.totalItems || 0,
          itemsPerPage: data?.pagination?.itemsPerPage || 10,
          search: searchQuery.trim(),
        });
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts(pagination.currentPage, pagination.search, true);

    if (location.state?.accountAdded || location.state?.accountUpdated) {
      const action = location.state.accountAdded ? 'added' : 'updated';
      const accountName = location.state.accountName || 'Account';
      setAlert({
        message: `${accountName} ${action} successfully!`
      });
      setTimeout(() => {
        setAlert(null);
      }, 5000);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate,pagination.currentPage, pagination.search]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
      fetchAccounts(page, pagination.search, true);
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

  const getAccounts = useCallback(
    debounce((searchQuery) => {
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
        search: searchQuery,
      }));
      fetchAccounts(1, searchQuery, false);
    }, 1000),
    [pagination.itemsPerPage]
  );
  function formatPhoneNumber(phoneNumber) {
    if(phoneNumber){if (phoneNumber.startsWith("+91")) {
      return phoneNumber;
    }
    return `+91${phoneNumber}`;}
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
  
  const handleFilterChange = (filterType, value) => {
    // console.log('filterType, value :', filterType, value)
    if (filterType === 'ownerStatus')
      setStatusFilter(prev => {
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

    else if (filterType === 'availableStatus') {
      setavailableStatusFilter(prev => {
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

    else if (filterType === 'type') {
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
  };
  const typeLabels = {
  Individual: "Owner Cum Driver",
  Company: "Travels"
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
  return (
    <div className="mb-8 flex flex-col gap-12">
      {alert && (
        <div className='mb-2'>
          <Alert
            color='blue'
            className='py-3 px-6 rounded-xl'
          >
            {alert.message}
          </Alert>
        </div>)}
      <AccountSearch onSearch={getAccounts}/>
      <Card>
        {accounts.length > 0 ? (
          <>
            <CardHeader variant="gradient"  className={`mb-8 p-6 flex-1 justify-between items-center rounded-xl 
              ${ColorStyles.bgColor}`}>
              <Typography variant="h6" color="white">
                Accounts List
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Created Date","Account Name","Email","Phone Number","Service Type","Source","Available Status","Owner Status","KYC Status"].map((el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                      >
                        {el === "KYC Status" ? (
                          <FilterPopover
                            title={el}
                            options={[
                              { value: "All", label: "All" },
                              { value: "PENDING UPLOAD", label: "Pending Upload" },
                              { value: "VERIFIED", label: "Verified" },
                              { value: "PENDING VERIFICATION", label: "Pending Verified" },
                              { value: "DECLINED", label: "Declined" },

                            ]}
                            selectedFilters={documentTypeFilter}
                            onFilterChange={(value) => handleFilterChange("documentStatus", value)}
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
                      ): el === "Owner Status" ? (
                          <FilterPopover
                            title={el}
                            options={[
                              { value: "All", label: "All" },
                              { value: "InActive", label: "InActive" },
                              { value: "Active", label: "Active" }
                            ]}
                            selectedFilters={statusFilter}
                            onFilterChange={(value) => handleFilterChange("ownerStatus", value)}
                          />
                        ) : el === "Available Status" ? (
                          <FilterPopover title={el}
                            options={[
                              { value: "All", label: "All" },
                              { value: "Offline", label: "Offline" },
                              { value: "Online", label: "Online" }
                            ]}
                            selectedFilters={availableStatusFilter}
                            onFilterChange={(value) => handleFilterChange("availableStatus", value)}
                          />
                        ) : el === "Service Type" ? (
                          <FilterPopover
                            title={el}
                            options={[
                              { value: "All", label: "All" },
                              { value: "Company", label: "Travels" },
                              { value: "Individual", label: "Owner Cum Driver" },
                            ]}
                            selectedFilters={serviceTypeFilter}
                            onFilterChange={(value) => handleFilterChange("type", value)}
                          />
                        ) :  el === "Created Date" ? (
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
                        {/* {sortConfig.key === "name" && (
                          sortConfig.direction === "ascending" ? (
                            <ChevronUpIcon className="w-4 h-4 ml-1 text-black" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4 ml-1 text-black" />
                          )
                        )} */}
                      </div>
                      ):(
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
                    accounts.filter(account =>
                    (statusFilter.includes('All') || statusFilter.includes(account.ownerStatus)) && 
                    (sourceFilter.includes('All') || sourceFilter.includes(account.source)) &&
                    (serviceTypeFilter.includes('All') || serviceTypeFilter.includes(account.type)) &&
                    (availableStatusFilter.includes('All') || availableStatusFilter.includes(account.availableStatus)) &&
                    (documentTypeFilter.includes('All') || documentTypeFilter.includes(account.documentStatus?.status))
                  ).map(
                    ({id, created_at, name, email,phoneNumber, serviceType, source, availableStatus, type, ownerStatus, documentStatus}, key) => {
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
                            <div className="flex items-center gap-4">
                              <div onClick={() => navigate(`/dashboard/vendors/account/details/${id}`)}>
                                <Typography
                                  variant="small"
                                  color="blue"
                                  className="font-semibold underline cursor-pointer"
                                >
                                  {name}
                                </Typography>
                              </div>
                            </div>
                          </td>
                           <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-900">
                              {email}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-900">
                              {formatPhoneNumber(phoneNumber)}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-900">
                              {typeLabels[type] || type}
                            </Typography>
                          </td>
                          {/* <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-900">
                              {type}
                            </Typography>
                          </td> */}
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-900">
                              {source}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Chip
                              variant="ghost"
                              color={availableStatus == "ACTIVE" ? "green" : "black"}
                              value={availableStatus == "ACTIVE" ? "Online" : "Offline"}
                              className="py-0.5 px-2 text-[11px] font-medium w-fit"
                            />
                          </td>
                          <td className={className}>
                            <Chip
                              variant="ghost"
                              color={ownerStatus == "ACTIVE" ? "green" : "black"}
                              value={ownerStatus == "ACTIVE" ? "Active" : "InActive"}
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
                          {/* <td className={className}>
                            <Button
                              as='a'
                              onClick={() => navigate(`/dashboard/vendors/account/edit/${id}`)}
                              className="text-xs font-semibold text-white"
                            >
                              Edit
                            </Button>
                          </td> */}
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
          </>) : (
          <CardHeader variant="gradient"  className={`mb-8 p-6 ${ColorStyles.bgColor}`}>
            <Typography variant="h6" color="white">
              No Accounts
            </Typography>
          </CardHeader>
        )}
      </Card>
    </div>
  );
}

export default AccountView;
