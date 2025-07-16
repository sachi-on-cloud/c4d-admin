import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Switch,
  Spinner
} from '@material-tailwind/react';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { useNavigate } from 'react-router-dom';
import moment from "moment";

export function DriverNotificationList() {
    const navigate = useNavigate();
    const [driverNotification, setdriverNotification] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);

      useEffect(() => {
          const fetchDriverNotificationList = async () => {
            setLoading(false);
            try {
              const data = await ApiRequestUtils.get(API_ROUTES.GET_DRIVER_NOTIFY);
              setdriverNotification(data.data || []);
            }
          
            catch (err) {
              console.error('API error:', err);
            } 
          };

          fetchDriverNotificationList();
        }, []);

 const handleStatusToggle = async (notificationId, newStatus) => {
       try {
         setLoading(true);
         setUpdatingUserId(notificationId);
        
   
         const res = await ApiRequestUtils.update(API_ROUTES.UPDATE_DRIVER_NOTIFY, {
           notificationId: notificationId,
           status: newStatus,
         });
         
   
       setdriverNotification((prevList) =>
           prevList.map((item) =>
             item.id === notificationId ? { ...item, status: newStatus } : item
           )
         );
       } catch (err) {
         console.error('Failed to update banner status:', err);
       } finally {
         setUpdatingUserId(null);
         setLoading(false);
       }
     };

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="flex items-center justify-end">
        <button
          onClick={() => navigate('/dashboard/vendors/driverNotificationList/add')}
          className={`ml-4 px-4 py-2 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${ColorStyles.addButtonColor}`}
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
            Drivers App Notification
          </Typography>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            {loading ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <Spinner className="h-10 w-10 mb-2" />
                      </div>
                    ) : (
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Title</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">App</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Summary</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Created Date</th>
                <th className='border-b border-blue-gray-50 py-3 px-5 text-left'>Status</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {driverNotification.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-3 px-5 text-center">
                    No Driver Notification List
                  </td>
                </tr>
              ) : (
                driverNotification.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-blue-gray-50">
                    <td className="py-3 px-5">{item.title || '-'}</td>
                    <td className="py-3 px-5">{item.notifyType || '-'}</td>
                    <td className="py-3 px-5">{item.message || '-'}</td>
                    <td className="py-3 px-5">
                      {moment(item ?.created_at).format('DD-MM-YYYY / hh:mm A') || '-'}
                    </td>
                    <td className="py-3 px-5">
                      <Switch
                        color="blue"
                        checked={item.status}
                        onChange={() => handleStatusToggle(item.id, !item.status)}
                        disabled={updatingUserId === item.id}
                         label={item.status ? 'Active' : 'Inactive'}
                      />
                    </td>
                    <td className="py-3 px-5">
                      <Button
                        as='a'
                        onClick={() => navigate(`/dashboard/vendors/driverNotificationList/edit/${item.id}`)}
                        className="text-xs font-semibold bg-[#1A73E8] text-white"
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
                    )}       
        </CardBody>
      </Card>
    </div>
  );
}

export default DriverNotificationList;
