import { useState } from "react";
import { SUBSCRIPTION_ADD_SCHEME } from "@/utils/validations";
import { Alert } from "@material-tailwind/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { useNavigate } from 'react-router-dom';


const MasterSubscriptionAdd = () => {
  const [alert, setAlert] = useState(false);
  const navigate = useNavigate();

  const currentDate = () => {
    return (new Date()).toISOString().split('T')[0];
  };

  const initialValues = {
    price: '',
    packagePrice: '',
    serviceType: '',
    discount: '',
    discountPrice: '',
    discountStartDate: '',
    discountEndDate: ''
  };

  const onSubmit = async (values) => {
    let subscriptionDetails = {
      price: values.price,
      packagePrice: values.packagePrice,
      serviceType: values.serviceType,
      discount: values.discount,
      discountPrice: values.discountPrice,
      discountStartDate: values.discountStartDate,
      discountEndDate: values.discountEndDate,
    };
    try {
      const data = await ApiRequestUtils.post(API_ROUTES.ADD_MASTER_SUBSCRIPTION_ADD, subscriptionDetails);
      if (data?.success) {
        return navigate("/dashboard/finance/master-subscription");
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error === "Driver has an overlapping subscription") {
        setAlert({
          color: "black",
          message: "This account is already subscribed. Please check the subscription details.",
        });
        setTimeout(() => setAlert(null), 5000);
      }
    }
  };

  return (
    <div className="p-4">
      {alert && (
        <div className="mb-2">
          <Alert color={alert.color} className="py-3 px-6 rounded-xl">
            {alert.message}
          </Alert>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Add Master Subscription</h2>
      <Formik
        initialValues={initialValues}
        // validationSchema={SUBSCRIPTION_ADD_SCHEME} //Schema need to be added newly.
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {({ handleSubmit, values, setFieldValue, errors }) => (
          <Form>
            <div className="p-4 bg-gray-50 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="source" className="text-sm font-medium text-gray-700">Service Type</label>
                <Field as="select" name="serviceType" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                  <option value="">Select Service Type</option>
                  <option value="ACTING_DRIVER">Acting Driver</option>
                  <option value="RIDES_RENTAL_CABS">Rides/Rental Cabs</option>
                </Field>
                <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="packagePrice" className="text-sm font-medium text-gray-700">Subscription Amount (INR)</label>
                <Field type="number" name="packagePrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                <ErrorMessage name="packagePrice" component="div" className="text-red-500 text-sm my-1" />
              </div>
              <div>
                <label htmlFor="price" className="text-sm font-medium text-gray-700">Earnings Threshold (INR)</label>
                <Field type="number" name="price" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                <ErrorMessage name="price" component="div" className="text-red-500 text-sm my-1" />
              </div>
              <div>
                <label htmlFor="discount" className="text-sm font-medium text-gray-700">Discount</label>
                <Field type="number" name="discount" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                <ErrorMessage name="discount" component="div" className="text-red-500 text-sm my-1" />
              </div>
              <div>
                <label htmlFor="discountPrice" className="text-sm font-medium text-gray-700">Discount Price</label>
                <Field type="number" name="discountPrice" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                <ErrorMessage name="discountPrice" component="div" className="text-red-500 text-sm my-1" />
              </div>
              <div>
                <label htmlFor="discountStartDate" className="text-sm font-medium text-gray-700">Discount Start Date</label>
                <Field type="date" name="discountStartDate" className="p-2 w-full rounded-xl border-2 border-gray-300" value={values.discountStartDate} max={currentDate()}
                  onChange={(e) => {
                    setFieldValue('discountStartDate', e.target.value);
                  }} />
                <ErrorMessage name="discountStartDate" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label htmlFor="discountEndDate" className="text-sm font-medium text-gray-700">Discount End Date</label>
                <Field type="date" name="dateOfBirth" className="p-2 w-full rounded-xl border-2 border-gray-300" value={values.discountEndDate} max={currentDate()}
                  onChange={(e) => {
                    setFieldValue('discountEndDate', e.target.value);
                  }} />
                <ErrorMessage name="discountEndDate" component="div" className="text-red-500 text-sm" />
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                type='submit'
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
              >
                Submit
              </button>
            </div>
            {/* </div> */}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MasterSubscriptionAdd;
