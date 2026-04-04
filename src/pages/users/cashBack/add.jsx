import React from "react";
import { useNavigate } from "react-router-dom";
import { API_ROUTES } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import CashBackForm from "./CashBackForm";

const CashBackAdd = () => {
  const navigate = useNavigate();

  const initialValues = {
    serviceType: "",
    name: "",
    description: "",
    config: {
      zones: [],
      cashbackDiscount: "",
      parcelVehicleType: "",
      subZoneId: "",
    },
    isActive: true,
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const selectedParcelVehicleType = String(
        values?.config?.parcelVehicleType || "BIKE"
      ).toUpperCase();
      const selectedParcelSubZoneId = values?.config?.subZoneId;

      const payload = {
        serviceType: values.serviceType,
        name: values.name,
        description: values.description || "",
        config: {
          zones: values.config.zones,
          cashbackDiscount: Number(values.config.cashbackDiscount),
          ...(values.serviceType === "PARCEL"
            ? {
                parcelVehicleType: selectedParcelVehicleType,
                ...(selectedParcelVehicleType === "BIKE" && selectedParcelSubZoneId
                  ? { subZoneId: Number(selectedParcelSubZoneId) }
                  : {}),
              }
            : {}),
        },
        isActive: Boolean(values.isActive),
      };
      // console.log("Submitting new Cash Back with payload:", payload);

      const response = await ApiRequestUtils.post(API_ROUTES.ADD_CASH_BACK, payload);
      if (response?.success) {
        navigate("/dashboard/finance/cash-back/list");
      } else {
        console.error("Unable to add Cash Back:", response?.message);
      }
    } catch (error) {
      console.error("Failed to add cash back:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CashBackForm
      title="Add Cash Back"
      submitLabel="Save Cash Back"
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
};

export default CashBackAdd;
