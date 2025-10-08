import React, { useState, useEffect, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ColorStyles, API_ROUTES, QUANTITY_TYPE, STATUS_OPTIONS } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import Select from 'react-select';

const validationSchema = Yup.object({
  quantityType: Yup.string().required('Quantity Type is required'),
  categoryType: Yup.string().required('Category Type is required'),
  name: Yup.string().required('Name is required'),
  status: Yup.string().required('Status is required'),
  zone: Yup.string().required('Zone is required'),
});

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);

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

  const fetchCategories = async () => {
    try {
      const response = await ApiRequestUtils.get(API_ROUTES.GET_CATEGORY);
      if (!response?.data || !Array.isArray(response.data)) {
        throw new Error('Invalid categories response');
      }
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories.');
    } 
  };

  const fetchProduct = async () => {
    if (!id) {
      setError('Invalid product ID.');
      return;
    }
    try {
      const response = await ApiRequestUtils.get(`${API_ROUTES.GET_PRODUCTS}?productId=${id}`);
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        setProduct(response.data[0]);
      } else {
        setError('No product found for the provided ID.');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product data.');
    } 
  };

  useEffect(() => {
    fetchCategories();
    fetchGeoData();
    fetchProduct();
  }, [id]);

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

  const initialValues = {
    categoryType: product?.Category?.type || '',
    name: product?.name || '',
    quantityType: product?.quantityType || '',
    status: product?.status || '',
    zone: product?.zone || '',
    zoneId: product?.zoneId || '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const selectedCategory = categories.find((category) => category.Category?.type === values.categoryType);
      const categoryId = selectedCategory?.Category?.id || product?.Category?.id;
      
      const selectedZoneId = values.zone === 'All' ? '' : serviceAreas.find((area) => area.name === values.zone)?.id || '';
      if (values.zone !== 'All' && !selectedZoneId) {
        setError('Selected zone is invalid.');
        setSubmitting(false);
        return;
      }

      const payload = {
        categoryId,
        quantityType: values.quantityType.trim(),
        name: values.name.trim(),
        status: values.status.trim(),
        zone: values.zone.trim(),
        zoneId: selectedZoneId,
      };

      const response = await ApiRequestUtils.update(`${API_ROUTES.UPDATE_PRODUCTS}/${id}`, payload);
      if (response?.success) {
        navigate('/dashboard/inventory/product-list');
      } else {
        setError(response?.error || 'Product update failed.');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (isDirty) => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        navigate('/dashboard/inventory/product-list');
      }
    } else {
      navigate('/dashboard/inventory/product-list');
    }
  };

  return (
    <div className="p-4 mx-auto max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ isSubmitting, isDirty, setFieldValue, values }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="categoryType" className="text-sm font-medium text-gray-700">
                  Category Type
                </label>
                <Field
                  as="select"
                  id="categoryType"
                  name="categoryType"
                  className="p-2 w-full rounded-md border border-gray-300 shadow-sm"
                  disabled
                  aria-label="Category Type"
                >
                  <option value="">Select a Category</option>
                  {categories.map((category, index) => (
                    <option key={category.Category?.id || `category-${index}`} value={category.Category?.type}>
                      {category.Category?.name || category.Category?.type || 'Unnamed Category'}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="categoryType" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <Field
                  id="name"
                  type="text"
                  name="name"
                  className="p-2 w-full rounded-md border border-gray-300 shadow-sm"
                  aria-label="Product Name"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="quantityType" className="text-sm font-medium text-gray-700">
                  Quantity Type
                </label>
                <Field
                  as="select"
                  id="quantityType"
                  name="quantityType"
                  className="p-2 w-full rounded-md border border-gray-300 shadow-sm"
                  aria-label="Quantity Type"
                >
                  <option value="">Select a Quantity Type</option>
                  {QUANTITY_TYPE.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="quantityType" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <Field
                  as="select"
                  id="status"
                  name="status"
                  className="p-2 w-full rounded-md border border-gray-300 shadow-sm"
                  aria-label="Status"
                >
                  <option value="">Select a Status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="zone" className="text-sm font-medium text-gray-700">
                  Zone
                </label>
                <Select
                  inputId="zone"
                  options={ZONE_OPTIONS}
                  onChange={(selectedOption) => setFieldValue('zone', selectedOption?.value || '')}
                  value={ZONE_OPTIONS.find((option) => option.value === values.zone) || null}
                  placeholder="Select Zone"
                  className="w-full"
                  aria-label="Zone"
                />
                <ErrorMessage name="zone" component="div" className="text-red-500 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                onClick={() => handleCancel(isDirty)}
                className={`py-2 px-4 rounded-xl ${ColorStyles.backButton}`}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                color="black"
                className={`py-2 px-4 rounded-xl ${ColorStyles.continueButtonColor}`}
              >
                {isSubmitting ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditProduct;