import React, { useEffect, useMemo, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Button, Spinner } from "@material-tailwind/react";
import Select from "react-select";
import { CASH_BACK_SCHEMA } from "@/utils/validations";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";

const SERVICE_TYPE_OPTIONS = [
  { value: "DRIVER", label: "Driver" },
  { value: "RIDES", label: "Local" },
  { value: "RENTAL_HOURLY_PACKAGE", label: "Hourly Package" },
  { value: "RENTAL_DROP_TAXI", label: "Drop Taxi" },
  { value: "RENTAL", label: "Round Trip" },
  { value: "AUTO", label: "Auto" },
  { value: "ALL", label: "All" },
];

const CashBackForm = ({
  initialValues,
  title,
  submitLabel,
  onSubmit,
  loading = false,
}) => {
  const [serviceAreas, setServiceAreas] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(false);

  useEffect(() => {
    const fetchGEOData = async () => {
      try {
        setZonesLoading(true);
        const response = await ApiRequestUtils.getWithQueryParam(
          API_ROUTES.GEO_MARKINGS_LIST,
          { type: "Service Area" }
        );
        setServiceAreas(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching GEO_MARKINGS_LIST:", error);
        setServiceAreas([]);
      } finally {
        setZonesLoading(false);
      }
    };
    fetchGEOData();
  }, []);

  const zoneOptions = useMemo(
    () => [
      { value: "ALL", label: "All" },
      ...serviceAreas.map((area) => ({
        value: area.name,
        label: area.name,
      })),
    ],
    [serviceAreas]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto bg-white">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={CASH_BACK_SCHEMA}
        onSubmit={onSubmit}
      >
        {({ values, isSubmitting, setFieldValue, setFieldTouched }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Service Type</label>
                <Field
                  as="select"
                  name="serviceType"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                >
                  <option value="">Select Service Type</option>
                  {SERVICE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="serviceType" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Field
                  type="text"
                  name="name"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                  placeholder="Enter cash back name"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Field
                  as="textarea"
                  rows={4}
                  name="description"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                  placeholder="Enter description"
                />
                <ErrorMessage name="description" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Cashback Discount (%)</label>
                <Field
                  type="number"
                  name="config.cashbackDiscount"
                  step="0.01"
                  min="0"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                  placeholder="Enter cashback discount"
                />
                <ErrorMessage
                  name="config.cashbackDiscount"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Field
                  as="select"
                  name="isActive"
                  className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                  value={String(values.isActive)}
                  onChange={(e) => setFieldValue("isActive", e.target.value === "true")}
                >
                  <option value="true">Active</option>
                  <option value="false">In Active</option>
                </Field>
                <ErrorMessage name="isActive" component="div" className="text-red-500 text-sm" />
              </div>


              <div>
                <label className="text-sm font-medium text-gray-700">Zones</label>
                <Select
                  isMulti
                  isLoading={zonesLoading}
                  options={zoneOptions}
                  value={zoneOptions.filter((option) =>
                    (values?.config?.zones || []).map((zone) =>
                      zone === "All" ? "ALL" : zone
                    ).includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    const selectedValues = (selectedOptions || []).map((option) => option.value);
                    const normalizedValues = selectedValues.includes("ALL")
                      ? ["ALL"]
                      : selectedValues.filter((zone) => zone !== "ALL");
                    setFieldValue("config.zones", normalizedValues);
                  }}
                  onBlur={() => setFieldTouched("config.zones", true)}
                  placeholder="Select zones"
                />
                <ErrorMessage name="config.zones" component="div" className="text-red-500 text-sm" />
              </div>


            </div>

            <div className="flex gap-3 mt-4 justify-center">
              <Button
                type="button"
                className={`rounded-xl ${ColorStyles.backButton}`}
                onClick={() => window.history.back()}
              >
                Back
              </Button>
              <Button
                type="submit"
                className={`rounded-xl ${ColorStyles.continueButtonColor}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : submitLabel}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CashBackForm;
