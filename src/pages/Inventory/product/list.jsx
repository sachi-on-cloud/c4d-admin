import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button
} from '@material-tailwind/react';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { useNavigate } from 'react-router-dom';

export function ProductList() {
  const navigate = useNavigate();
  const [product, setproductItems] = useState([]);

  useEffect(() => {
    const fetchproductList = async () => {
      try {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_PRODUCTS); 
        setproductItems(data.data || []); 
      } catch (err) {
        console.error('API error:', err);
      }
    };

    fetchproductList();
  }, []);

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="flex items-center justify-end">
        <button
          onClick={() => navigate('/dashboard/inventory/product-add')}
          className={`ml-4 px-4 py-2 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${ColorStyles.addButtonColor}`}
        >
          Add  Product
        </button>
      </div>
      <Card>
        <CardHeader
          variant="gradient"
          className={`mb-8 p-6 flex-1 justify-between items-center ${ColorStyles.bgColor}`}
        >
          <Typography variant="h6" color="white">
             Product List
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Quantity Type</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Category Type</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Name</th>
                {/* <th className='border-b border-blue-gray-50 py-3 px-5 text-left'> Zone</th> */}
                <th className='border-b border-blue-gray-50 py-3 px-5 text-left'> Action</th>
              </tr>
            </thead>
            <tbody>
              {product.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-3 px-5 text-center">
                    No product List
                  </td>
                </tr>
              ) : (
                product.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-blue-gray-50">
                    <td className="py-3 px-5">{item.quantityType || '-'}</td>
                    <td className="py-3 px-5">{item.Category?.type || '-'}</td>
                    <td className="py-3 px-5" 
                     onClick={() =>
                        navigate(`/dashboard/inventory/quantity-add`, {
                          state: { productId: item.id },
                        })
                      }
                      >{item.name || '-'}
                      </td>
                      {/* <td className="py-3 px-5">{item.Category?.zone || '-'}</td> */}
                    <td className="py-3 px-5">
                      <Button
                        as='a'
                        onClick={() => navigate(`/dashboard/inventory/product-edit/${item.id}`)}
                        className="text-xs font-semibold bg-primary text-white"
                      >
                        Edit
                      </Button>
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

export default ProductList;