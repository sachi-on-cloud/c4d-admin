import React, { useState, useEffect, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import { ColorStyles, API_ROUTES, QUANTITY_TYPE } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import Select from 'react-select';

const validationSchema = Yup.object({
  quantityType: Yup.string().required('Quantity Type is required'),
  categoryType: Yup.string().required('Category Type is required'),
  name: Yup.string().required('Name is required'),
  zone: Yup.string().required('Zone is required'),
});

const AddProduct = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
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

  const fetchCategoryList = async () => {
    try {
      const response = await ApiRequestUtils.get(API_ROUTES.GET_CATEGORY);
      if (!response?.data || !Array.isArray(response.data)) {
        throw new Error('Invalid categories response');
      }
      setCategoryItems(response.data);
    } catch (err) {
      console.error('API error:', err);
      setError('Failed to fetch categories. Please try again.');
    }
  };

  useEffect(() => {
    fetchGeoData();
    fetchCategoryList();
  }, []);

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
    quantityType: '',
    categoryType: '',
    name: '',
    zone: '',
    zoneId: '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const selectedCategory = categoryItems.find(
        (category) => category.Category?.type === values.categoryType
      );
      const categoryId = selectedCategory?.Category?.id || null;

      if (!categoryId) {
        setError('Selected category is invalid.');
        setSubmitting(false);
        return;
      }

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
        zone: values.zone.trim(),
        zoneId: selectedZoneId,
      };

      const response = await ApiRequestUtils.post(API_ROUTES.POST_PRODUCTS, payload);
      if (response?.success) {
        navigate('/dashboard/inventory/product-list');
      } else {
        setError(response?.error || 'Product creation failed.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 mx-auto max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Add Product</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
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
                >
                  <option value="">Select a Category</option>
                  {categoryItems.map((category) => (
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
                  className="p-2 w-full rounded-md border-gray-300 shadow-sm"
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
                >
                  <option value="">Select a Quantity Type</option>
                  {QUANTITY_TYPE.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="quantityType" component="div" className="text-red-500 text-sm" />
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
                />
                <ErrorMessage name="zone" component="div" className="text-red-500 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                className={`py-2 px-4 rounded-xl ${ColorStyles.backButton}`}
                onClick={() => navigate('/dashboard/inventory/product-list')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                color="black"
                className={`py-2 px-4 rounded-xl ${ColorStyles.continueButtonColor}`}
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddProduct;