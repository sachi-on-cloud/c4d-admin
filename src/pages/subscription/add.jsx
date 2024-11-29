import { useState, useEffect } from "react";
import { Alert } from "@material-tailwind/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";

const SubscriptionAdd = () => {
  const [alert, setAlert] = useState(false);
  const [selectedOption, setSelectedOption] = useState("owner");

  useEffect(() => {
    const fetchData = async () => {
      const data = await ApiRequestUtils.get(API_ROUTES.GET_ACCOUNTS);
      const data1 = await ApiRequestUtils.get(API_ROUTES.GET_SUBCRIPTION_PLAN);
      console.log("DATA IN ACCOUNTS", data);
      console.log("PLAN DETAILS", data1);
    };
    fetchData();
  }, []);

  const initialValues = {
    owner: "",
    cab: "",
    driver: "",
  };

  const handleSubmit = (values) => {
    console.log("Form Values:", values);
  };

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
        {({ values }) => (
          <Form>
            <div className="p-4 border rounded-md bg-gray-50">
              {selectedOption === "owner" && (
                <div className="p-4 border rounded-md bg-gray-50 grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Select Owner
                    </label>
                    <Field
                      as="select"
                      name="owner"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>
                        Choose Owner
                      </option>
                      {/* {owners.map((owner, index) => (
                        <option key={index} value={owner}>
                          {owner}
                        </option>
                      ))} */}
                    </Field>
                    <ErrorMessage
                      name="owner"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
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
                      {/* {cabs.map((cab, index) => (
                        <option key={index} value={cab}>
                          {cab}
                        </option>
                      ))} */}
                    </Field>
                    <ErrorMessage
                      name="cab"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Plan Details
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                  value="₹1000"
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
                </div>
              )}
              {selectedOption === "driver" && (
                <div className="p-4 border rounded-md bg-gray-50 grid grid-cols-2 gap-4">
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
                      {/* {drivers.map((driver, index) => (
                        <option key={index} value={driver}>
                          {driver}
                        </option>
                      ))} */}
                    </Field>
                    <ErrorMessage
                      name="driver"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Plan Details
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                  value="₹1000"
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
                </div>
              )}
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
