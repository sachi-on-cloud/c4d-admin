import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, Typography, Button, Alert, Spinner } from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';
import moment from "moment";

export function ShopList() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [alert, setAlert] = useState(null);  
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    search: '',
  });

  const location = useLocation();

  const fetchShops = async (page = 1, searchQuery = '', showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_ALL_SHOPS, {
        page: page,
        limit: pagination.itemsPerPage,
        search: searchQuery.trim(),
      });
      if (data?.success) {
        setShops(data?.data || []);
        setPagination({
          currentPage: page,
          totalPages: searchQuery.trim() ? 1 : data?.pagination?.totalPages || 1,
          totalItems: data?.pagination?.totalItems || 0,
          itemsPerPage: data?.pagination?.itemsPerPage || 10,
          search: searchQuery.trim(),
        });
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops(pagination.currentPage, pagination.search, true);

    if (location.state?.shopAdded || location.state?.shopUpdated) {
      const action = location.state.shopAdded ? 'added' : 'updated';
      setAlert({
        message: `${location.state.shopName} ${action} successfully!`
      });
      setTimeout(() => {
        setAlert(null);
      }, 5000);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, pagination.currentPage, pagination.search]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
      fetchShops(page, pagination.search, true);
    }
  };

  const generatePageButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          size="sm"
          variant={i === pagination.currentPage ? 'filled' : 'outlined'}
          className={`mx-1 ${ColorStyles.bgColor} text-white`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    return buttons;
  };

  return (
    <div className="mb-8 flex flex-col gap-12 mt-5">
      {alert && (
        <div className='mb-2'>
          <Alert color='blue' className='py-3 px-6 rounded-xl'>
            {alert.message}
          </Alert>
        </div>
      )}
      <Card>
        {shops.length > 0 ? (
          <>
            <CardHeader variant="gradient" className={`mb-8 p-6 rounded-xl ${ColorStyles.bgColor}`}>
              <div className="flex justify-between items-center">
                <Typography variant="h6" color="white">
                  Shops List
                </Typography>
                <Button
                  size="sm"
                  className='bg-red-500 text-white'
                  onClick={() => navigate('/dashboard/vendors/shops/add')}
                >
                  Add Shop
                </Button>
              </div>
            </CardHeader>
            <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    {["Date","Shop Name","Shop Type", "Phone Number", "Shop Address", "Zone", "Booking Count"].map((el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                        style={{ width: el === "Shop Name" || el === "Shop Address" ? '20%' : '10%' }}
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase text-black"
                        >
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-3 px-5">
                        <div className="flex justify-center items-center">
                          <Spinner className="h-12 w-12" />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    shops.map(
                      ({ id, created_at, shopName, shopType, primaryPhone, shopAddress, shopZone, bookingCount }, key) => {
                        const className = `py-3 px-5 ${key === shops.length - 1 ? "" : "border-b border-blue-gray-50"}`;

                        return (
                          <tr key={id}>
                             <td className={className} >
                              <Typography className="text-xs font-semibold text-black">
                                {created_at ? moment(created_at).format("DD-MM-YYYY") : 'N/A'}
                              </Typography>
                            </td>
                            <td className={className} style={{ width: '20%' }}>
                              <div onClick={() => navigate(`/dashboard/vendors/shops/details/${id}`)} className='cursor-pointer'>
                                <Typography variant="small" color="blue" className="font-semibold underline">
                                  {shopName}
                                </Typography>
                              </div>
                            </td>
                            <td className={className} >
                              <Typography className="text-xs font-semibold text-black">
                                {shopType}
                              </Typography>
                            </td>
                            <td className={className} >
                              <Typography className="text-xs font-semibold text-black">
                                {primaryPhone}
                              </Typography>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-semibold text-black">
                                {shopAddress?.name}
                              </Typography>
                            </td>
                            <td className={className} >
                              <Typography className="text-xs font-semibold text-black">
                                {shopZone}
                              </Typography>
                            </td>
                            <td className={className} >
                              <Typography className="text-xs font-semibold text-black">
                                {bookingCount ?? '0'}
                              </Typography>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
              <div className="flex items-center justify-center mt-4">
                <Button
                  size="sm"
                  variant="text"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className="mx-1"
                >
                  {'<'}
                </Button>
                {generatePageButtons()}
                <Button
                  size="sm"
                  variant="text"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className="mx-1"
                >
                  {'>'}
                </Button>
              </div>
            </CardBody>
          </>
        ) : (
          <CardHeader variant="gradient" className={`mb-8 p-6 ${ColorStyles.bgColor}`}>
            <div className="flex justify-between items-center">
              <Typography variant="h6" color="white">
                No Shops
              </Typography>
              <Button
                size="sm"
                className='bg-red-500 text-white'
                onClick={() => navigate('/dashboard/vendors/shops/add')}
              >
                Add Shop
              </Button>
            </div>
          </CardHeader>
        )}
      </Card>
    </div>
  );
}

export default ShopList;