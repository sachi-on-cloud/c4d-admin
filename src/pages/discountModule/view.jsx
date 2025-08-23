import React, { useEffect, useState } from 'react';
import {
  Card, CardHeader, CardBody, Typography, Button,
  Spinner,
} from '@material-tailwind/react';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';

const DiscountView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const res = await ApiRequestUtils.get(API_ROUTES.GET_DISCOUNT);
        let list = res?.data || [];

        // If an updated discount was passed via location.state, patch the list
        const updated = location.state?.updatedDiscount;
        if (updated) {
          list = list.map((item) => (item.id === updated.id ? updated : item));
        }

        setDiscounts(list);
      } catch (error) {
        console.error('Failed to fetch discount list:', error);
        setDiscounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, [location.state]);
  const serviceTypeLabels = {
  ALL:"All Services",
  DRIVER: "Driver",
  RIDES: "Rides",
  RENTAL_HOURLY_PACKAGE:"Hourly Package",
  RENTAL_DROP_TAXI:"Drop Taxi",
  RENTAL:"Outstation",
  AUTO:"Auto",
};

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="flex items-center justify-end">
        <button
          onClick={() => navigate('/dashboard/user/discountModule/add')}
          className="ml-4 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-700"
        >
          Add new
        </button>
      </div>

      <Card>
  <CardHeader className="mb-8 p-6 flex justify-between items-center bg-primary">
          <Typography variant="h6" color="white">Discount List</Typography>
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
                  <th className="py-3 px-5 text-left">Service Type</th>
                  <th className="py-3 px-5 text-left">Title</th>
                  <th className="py-3 px-5 text-left">Description</th>
                  <th className="py-3 px-5 text-left">Percentage</th>
                  <th className="py-3 px-5 text-left">Start Date</th>
                  <th className="py-3 px-5 text-left">End Date</th>
                  <th className="py-3 px-5 text-left">Status</th>
                  <th className="py-3 px-5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">No Discounts Found</td>
                  </tr>
                ) : (
                  discounts.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-5">{serviceTypeLabels[item.serviceType] || item.serviceType}</td>
                      <td className="py-3 px-5">{item.title || '-'}</td>
                      <td className="py-3 px-5">{item.description || '-'}</td>
                      <td className="py-3 px-5">{item.percentage}%</td>
                      <td className="py-3 px-5">{moment(item.startDate).format('DD-MM-YYYY ')}</td>
                      <td className="py-3 px-5">{moment(item.endDate).format('DD-MM-YYYY ')}</td>
                      <td className="py-3 px-5">
                        {item.isActive
                          ? <span className="text-green-600 font-semibold">Active</span>
                          : <span className="text-red-600 font-semibold">Inactive</span>}
                      </td>
                      <td className="py-3 px-5">
                        <Button
                          onClick={() =>
                            navigate(`/dashboard/user/discountModule/edit/${item.id}`, {
                              state: { discount: item },
                            })
                          }
                          size="sm"
                          className="bg-primary-500 text-white px-3 py-1 rounded hover:bg-primary-600"
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

export default DiscountView;
