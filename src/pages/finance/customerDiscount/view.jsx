import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Spinner,
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { MOCK_DISCOUNTS } from '@/data/customerDiscountMocks';

export function CustomerDiscountView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        // Use mock data for now; switch to API when backend is ready
        // const res = await ApiRequestUtils.get(API_ROUTES.GET_DISCOUNT);
        // let list = res?.data || [];
        let list = MOCK_DISCOUNTS;

        // Filter for customer discounts (offerType = CUSTOM)
        list = list.filter((item) => (item.offerType || '').toUpperCase() === 'CUSTOM');

        const updated = location.state?.updatedDiscount;
        if (updated && (updated.offerType || '').toUpperCase() === 'CUSTOM') {
          list = list.map((item) => (item.id === updated.id ? updated : item));
        }

        setDiscounts(list);
      } catch (error) {
        console.error('Failed to fetch customer discounts:', error);
        setDiscounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, [location.state]);

  const serviceTypeLabels = {
    ALL: "All Services",
    DRIVER: "Driver",
    RIDES: "Rides",
    RENTAL_HOURLY_PACKAGE: "Hourly Package",
    RENTAL_DROP_TAXI: "Drop Taxi",
    RENTAL: "Outstation",
    AUTO: "Auto",
  };

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="flex items-center justify-end">
        <button
          onClick={() => navigate('/dashboard/users/customer-discount/add')}
          className={`ml-4 px-4 py-2 font-normal rounded-3xl ${ColorStyles.addButtonColor}`}
        >
          Add new
        </button>
      </div>

      <Card>
        <CardHeader variant="gradient" className={`mb-8 p-6 rounded-xl ${ColorStyles.bgColor}`}>
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">
              Customer Discount List
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Spinner className="h-10 w-10" />
            </div>
          ) : (
            <table className="w-full min-w-[900px] table-auto">
              <thead>
                <tr>
                  <th className="py-3 px-5 text-left">Service Type</th>
                  <th className="py-3 px-5 text-left">Title</th>
                  <th className="py-3 px-5 text-left">Coupon Code</th>
                  <th className="py-3 px-5 text-left">Discount</th>
                  <th className="py-3 px-5 text-left">Start Date</th>
                  <th className="py-3 px-5 text-left">End Date</th>
                  <th className="py-3 px-5 text-left">Status</th>
                  <th className="py-3 px-5 text-left">Service Area</th>
                  <th className="py-3 px-5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">No Customer Discounts Found</td>
                  </tr>
                ) : (
                  discounts.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3 px-5">{serviceTypeLabels[item.serviceType] || item.serviceType}</td>
                      <td className="py-3 px-5">{item.title || '-'}</td>
                      <td className="py-3 px-5 font-semibold text-green-600">
                        {item.couponCode || '-'}
                      </td>
                      <td className="py-3 px-5">
                        {(() => {
                          const normalizedType = (item.discountType || (Number(item.amount) > 0 ? 'IsAmount' : 'percentage'))?.toLowerCase();
                          if (normalizedType === 'isamount' || normalizedType === 'amount' || normalizedType === 'flat') {
                            const value = item.amount ?? item.flatAmount ?? item.discountValue ?? 0;
                            return value ? `₹${value}` : '-';
                          }
                          const percent = item.percentage ?? item.discountValue ?? 0;
                          return percent ? `${percent}%` : '-';
                        })()}
                      </td>
                      <td className="py-3 px-5">{item.startDate ? moment(item.startDate).format('DD-MM-YYYY') : '-'}</td>
                      <td className="py-3 px-5">{item.endDate ? moment(item.endDate).format('DD-MM-YYYY') : '-'}</td>
                      <td className="py-3 px-5">
                        {item.isActive
                          ? <span className="text-green-600 font-semibold">Active</span>
                          : <span className="text-red-600 font-semibold">Inactive</span>}
                      </td>
                      <td className="py-3 px-5">
                        {item.serviceArea && item.serviceArea.length > 0 ? (
                          item.serviceArea.map((area, index) => (
                            <span key={index} className="mr-2">{area}</span>
                          ))
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-5">
                        <Button
                          onClick={() =>
                            navigate(`/dashboard/users/customer-discount/edit/${item.id}`, {
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
}

export default CustomerDiscountView;
