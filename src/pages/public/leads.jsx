import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Spinner,
  Popover,
  PopoverHandler,
  PopoverContent,
  Checkbox,
  Input,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { FaFilter } from "react-icons/fa";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import moment from 'moment';

export function LeadsView() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState(['All']);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    search: '',
  });

  const getSelectedSource = () => {
    if (!sourceFilter || sourceFilter.length === 0 || sourceFilter.includes('All')) {
      return '';
    }
    return sourceFilter[0];
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads(1, searchQuery.trim(), getSelectedSource());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, sourceFilter]);


  const fetchLeads = async (page = 1, searchQuery = '', source = '') => {
    setLoading(true);
    try {
      const data = await ApiRequestUtils.getWithQueryParam(
        API_ROUTES.GET_WEBSITE_LEADS,
        {
          page,
          limit: pagination.itemsPerPage,
          phoneNumber: searchQuery,
          source: source,
        }
      );

      if (data?.success) {
        setLeads(data?.data || []);
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          totalPages: searchQuery ? 1 : data?.pagination?.totalPages || 1,
          totalItems: data?.pagination?.totalItems || 0,
          search: searchQuery,
        }));
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
      fetchLeads(page, searchQuery.trim(), getSelectedSource());
    }
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'source') {
      setSourceFilter(prev => {
        if (value === 'All') return ['All'];
        const newFilter = prev.includes(value)
          ? prev.filter(item => item !== value)
          : [...prev.filter(item => item !== 'All'), value];
        return newFilter.length === 0 ? ['All'] : newFilter;
      });
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
    if (!phoneNumber) return '';
    return phoneNumber.startsWith("+91") ? phoneNumber : `+91${phoneNumber}`;
  };

  const FilterPopover = ({ title, options, selectedFilters, onFilterChange }) => (
    <Popover placement="bottom-start">
      <PopoverHandler>
        <div className="flex items-center gap-1 cursor-pointer select-none">
          <Typography variant="small" className={`text-[11px] font-bold uppercase ${ColorStyles.PopoverHandlerText}`}>
            {title}
          </Typography>
          <FaFilter className="text-xs" />
        </div>
      </PopoverHandler>
      <PopoverContent className="z-50 w-56 p-3 bg-white shadow-lg">
        {options.map((option) => (
          <div key={option.value} className="flex items-center mb-2">
            <Checkbox
              color="blue"
              checked={selectedFilters.includes(option.value)}
              onChange={() => onFilterChange(option.value)}
            />
            <Typography className="ml-2 text-sm">
              {option.label}
            </Typography>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="mb-8 flex flex-col gap-8">
      <Card className="p-2 bg-gray-50">
        <div className="max-w-md rounded-lg p-2 flex items-center gap-2">
          <Input
            type="text"
            label="Search leads by phone number"
            className="bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </Card>

      <Card>
        {leads.length > 0 || loading ? (
          <>
            <CardHeader variant="gradient" className={`p-6 ${ColorStyles.bgColor}`}>
              <div className="flex items-center justify-between">
                <Typography variant="h6" color="white">
                  Leads List
                </Typography>
                <FilterPopover
                  title="Source"
                  options={[
                    { value: "All", label: "All Sources" },
                    { value: "Mobile App", label: "Mobile App" },
                    { value: "Walk In", label: "Walk In" },
                    { value: "Call", label: "Call" },
                    { value: "Website", label: "Web Site" },
                  ]}
                  selectedFilters={sourceFilter}
                  onFilterChange={(value) => handleFilterChange("source", value)}
                />
              </div>
            </CardHeader>

            <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
              <table className="w-full min-w-[300px] table-auto">
                <thead>
                  <tr>
                    <th className="border-b border-blue-gray-50 py-3 px-6 text-left">
                      <Typography variant="small" className="font-bold uppercase text-[11px]">
                        Create Date
                      </Typography>
                    </th>
                    <th className="border-b border-blue-gray-50 py-3 px-6 text-left">
                      <Typography variant="small" className="font-bold uppercase text-[11px]">
                        Phone Number
                      </Typography>
                    </th>
                    <th className="border-b border-blue-gray-50 py-3 px-6 text-left">
                      <Typography variant="small" className="font-bold uppercase text-[11px]">
                        source
                      </Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      {/* <td className="py-10 text-center">
                        <div className="flex justify-center">
                          <Spinner className="h-12 w-12" />
                        </div>
                      </td> */}
                    </tr>
                  ) : (
                    leads.map(({ id, source, phoneNumber, created_at }) => (
                      <tr key={id} className="hover:bg-gray-50">
                        <td className="py-3 px-6">
                          <Typography className="text-sm font-medium">
                            {moment(created_at).format('DD MMM YYYY, hh:mm A')}
                          </Typography>
                        </td>
                        <td className="py-3 px-6">
                          <Typography className="text-sm font-medium">
                            {formatPhoneNumber(phoneNumber)}
                          </Typography>
                        </td>
                        <td className="py-3 px-6">
                          <Typography className="text-sm font-medium">
                            {(source)}
                          </Typography>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {!loading && pagination.totalPages > 0 && (
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
          </>
        ) : (
          <>
            <CardHeader variant="gradient" className={`p-6 ${ColorStyles.bgColor}`}>
              <div className="flex items-center justify-between">
                <Typography variant="h6" color="white">
                  Leads List
                </Typography>
                <FilterPopover
                  title="Source"
                  options={[
                    { value: "All", label: "All Sources" },
                    { value: "Mobile App", label: "Mobile App" },
                    { value: "Walk In", label: "Walk In" },
                    { value: "Call", label: "Call" },
                    { value: "Website", label: "Website" },
                  ]}
                  selectedFilters={sourceFilter}
                  onFilterChange={(value) => handleFilterChange("source", value)}
                />
              </div>
            </CardHeader>
            <CardBody className="px-6 py-8">
              <Typography variant="h6" color="blue-gray" className="text-center">
                No leads found
              </Typography>
            </CardBody>
          </>
        )}
      </Card>
    </div>
  );
}

export default LeadsView;