import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Spinner,
} from '@material-tailwind/react';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import ParcelSearch from '@/components/ParcelSearch';

export function ParcelView({ type, ownerName, id }) {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchParcelAccounts = async () => {
    setLoading(true);
    try {
      const data = await ApiRequestUtils.get(API_ROUTES.GET_ALL_PARCEL); // Updated to GET_ALL_PARCEL
      if (data?.success) {
        setAccounts(data?.data);
      }
    } catch (error) {
      console.error('Error fetching parcel accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcelAccounts();
  }, []);

  return (
    <div className="mb-8 flex flex-col gap-12">
      <ParcelSearch />
      <Card>
        {loading ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : accounts.length > 0 ? (
          <>
            <CardHeader
              variant="gradient"
              className={`mb-8 p-6 flex justify-between items-center rounded-xl ${ColorStyles.bgColor}`}
            >
              <Typography variant="h6" color="white">
                Parcel List
              </Typography>
              {type === 'Parcel' && (
                <div>
                  <Button
                    className={`text-white ${ColorStyles.addButtonColor}`}
                    onClick={() =>
                      navigate('/dashboard/vendors/account/parcel/allVehicles/add', {
                        state: {
                          ownerName,
                          type: 'Parcel',
                          accountId: id,
                        },
                      })
                    }
                  >
                    Add new Cab
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {[
                      'Created Date',
                      'Account Name',
                      'Vehicle Type',
                      'Phone Number',
                      'Vehicle Number',
                      'Status',
                    ].map((el) => (
                      <th key={el} className="border-b border-gray-300 pb-2">
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
                  {accounts.map(
                    (
                      {
                        id,
                        created_at,
                        name,
                        vehicleType,
                        phoneNumber,
                        vehicleNumber,
                        status,
                        Drivers,
                      },
                      key
                    ) => {
                      const className = `py-3 px-5 ${
                        key === accounts.length - 1 ? '' : 'border-b border-blue-gray-50'
                      }`;
                      return (
                        <tr key={id}>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-900">
                              {moment(created_at).format('YYYY-MM-DD')}
                            </Typography>
                          </td>
                          <td className={className}>
                            <div className="flex items-center gap-4">
                              <Typography
                                variant="small"
                                color="blue"
                                className="font-semibold underline cursor-pointer"
                                onClick={() =>
                                  navigate(`/dashboard/vendors/account/parcel/allVehicles/details/${id}`)
                                }
                              >
                                {name}
                              </Typography>
                            </div>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-900">
                              {vehicleType}
                              </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-900">{Drivers[0]?.phoneNumber}</Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-900">{vehicleNumber}</Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-900">{Drivers[0]?.status}</Typography>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </CardBody>
          </>
        ) : (
          <CardBody>
            <Typography variant="h6" color="gray" className="text-center">
              No parcel accounts found
            </Typography>
          </CardBody>
        )}
      </Card>
    </div>
  );
}

export default ParcelView;