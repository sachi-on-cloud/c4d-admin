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

export function CategoryList() {
  const navigate = useNavigate();
  const [categoryItems, setCategoryItems] = useState([]);
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

  // Fetch categories with optional zone filter
  const fetchCategoryList = async () => {
    try {
      
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_CATEGORY, {
        // status: { type: "string", enum: ["ACTIVE", "IN_ACTIVE", "ALL"] },
        // zoneId: { type: "string" },
      });
      setCategoryItems(data.data || []);
    } catch (err) {
      console.error('API error:', err);
      setError('Failed to fetch categories.');
    }
  };

  useEffect(() => {
    fetchGeoData();
  }, []);

  useEffect(() => {
    fetchCategoryList();
  }, [zone]); // Re-fetch categories when zone changes

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

  // Filtered categories based on zone
  const filteredCategories = useMemo(() => {
    return categoryItems.filter((item) => {
      return zone ? item.zone === zone : true;
    });
  }, [categoryItems, zone]);

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="flex flex-col-3 gap-4">
        <div className="flex flex-col">
          <label className="text-base font-medium text-gray-700">Select Zone:</label>
          <Select
            options={ZONE_OPTIONS}
            value={ZONE_OPTIONS.find((option) => option.value === zone) || null}
            onChange={handleChange}
            className="w-[200px]"
            placeholder="Select Zone"
            isClearable
          />
          {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
        {zone === '' && (
          <div className="flex items-center justify-end">
            <button
              onClick={() => navigate('/dashboard/inventory/category-add')}
              className={`ml-4 px-4 py-2 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${ColorStyles.addButtonColor}`}
            >
              Add New Category
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
            Category List
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Type</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Name</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Image</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Zone</th>
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-3 px-5 text-center">
                    No categories found
                  </td>
                </tr>
              ) : (
                filteredCategories.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-blue-gray-50">
                    <td className="py-3 px-5">{item.type || '-'}</td>
                    <td className="py-3 px-5">{item.name || '-'}</td>
                    <td className="py-3 px-5">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name || 'Category'}
                          className="w-32 h-auto rounded-md"
                        />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-5">{item.zone || '-'}</td>
                    <td className="py-3 px-5">
                      <Button
                        onClick={() => navigate(`/dashboard/inventory/category-edit/${item.id}`)}
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

export default CategoryList;