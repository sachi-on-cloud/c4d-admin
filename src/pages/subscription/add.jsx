import { useState, useEffect } from "react";
import { Alert, Option, Select, Typography } from "@material-tailwind/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";

const SubscriptionAdd = () => {
  const [alert, setAlert] = useState(false);
  const [owners, setOwners] = useState([]);
  const [cabs, setCabs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedOption, setSelectedOption] = useState("owner");

  useEffect(() => {
    const fetchData = async () => {

      const [ownerData, driverData, planData] = await Promise.all([
        await ApiRequestUtils.get(API_ROUTES.GET_ACCOUNTS),
        await ApiRequestUtils.get(API_ROUTES.GET_DRIVERS_FOR_SUBSCRIPTION),
        await ApiRequestUtils.get(API_ROUTES.GET_SUBCRIPTION_PLAN)
      ]);

      if (ownerData?.success && ownerData?.data.length > 0) {
        setOwners(ownerData?.data);
      }

      if (driverData?.success && driverData?.data.length > 0) {
        setDrivers(driverData?.data);
      }
      
      if (planData?.success && planData?.result) {
        setPlans(planData?.result)
      }
    };
    fetchData();
  }, []);

  const initialValues = {
    owner: "",
    cab: "",
    driver: "",
    paymentMethod: ""
  };

  const handleSubmit = async (values) => {
    console.log("Form Values:", values);
    try {
      const subscriptionDetails = {
        driverId: values.driver,
        ownerId: values.owner,
        cabId: values.cab,
        planId: plans?.id,
        paymentMethod: values.paymentMethod
      };
      const data = await ApiRequestUtils.post(API_ROUTES.CREATE_SUBSCRIPTION, subscriptionDetails);
      // if (!data?.success && data?.code === 203) {
      //   console.error('Driver already exists');
      //   setAlert({
      //     color: 'red',
      //     message: 'Driver already exists'
      //   });
      //   setTimeout(() => setAlert(null), 5000);
      //   resetForm();
      // } else {
      //   console.log('ELSE IN SUBMIT :');
      //   // navigate('/dashboard/drivers', {
      //   //     state: {
      //   //         driverAdded: true,
      //   //         driverName: data?.data?.firstName
      //   //     }
      //   // });
      //   setDriverAdded({
      //     driverId: data?.data?.id,
      //     value: true
      //   });
      // }
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const onOwnerChangeHandler = async (val) => {
    const cabData = await ApiRequestUtils.get(API_ROUTES.GET_ACCOUNT_CABS + val);
    //add logic if no cabs available for selected owner.
    setCabs(cabData?.data);
  }
  const date = new Date();

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2); // Extract last 2 digits of the year

    return `${day}/${month}/${year}`;
  }

  const format30Days = () => {
    const today = new Date();
    today.setDate(today.getDate() + 30);

    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear().toString().slice(-2); // Extract last 2 digits of the year

    return `${day}/${month}/${year}`;
  }

  return (
    <div className="p-4">
      {alert && (
        <div className="mb-2">
          <Alert color={alert.color} className="py-3 px-6 rounded-xl">
            {alert.message}
          </Alert>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Add Subscription</h2>
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            name="subscriptionType"
            value="owner"
            checked={selectedOption === "owner"}
            onChange={() => setSelectedOption("owner")}
            className="mr-2"
          />
          Owner
        </label>
        <label>
          <input
            type="radio"
            name="subscriptionType"
            value="driver"
            checked={selectedOption === "driver"}
            onChange={() => setSelectedOption("driver")}
            className="mr-2"
          />
          Driver
        </label>
      </div>

      <Formik
        initialValues={initialValues}
        // validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values,setFieldValue }) => (
          <Form>
            <div className="p-4 border rounded-md bg-gray-50">
                <div className="p-4 border rounded-md bg-gray-50 grid grid-cols-2 gap-4">
                {selectedOption === "owner" &&
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Select Owner
                    </label>
                    <Field
                      as="select"
                      name="owner"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        const selectedOwner = e.target.value;
                        setFieldValue("owner", selectedOwner)
                        onOwnerChangeHandler(selectedOwner)
                      }
                      }
                    >
                      <option value="" disabled>
                        Choose Owner
                      </option>
                      {owners.map((owner, index) => (
                        <option key={index} value={owner.id}>
                          {owner.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="owner"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                }

                {selectedOption === "owner" &&
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Select Cab
                    </label>
                    <Field
                      as="select"
                      name="cab"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!values.owner}
                    >
                      <option value="" disabled>
                        {values.owner ? "Choose Cab" : "Select an owner first"}
                      </option>
                      {cabs.map((cab, index) => (
                        <option key={index} value={cab.id}>
                          {cab.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="cab"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                }
                {selectedOption === "driver" &&
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Select Driver
                    </label>
                    <Field
                      as="select"
                      name="driver"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>
                        Choose Driver
                      </option>
                      {drivers.map((driver, index) => (
                        <option key={index} value={driver.id}>
                          {driver.firstName}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="driver"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                }
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Plan Details
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                    value={`₹ ${plans ? Number(plans.price) : 1000}`}
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                      value={formatDate(date)}
                      readOnly
                    />
                  </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        End Date
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                        value={format30Days(date)}
                        readOnly
                    />
                    </div>
                </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2">Paymnet Method</label>
                    <Field as="select" name="paymentMethod" className="p-2 w-full rounded-md border-2 border-gray-300">
                      <option value="">Select Payment method</option>
                      <option value="CASH">CASH</option>
                      <option value="GPAY">GPAY</option>
                    </Field>
                    <ErrorMessage name="paymentMethod" component="div" className="text-red-500 text-sm" />
                  </div>
                </div>
              <div className="mt-4 flex justify-center">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
                >
                  Submit
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SubscriptionAdd;
