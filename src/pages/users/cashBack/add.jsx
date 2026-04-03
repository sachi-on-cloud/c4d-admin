import React from "react";
import { useNavigate } from "react-router-dom";
import { API_ROUTES } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import CashBackForm from "./CashBackForm";

const CashBackAdd = () => {
  const navigate = useNavigate();

  const initialValues = {
    serviceType: "",
    parcelVehicleType: "BIKE",
    subZoneId: "",
    name: "",
    description: "",
    config: {
      zones: [],
      cashbackDiscount: "",
    },
    isActive: true,
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        serviceType: values.serviceType,
        name: values.name,
        description: values.description || "",
        config: {
          zones: values.config.zones,
          cashbackDiscount: Number(values.config.cashbackDiscount),
        },
        isActive: Boolean(values.isActive),
        ...(values.serviceType === "PARCEL"
          ? {
              parcelVehicleType: String(values.parcelVehicleType || "BIKE").toUpperCase(),
              ...(String(values.parcelVehicleType || "BIKE").toUpperCase() === "BIKE" && values.subZoneId
                ? { subZoneId: Number(values.subZoneId) }
                : {}),
            }
          : {}),
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
