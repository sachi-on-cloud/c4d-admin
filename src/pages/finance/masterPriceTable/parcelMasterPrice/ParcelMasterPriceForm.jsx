import { useMemo, useState, useEffect } from "react";
import { Button, Card, CardBody, Typography, Switch } from "@material-tailwind/react";
import { ColorStyles } from "@/utils/constants";
import { buildParcelPayload } from "./mapper";
import { buildWeightCode, toNum } from "./defaults";
import { validateParcelForm } from "./validation";

const inputClass = "w-full min-w-0";

const UiInput = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`p-2 w-full min-w-0 rounded-md border border-gray-300 bg-white text-gray-700 focus:border-blue-400 focus:outline-none ${className}`}
  />
);

const toTitleCase = (value) => {
  const text = String(value || "").toLowerCase();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export default function ParcelMasterPriceForm({
  title,
  initialForm,
  serviceAreas,
  zones,
  saving,
  submitLabel,
  errorMessage,
  onSubmit,
  onBack,
  readOnly = false,
  primaryButtonLabel,
  onPrimaryButtonClick,
}) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const selectedServiceArea = useMemo(
    () => serviceAreas.find((item) => item.name === form.zone),
    [serviceAreas, form.zone]
  );

  const subZoneOptions = useMemo(() => {
    if (!selectedServiceArea) return [];
    return zones.filter((item) => !item.parent_id || item.parent_id === selectedServiceArea.id);
  }, [zones, selectedServiceArea]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updatePeak = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      peakHour: prev.peakHour.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    }));
  };

  const addPeakRow = () => {
    setForm((prev) => ({
      ...prev,
      peakHour: [...prev.peakHour, { start: "", end: "", kilometerPrice: "" }],
    }));
  };

  const removePeakRow = (idx) => {
    setForm((prev) => ({
      ...prev,
      peakHour: prev.peakHour.filter((_, i) => i !== idx),
    }));
  };

  const updateWeightRow = (idx, key, value) => {
    setForm((prev) => ({
      ...prev,
      parcelPricing: {
        ...prev.parcelPricing,
        weightSurcharge: prev.parcelPricing.weightSurcharge.map((row, i) =>
          i === idx ? { ...row, [key]: value } : row
        ),
      },
    }));
  };

  const addWeightRow = () => {
    const list = form.parcelPricing.weightSurcharge || [];
    const last = list[list.length - 1];
    const nextMin = last ? toNum(last.maxKg) || toNum(last.minKg) : 0;
    setForm((prev) => ({
      ...prev,
      parcelPricing: {
        ...prev.parcelPricing,
        weightSurcharge: [
          ...prev.parcelPricing.weightSurcharge,
          {
            code: buildWeightCode(nextMin, null),
            minKg: nextMin,
            maxKg: null,
            amount: 0,
          },
        ],
      },
    }));
  };

  const removeWeightRow = (idx) => {
    setForm((prev) => ({
      ...prev,
      parcelPricing: {
        ...prev.parcelPricing,
        weightSurcharge: prev.parcelPricing.weightSurcharge.filter((_, i) => i !== idx),
      },
    }));
  };

  const updateSurcharge = (key, field, value) => {
    setForm((prev) => ({
      ...prev,
      parcelPricing: {
        ...prev.parcelPricing,
        [key]: {
          ...prev.parcelPricing[key],
          [field]: value,
        },
      },
    }));
  };

  const updateOutsideDropField = (groupKey, field, value) => {
    setForm((prev) => ({
      ...prev,
      parcelPricing: {
        ...prev.parcelPricing,
        outsideDropSurcharge: {
          ...prev.parcelPricing.outsideDropSurcharge,
          [groupKey]: {
            ...prev.parcelPricing.outsideDropSurcharge[groupKey],
            [field]: value,
          },
        },
      },
    }));
  };

  const toggleSurchargeStatus = (key, checked) => {
    if (key === "outsideDropSurcharge") {
      setForm((prev) => ({
        ...prev,
        parcelPricing: {
          ...prev.parcelPricing,
          outsideDropSurcharge: {
            ...prev.parcelPricing.outsideDropSurcharge,
            status: checked ? "ACTIVE" : "INACTIVE",
            zoneToZone: {
              ...prev.parcelPricing.outsideDropSurcharge.zoneToZone,
              value: checked ? prev.parcelPricing.outsideDropSurcharge.zoneToZone.value || 0 : 0,
            },
            withoutZone: {
              ...prev.parcelPricing.outsideDropSurcharge.withoutZone,
              value: checked ? prev.parcelPricing.outsideDropSurcharge.withoutZone.value || 0 : 0,
            },
          },
        },
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      parcelPricing: {
        ...prev.parcelPricing,
        [key]: {
          ...prev.parcelPricing[key],
          status: checked ? "ACTIVE" : "INACTIVE",
          value: checked ? prev.parcelPricing[key].value || 0 : 0,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly || typeof onSubmit !== "function") return;
    setError("");
    const validationError = validateParcelForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    await onSubmit(buildParcelPayload(form), form);
  };

  const renderSurchargeFields = (titleLabel, key, showType = true) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Typography variant="h6" className="font-semibold text-gray-800">
          {titleLabel}
        </Typography>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
          <Switch
            checked={form.parcelPricing[key].status === "ACTIVE"}
            disabled={readOnly}
            onChange={(e) => toggleSurchargeStatus(key, e.target.checked)}
            color="green"
          />
          {toTitleCase(form.parcelPricing[key].status)}
        </div>
      </div>
      <div className={`grid ${showType ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-2`}>
        {showType ? (
          <div className={`min-w-0 ${form.parcelPricing[key].status === "INACTIVE" ? "opacity-60" : ""}`}>
            <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
            <select
              className="p-2 w-full rounded-md border border-gray-300 bg-white"
              value={form.parcelPricing[key].type}
              disabled={readOnly || form.parcelPricing[key].status === "INACTIVE"}
              onChange={(e) => updateSurcharge(key, "type", e.target.value)}
            >
              <option value="FLAT">Flat</option>
              <option value="PERCENT">Percent</option>
            </select>
          </div>
        ) : null}
        <div className={`min-w-0 ${form.parcelPricing[key].status === "INACTIVE" ? "opacity-60" : ""}`}>
          <label className="text-xs font-semibold text-gray-500 uppercase">
            Amount Value
          </label>
          <UiInput
            className={inputClass}
            type="number"
            value={form.parcelPricing[key].value}
            readOnly={readOnly}
            disabled={readOnly || form.parcelPricing[key].status === "INACTIVE"}
            onChange={(e) => updateSurcharge(key, "value", e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderNightSurchargeFields = () => {
    const night = form.parcelPricing.nightSurcharge;
    const isInactive = night.status === "INACTIVE";
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Typography variant="h6" className="font-semibold text-gray-800">
            Night Surcharge
          </Typography>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <Switch
              checked={night.status === "ACTIVE"}
              disabled={readOnly}
              onChange={(e) => toggleSurchargeStatus("nightSurcharge", e.target.checked)}
              color="green"
            />
            {toTitleCase(night.status)}
          </div>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 ${isInactive ? "opacity-60" : ""}`}>
          <div className="min-w-0">
            <label className="text-xs font-semibold text-gray-500 uppercase">Start</label>
            <UiInput
              className={inputClass}
              type="time"
              readOnly={readOnly}
              disabled={readOnly || isInactive}
              value={night.start || "22:00"}
              onChange={(e) => updateSurcharge("nightSurcharge", "start", e.target.value)}
            />
          </div>
          <div className="min-w-0">
            <label className="text-xs font-semibold text-gray-500 uppercase">End</label>
            <UiInput
              className={inputClass}
              type="time"
              readOnly={readOnly}
              disabled={readOnly || isInactive}
              value={night.end || "05:00"}
              onChange={(e) => updateSurcharge("nightSurcharge", "end", e.target.value)}
            />
          </div>
          <div className="min-w-0">
            <label className="text-xs font-semibold text-gray-500 uppercase">Amount Value</label>
            <UiInput
              className={inputClass}
              type="number"
              readOnly={readOnly}
              disabled={readOnly || isInactive}
              value={night.value ?? 0}
              onChange={(e) => updateSurcharge("nightSurcharge", "value", e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderOutsideDropSurchargeFields = () => {
    const outside = form.parcelPricing.outsideDropSurcharge;
    const isInactive = outside.status === "INACTIVE";

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Typography variant="h6" className="font-semibold text-gray-800">
            Outside Drop Surcharge
          </Typography>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <Switch
              checked={outside.status === "ACTIVE"}
              disabled={readOnly}
              onChange={(e) => toggleSurchargeStatus("outsideDropSurcharge", e.target.checked)}
              color="green"
            />
            {toTitleCase(outside.status)}
          </div>
        </div>

        <div className={`space-y-2 ${isInactive ? "opacity-60" : ""}`}>
          <label className="text-xs font-semibold text-gray-500 uppercase">Zone To Zone</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              className="p-2 w-full rounded-md border border-gray-300 bg-white"
              value={outside.zoneToZone?.type || "FLAT"}
              disabled={readOnly || isInactive}
              onChange={(e) => updateOutsideDropField("zoneToZone", "type", e.target.value)}
            >
              <option value="FLAT">Flat</option>
              <option value="PERCENT">Percent</option>
            </select>
            <UiInput
              className={inputClass}
              type="number"
              readOnly={readOnly}
              disabled={readOnly || isInactive}
              value={outside.zoneToZone?.value ?? 0}
              onChange={(e) => updateOutsideDropField("zoneToZone", "value", e.target.value)}
            />
          </div>
        </div>

        <div className={`space-y-2 ${isInactive ? "opacity-60" : ""}`}>
          <label className="text-xs font-semibold text-gray-500 uppercase">Without Zone</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              className="p-2 w-full rounded-md border border-gray-300 bg-white"
              value={outside.withoutZone?.type || "FLAT"}
              disabled={readOnly || isInactive}
              onChange={(e) => updateOutsideDropField("withoutZone", "type", e.target.value)}
            >
              <option value="FLAT">Flat</option>
              <option value="PERCENT">Percent</option>
            </select>
            <UiInput
              className={inputClass}
              type="number"
              readOnly={readOnly}
              disabled={readOnly || isInactive}
              value={outside.withoutZone?.value ?? 0}
              onChange={(e) => updateOutsideDropField("withoutZone", "value", e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  const formatWeightRangeLabel = (row) => {
    const min = toNum(row?.minKg);
    const max = row?.maxKg;
    if (max === null || max === "") return `${min}+ kg`;
    return `${min} to ${toNum(max)} kg`;
  };

  return (
    <div className="p-4 mx-auto space-y-6">
      <div>
        <Typography variant="h4" className="font-bold text-gray-900">{title}</Typography>
      </div>

      {errorMessage ? <p className="text-red-600 text-sm">{errorMessage}</p> : null}
      {error ? <p className="text-red-600 text-sm">{error}</p> : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Card className="rounded-none">
            <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <div className="min-w-0">
                <label className="text-xs font-semibold text-gray-500 uppercase">Zone</label>
                <select
                  className="p-2 w-full rounded-md border border-gray-300 bg-white"
                  value={form.zone}
                  disabled={readOnly}
                  onChange={(e) => {
                    updateField("zone", e.target.value);
                    updateField("subZoneId", "");
                  }}
                >
                  <option value="">Select Zone</option>
                  {serviceAreas.map((area) => (
                    <option key={area.id} value={area.name}>{area.name}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-0">
                <label className="text-xs font-semibold text-gray-500 uppercase">Sub Zone</label>
                <select
                  className="p-2 w-full rounded-md border border-gray-300 bg-white"
                  value={form.subZoneId}
                  disabled={!form.zone || readOnly}
                  onChange={(e) => updateField("subZoneId", e.target.value)}
                >
                  <option value="">Select Sub Zone</option>
                  {subZoneOptions.map((subZone) => (
                    <option key={subZone.id} value={subZone.id}>{subZone.name}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-0">
                <label className="text-xs font-semibold text-gray-500 uppercase">Base Fare</label>
                <UiInput className={inputClass} type="number" readOnly={readOnly} value={form.baseFare} onChange={(e) => updateField("baseFare", e.target.value)} />
              </div>
              <div className="min-w-0">
                <label className="text-xs font-semibold text-gray-500 uppercase">Base Km</label>
                <UiInput className={inputClass} type="number" readOnly={readOnly} value={form.baseKm} onChange={(e) => updateField("baseKm", e.target.value)} />
              </div>
              <div className="min-w-0">
                <label className="text-xs font-semibold text-gray-500 uppercase">Kilometer Price</label>
                <UiInput className={inputClass} type="number" readOnly={readOnly} value={form.kilometerPrice} onChange={(e) => updateField("kilometerPrice", e.target.value)} />
              </div>
            </div>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white">
            <Card  className="rounded-none"><CardBody>{renderSurchargeFields("Weather Surcharge", "weatherSurcharge", false)}</CardBody></Card>
            <Card  className="rounded-none"><CardBody>{renderSurchargeFields("Handling Surcharge", "handlingSurcharge", false)}</CardBody></Card>
          </div>

          <Card  className="rounded-none">
            <CardBody className="space-y-4 bg-white">
            <Typography variant="h6" className="font-semibold text-gray-900">Commission</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-xs font-semibold text-gray-500 uppercase">Base Fare Percent</label>
                <UiInput className={inputClass} type="number" readOnly={readOnly} value={form.parcelPricing.baseFarePercent} onChange={(e) => setForm((prev) => ({ ...prev, parcelPricing: { ...prev.parcelPricing, baseFarePercent: e.target.value } }))} />
              </div>
              <div className="min-w-0">
                <label className="text-xs font-semibold text-gray-500 uppercase">Distance Fare Percent</label>
                <UiInput className={inputClass} type="number" readOnly={readOnly} value={form.parcelPricing.distanceFarePercent} onChange={(e) => setForm((prev) => ({ ...prev, parcelPricing: { ...prev.parcelPricing, distanceFarePercent: e.target.value } }))} />
              </div>
            </div>
            </CardBody>
          </Card>

          <Card  className="rounded-none">
            <CardBody className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <Typography variant="h6" className="font-semibold text-gray-900">Peak Hour</Typography>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input type="checkbox" checked={form.peakHourEnabled} disabled={readOnly} onChange={(e) => updateField("peakHourEnabled", e.target.checked)} />
                Enable Peak Hour
              </label>
            </div>
            {form.peakHourEnabled ? (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button type="button" size="sm" className="bg-black" disabled={readOnly} onClick={addPeakRow}>Add Peak Slot</Button>
                </div>
                {form.peakHour.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end border rounded-lg p-3 bg-gray-50">
                    <div className="min-w-0">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Start</label>
                      <UiInput className={inputClass} type="time" readOnly={readOnly} value={row.start} onChange={(e) => updatePeak(idx, "start", e.target.value)} />
                    </div>
                    <div className="min-w-0">
                      <label className="text-xs font-semibold text-gray-500 uppercase">End</label>
                      <UiInput className={inputClass} type="time" readOnly={readOnly} value={row.end} onChange={(e) => updatePeak(idx, "end", e.target.value)} />
                    </div>
                    <div className="min-w-0">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Kilometer Price</label>
                      <UiInput className={inputClass} type="number" readOnly={readOnly} value={row.kilometerPrice} onChange={(e) => updatePeak(idx, "kilometerPrice", e.target.value)} />
                    </div>
                    <div>
                      <Button type="button" color="red" size="sm" disabled={readOnly || form.peakHour.length === 1} onClick={() => removePeakRow(idx)}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Typography variant="small" className="text-gray-500">Peak hour disabled. No peak slots will be sent in payload.</Typography>
            )}
            </CardBody>
          </Card>

          <Card  className="rounded-none">
            <CardBody className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <Typography variant="h6" className="font-semibold text-gray-900">Weight Surcharge</Typography>
              <Button type="button" size="sm" className="bg-black" disabled={readOnly} onClick={addWeightRow}>Add Slab</Button>
            </div>
            <div className="space-y-2">
              {form.parcelPricing.weightSurcharge.map((row, idx) => (
                <div key={`${row.code}-${idx}`} className="grid grid-cols-1 md:grid-cols-5 gap-2 border rounded-lg p-3 bg-gray-50">
                  <div className="min-w-0">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Slab</label>
                    <div className="p-2 w-full min-w-0 rounded-md border border-gray-200 bg-gray-100 text-gray-700">
                      {formatWeightRangeLabel(row)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Min Kg</label>
                    <UiInput className={inputClass} type="number" readOnly={readOnly} value={row.minKg} onChange={(e) => updateWeightRow(idx, "minKg", e.target.value)} />
                  </div>
                  <div className="min-w-0">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Max Kg</label>
                    <UiInput className={inputClass} type="number" readOnly={readOnly} value={row.maxKg === null ? "" : row.maxKg} placeholder={row.maxKg === null ? "Open ended (+)" : ""} onChange={(e) => updateWeightRow(idx, "maxKg", e.target.value === "" ? null : e.target.value)} />
                  </div>
                  <div className="min-w-0">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Amount</label>
                    <UiInput className={inputClass} type="number" readOnly={readOnly} value={row.amount} onChange={(e) => updateWeightRow(idx, "amount", e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" size="sm" color="red" disabled={readOnly || form.parcelPricing.weightSurcharge.length === 1} onClick={() => removeWeightRow(idx)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            <Card  className="rounded-none"><CardBody>{renderOutsideDropSurchargeFields()}</CardBody></Card>
            <Card  className="rounded-none"><CardBody>{renderNightSurchargeFields()}</CardBody></Card>
          </div>
        </div>

        <div className="flex justify-center items-center gap-3">
          <Button type="button" onClick={onBack} className={ColorStyles.backButton}>Back</Button>
          {onPrimaryButtonClick ? (
            <Button type="button" className={ColorStyles.editButton} onClick={onPrimaryButtonClick}>
              {primaryButtonLabel || "Edit"}
            </Button>
          ) : (
            <Button type="submit" className={ColorStyles.editButton} disabled={saving}>
              {saving ? "Saving..." : submitLabel}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
