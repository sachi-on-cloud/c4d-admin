import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { API_ROUTES } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import CashBackForm from "./CashBackForm";

const getNormalizedRecord = (record = {}) => ({
  id: record?.settingId || record?.id || record?.cashBackId || record?._id || null,
  serviceType: record?.serviceType || "",
  parcelVehicleType: String(record?.parcelVehicleType || "BIKE").toUpperCase(),
  subZoneId: record?.subZoneId ? String(record.subZoneId) : "",
  name: record?.name || "",
  description: record?.description || "",
  config: {
    zones: Array.isArray(record?.config?.zones) ? record.config.zones : [],
    cashbackDiscount:
      record?.config?.cashbackDiscount !== null && record?.config?.cashbackDiscount !== undefined
        ? String(record.config.cashbackDiscount)
        : "",
  },
  isActive: Boolean(record?.isActive),
});

const CashBackEdit = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recordId, setRecordId] = useState(id || null);
  const [initialValues, setInitialValues] = useState({
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
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const cashBackFromState = location?.state?.cashBack;
        if (cashBackFromState) {
          const normalized = getNormalizedRecord(cashBackFromState);
          setInitialValues(normalized);
          setRecordId(normalized.id || id);
          return;
        }

        let record = null;
        try {
          const response = await ApiRequestUtils.get(`${API_ROUTES.GET_CASH_BACK}/${id}`);
          const data = response?.data;
          record = Array.isArray(data) ? data[0] : data;
        } catch (error) {
          const fallback = await ApiRequestUtils.get(API_ROUTES.GET_CASH_BACK);
          const list = Array.isArray(fallback?.data) ? fallback.data : [];
          record = list.find((item) => String(item?.id || item?.cashBackId || item?._id) === String(id));
        }

        if (!record) {
          throw new Error("Cash Back record not found");
        }
        const normalized = getNormalizedRecord(record);
        setInitialValues(normalized);
        setRecordId(normalized.id || id);
      } catch (error) {
        console.error("Failed to load cash back record:", error);
        navigate("/dashboard/finance/cash-back/list");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [id, location.state, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const parsedSettingId = Number(recordId || id);
      if (!Number.isFinite(parsedSettingId) || parsedSettingId <= 0) {
        throw new Error("Invalid settingId");
      }

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

      const updateRoute = API_ROUTES.UPDATE_CASH_BACK.replace(
        ":settingId",
        String(parsedSettingId)
      );
      const response = await ApiRequestUtils.update(updateRoute, payload);

      if (response?.success) {
        navigate("/dashboard/finance/cash-back/list");
      } else {
        console.error("Unable to update Cash Back:", response?.message);
      }
    } catch (error) {
      console.error("Failed to update cash back:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CashBackForm
      title="Edit Cash Back"
      submitLabel="Update Cash Back"
      initialValues={initialValues}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};

export default CashBackEdit;
