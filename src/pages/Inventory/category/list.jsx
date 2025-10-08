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

export function CategoryList() {
  const navigate = useNavigate();
  const [category, setcategoryItems] = useState([]);

  useEffect(() => {
    const fetchcategoryList = async () => {
      try {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_CATEGORY);
        setcategoryItems(data.data || []);
      } catch (err) {
        console.error('API error:', err);
      }
    };

    fetchcategoryList();
  }, []);

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="flex items-center justify-end">
        <button
          onClick={() => navigate('/dashboard/inventory/category-add')}
          className={`ml-4 px-4 py-2 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${ColorStyles.addButtonColor}`}
        >
          Add new Category
        </button>
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
                {/* <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Zone</th> */}
                <th className="border-b border-blue-gray-50 py-3 px-5 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {category.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-3 px-5 text-center">
                    No category List
                  </td>
                </tr>
              ) : (
                category.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-blue-gray-50">
                    <td className="py-3 px-5">{item.type || '-'}</td>
                    <td className="py-3 px-5">{item.name || '-'}</td>
                    <td className="py-3 px-5">
                      <img
                        src={item.image}
                        alt="Category"
                        className="w-32 h-auto rounded-md"
                      />
                    </td>
                    {/* <td className="py-3 px-5">{item.zone}</td> */}
                    <td className="py-3 px-5">
                      <Button
                        as='a'
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