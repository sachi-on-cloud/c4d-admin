import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import Select from 'react-select';

const AddBanner = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [serviceAreas, setServiceAreas] = useState([]);

  const initialValues = {
    fromDate: '',
    toDate: '',
    redirectUrl: '',
    status: true,
    type: '',
    image: null,
    zone: [],
  };

  const fetchGeoData = async () => {
  try {
    const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST, {
      type: 'Service Area',
    });
 setServiceAreas(response?.data);// Ensure serviceAreas is always an array
  } catch (error) {
    console.error('Error fetching GEO_MARKINGS_LIST:', error);
    setError('Failed to fetch service areas. Please try again.');
  }
};

  useEffect(() => {
    fetchGeoData();
  }, []);

  const ZONE_OPTIONS = [
    { value: 'All', label: 'All' },
    ...serviceAreas.map((area) => ({
      value: area.name,
      label: area.name,
    })),
  ];

  const validationSchema = Yup.object().shape({
    // status: Yup.boolean().required('Status is required'),
    type: Yup.string().required('Type is required'),
    image: Yup.mixed()
      .required('Image is required')
      .test('fileType', 'Only JPEG or PNG files are allowed', (value) =>
        value ? ['image/jpeg', 'image/png','image/gif'].includes(value.type) : false
      ),
      fromDate: Yup.string().required('Start Date is required'),
      toDate: Yup.string().required('End Date is required'),
      zone: Yup.mixed().required('Zone is required')
  });

  const handleImageUpload = (file, setFieldValue) => {
    const validTypes = ['image/jpeg', 'image/png','image/gif'];
    if (!file || !validTypes.includes(file.type)) {
      alert('Only JPEG and PNG images are allowed.');
      return;
    }

    setFieldValue('image', file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // console.log('Sending image:', values.image?.name, values.image?.type);

      const formData = new FormData();
      formData.append('fromDate', values.fromDate);
      formData.append('toDate', values.toDate);
      formData.append('redirectUrl', values.redirectUrl.trim());
      formData.append('status', values.status === 'true' || values.status === true);
      formData.append('type', values.type.trim());
      formData.append('zone', JSON.stringify(values.zone.includes['All'] ? ['All'] : values.zone));
      formData.append('image', values.image, values.image.name);
      formData.append('fileTypeImage', values.image?.type || '');
      formData.append('extImage', values.image?.name?.split('.').pop()?.toLowerCase() || '');
      const response = await ApiRequestUtils.postDocs(API_ROUTES.POST_BANNER, formData);
      if (response?.success) {
        navigate('/dashboard/user/bannerimgView');
      } else {
        setError(response?.error || 'Banner upload failed.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Banner</h2>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values,setFieldValue }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="text-sm font-medium text-gray-700">From Date</label>
                <Field name="fromDate" type="date" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" />
                <ErrorMessage name="fromDate" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">To Date</label>
                <Field name="toDate" type="date" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" />
                <ErrorMessage name="toDate" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Redirect URL</label>
                <Field name="redirectUrl" type="text" className="p-2 w-full rounded-md border border-gray-300 shadow-sm" />
                <ErrorMessage name="redirectUrl" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <Field as="select" name="type" className="p-2 w-full rounded-md border border-gray-300 shadow-sm">
                  <option value="">select the Type</option>
                  <option value="TOP">Top</option>
                  <option value="BOTTOM">Bottom</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="BACKGROUND">Background</option>
                  <option value="BANNER">Banner</option>
                  <option value="STATS">Stats</option>
                </Field>
                <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Field as="select" name="status" className="p-2 w-full rounded-md border border-gray-300 shadow-sm">
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </Field>
                <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label htmlFor="zone" className="text-sm font-medium text-gray-700">
                  Zone
                </label>
                <Select
                  name="zone"
                  options={ZONE_OPTIONS}
                  isMulti
                  value={values.zone.map((val) => ({ value: val, label: val }))}
                  onChange={(selectedOptions) => {
                    const selectedValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                    if (selectedValues.includes['All'] && selectedValues.length > 1) {
                      setFieldValue('zone', ['All']);
                    } else if (selectedValues.includes('All')) {
                      setFieldValue('zone', ['All']);
                    } else {
                      setFieldValue('zone', selectedValues);
                    }
                  }}
                  placeholder="Select service Area"
                  className="mt-1"
                />
                <ErrorMessage name="zone" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label htmlFor="image" className="text-sm font-medium text-gray-700">
                  Image
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover mb-2 border" />
                )}
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  className="p-2 w-full rounded-md border border-gray-300 shadow-sm"
                  onChange={(e) => handleImageUpload(e.currentTarget.files[0], setFieldValue)}
                />
                <ErrorMessage name="image" component="div" className="text-red-500 text-sm" />
              </div>
            </div>

            <div className="flex flex-row">
              <Button
                fullWidth
                type="button"
                onClick={() => navigate('/dashboard/user/bannerimgView')}
                className={`my-6 mx-2 border-2 rounded-xl ${ColorStyles.backButton}`}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                type="submit"
                disabled={isSubmitting}
                color="black"
                className={`my-6 mx-2 border-2 rounded-xl ${ColorStyles.continueButtonColor}`}
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

export default AddBanner;