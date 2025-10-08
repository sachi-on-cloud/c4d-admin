import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from '@material-tailwind/react';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { useNavigate } from 'react-router-dom';

export function QuantityList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProductList = async () => {
      try {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_PRODUCTS);
        setProducts(data.data || []);
      } catch (err) {
        console.error('API error:', err);
      }
    };

    fetchProductList();
  }, []);

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="flex items-center justify-end">
      </div>
      <Card>
        <CardHeader
          variant="gradient"
          className={`mb-8 p-6 flex justify-between items-center ${ColorStyles.bgColor}`}
        >
          <Typography variant="h6" color="white">
            Stock List
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Type</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Name</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="2" className="py-3 px-5 text-center">
                    No products available
                  </td>
                </tr>
              ) : (
                products.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-blue-gray-50">
                    <td className="py-3 px-5">{item.Category?.type || '-'}</td>
                    <td
                      className="py-3 px-5 underline text-blue-900 cursor-pointer"
                      onClick={() =>
                        navigate(`/dashboard/inventory/quantity-add`, {
                          state: { productId: item.id },
                        })
                      }
                    >
                      {item.name || item.type || '-'}
                    </td>
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

export default QuantityList;