import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Spinner,
  Switch,
  Input,
  Popover,
  PopoverHandler,
  PopoverContent,
  Checkbox,
} from '@material-tailwind/react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { FaFilter } from 'react-icons/fa';

const BannerView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bannerList, setBannerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingBannerId, setUpdatingBannerId] = useState(null);
  const [editingPositionId, setEditingPositionId] = useState(null);
  const [positionValues, setPositionValues] = useState([]);
  const [typeFilter, setTypeFilter] = useState(['All']);
  const [zoneFilter, setZoneFilter] = useState(['All']);
  const [statusTab, setStatusTab] = useState('active');
  const [positionErrorById, setPositionErrorById] = useState({});

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const filterType = {
          type: typeFilter,
          zone: zoneFilter,
        };
        const queryParams = {
          filterType: JSON.stringify(filterType),
          status: statusTab === 'active',
        };
      const res = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_BANNER, queryParams);
      
      // Handle different response structures
      let list = [];
      if (Array.isArray(res?.data?.data)) {
        list = res.data.data;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      }
      
      
      const updated = location.state?.updatedBanner;
      if (updated) {
        list = list.map((item) => item.id === updated.id ? updated : item);
      }

      setBannerList(list);
    } catch (err) {
      console.error('Failed to fetch banner list:', err);
      setBannerList([]);
    } finally {
      setLoading(false);
    }
  };

  fetchBanners();
}, [location.state, typeFilter, zoneFilter, statusTab]);

  const handleStatusToggle = async (bannerId, newStatus) => {
    try {
      setLoading(true);
      setUpdatingBannerId(bannerId);
      // console.log('Updating Banner:', { bannerId, status: newStatus });

      const res = await ApiRequestUtils.update(API_ROUTES.UPDATE_BANNER, {
        bannerId: bannerId,
        status: newStatus,
      });
      // console.log('Update Response ====> :', res);

      setBannerList((prevList) =>
        prevList.map((item) =>
          item.id === bannerId ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error('Failed to update banner status:', err);
    } finally {
      setUpdatingBannerId(null);
      setLoading(false);
    }
  };

  const handlePositionChange = (bannerId, value) => {
    setPositionValues(prev => ({
      ...prev,
      [bannerId]: value
    }));
  };

  const positionUpdate = async (bannerId) => {
    try {
      setLoading(true);
      const newPosition = positionValues[bannerId];
      const result = await ApiRequestUtils.update(API_ROUTES.BANNER_POSITION_UPDATE, {
        bannerId: bannerId,
        position: newPosition
      });
      
      setBannerList((prevList) =>
        prevList.map((item) =>
          item.id === bannerId ? { ...item, position: newPosition } : item
        )
      );
      setEditingPositionId(null); 
    } catch (err) {
      console.error('Failed to update banner position:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    const setter = filterType === 'type' ? setTypeFilter : setZoneFilter;
    setter(prev => {
      if (value === 'All') {
        return ['All'];
      } else {
        const newFilter = prev.includes(value)
          ? prev.filter(item => item !== value)
          : [...prev.filter(item => item !== 'All'), value];
        return newFilter.length === 0 ? ['All'] : newFilter;
      }
    });
  };

  const FilterPopover = ({ title, options, selectedFilters, onFilterChange }) => (
    <Popover placement="bottom-start">
      <PopoverHandler>
        <div className="flex items-center cursor-pointer">
         {title}
         <FaFilter className="text-gray-700
           text-xs" />
        </div>
      </PopoverHandler>
      <PopoverContent className="p-2 z-10">
        {options.map((option) => (
          <div key={option.value} className="flex items-center mb-2">
            <Checkbox
              color="blue"
              checked={selectedFilters.includes(option.value)}
              onChange={() => onFilterChange(option.value)}
            />
            <Typography color="blue-gray" className="font-medium ml-2">
              {option.label}
            </Typography>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );

  const typeOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'TOP', label: 'Top' },
  { value: 'BOTTOM', label: 'Bottom' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'BACKGROUND', label: 'Background' },
  { value: 'BANNER', label: 'Banner' },
  { value: 'STATS', label: 'Stats' },
  { value: 'TOP_NEW', label: 'Top New'},
  { value: 'MIDCAROUSEL', label: 'Mid Carousel'},
  { value: 'PROMOTION', label: 'Promotion'},
  { value: 'BOTTOM_NEW', label: 'Bottom New'},
  { value: 'NEW_CUSTOMER', label: 'New Customer' },
];

  const zoneOptions = [
    { value: 'All', label: 'All'},
    { value: 'Chennai', label: 'Chennai' },
    { value: 'Thiruvannamali', label: 'Thiruvannamali' },
    { value: 'Vellore', label: 'Vellore' },
    { value: 'Kanchipuram', label: 'Kanchipuram' },
  ];

  // Client-side filtering remains as a fallback
  const filteredBannerList = bannerList.filter(item =>
    (typeFilter.includes('All') || typeFilter.includes(item.type)) &&
    (zoneFilter.includes('All') || zoneFilter.includes(item.zone))
  );

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="flex items-center justify-end">
        <button
          onClick={() => navigate('/dashboard/user/bannerimg/add')}
          className="ml-4 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-700"
        >
          Add New
        </button>
      </div>

      <Card className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <CardHeader className="mb-8 p-6 flex justify-between items-center bg-primary">
          <Typography variant="h6" color="white">Banner List</Typography>
        </CardHeader>

        <CardBody className="overflow-x-auto px-0 pt-0 pb-4">
          <div className="px-6 pb-4 flex items-center justify-between">
            <div className="inline-flex rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setStatusTab('active')}
                className={`px-4 py-1 text-sm font-medium rounded-full transition-colors ${
                  statusTab === 'active' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Active 
                {/* ({activeCount}) */}
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('inactive')}
                className={`px-4 py-1 text-sm font-medium rounded-full transition-colors ${
                  statusTab === 'inactive' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Inactive 
                {/* ({inactiveCount}) */}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Spinner className="h-10 w-10" />
            </div>
          ) : (
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr className=" text-black">
                  <th className="py-3 px-5 text-left text-gray-700">Image</th>
                 <th className="py-3 px-5 text-left">
                    <FilterPopover
                      title={<span className="text-base font-semibold text-gray-700">Type</span>}
                      options={typeOptions}
                      selectedFilters={typeFilter}
                      onFilterChange={(value) => handleFilterChange('type', value)}
                    />
                  </th>
                  <th className="py-3 px-5 text-left  text-gray-700">Redirect URL</th>
                  <th className="py-3 px-5 text-left  text-gray-700">From Date</th>
                  <th className="py-3 px-5 text-left  text-gray-700">To Date</th>
                  <th className="py-3 px-5 text-left  text-gray-700">Status</th>
                  <th className="py-3 px-5 text-left  text-gray-700">Position</th>
                  <th className="py-3 px-5 text-left  text-gray-700">
                  <FilterPopover
                      title={<span className="text-base font-semibold text-gray-700">Zone</span>}
                      options={zoneOptions}
                      selectedFilters={zoneFilter}
                      onFilterChange={(value) => handleFilterChange('zone', value)}
                    />
                  </th>
                  <th className="py-3 px-5 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {filteredBannerList.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No Banner Records Found
                    </td>
                  </tr>
                ) : (
                  filteredBannerList.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-5">
                        <img
                          src={item.imageUrl}
                          alt="banner"
                          className="w-32 h-auto rounded-xl"
                        />
                      </td>
                      <td className="py-3 px-5">{item.type || '-'}</td>
                      <td className="py-3 px-5">{item.redirectUrl || '-'}</td>
                      <td className="py-3 px-5">
                        {item.fromDate ? moment(item.fromDate).format('DD-MM-YYYY') : '-'}
                      </td> 
                      <td className="py-3 px-5">
                        {item.toDate ? moment(item.toDate).format('DD-MM-YYYY') : '-'}
                      </td>
                      <td className="py-3 px-5">
                        <Switch
                          color="blue"
                          checked={item.status}
                          onChange={() => handleStatusToggle(item.id, !item.status)}
                          disabled={updatingBannerId === item.id}
                          label={item.status ? 'Active' : 'Inactive'}
                        />
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center">
                          <Input
                            type="number"
                            className="w-12 h-10 border border-gray-300 rounded-md text-center mx-auto"
                            value={item.id === editingPositionId ? (positionValues[item.id] ?? item.position) : item.position}
                            onChange={(e) => handlePositionChange(item.id, e.target.value)}
                            disabled={editingPositionId !== item.id}
                          />
                          <Button
                            size="sm"
                            color="blue"
                            variant="gradient"
                            className="ml-2"
                            onClick={() => {
                              if (editingPositionId === item.id) {
                                const newPositionValue = positionValues[item.id] ?? item.position;
                                const newPosition = newPositionValue !== undefined && newPositionValue !== null
                                  ? String(newPositionValue).trim()
                                  : '';

                                if (newPosition === '') {
                                  setPositionErrorById(prev => ({
                                    ...prev,
                                    [item.id]: 'Position is required',
                                  }));
                                  return;
                                }

                                const isDuplicate = bannerList.some(b =>
                                  b.id !== item.id &&
                                  b.type === item.type &&
                                  String(b.position) === newPosition
                                );

                                if (isDuplicate) {
                                  setPositionErrorById(prev => ({
                                    ...prev,
                                    [item.id]: `Another ${item.type} banner already uses position ${newPosition}`,
                                  }));
                                  return;
                                }

                                setPositionErrorById(prev => ({
                                  ...prev,
                                  [item.id]: '',
                                }));

                                positionUpdate(item.id);
                              } else {
                                setEditingPositionId(item.id);
                              }
                            }}
                          >
                            {editingPositionId === item.id ? 'Update' : 'Edit'}
                          </Button>
                        </div>
                        {positionErrorById[item.id] && (
                          <p className="mt-1 text-xs text-red-500 text-center">
                            {positionErrorById[item.id]}
                          </p>
                        )}
                      </td>
                       <td className="py-3 px-5">
                        {item.zone}
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

export default BannerView;