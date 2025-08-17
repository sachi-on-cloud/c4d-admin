import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from '@material-tailwind/react';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { useNavigate } from 'react-router-dom';
import moment from "moment";

export function NotificationList() {
  const navigate = useNavigate();
  const [notification, setNotificationItems] = useState([]);

  useEffect(() => {
    const fetchNotificationList = async () => {
      try {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_NOTIFICATION); 
        setNotificationItems(data.data || []); 
      } catch (err) {
        console.error('API error:', err);
      }
    };

    fetchNotificationList();
  }, []);

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="flex items-center justify-end">
        <button
          onClick={() => navigate('/dashboard/vendors/notification/add')}
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
             All Push Notification
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {/* <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Title</th> */}
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Type</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">App</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Message</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">City</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {notification.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-3 px-5 text-center">
                    No Notification List
                  </td>
                </tr>
              ) : (
                notification.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-blue-gray-50">
                    {/* <td className="py-3 px-5">{item.title || '-'}</td> */}
                    <td className="py-3 px-5">{item.type || '-'}</td>
                    <td className="py-3 px-5">{item.app || '-'}</td>
                    <td className="py-3 px-5">{item.message || '-'}</td>
                    <td className="py-3 px-5">{item.city || '-'}</td>
                    <td className="py-3 px-5">{moment(item?.created_at).format('DD-MM-YYYY / hh:mm A') || '-'}</td>                  
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default NotificationList;