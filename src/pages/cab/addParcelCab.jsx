import React, { useEffect, useState } from 'react';
import { Button, Input, List, ListItem, Typography } from '@material-tailwind/react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { useNavigate, useLocation } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';

const LocationInput = ({ field, form, suggestions, onSearch, type }) => {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    form.validateField(field.name);
  }, []);

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Enter address"
        {...field}
        onChange={(e) => {
          form.setFieldValue(field.name, e.target.value);
          onSearch(e.target.value, type);
          form.setFieldTouched(field.name, true, false);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          field.onBlur(e);
          setTimeout(() => setIsFocused(false), 200);
          form.validateField(field.name);
        }}
        className="pr-10"
      />
      {suggestions.length > 0 && isFocused && (
        <List className="w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {suggestions.map((suggestion, index) => (
            <ListItem
              key={index}
              onClick={() => {
                form.setFieldValue(field.name, suggestion);
                setIsFocused(false);
                form.validateField(field.name);
              }}
              className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
            >
              <Typography variant="small">{suggestion}</Typography>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

// const validationSchema = Yup.object({
//   name: Yup.string().required('Vehicle Name is required'),
//   ownerName: Yup.string().required('Owner Name is required'),
//   autoNumber: Yup.string().required('Auto Number is required'),
//   address: Yup.string().required('Address is required'),
//   insurance: Yup.string().required('Insurance Expiry Date is required'),
//   autoType: Yup.string().required('Auto Type is required'),
//   seater: Yup.string().required('Seater is required'),
//   modelYear: Yup.string().required('Year of Model is required'),
// });

const ParcelCabAdd = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ownerName = '', accountId = '' } = location?.state || {}; 

  const [ownerAddressSuggestions, setOwnerAddressSuggestions] = useState([]);

  const searchLocations = async (query, type) => {
    if (query.length > 2) {
      try {
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.SEARCH_ADDRESS, {
          address: query,
        });
        if (data?.success && data?.data) {
          if (type === 'owner') {
            setOwnerAddressSuggestions(data?.data);
          }
        }
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      }
    } else {
      setOwnerAddressSuggestions([]);
    }
  };

  const currentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="p-4 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add New Vehicle</h2>

      <Formik
        initialValues={{
          accountId: accountId,
          name: '',
          ownerName: ownerName, 
          vehicleNumber: '',
          address: '',
          insurance: '',
          autoType: '',
          seater: '3',
          modelYear: '',


        }}
        // validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const payload = {
              accountId: values.accountId,
              name: values.name,
              company: values.ownerName,
              vehicleNumber: values.vehicleNumber,
              curAddress: values.address,
              insurance: values.insurance,
              vehicleType: values.autoType,
              seater: values.seater,
              modelYear: values.modelYear,
              curLatitude: '',
              curLongitude: '',
            };
            const res = await ApiRequestUtils.post(API_ROUTES.CREATE_PARCEL_ADMIN, payload);

            if (res?.success) {
              
              navigate(`/dashboard/vendors/account/parcel/details/${accountId}`, {
                state: { refresh: true }
              });
            } else {
              alert('Failed to add auto: ' + (res?.message || 'Unknown error'));
            }
          } catch (error) {
            console.error('Submission error:', error);
            alert('Something went wrong!');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ handleChange, values }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Vehicle Name */}
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Vehicle Name
                </label>
                <Field name="name" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="ownerName" className="text-sm font-medium text-gray-700">
                  Owner Name
                </label>
                <Field name="ownerName" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                <ErrorMessage name="ownerName" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="vehicleNumber" className="text-sm font-medium text-gray-700">
                  Bike Number
                </label>
                <Field
                  name="vehicleNumber"
                  maxLength={10}
                  className="p-2 w-full rounded-md border-gray-300 shadow-sm"
                />
                <ErrorMessage name="vehicleNumber" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Address
                </label>
                <Field name="address">
                  {({ field, form }) => (
                    <LocationInput
                      field={field}
                      form={form}
                      suggestions={ownerAddressSuggestions}
                      onSearch={searchLocations}
                      type="owner"
                    />
                  )}
                </Field>
                <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="insurance" className="text-sm font-medium text-gray-700">
                  Insurance Expiry Date
                </label>
                <Field
                  type="date"
                  name="insurance"
                  className="p-2 w-full rounded-md border-gray-300 shadow-sm"
                  min={currentDate()}
                />
                <ErrorMessage name="insurance" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Bike Type</label>
                <div className="space-x-4 mt-1">
                  {['PETROL', 'EV'].map((type) => (
                    <label key={type} className="inline-flex items-center">
                      <Field
                        type="radio"
                        name="autoType"
                        value={type}
                        className="mr-2"
                        onChange={handleChange}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
                <ErrorMessage name="autoType" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label htmlFor="seater" className="text-sm font-medium text-gray-700">
                  Seater
                </label>
                <Field name="seater" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                <ErrorMessage name="seater" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="modelYear" className="text-sm font-medium text-gray-700">
                  Year of Model
                </label>
                <Field name="modelYear" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                <ErrorMessage name="modelYear" component="div" className="text-red-500 text-sm" />
              </div>




            </div>
            <div className="flex flex-row">
              <Button
                fullWidth
                className="my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl"
                onClick={() => navigate('/dashboard/vendors/account/parcel')}
                type="reset"
              >
                Cancel
              </Button>
              <Button
                fullWidth
                color="black"
                className={`my-6 mx-2 ${ColorStyles.continueButtonColor}`}
                type="submit"
              // onClick={()=>navigate('/dashboard/vendors/account/autoView/details')}
              >
                Continue
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ParcelCabAdd;