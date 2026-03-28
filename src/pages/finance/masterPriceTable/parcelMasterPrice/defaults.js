export const defaultWeightRows = [
  { code: "W_0_1", minKg: 0, maxKg: 1, amount: 0 },
  { code: "W_1_5", minKg: 1, maxKg: 5, amount: 25 },
  { code: "W_5_10", minKg: 5, maxKg: 10, amount: 45 },
  { code: "W_10_PLUS", minKg: 10, maxKg: null, amount: 70 },
];

export const defaultSurcharge = (status = "INACTIVE", type = "FLAT", value = 0) => ({
  status,
  type,
  value,
});

export const defaultSimpleSurcharge = (status = "INACTIVE", value = 0) => ({
  status,
  value,
});

export const defaultNightSurcharge = (status = "INACTIVE", start = "22:00", end = "05:00", value = 0) => ({
  status,
  start,
  end,
  value,
});

export const defaultOutsideDropSurcharge = (status = "INACTIVE") => ({
  status,
  zoneToZone: { type: "FLAT", value: 0 },
  withoutZone: { type: "FLAT", value: 0 },
});

export const createInitialParcelForm = () => ({
  zone: "",
  subZoneId: "",
  baseFare: "",
  baseKm: "",
  kilometerPrice: "",
  peakHourEnabled: false,
  peakHour: [{ start: "", end: "", kilometerPrice: "" }],
  parcelPricing: {
    weightSurcharge: defaultWeightRows,
    weatherSurcharge: defaultSimpleSurcharge("ACTIVE", 20),
    handlingSurcharge: defaultSimpleSurcharge("ACTIVE", 15),
    nightSurcharge: defaultNightSurcharge("ACTIVE", "22:00", "05:00", 25),
    outsideDropSurcharge: defaultOutsideDropSurcharge("INACTIVE"),
    baseFarePercent: "",
    distanceFarePercent: "",
  },
});

export const toNum = (val) => {
  if (val === "" || val === null || val === undefined) return 0;
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeCodeNum = (value) => String(toNum(value)).replace(".", "_");

export const buildWeightCode = (minKg, maxKg) => {
  const min = normalizeCodeNum(minKg);
  if (maxKg === null || maxKg === "") return `W_${min}_PLUS`;
  const max = normalizeCodeNum(maxKg);
  return `W_${min}_${max}`;
};
