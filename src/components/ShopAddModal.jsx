import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Button,
  Input,
  Alert,
  Spinner,
  Textarea
} from "@material-tailwind/react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';

// Validation schema for shop addition
const ShopAddSchema = Yup.object().shape({
  shopName: Yup.string()
    .required('Shop name is required')
    .min(2, 'Shop name must be at least 2 characters'),
  shopAddress: Yup.string()
    .required('Shop address is required')
    .min(5, 'Shop address must be at least 5 characters'),
  shopContactName: Yup.string()
    .required('Contact name is required')
    .min(2, 'Contact name must be at least 2 characters'),
  shopContactPhone: Yup.string()
    .required('Contact phone is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  shopLandmark: Yup.string(),
  zone: Yup.string()
    .required('Zone is required'),
});

const ShopAddModal = ({ 
  isOpen, 
  onClose, 
  onShopAdded, 
  zoneOptions = [], 
  currentZone = '',
  searchLocations,
  handleSelectLocation 
}) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [localZoneOptions, setLocalZoneOptions] = useState([]);

  // Fetch zones from geo markings
  const fetchZonesFromGeoMarkings = useCallback(async () => {
    try {
      const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST, {});
      if (response?.success && response?.data) {
        // Filter for zones only
        const zones = response.data.filter(item => item.type === 'Service Area');
        const zoneOptions = zones.map(zone => ({
          value: zone.name,
          label: zone.name
        }));
        setLocalZoneOptions(zoneOptions);
      }
    } catch (error) {
      console.error('Error fetching zones from geo markings:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchZonesFromGeoMarkings();
    }
  }, [isOpen, fetchZonesFromGeoMarkings]);

  const initialValues = {
    shopName: '',
    shopAddress: '',
    shopContactName: '',
    shopContactPhone: '',
    shopLandmark: '',
    shopLocation: null,
    zone: currentZone || '',
  };

  const handleAddressSearch = useCallback(async (query) => {
    if (query.length > 2) {
      try {
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.SEARCH_ADDRESS, { address: query });
        if (data?.success && data?.data) {
          setAddressSuggestions(data.data);
        }
      } catch (error) {
        console.error('Error searching addresses:', error);
      }
    } else {
      setAddressSuggestions([]);
    }
  }, []);

  const handleAddressSelect = async (address, setFieldValue) => {
    try {
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_LATLONG, { address });
      if (data?.success) {
        const location = { lat: data.data.lat, lng: data.data.lng };
        setFieldValue('shopAddress', address);
        setFieldValue('shopLocation', location);
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setAlert({ show: false, message: '', type: 'success' });

    try {
      const shopData = {
        shopName: values.shopName.trim(),
        shopLat: values.shopLocation?.lat || 0,
        shopLong: values.shopLocation?.lng || 0,
        shopAddress: { name: values.shopAddress.trim() },
        shopLocation: values.shopAddress.trim(),
        shopLandmark: values.shopLandmark.trim(),
        shopContactName: values.shopContactName.trim(),
        shopContactPhone: values.shopContactPhone.trim(),
        shopZone: values.zone,
      };

      const response = await ApiRequestUtils.post(API_ROUTES.ADD_SHOP_ADDRESS, shopData);
      
      if (response?.success) {
        setAlert({ 
          show: true, 
          message: 'Shop added successfully!', 
          type: 'success' 
        });
        
        // Notify parent component about new shop
        if (onShopAdded) {
          onShopAdded(response.data || shopData);
        }
        
        // Reset form and close modal after a short delay
        setTimeout(() => {
          resetForm();
          setAlert({ show: false, message: '', type: 'success' });
          onClose();
        }, 1500);
      } else {
        throw new Error(response?.message || 'Failed to add shop');
      }
    } catch (error) {
      console.error('Error adding shop:', error);
      setAlert({ 
        show: true, 
        message: error.message || 'Failed to add shop. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setAlert({ show: false, message: '', type: 'success' });
    setAddressSuggestions([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} handler={handleClose} size="lg" className="bg-white shadow-lg">
      <DialogHeader className="bg-blue-600 text-white rounded-t-lg">
        <Typography variant="h5" className="text-white">
          Add New Shop
        </Typography>
      </DialogHeader>

      <Formik
        initialValues={initialValues}
        validationSchema={ShopAddSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ setFieldValue, values, isSubmitting }) => (
          <Form>
            <DialogBody className="space-y-4 max-h-96 overflow-y-auto">
              {alert.show && (
                <Alert 
                  color={alert.type === 'success' ? 'green' : 'red'} 
                  className="mb-4"
                >
                  {alert.message}
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shop Name */}
                <div>
                  <Typography variant="small" className="mb-1 font-medium text-gray-700">
                    Shop Name <span className="text-red-500">*</span>
                  </Typography>
                  <Field name="shopName">
                    {({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter shop name"
                        className="w-full"
                      />
                    )}
                  </Field>
                  <ErrorMessage name="shopName" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {/* Zone Selection */}
                <div>
                  <Typography variant="small" className="mb-1 font-medium text-gray-700">
                    Zone <span className="text-red-500">*</span>
                  </Typography>
                  <Field name="zone">
                    {({ field }) => (
                      <select
                        {...field}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Zone</option>
                        {(localZoneOptions.length > 0 ? localZoneOptions : zoneOptions).map((zone, index) => {
                          const zoneValue = typeof zone === 'string' ? zone : (zone.value || zone.name);
                          const zoneLabel = typeof zone === 'string' ? zone : (zone.label || zone.name || zone.value);
                          return (
                            <option key={index} value={zoneValue}>
                              {zoneLabel}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </Field>
                  <ErrorMessage name="zone" component="div" className="text-red-500 text-xs mt-1" />
                </div>
              </div>

              {/* Shop Address */}
              <div>
                <Typography variant="small" className="mb-1 font-medium text-gray-700">
                  Shop Address <span className="text-red-500">*</span>
                </Typography>
                <div className="relative">
                  <Field name="shopAddress">
                    {({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter shop address"
                        className="w-full"
                        onChange={(e) => {
                          setFieldValue('shopAddress', e.target.value);
                          setFieldValue('shopLocation', null);
                          handleAddressSearch(e.target.value);
                        }}
                      />
                    )}
                  </Field>
                  {addressSuggestions.length > 0 && (
                    <ul className="border rounded-lg bg-white mt-2">
                      {addressSuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="p-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleAddressSelect(suggestion, setFieldValue)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <ErrorMessage name="shopAddress" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              {/* Landmark */}
              <div>
                <Typography variant="small" className="mb-1 font-medium text-gray-700">
                  Landmark (Optional)
                </Typography>
                <Field name="shopLandmark">
                  {({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter nearby landmark"
                      className="w-full"
                    />
                  )}
                </Field>
                <ErrorMessage name="shopLandmark" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Name */}
                <div>
                  <Typography variant="small" className="mb-1 font-medium text-gray-700">
                    Contact Name <span className="text-red-500">*</span>
                  </Typography>
                  <Field name="shopContactName">
                    {({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter contact person name"
                        className="w-full"
                      />
                    )}
                  </Field>
                  <ErrorMessage name="shopContactName" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {/* Contact Phone */}
                <div>
                  <Typography variant="small" className="mb-1 font-medium text-gray-700">
                    Contact Phone <span className="text-red-500">*</span>
                  </Typography>
                  <Field name="shopContactPhone">
                    {({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter 10-digit phone number"
                        maxLength="10"
                        className="w-full"
                      />
                    )}
                  </Field>
                  <ErrorMessage name="shopContactPhone" component="div" className="text-red-500 text-xs mt-1" />
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="space-x-2">
              <Button 
                variant="text" 
                color="gray" 
                onClick={handleClose}
                disabled={loading || isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                color="blue"
                disabled={loading || isSubmitting}
                className="flex items-center gap-2"
              >
                {(loading || isSubmitting) && <Spinner className="h-4 w-4" />}
                {loading || isSubmitting ? 'Adding Shop...' : 'Add Shop'}
              </Button>
            </DialogFooter>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default ShopAddModal;