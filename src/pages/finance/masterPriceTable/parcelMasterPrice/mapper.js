import {
  buildWeightCode,
  createInitialParcelForm,
  defaultNightSurcharge,
  defaultOutsideDropSurcharge,
  defaultSimpleSurcharge,
  toNum,
} from "./defaults";

export const mapApiToParcelForm = (data) => {
  const form = createInitialParcelForm();
  const peakHour = Array.isArray(data?.peakHours)
    ? data.peakHours
    : (Array.isArray(data?.peakHour) ? data.peakHour : []);
  const ppRaw = data?.parcelPricing;
  const pp = Array.isArray(ppRaw) ? (ppRaw[0] || {}) : (ppRaw || {});

  return {
    ...form,
    zone: data?.zone || "",
    subZoneId: data?.subZoneId ? String(data.subZoneId) : "",
    baseFare: data?.baseFare ?? "",
    baseKm: data?.baseKm ?? "",
    kilometerPrice: data?.kilometerPrice ?? "",
    peakHourEnabled: peakHour.length > 0,
    peakHour: peakHour.length
      ? peakHour.map((row) => ({
          start: row?.start || "",
          end: row?.end || "",
          kilometerPrice: row?.kilometerPrice ?? "",
        }))
      : form.peakHour,
    parcelPricing: {
      weightSurcharge: Array.isArray(pp.weightSurcharge) && pp.weightSurcharge.length
        ? pp.weightSurcharge.map((row) => ({
            code: row?.code || "",
            minKg: row?.minKg ?? 0,
            maxKg: row?.maxKg === null ? null : (row?.maxKg ?? ""),
            amount: row?.amount ?? 0,
          }))
        : form.parcelPricing.weightSurcharge,
      weatherSurcharge: {
        ...defaultSimpleSurcharge(),
        ...(pp.weatherSurcharge || {}),
        value: pp?.weatherSurcharge?.value ?? 0,
      },
      handlingSurcharge: {
        ...defaultSimpleSurcharge(),
        ...(pp.handlingSurcharge || {}),
        value: pp?.handlingSurcharge?.value ?? 0,
      },
      nightSurcharge: (() => {
        const night = pp?.nightSurcharge || {};
        return {
          ...defaultNightSurcharge(),
          ...night,
          start: night?.start || "22:00",
          end: night?.end || "05:00",
          value: night?.value ?? 0,
        };
      })(),
      outsideDropSurcharge: (() => {
        const outside = pp?.outsideDropSurcharge || {};
        const legacyType = outside?.type || "FLAT";
        const legacyValue = outside?.value ?? 0;
        return {
          ...defaultOutsideDropSurcharge(),
          ...outside,
          zoneToZone: {
            type: outside?.zoneToZone?.type || legacyType,
            value: outside?.zoneToZone?.value ?? legacyValue,
          },
          withoutZone: {
            type: outside?.withoutZone?.type || legacyType,
            value: outside?.withoutZone?.value ?? legacyValue,
          },
        };
      })(),
      baseFarePercent: pp?.commission?.baseFarePercent ?? pp?.baseFarePercent ?? "",
      distanceFarePercent: pp?.commission?.distanceFarePercent ?? pp?.distanceFarePercent ?? "",
    },
  };
};

export const buildParcelPayload = (form) => ({
  serviceType: 'PARCEL',
  type: 'Parcel',
  period: 'Parcel',
  zone: form.zone,
  subZoneId: Number(form.subZoneId),
  baseFare: toNum(form.baseFare),
  baseKm: toNum(form.baseKm),
  kilometerPrice: toNum(form.kilometerPrice),
  peakHours: form.peakHourEnabled
    ? form.peakHour.map((row) => ({
        start: row.start,
        end: row.end,
        kilometerPrice: toNum(row.kilometerPrice),
      }))
    : [],
  parcelPricing: [
    {
      weightSurcharge: (form.parcelPricing.weightSurcharge || []).map((row) => ({
        code: buildWeightCode(row.minKg, row.maxKg),
        minKg: toNum(row.minKg),
        maxKg: row.maxKg === "" || row.maxKg === null ? null : toNum(row.maxKg),
        amount: toNum(row.amount),
      })),
      weatherSurcharge: {
        status: form.parcelPricing.weatherSurcharge.status,
        value: toNum(form.parcelPricing.weatherSurcharge.value),
      },
      handlingSurcharge: {
        status: form.parcelPricing.handlingSurcharge.status,
        value: toNum(form.parcelPricing.handlingSurcharge.value),
      },
      nightSurcharge: {
        status: form.parcelPricing.nightSurcharge.status,
        start: form.parcelPricing.nightSurcharge.start,
        end: form.parcelPricing.nightSurcharge.end,
        value: toNum(form.parcelPricing.nightSurcharge.value),
      },
      outsideDropSurcharge: {
        status: form.parcelPricing.outsideDropSurcharge.status,
        zoneToZone: {
          type: form.parcelPricing.outsideDropSurcharge.zoneToZone.type,
          value: toNum(form.parcelPricing.outsideDropSurcharge.zoneToZone.value),
        },
        withoutZone: {
          type: form.parcelPricing.outsideDropSurcharge.withoutZone.type,
          value: toNum(form.parcelPricing.outsideDropSurcharge.withoutZone.value),
        },
      },
      commission: {
        baseFarePercent: toNum(form.parcelPricing.baseFarePercent),
        distanceFarePercent: toNum(form.parcelPricing.distanceFarePercent),
      },
    },
  ],
});
