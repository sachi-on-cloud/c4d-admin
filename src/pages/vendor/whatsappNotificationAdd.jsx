import React, { useEffect, useState } from 'react';
import { Formik, Field, ErrorMessage, Form } from 'formik';
import { Button } from '@material-tailwind/react';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';


const WhatsappNotificationApp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [serviceAreas, setServiceAreas] = useState([]);
  // const [templates, setTemplates] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  // const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isLoadingDiscounts, setIsLoadingDiscounts] = useState(false);
  const [error, setError] = useState(null);

  // Initial form values
  const initialValues = {
    discountId: '',
    templateId: '',
    message: '',
    serviceType: '',
    title: '',
    description: '',
    percentage: '',
    startDate: '',
    endDate: '',
    isActive: true,
    serviceArea: '',
  };

  // Fetch service areas, templates, and discounts
  useEffect(() => {
    const fetchGeoData = async () => {
      setIsLoadingAreas(true);
      try {
        const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST, {
          type: 'Service Area',
        });
        setServiceAreas(response?.data);
      } catch (error) {
        console.error('Error fetching GEO_MARKINGS_LIST:', error);
        setError('Failed to load service areas. Please try again.');
        setServiceAreas([]);
      } finally {
        setIsLoadingAreas(false);
      }
    };

    // const fetchTemplates = async () => {
    //   setIsLoadingTemplates(true);
    //   try {
    //     const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.TEMPLATES_LIST);
    //     setTemplates (response?.data);
    //   } catch (error) {
    //     console.error('Error fetching TEMPLATES_LIST:', error);
    //     setError('Failed to load templates. Please try again.');
    //     setTemplates([]);
    //   } finally {
    //     setIsLoadingTemplates(false);
    //   }
    // };

    const fetchDiscounts = async () => {
      setIsLoadingDiscounts(true);
      try {
        // const res = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DISCOUNT);
        setDiscounts(res?.data);
      } catch (error) {
        console.error('Failed to fetch discount list:', error);
        setError('Failed to load discounts. Please try again.');
        setDiscounts([]);
      } finally {
        setIsLoadingDiscounts(false);
      }
    };

    fetchGeoData();
    // fetchTemplates();
    fetchDiscounts();
  }, [location.state]);

  // Map options for react-select
  const ZONE_OPTIONS = serviceAreas.map((area) => ({
    value: area.name,
    label: area.name,
  }));

  // const TEMPLATE_OPTIONS = templates.map((template) => ({
  //   value: template.id,
  //   label: template.name,
  // }));

  const DISCOUNT_OPTIONS = discounts.map((discount) => ({
    value: discount.id,
    label: discount.serviceType,
  }));

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    const serviceTypeMap = {
      RENTAL_DROP_TAXI: 'RENTAL',
      RENTAL_HOURLY_PACKAGE: 'RENTAL',
    };
    const payload = {
      discountId: values.discountId || undefined,
      templateId: values.templateId || undefined,
      message: values.message?.trim() || undefined,
      serviceType: serviceTypeMap[values.serviceType] || values.serviceType?.trim() || undefined,
      percentage: values.percentage ? parseFloat(values.percentage) : undefined,
      startDate: values.startDate
        ? new Date(values.startDate).toISOString().split('T')[0]
        : undefined,
      endDate: values.endDate
        ? new Date(values.endDate).toISOString().split('T')[0]
        : undefined,
      isActive: values.isActive,
      title: values.title?.trim() || undefined,
      description: values.description?.trim() || undefined,
      serviceArea: values.serviceArea || undefined,
    };

    try {
      console.log('POST payload:', payload);
      const res = await ApiRequestUtils.post(API_ROUTES.POST_DISCOUNT, payload);
      console.log('DISCOUNT RESPONSE:', res);
      navigate('/dashboard/vendors/whatsappNotificationList');
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      setStatus({ error: 'Failed to submit the form. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add WhatsApp Notification</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <Formik
        initialValues={initialValues}
        // validationSchema={}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values, status }) => (
          <Form className="space-y-6">
            {status?.error && <div className="text-red-500">{status.error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="discountId" className="text-sm font-medium text-gray-700">
                  Discount
                </label>
                <Select
                  name="discountId"
                  options={DISCOUNT_OPTIONS}
                  isLoading={isLoadingDiscounts}
                  value={
                    values.discountId
                      ? {
                          value: values.discountId,
                          label: DISCOUNT_OPTIONS.find((d) => d.value === values.discountId)?.label || '',
                        }
                      : null
                  }
                  onChange={(selectedOption) => {
                    const discountId = selectedOption ? selectedOption.value : '';
                    setFieldValue('discountId', discountId);
                    if (selectedOption) {
                      const selectedDiscount = discounts.find((d) => d.id === discountId);
                      if (selectedDiscount) {
                        setFieldValue('serviceType', selectedDiscount.serviceType || '');
                        setFieldValue('title', selectedDiscount.title || '');
                        setFieldValue('description', selectedDiscount.description || '');
                        setFieldValue('percentage', selectedDiscount.percentage || '');
                        setFieldValue(
                          'startDate',
                          selectedDiscount.startDate
                            ? new Date(selectedDiscount.startDate).toISOString().slice(0, 16)
                            : '',
                        );
                        setFieldValue(
                          'endDate',
                          selectedDiscount.endDate
                            ? new Date(selectedDiscount.endDate).toISOString().slice(0, 16)
                            : '',
                        );
                        setFieldValue('isActive', selectedDiscount.isActive ?? true);
                        setFieldValue('serviceArea', selectedDiscount.serviceArea || '');
                      }
                    } else {
                      setFieldValue('serviceType', '');
                      setFieldValue('title', '');
                      setFieldValue('description', '');
                      setFieldValue('percentage', '');
                      setFieldValue('startDate', '');
                      setFieldValue('endDate', '');
                      setFieldValue('isActive', true);
                      setFieldValue('serviceArea', '');
                    }
                  }}
                  placeholder="Select Discount"
                  className="mt-1"
                  isDisabled={isLoadingDiscounts || error}
                  isClearable
                />
                <ErrorMessage
                  name="discountId"
                  className="text-red-500 text-sm mt-1"
                  component="div"
                />
              </div>
              {/* <div>
                <label htmlFor="templateId" className="text-sm font-medium text-gray-700">
                  Template (Optional)
                </label>
                <Select
                  id="templateId"
                  name="templateId"
                  options={TEMPLATE_OPTIONS}
                  isLoading={isLoadingTemplates}
                  value={
                    values.templateId
                      ? {
                          value: values.templateId,
                          label: TEMPLATE_OPTIONS.find((t) => t.value === values.templateId)?.label || '',
                        }
                      : null
                  }
                  onChange={(selectedOption) => {
                    setFieldValue('templateId', selectedOption ? selectedOption.value : '');
                  }}
                  placeholder="Select Template"
                  className="mt-1"
                  isDisabled={isLoadingTemplates || error}
                  isClearable
                />
                <ErrorMessage
                  name="templateId"
                  className="text-red-500 text-sm mt-1"
                  component="div"
                />
              </div> */}
              <div>
                <label htmlFor="serviceType" className="text-sm font-medium text-gray-700">
                  Service Type
                </label>
                <Field
                  as="select"
                  name="serviceType"
                  className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Service Type</option>
                  <option value="DRIVER">Driver</option>
                  <option value="RIDES">Rides</option>
                  <option value="RENTAL_HOURLY_PACKAGE">Hourly Package</option>
                  <option value="RENTAL_DROP_TAXI">Drop Taxi</option>
                  <option value="RENTAL">Outstation</option>
                  <option value="AUTO">Auto</option>
                  <option value="ALL">All</option>
                </Field>
                <ErrorMessage
                  name="serviceType"
                  className="text-red-500 text-sm mt-1"
                  component="div"
                />
              </div>
              <div>
                <label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Title
                </label>
                <Field
                  type="text"
                  name="title"
                  className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage
                  name="title"
                  className="text-red-500 text-sm mt-1"
                  component="div"
                />
              </div>
              <div>
                <label htmlFor="percentage" className="text-sm font-medium text-gray-700">
                  Discount Percentage (%)
                </label>
                <Field
                  type="number"
                  name="percentage"
                  className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage
                  name="percentage"
                  className="text-red-500 text-sm mt-1"
                  component="div"
                />
              </div>
              <div>
                <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                  Start Date & Time
                </label>
                <Field
                  type="datetime-local"
                  name="startDate"
                  className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage
                  name="startDate"
                  className="text-red-500 text-sm mt-1"
                  component="div"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                  End Date & Time
                </label>
                <Field
                  type="datetime-local"
                  name="endDate"
                  className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage
                  name="endDate"
                  className="text-red-500 text-sm mt-1"
                  component="div"
                />
              </div>
              <div>
                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <Field
                  as="textarea"
                  name="description"
                  className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  rows="4"
                />
                <ErrorMessage
                  name="description"
                  className="text-red-500 text-sm mt-1"
                  component="div"
                />
              </div>
              <div>
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <Field
                  as="select"
                  name="isActive"
                  className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </Field>
                <ErrorMessage
                  name="isActive"
                  className="text-red-500 text-sm mt-1"
                  component="div"
                />
              </div>
              <div>
                <label htmlFor="serviceArea" className="text-sm font-medium text-gray-700">
                  Select Service Area (Optional)
                </label>
                <Select
                  name="serviceArea"
                  options={ZONE_OPTIONS}
                  isLoading={isLoadingAreas}
                  value={
                    values.serviceArea
                      ? { value: values.serviceArea, label: values.serviceArea }
                      : null
                  }
                  onChange={(selectedOption) => {
                    setFieldValue('serviceArea', selectedOption ? selectedOption.value : '');
                  }}
                  placeholder="Select Service Area"
                  className="mt-1"
                  isDisabled={isLoadingAreas || error}
                  isClearable
                />
                <ErrorMessage
                  name="serviceArea"
                  className="text-red-500 text-sm mt-1"
                  component="div"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                className={`px-8 rounded-xl ${ColorStyles.backButton}`}
                onClick={() => navigate('/dashboard/vendors/whatsappNotificationList')}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 rounded-xl ${ColorStyles.continueButtonColor}`}
              >
                {isSubmitting ? 'Submitting...' : 'Add'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default WhatsappNotificationApp;