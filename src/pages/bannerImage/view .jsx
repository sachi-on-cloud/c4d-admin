import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Spinner,
  Switch,
} from '@material-tailwind/react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';

const BannerView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bannerList, setBannerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingBannerId, setUpdatingBannerId] = useState(null);

  useEffect(() => {
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await ApiRequestUtils.get(API_ROUTES.GET_BANNER);
      // console.log('Full API Response:', res); 
      
      // Handle different response structures
      let list = [];
      if (Array.isArray(res?.data?.data)) {
        list = res.data.data;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      }
      
      
      const updated = location.state?.updatedBanner;
      if (updated) {
        list = list.map((item) => item.id === updated.id ? updated : item);
      }

      setBannerList(list);
    } catch (err) {
      console.error('Failed to fetch banner list:', err);
      setBannerList([]);
    } finally {
      setLoading(false);
    }
  };

  fetchBanners();
}, [location.state]);

  const handleStatusToggle = async (bannerId, newStatus) => {
    try {
      setLoading(true);
      setUpdatingBannerId(bannerId);
      // console.log('Updating Banner:', { bannerId, status: newStatus });

      const res = await ApiRequestUtils.update(API_ROUTES.UPDATE_BANNER, {
        bannerId: bannerId,
        status: newStatus,
      });
      // console.log('Update Response ====> :', res);

      setBannerList((prevList) =>
        prevList.map((item) =>
          item.id === bannerId ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error('Failed to update banner status:', err);
    } finally {
      setUpdatingBannerId(null);
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="flex items-center justify-end">
        <button
          onClick={() => navigate('/dashboard/user/bannerimg/add')}
          className="ml-4 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-700"
        >
          Add New
        </button>
      </div>

      <Card>
        <CardHeader className="mb-8 p-6 flex justify-between items-center bg-primary">
          <Typography variant="h6" color="white">Banner List</Typography>
        </CardHeader>

        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Spinner className="h-10 w-10" />
            </div>
          ) : (
            <table className="w-full min-w-[1000px] table-auto">
              <thead>
                <tr>
                  <th className="py-3 px-5 text-left">Image</th>
                  <th className="py-3 px-5 text-left">Type</th>
                  <th className="py-3 px-5 text-left">Redirect URL</th>
                  <th className="py-3 px-5 text-left">From Date</th>
                  <th className="py-3 px-5 text-left">To Date</th>
                  <th className="py-3 px-5 text-left">Status</th>
                  
                </tr>
              </thead>
              <tbody>
                {bannerList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No Banner Records Found
                    </td>
                  </tr>
                ) : (
                  bannerList.map((item, index) => (
                    <tr key={item.id || index} className="border-b">
                      <td className="py-3 px-5">
                        <img
                          src={item.imageUrl}
                          alt="banner"
                          className="w-32 h-auto rounded-md"
                        />
                      </td>
                      <td className="py-3 px-5">{item.type || '-'}</td>
                      <td className="py-3 px-5">{item.redirectUrl || '-'}</td>
                      <td className="py-3 px-5">
                        {item.fromDate ? moment(item.fromDate).format('DD-MM-YYYY') : '-'}
                      </td> 
                      <td className="py-3 px-5">
                        {item.toDate ? moment(item.toDate).format('DD-MM-YYYY') : '-'}
                      </td>
                      <td className="py-3 px-5">
                        <Switch
                          color="blue"
                          checked={item.status}
                          onChange={() => handleStatusToggle(item.id, !item.status)}
                          disabled={updatingBannerId === item.id}
                          label={item.status ? 'Active' : 'Inactive'}
                        />
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
};

export default BannerView;
