import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@material-tailwind/react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import moment from 'moment';

const validationSchema = Yup.object({
  productId: Yup.string().required('Product Type is required'),
  entryAt: Yup.string().required('Date is required'),
  totalStock: Yup.number().required('Total Stock is required'),
  premiumStock: Yup.number().required('Premium Stock is required'),
  regularStock: Yup.number().required('Regular Stock is required'),
  wasteStock: Yup.number().required('Waste Stock is required'),
});

const AddQuantity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [productItems, setProductItems] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [error, setError] = useState(null);
  const selectedProductId = location.state?.productId || '';

  const initialValues = {
    productId: selectedProductId,
    zone: '',
    entryAt: '',
    totalStock: '',
    premiumStock: '',
    regularStock: '',
    wasteStock: '',
  };

  // Fetch products
  const fetchProductList = async () => {
    try {
      const data = await ApiRequestUtils.get(API_ROUTES.GET_PRODUCTS);
      setProductItems(data.data || []);
    } catch (err) {
      console.error('API error fetching products:', err);
      setError('Failed to fetch products.');
    }
  };

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

  useEffect(() => {
    fetchProductList();
    fetchGeoData();
  }, []);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const selectedProduct = productItems.find((product) => product.id === values.productId);
      if (!selectedProduct) {
        throw new Error('Selected product does not exist.');
      }

      const selectedZone = serviceAreas.find((area) => area.name === values.zone);
      if (!selectedZone) {
        throw new Error('Selected zone does not exist.');
      }

      const formattedDateTime = moment(values.entryAt).format('YYYY-MM-DD HH:mm:ss.SSSZ');
      const payload = {
        productId: values.productId,
        zone: values.zone,
        entryAt: formattedDateTime,
        totalStock: parseInt(values.totalStock),
        premiumStock: parseInt(values.premiumStock),
        regularStock: parseInt(values.regularStock),
        wasteStock: parseInt(values.wasteStock),
      };

      const response = await ApiRequestUtils.post(
        `${API_ROUTES.POST_STOCK}/${values.productId}/stocks`,
        payload
      );

      if (response?.success) {
        navigate('/dashboard/inventory/quantity-list');
      } else {
        throw new Error(response?.error || 'Failed to add stock.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to add stock.');
      setFieldError('productId', err.message || 'Failed to add stock.');
    } finally {
      setSubmitting(false);
    }
  };

  // Product name options for the select dropdown
  const PRODUCT_NAME_OPTIONS = productItems.map((product) => ({
    value: product.id,
    label: product.name || 'Unnamed Product',
  }));

  // Zone options for the select dropdown
  const ZONE_OPTIONS = serviceAreas.map((area) => ({
    value: area.name,
    label: area.name,
  }));

  return (
    <div className="p-4 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Stock</h2>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Zone</label>
                <Select
                  options={ZONE_OPTIONS}
                  value={ZONE_OPTIONS.find((option) => option.value === values.zone) || null}
                  onChange={(selectedOption) => setFieldValue('zone', selectedOption ? selectedOption.value : '')}
                  placeholder="Select Zone"
                  className="w-full"
                  isClearable
                />
                <ErrorMessage name="zone" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Product Name</label>
                <Select
                  options={PRODUCT_NAME_OPTIONS}
                  value={PRODUCT_NAME_OPTIONS.find((option) => option.value === values.productId) || null}
                  onChange={(selectedOption) => setFieldValue('productId', selectedOption ? selectedOption.value : '')}
                  placeholder="Select Product Name"
                  className="w-full"
                  isClearable
                  isDisabled={!values.zone} // Disable until a zone is selected
                />
                <ErrorMessage name="productId" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <Field
                  type="datetime-local"
                  name="entryAt"
                  className="p-2 w-full rounded-md border border-gray-300 shadow-sm"
                />
                <ErrorMessage name="entryAt" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Total Stock</label>
                <Field
                  type="number"
                  name="totalStock"
                  className="p-2 w-full rounded-md border border-gray-300 shadow-sm"
                  min={0}
                />
                <ErrorMessage name="totalStock" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Premium Stock</label>
                <Field
                  type="number"
                  name="premiumStock"
                  className="p-2 w-full rounded-md border border-gray-300 shadow-sm"
                  min={0}
                />
                <ErrorMessage name="premiumStock" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Regular Stock</label>
                <Field
                  type="number"
                  name="regularStock"
                  className="p-2 w-full rounded-md border border-gray-300 shadow-sm"
                  min={0}
                />
                <ErrorMessage name="regularStock" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Waste Stock</label>
                <Field
                  type="number"
                  name="wasteStock"
                  className="p-2 w-full rounded-md border border-gray-300 shadow-sm"
                  min={0}
                />
                <ErrorMessage name="wasteStock" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                onClick={() => navigate('/dashboard/inventory/quantity-list')}
                className={`px-4 py-2 rounded-xl border-2 ${ColorStyles.backButton}`}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-xl border-2 ${ColorStyles.continueButtonColor}`}
              >
                Add
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddQuantity;