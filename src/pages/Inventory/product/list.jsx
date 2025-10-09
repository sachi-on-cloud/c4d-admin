import React, { useEffect, useState, useMemo } from 'react';
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
import Select from 'react-select';

export function ProductList() {
  const navigate = useNavigate();
  const [productItems, setProductItems] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [zone, setZone] = useState('');
  const [error, setError] = useState(null);

  // Fetch service areas (zones)
  const fetchGeoData = async () => {
    try {
      const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST, {
        type: 'Service Area',
        id: '',
      });
      if (!response?.data || !Array.isArray(response.data)) {
        throw new Error('Invalid service areas response');
      }
      setServiceAreas(response.data);
    } catch (error) {
      console.error('Error fetching GEO_MARKINGS_LIST:', error);
      setError('Failed to fetch service areas.');
    }
  };

  // Fetch products with optional zone filter
  const fetchProductList = async () => {
    try {
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_PRODUCTS,{
        // category: { type: "string" },
        // status: { type: "string", enum: ["ACTIVE", "IN_ACTIVE", "ALL"] },
        // zoneId: { type: "string" },
      });
      setProductItems(data.data || []);
    } catch (err) {
      console.error('API error:', err);
      setError('Failed to fetch products.');
    }
  };

  useEffect(() => {
    fetchGeoData();
  }, []);

  useEffect(() => {
    fetchProductList();
  }, [zone]); // Re-fetch products when zone changes

  // Handle select changes for zone
  const handleChange = (selectedOption) => {
    setZone(selectedOption ? selectedOption.value : '');
  };

  // Zone options for the select dropdown
  const ZONE_OPTIONS = useMemo(
    () => [
      { value: 'ALL', label: 'All' },
      ...serviceAreas.map((area) => ({
        value: area.name,
        label: area.name,
      })),
    ],
    [serviceAreas]
  );

  // Filtered products based on zone
  const filteredProducts = useMemo(() => {
    return productItems.filter((item) => {
      return zone ? item.Category?.zone === zone : true;
    });
  }, [productItems, zone]);

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="flex flex-col-3 gap-4">
        <div className="flex flex-col">
          <label className="text-base font-medium text-gray-700">Select Zone:</label>
          <Select
            options={ZONE_OPTIONS}
            value={ZONE_OPTIONS.find((option) => option.value === zone) || null}
            onChange={handleChange}
            placeholder="Select Zone"
            className="w-[200px]"
            isClearable
          />
          {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
        {zone === '' && (
          <div className="flex items-center justify-end">
            <button
              onClick={() => navigate('/dashboard/inventory/product-add')}
              className={`ml-4 px-4 py-2 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${ColorStyles.addButtonColor}`}
            >
              Add Product
            </button>
          </div>
        )}
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
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Zone</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-3 px-5 text-center">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-blue-gray-50">
                    <td className="py-3 px-5">{item.quantityType || '-'}</td>
                    <td className="py-3 px-5">{item.Category?.type || '-'}</td>
                    <td
                      className="py-3 px-5 cursor-pointer hover:text-primary-700"
                      onClick={() =>
                        navigate(`/dashboard/inventory/quantity-add`, {
                          state: { productId: item.id },
                        })
                      }
                    >
                      {item.name || '-'}
                    </td>
                    <td className="py-3 px-5">{item.Category?.zone || '-'}</td>
                    <td className="py-3 px-5">
                      <Button
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