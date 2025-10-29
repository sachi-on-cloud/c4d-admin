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

export function QuantityList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [zone, setZone] = useState('');
  const [productName, setProductName] = useState('');
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
      const queryParams = zone ? { zone } : {};
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_PRODUCTS, queryParams);
      setProducts(data.data || []);
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

  // Handle select changes for zone and product name
  const handleChange = (selectedOption, field) => {
    if (field === 'zone') {
      setZone(selectedOption ? selectedOption.value : '');
    } else if (field === 'productName') {
      setProductName(selectedOption ? selectedOption.value : '');
    }
  };

  // Zone options for the select dropdown
  const ZONE_OPTIONS = useMemo(
    () => [
      { value: 'All', label: 'All' },
      ...serviceAreas.map((area) => ({
        value: area.name,
        label: area.name,
      })),
    ],
    [serviceAreas]
  );

  // Product name options for the select dropdown
  const PRODUCT_NAME_OPTIONS = useMemo(
    () => [
      { value: 'All', label: 'All' },
      ...Array.from(new Set(products.map((item) => item.name)))
        .filter((name) => name)
        .map((name) => ({
          value: name,
          label: name,
        })),
    ],
    [products]
  );

  // Filtered products based on zone and product name
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesZone = zone ? item.Category?.zone === zone : true;
      const matchesName = productName ? item.name === productName : true;
      return matchesZone && matchesName;
    });
  }, [products, zone, productName]);

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="flex flex-col-2 gap-4">
        <div className="flex flex-col">
          <label className="text-base font-medium text-gray-700">Select Zone:</label>
          <Select
            options={ZONE_OPTIONS}
            value={ZONE_OPTIONS.find((option) => option.value === zone) || null}
            onChange={(selectedOption) => handleChange(selectedOption, 'zone')}
            placeholder="Select Zone"
            className="w-[200px]"
            isClearable
          />
          {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
        <div className="flex flex-col">
          <label className="text-base font-medium text-gray-700">Select Product Name:</label>
          <Select
            options={PRODUCT_NAME_OPTIONS}
            value={PRODUCT_NAME_OPTIONS.find((option) => option.value === productName) || null}
            onChange={(selectedOption) => handleChange(selectedOption, 'productName')}
            placeholder="Select Product Name"
            className="w-[250px]"
            isClearable
          />
        </div>
      
      <div className="flex items-center justify-end">
        <button
          onClick={() => navigate('/dashboard/inventory/quantity-add')}
          className={`ml-4 px-4 py-2 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${ColorStyles.addButtonColor}`}
        >
          Add Stock
        </button>
      </div>
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
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Zone</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Total Count</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Premium Count</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Regular Count</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Waste Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-3 px-5 text-center">
                    No products available
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item, index) => (
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
                      {item.name || '-'}
                    </td>
                    <td className="py-3 px-5">{item.Category?.zone || '-'}</td>
                    <td className="py-3 px-5">{item.totalStock || '-'}</td>
                    <td className="py-3 px-5">{item.premiumStock || '-'}</td>
                    <td className="py-3 px-5">{item.regularStock || '-'}</td>
                    <td className="py-3 px-5">{item.wasteStock || '-'}</td>
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