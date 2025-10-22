import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Popover,
  PopoverHandler,
  PopoverContent,
  Checkbox,
} from '@material-tailwind/react';
import { FaFilter, FaEdit } from 'react-icons/fa';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

export function CombineView() {
  const navigate = useNavigate();
  // Initialize with a sample record
  const [items, setItems] = useState([
    {
      id: 1,
      serviceType: 'Type1',
      serviceArea: 'Chennai',
      message: 'Sample service message for Type1 in Chennai',
      created_at: '2025-10-20T10:30:00Z',
    },
  ]);
  const [serviceTypeFilter, setServiceTypeFilter] = useState(['All']);
  const [serviceAreaFilter, setServiceAreaFilter] = useState(['All']);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 1, // Reflecting the sample record
    itemsPerPage: 15,
  });

  const fetchCombineViewList = async (page = 1, showLoader = true) => {
    try {
      const filterType = {
        serviceType: serviceTypeFilter,
        serviceArea: serviceAreaFilter,
      };

      const queryParams = {
        page: page,
        limit: pagination.itemsPerPage,
      };

      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_COMBINE_VIEW, {
        ...queryParams,
        filterType: JSON.stringify(filterType),
      });

      if (data?.success) {
        setItems(data?.data || []);
        setPagination({
          currentPage: page,
          totalPages: data?.pagination?.totalPages || 1,
          totalItems: data?.pagination?.totalItems || 0,
          itemsPerPage: data?.pagination?.itemsPerPage || 15,
        });
      }
    } catch (err) {
      console.error('API error:', err);
      // Keep the sample record if API fails
      setItems([
        {
          id: 1,
          serviceType: 'Type1',
          serviceArea: 'Chennai',
          message: 'Sample service message for Type1 in Chennai',
          created_at: '2025-10-20T10:30:00Z',
        },
      ]);
    }
  };

  useEffect(() => {
    fetchCombineViewList(pagination.currentPage, true);
  }, [pagination.currentPage, pagination.itemsPerPage, serviceTypeFilter, serviceAreaFilter]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
      fetchCombineViewList(page, true);
    }
  };

  const handleServiceTypeFilterChange = (value) => {
    setServiceTypeFilter((prev) => {
      if (value === 'All') {
        return ['All'];
      } else {
        const newFilter = prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev.filter((item) => item !== 'All'), value];
        return newFilter.length === 0 ? ['All'] : newFilter;
      }
    });
  };

  const handleServiceAreaFilterChange = (value) => {
    setServiceAreaFilter((prev) => {
      if (value === 'All') {
        return ['All'];
      } else {
        const newFilter = prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev.filter((item) => item !== 'All'), value];
        return newFilter.length === 0 ? ['All'] : newFilter;
      }
    });
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

  const FilterPopover = ({ title, options, selectedFilters, onFilterChange }) => (
    <Popover placement="bottom-start">
      <PopoverHandler>
        <div className="flex items-center cursor-pointer">
          {title}
          <FaFilter className="text-gray-700 text-xs ml-2" />
        </div>
      </PopoverHandler>
      <PopoverContent className="p-2 z-10">
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
      <div className="flex items-center justify-end">
        <button
          onClick={() => navigate('/dashboard/vendors/customerNotificationList/add')}
          className={`ml-4 px-4 py-2 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${ColorStyles.addButtonColor}`}
        >
          Add new
        </button>
      </div>
      <Card>
        <CardHeader
          variant="gradient"
          className={`mb-8 p-6 flex-1 justify-between items-center ${ColorStyles.bgColor}`}
        >
          <Typography variant="h6" color="white">
            Combine View
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">
                  <div className="flex items-center justify-between">
                    <FilterPopover
                      title={<span className="text-base font-semibold text-gray-700">Service Type</span>}
                      options={[
                        { value: 'All', label: 'All' },
                        { value: 'Type1', label: 'Type 1' },
                        { value: 'Type2', label: 'Type 2' },
                        { value: 'Type3', label: 'Type 3' },
                      ]}
                      selectedFilters={serviceTypeFilter}
                      onFilterChange={(value) => handleServiceTypeFilterChange(value)}
                    />
                  </div>
                </th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">
                  <div className="flex items-center justify-between">
                    <FilterPopover
                      title={<span className="text-base font-semibold text-gray-700">Service Area</span>}
                      options={[
                        { value: 'All', label: 'All' },
                        { value: 'Chennai', label: 'Chennai' },
                        { value: 'Vellore', label: 'Vellore' },
                        { value: 'Thiruvannamalai', label: 'Thiruvannamalai' },
                        { value: 'Kanchipuram', label: 'Kanchipuram' },
                      ]}
                      selectedFilters={serviceAreaFilter}
                      onFilterChange={(value) => handleServiceAreaFilterChange(value)}
                    />
                  </div>
                </th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Message</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Created Date</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-3 px-5 text-center">
                    No Combine View Items
                  </td>
                </tr>
              ) : (
                items
                  .filter((item) => serviceTypeFilter.includes('All') || serviceTypeFilter.includes(item.serviceType))
                  .filter((item) => serviceAreaFilter.includes('All') || serviceAreaFilter.includes(item.serviceArea))
                  .map((item, index) => (
                    <tr key={item.id || index} className="border-b border-blue-gray-50">
                      <td className="py-3 px-5">{item.serviceType || '-'}</td>
                      <td className="py-3 px-5">{item.serviceArea || '-'}</td>
                      <td className="py-3 px-5">{item.message || '-'}</td>
                      <td className="py-3 px-5">{moment(item?.created_at).format('DD-MM-YYYY / hh:mm A') || '-'}</td>
                     <td >
                        <Button
                        as="a"
                        onClick={() => navigate(`dashboard/vendors/customerNotificationList/edit/:id`)}
                        className="text-xs font-semibold text-white bg-primary"
                        >
                        Edit
                        </Button>
                    </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
          {items.length > 0 && (
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

export default CombineView;