import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardBody, Typography } from "@material-tailwind/react";
import {
  fetchDriverIncentiveList,
  updateDriverIncentiveComponent,
  updateDriverIncentiveStatus,
} from "./driverIncentiveApi";
import { fetchZoneOptions } from "./zoneOptions";
import DriverIncentiveComponentEditor from "./DriverIncentiveComponentEditor";
import { createDefaultRule, createEditableRule, getTargetComponent } from "./edit.utils";

function DriverIncentiveEdit() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCode = useMemo(
    () => new URLSearchParams(location.search).get("code") || "",
    [location.search]
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [rowData, setRowData] = useState(null);
  const [zoneOptions, setZoneOptions] = useState([{ label: "ALL", value: "ALL" }]);
  const [componentRules, setComponentRules] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
    partnerType: "CAB",
    vehicleType: "ALL",
    zone: "ALL",
    code: "",
    enabled: true,
    payoutFrequency: "WEEKLY",
    validFrom: "",
    validTo: "",
  });

  useEffect(() => {
    const loadZones = async () => {
      const options = await fetchZoneOptions();
      setZoneOptions(options);
    };

    loadZones();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const stateRow = location.state?.row || {};
        const requestedPartnerType =
          stateRow?.scope?.partnerType ||
          stateRow?.config?.scope?.partnerType ||
          "CAB";
        const stateCode =
          stateRow?.code ||
          stateRow?.component?.code ||
          (Array.isArray(stateRow?.components) ? stateRow.components?.[0]?.code : "");
        const requestCode = selectedCode || stateCode || "ONLINE_HOURS_BONUS";
        const response = await fetchDriverIncentiveList({
          settingId: id,
          code: requestCode,
          partnerType: requestedPartnerType,
        });
        const rows = Array.isArray(response?.rows)
          ? response.rows
          : Array.isArray(response?.data)
            ? response.data
            : response?.data && typeof response.data === "object"
              ? [response.data]
              : [];
        const fromState = stateRow && Object.keys(stateRow).length ? stateRow : null;
        const selectedRow =
          rows.find((item) => String(item?.settingId || item?.id) === String(id)) || fromState;
        if (!selectedRow) {
          throw new Error("Incentive record not found");
        }

        const scope = selectedRow?.scope || selectedRow?.config?.scope || {};
        const component = getTargetComponent(selectedRow, selectedCode);
        if (!component) {
          throw new Error("Component not found for this record");
        }

        setRowData(selectedRow);
        const resolvedPayoutFrequency =
          component?.payoutFrequency ||
          component?.rules?.[0]?.condition?.period ||
          "WEEKLY";

        setForm({
          name: selectedRow?.name || "",
          description: selectedRow?.description || "",
          isActive: typeof selectedRow?.isActive === "boolean" ? selectedRow.isActive : true,
          partnerType: scope?.partnerType || "CAB",
          vehicleType: scope?.vehicleType || "ALL",
          zone: scope?.zone || "ALL",
          code: component?.code || selectedCode || "",
          enabled: typeof component?.enabled === "boolean" ? component.enabled : true,
          payoutFrequency: resolvedPayoutFrequency,
          validFrom: component?.validFrom || "",
          validTo: component?.validTo || "",
        });
        setComponentRules(
          Array.isArray(component?.rules) && component.rules.length > 0
            ? component.rules.map((rule) => ({
              ...createEditableRule(rule, component?.code || selectedCode || ""),
              period: resolvedPayoutFrequency,
            }))
            : [{ ...createDefaultRule(component?.code || selectedCode || ""), period: resolvedPayoutFrequency }]
        );
      } catch (apiError) {
        setError(apiError?.message || "Failed to load incentive record");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, location.state, selectedCode]);

  const onInputChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onPayoutFrequencyChange = (value) => {
    onInputChange("payoutFrequency", value);
    setComponentRules((prev) =>
      prev.map((rule) => ({
        ...rule,
        period: value,
      }))
    );
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!rowData) return;

    const existingComponent = getTargetComponent(rowData, form.code);
    if (!existingComponent) {
      setError("Component not found for update");
      return;
    }

    const nextComponent = {
      ...existingComponent,
      enabled: Boolean(form.enabled),
      validFrom: form.validFrom || null,
      validTo: form.validTo || null,
    };
    delete nextComponent.applyMode;

    if (nextComponent.code === "ONLINE_HOURS_BONUS" || nextComponent.code === "SERVICE_TRIP_BONUS") {
      nextComponent.payoutFrequency = form.payoutFrequency || "WEEKLY";
      nextComponent.rules = componentRules.map((rule) => ({
        amount: Number(rule.amount || 0),
        condition: {
          metric: rule.metric || (nextComponent.code === "ONLINE_HOURS_BONUS" ? "onlineHours" : "tripCount"),
          period: form.payoutFrequency || rule.period || "WEEKLY",
          serviceType: rule.serviceType || (nextComponent.code === "ONLINE_HOURS_BONUS" ? "ANY" : "RIDES"),
          op: rule.op || ">=",
          value: Number(rule.value || 0),
          bookingType: null,
          packageType: null,
          isMandatory: true,
        },
      }));
    }

    setSaving(true);
    setError("");
    try {
      const parsedSettingId = Number(rowData?.settingId || rowData?.id);
      if (!Number.isFinite(parsedSettingId) || parsedSettingId <= 0) {
        throw new Error("Missing settingId");
      }

      const statusResponse = await updateDriverIncentiveStatus({
        settingId: parsedSettingId,
        code: form.code,
        enabled: Boolean(form.enabled),
        scope: {
          partnerType: form.partnerType || "CAB",
          vehicleType: form.vehicleType || "ALL",
          zone: form.zone || "ALL",
        },
      });
      if (!statusResponse?.success) {
        throw new Error(statusResponse?.message || "Failed to update incentive status");
      }

      const response = await updateDriverIncentiveComponent({
        settingId: parsedSettingId,
        isActive: Boolean(form.isActive),
        scope: {
          partnerType: form.partnerType || "CAB",
          vehicleType: form.vehicleType || "ALL",
          zone: form.zone || "ALL",
        },
        component: nextComponent,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to update incentive component");
      }

      navigate("/dashboard/vendors/driver-incentive");
    } catch (apiError) {
      setError(apiError?.message || "Failed to update incentive component");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-10 mt-5 px-4">
        <Card>
          <CardBody>
            <Typography color="gray" className="text-sm">
              Loading incentive record...
            </Typography>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-10 mt-5 px-4 bg-white">
      <div className="mb-5 flex items-center justify-between">
        <Typography variant="h5" color="blue-gray" className="font-bold">
          Edit Driver Incentive
        </Typography>
        <Button variant="outlined" color="blue" onClick={() => navigate("/dashboard/vendors/driver-incentive")}>
          Back
        </Button>
      </div>
      <Card>
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-5">
            {!!error && (
              <Typography color="red" className="text-sm">
                {error}
              </Typography>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="hidden">
                  <Typography variant="small" color="blue-gray" className="mb-1 font-semibold">
                    Zone
                  </Typography>
                  <select
                    value={form.zone}
                    onChange={(event) => onInputChange("zone", event.target.value)}
                    className="w-full rounded-md border border-blue-gray-200 px-3 py-2 text-sm"
                  >
                    {zoneOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <DriverIncentiveComponentEditor
              form={form}
              onInputChange={onInputChange}
              onPayoutFrequencyChange={onPayoutFrequencyChange}
              componentRules={componentRules}
              setComponentRules={setComponentRules}
            />
            <div className="hidden">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => onInputChange("isActive", event.target.checked)}
                  className="h-4 w-4 rounded border-blue-gray-300"
                />
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Is Active
                </Typography>
              </label>
            </div>

            <Button type="submit" color="blue" disabled={saving}>
              {saving ? "Saving..." : "Update"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default DriverIncentiveEdit;
