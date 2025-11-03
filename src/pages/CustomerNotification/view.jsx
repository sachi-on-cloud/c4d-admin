import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Switch,
} from '@material-tailwind/react';
import { ColorStyles } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

export function CombineView() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
  });
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null); // For loading state

  const fetchCombineViewList = async (page = 1) => {
    try {
      setError(null);
      const queryParams = {
        page: page,
        limit: pagination.itemsPerPage,
      };

      const data = await ApiRequestUtils.getWithQueryParam('/notification-messages', queryParams);

      if (data?.success) {
        // Map serviceType to display-friendly values if needed
        const mappedItems = data?.data.map(item => ({
          ...item,
          serviceType: item.serviceType ? {
            'rides': 'Rides',
            'outstation': 'Outstation',
            'acting_driver': 'Acting Driver',
            'hourly_package': 'Hourly Package',
            'drop_taxi': 'Drop Taxi',
          }[item.serviceType.toLowerCase()] || item.serviceType : '-',
        }));
        setItems(mappedItems || []);
        setPagination({
          currentPage: page,
          totalPages: data?.pagination?.totalPages || 1,
          totalItems: data?.pagination?.totalItems || 0,
          itemsPerPage: data?.pagination?.itemsPerPage || 15,
        });
      } else {
        setItems([]);
        setError('Failed to fetch data from the API');
      }
    } catch (err) {
      console.error('API error:', err);
      setItems([]);
      setError('An error occurred while fetching data');
    }
  };

  useEffect(() => {
    fetchCombineViewList(pagination.currentPage, true);
  }, [pagination.currentPage, pagination.itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
    }
  };

  // Toggle Status API Call
  const handleStatusToggle = async (id, currentStatus) => {
    setUpdatingId(id);
    try {
      const response = await ApiRequestUtils.update(`/notification-messages/${id}`, {
        status: !currentStatus,
      });

      if (response?.success) {
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, status: !currentStatus } : item
          )
        );
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('An error occurred');
    } finally {
      setUpdatingId(null);
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
            Customer App Notification
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {error && (
            <Typography color="red" className="text-center py-3">
              {error}
            </Typography>
          )}
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">
                  <Typography className="text-base font-semibold text-gray-700">
                    Service Type
                  </Typography>
                </th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">
                  <Typography className="text-base font-semibold text-gray-700">
                    Service Area
                  </Typography>
                </th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Message</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Created Date</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Last Updated</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Status</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !error ? (
                <tr>
                  <td colSpan="7" className="py-3 px-5 text-center">
                    No Combine View Items
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-blue-gray-50">
                    <td className="py-3 px-5">{item.serviceType || '-'}</td>
                    <td className="py-3 px-5">{item.serviceArea || '-'}</td>
                    <td className="py-3 px-5 max-w-xs truncate">{item.message || '-'}</td>
                    <td className="py-3 px-5">{moment(item?.created_at).format('DD-MM-YYYY / hh:mm A') || '-'}</td>
                    <td className="py-3 px-5">{moment(item?.updated_at).format('DD-MM-YYYY / hh:mm A') || '-'}</td>
                    
                    {/* Status Toggle */}
                    <td className="py-3 px-5">
                      <Switch
                        checked={item.status === true}
                        onChange={() => handleStatusToggle(item.id, item.status)}
                        disabled={updatingId === item.id}
                        color="blue"
                        label={updatingId === item.id ? "Updating..." : (item.status ? "Active" : "Inactive")}
                      />
                    </td>

                    <td className="py-3 px-5">
                      <Button
                        onClick={() => navigate(`/dashboard/vendors/customerNotificationList/edit/${item.id}`)}
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