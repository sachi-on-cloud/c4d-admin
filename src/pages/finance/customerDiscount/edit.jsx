import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button, Alert, Spinner } from '@material-tailwind/react';
import Select from 'react-select';
import { ColorStyles, API_ROUTES } from '@/utils/constants';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { CUSTOMER_DISCOUNT_ADD_SCHEMA } from '@/utils/validations';
import { MOCK_CUSTOMER_OFFER_RECORDS } from '@/data/customerDiscountMocks';

const CustomerDiscountEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [initialValues, setInitialValues] = useState(null);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  const formatDateOnly = (isoString) => {
    return isoString ? isoString.slice(0, 10) : '';
  };

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GEO_MARKINGS_LIST, {
          type: 'Service Area',
        });
        setServiceAreas(response?.data || []);
      } catch (error) {
        console.error('Error fetching GEO_MARKINGS_LIST:', error);
      }
    };
    fetchGeoData();
  }, []);

  const ZONE_OPTIONS = [
    { value: 'All', label: 'All' },
    ...serviceAreas.map((area) => ({
      value: area.name,
      label: area.name,
    })),
  ];

  useEffect(() => {
    const discountFromState = location.state?.discount;

    const buildInitialValues = (data) => {
      const initialDiscountType = (() => {
        if (data.discountType) {
          const lower = data.discountType.toLowerCase();
          if (lower === 'isamount' || lower === 'amount' || lower === 'flat') return 'IsAmount';
          if (lower === 'percentage' || lower === 'percent') return 'percentage';
        }
        return Number(data.amount) > 0 ? 'IsAmount' : 'percentage';
      })();

      return {
        discountId: data.discountId || data.id,
        serviceType: data.serviceType || '',
        title: data.title || '',
        description: data.description || '',
        offerType: data.offerType || '',
        couponCode: data.couponCode || '',
        discountType: initialDiscountType,
        percentage: data.percentage || '',
        amount: data.amount || '',
        startDate: formatDateOnly(data.startDate),
        endDate: formatDateOnly(data.endDate),
        isActive: data.isActive ? 'true' : 'false',
        serviceArea: data.serviceArea
          ? data.serviceArea === 'All'
            ? ['All']
            : Array.isArray(data.serviceArea)
              ? data.serviceArea
              : [data.serviceArea]
          : [],
        cabType: data.cabType || '',
        isPremium: data.isPremium || false,
      };
    };

    const fetchDiscount = async () => {
      try {
        if (discountFromState) {
          setInitialValues(buildInitialValues(discountFromState));
        } else {
          const res = await ApiRequestUtils.get(API_ROUTES.GET_DISCOUNT);
          const list = res?.data || [];
          const data = list.find((d) => String(d.id) === String(id));
          if (!data) {
            throw new Error('Discount not found');
          }
          setInitialValues(buildInitialValues(data));
        }
      } catch (err) {
        console.error('Failed to load discount:', err);
        alert('Discount not found');
        navigate('/dashboard/users/customer-discount');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, [id, location.state, navigate]);

  const safeDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const hasAmount = Number(values.amount) > 0;
      const hasPercentage = Number(values.percentage) > 0;
      let discountType = values.discountType;

      if (hasAmount && !hasPercentage) {
        discountType = 'IsAmount';
      } else if (hasPercentage && !hasAmount) {
        discountType = 'percentage';
      }

      const serviceAreaPayload =
        values.offerType === 'GENERAL'
          ? (values.serviceArea && values.serviceArea.length ? values.serviceArea : ['All'])
          : [];

      const payload = {
        discountId: Number(values.discountId),
        serviceType: values.serviceType,
        title: values.title,
        description: values.description,
        offerType: values.offerType,
        couponCode: values.couponCode,
        discountType,
        percentage: (discountType || '').toLowerCase() === 'percentage' ? Number(values.percentage) || 0 : 0,
        amount: (discountType || '').toLowerCase() === 'isamount' ? Number(values.amount) || 0 : 0,
        startDate: safeDate(values.startDate),
        endDate: safeDate(values.endDate),
        isActive: values.isActive,
        serviceArea: serviceAreaPayload,
        cabType: values.cabType || '',
        isPremium: values.isPremium || false,
      };

      const response = await ApiRequestUtils.update(API_ROUTES.PUT_DISCOUNT, payload);

      if (response?.success) {
        navigate('/dashboard/users/customer-discount', {
          state: { updatedDiscount: response.data },
        });
      } else {
        setAlert({ color: 'red', message: 'Failed to update discount' });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      console.error('Update failed:', error);
      setAlert({ color: 'red', message: 'Update failed!' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !initialValues) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto">
      {alert && (
        <div className="mb-2">
          <Alert color={alert.color}>{alert.message}</Alert>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Edit Customer Discount</h2>

      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-4">
          <button
            type="button"
            className={`px-3 py-2 text-sm font-medium border-b-2 ${activeTab === 'details'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('details')}
          >
            Offer Details
          </button>
          <button
            type="button"
            className={`px-3 py-2 text-sm font-medium border-b-2 ${activeTab === 'customers'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('customers')}
          >
            Customer Offer Records
          </button>
        </nav>
      </div>

      {activeTab === 'details' && (
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={CUSTOMER_DISCOUNT_ADD_SCHEMA}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field type="hidden" name="discountId" />

                <div>
                  <label className="text-sm font-medium text-gray-700">Offer ID</label>
                  <input
                    type="text"
                    value={values.discountId}
                    readOnly
                    className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                <label className="text-sm font-medium text-gray-700">Service Type</label>
                <Field
                  as="select"
                  name="serviceType"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                >
                  <option value="">Select Service Type</option>
                  <option value="DRIVER">DRIVER</option>
                  <option value="RIDES">RIDES</option>
                  <option value="RENTAL_HOURLY_PACKAGE">HOURLY PACKAGE</option>
                  <option value="RENTAL_DROP_TAXI">DROP TAXI</option>
                  <option value="RENTAL">OUTSTATION</option>
                  <option value="AUTO">AUTO</option>
                  <option value="ALL">ALL</option>
                </Field>
                <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
                </div>

                <div>
                <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
                <Field
                  type="text"
                  name="title"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                <ErrorMessage name="title" component="div" className="text-red-500 text-sm" />
                </div>

                <div>
                <label className="text-sm font-medium text-gray-700">Offer Type</label>
                <Field
                  as="select"
                  name="offerType"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                >
                  <option value="">Select Offer Type</option>
                  <option value="GENERAL">General</option>
                  <option value="CUSTOM">Custom</option>
                </Field>
                <ErrorMessage name="offerType" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label htmlFor="couponCode" className="text-sm font-medium text-gray-700">Coupon Code</label>
                <Field
                  type="text"
                  name="couponCode"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                <ErrorMessage name="couponCode" component="div" className="text-red-500 text-sm" />
                </div>

                {values.offerType === 'GENERAL' && (
                  <div>
                  <label htmlFor="serviceArea" className="text-sm font-medium text-gray-700">Select Service Area</label>
                  <Select
                    name="serviceArea"
                    options={ZONE_OPTIONS}
                    isMulti
                    value={values.serviceArea.map((val) => ({ value: val, label: val }))}
                    onChange={(selectedOptions) => {
                      const selectedValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      if (selectedValues.includes('All') && selectedValues.length > 1) {
                        setFieldValue('serviceArea', ['All']);
                      } else if (selectedValues.includes('All')) {
                        setFieldValue('serviceArea', ['All']);
                      } else {
                        setFieldValue('serviceArea', selectedValues);
                      }
                    }}
                    placeholder="Select Service Area"
                    className="mt-1"
                  />
                    <ErrorMessage name="serviceArea" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                )}

                <div>
                <label className="text-sm font-medium text-gray-700">Discount Type</label>
                <Field
                  as="select"
                  name="discountType"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm bg-white"
                >
                  <option value="">Select Discount Type</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="IsAmount">Amount (₹)</option>
                </Field>
                <ErrorMessage name="discountType" component="div" className="text-red-500 text-sm" />
                </div>

                {(values.discountType || '').toLowerCase() === 'percentage' ? (
                  <div>
                  <label className="text-sm font-medium text-gray-700">Discount Percentage (%)</label>
                  <Field
                    type="number"
                    name="percentage"
                    className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                  />
                    <ErrorMessage name="percentage" component="div" className="text-red-500 text-sm" />
                  </div>
                ) : (values.discountType || '').toLowerCase() === 'isamount' ? (
                  <div>
                  <label className="text-sm font-medium text-gray-700">Discount Amount (₹)</label>
                  <Field
                    type="number"
                    name="amount"
                    className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                  />
                    <ErrorMessage name="amount" component="div" className="text-red-500 text-sm" />
                  </div>
                ) : null}

                <div>
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <Field
                  name="startDate"
                  type="date"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                  <ErrorMessage name="startDate" component="div" className="text-red-500 text-sm" />
                </div>

                <div>
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <Field
                  name="endDate"
                  type="date"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                />
                  <ErrorMessage name="endDate" component="div" className="text-red-500 text-sm" />
                </div>

                <div>
                <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                <Field
                  as="textarea"
                  name="description"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                  rows="4"
                />
                  <ErrorMessage name="description" component="div" className="text-red-500 text-sm my-1" />
                </div>

                <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Field
                  as="select"
                  name="isActive"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Field>
                <ErrorMessage name="isActive" component="div" className="text-red-500 text-sm" />
              </div>
            </div>

            <div className="flex flex-row">
              <Button
                fullWidth
                type="button"
                className={`my-6 mx-2 rounded-xl ${ColorStyles.backButton}`}
                onClick={() => navigate('/dashboard/users/customer-discount')}
              >
                Back
              </Button>
              <Button
                fullWidth
                type="submit"
                disabled={isSubmitting}
                className={`my-6 px-8 border-2 rounded-xl ${ColorStyles.continueButtonColor}`}
              >
                Update
              </Button>
            </div>
          </Form>
          )}
        </Formik>
      )}

      {activeTab === 'customers' && (
        <CardCustomerOfferRecords offerId={initialValues.discountId} />
      )}
    </div>
  );
};

const CardCustomerOfferRecords = ({ offerId }) => {
  const records = MOCK_CUSTOMER_OFFER_RECORDS.filter(
    (rec) => String(rec.offerId) === String(offerId)
  );

  const getStatusLabel = (status) => {
    if (!status) return 'Not availed';
    return status;
  };

  return (
    <div className="mt-6">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">Customer Offer Records</h3>
        <p className="text-sm text-gray-500">Read-only list of customers linked to this offer.</p>
      </div>
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full min-w-[600px] table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Customer Name</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Phone Number</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Offer ID</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Offer Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-sm text-gray-500">
                  No customer records found for this offer.
                </td>
              </tr>
            ) : (
              records.map((rec, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-800">{rec.customerName}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{rec.phoneNumber}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{rec.offerId}</td>
                  <td className="py-3 px-4 text-sm">
                    {getStatusLabel(rec.offerStatus)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerDiscountEdit;
