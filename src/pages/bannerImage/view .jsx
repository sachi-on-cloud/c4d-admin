import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Spinner,
} from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';

const BannerView = () => {
  const navigate = useNavigate();
  const [bannerList, setBannerList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await ApiRequestUtils.get(API_ROUTES.GET_BANNER);
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        setBannerList(list);
      } catch (err) {
        console.error('Failed to fetch banner list:', err);
        setBannerList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="flex items-center justify-end">
        <button
          onClick={() => navigate('/dashboard/user/banner/add')}
          className="ml-4 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Add New
        </button>
      </div>

      <Card>
        <CardHeader className="mb-8 p-6 flex justify-between items-center bg-blue-600">
          <Typography variant="h6" color="white">Banner List</Typography>
        </CardHeader>

        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Spinner className="h-10 w-10 mb-2" />
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
                  <th className="py-3 px-5 text-left">Actions</th>
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
                      <td className="py-3 px-5">{item.fromDate || '-'}</td>
                      <td className="py-3 px-5">{item.toDate || '-'}</td>
                      <td className="py-3 px-5">
                        {item.isActive ? (
                          <span className="text-green-600 font-semibold">Active</span>
                        ) : (
                          <span className="text-red-600 font-semibold">Inactive</span>
                        )}
                      </td>
                      <td className="py-3 px-5">
                        <Button
                          onClick={() =>
                            navigate(`/dashboard/user/banner/edit/${item.id}`, {
                              state: { banner: item },
                            })
                          }
                          size="sm"
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
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
};

export default BannerView;
