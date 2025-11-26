import { useState, useEffect } from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import moment from "moment";
import { API_ROUTES } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";

const MasterPriceLogParcel = ({ id }) => {
  const [documentslogs, setDocumentLogs] = useState([]);

  const masterPriceTableLogParcel = async (id) => {
    try {
      const data = await ApiRequestUtils.get(API_ROUTES.MASTERPRICETABLE_LOG + id);
      setDocumentLogs(data?.data || []);
    } catch (error) {
      console.error("Error fetching log", error);
    }
  };

  useEffect(() => {
    if (id) masterPriceTableLogParcel(id);
  }, [id]);

  const fieldMappings = {
    parcelType: "Parcel Type",
    baseFare: "Base Fare",
    baseKm: "Base Km",
    pickupFreeKm: "Pickup Free Km",
    nightCharge: "Night Charge",
    nightHoursFrom: "Night Hours From",
    nightHoursTo: "Night Hours To",

    distanceSlabs: "Distance Slabs",
    weightSurcharge: "Weight Surcharge",
    peakSurcharge: "Peak Surcharge",
    weatherSurcharge: "Weather Surcharge",
    handlingSurcharge: "Handling Surcharge",
  };


  const formatArray = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return "-";
    return arr
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return JSON.stringify(item);
        }
        return String(item);
      })
      .join(" | ");
  };

  const formatDistanceSlabs = (slabs) => {
    if (!Array.isArray(slabs) || slabs.length === 0) return "-";
    return slabs
      .map((s) => {
        const max = s.maxKm === null ? "∞" : s.maxKm;
        return `≤ ${max} km → ₹${s.ratePerKm}/km`;
      })
      .join(", ");
  };

  const formatWeightSurcharge = (arr) => formatArray(arr);
  const formatPeakSurcharge = (arr) => formatArray(arr);
  const formatWeatherSurcharge = (arr) => formatArray(arr);
  const formatHandlingSurcharge = (arr) => formatArray(arr);

  const formatValue = (field, value) => {
    if (value === null || value === undefined || value === "") return "-";

    const lower = field.toLowerCase();

    if (lower.includes("distanceslabs")) return formatDistanceSlabs(value);
    if (lower.includes("weightsurcharge")) return formatWeightSurcharge(value);
    if (lower.includes("peaksurcharge")) return formatPeakSurcharge(value);
    if (lower.includes("weathersurcharge")) return formatWeatherSurcharge(value);
    if (lower.includes("handlingsurcharge")) return formatHandlingSurcharge(value);

    if (Array.isArray(value)) return formatArray(value);
    if (typeof value === "object") return JSON.stringify(value);

    return String(value);
  };


  return (
    <>
      <div className="flex flex-row justify-between px-2 mb-2 mt-4">
        <h2 className="text-2xl font-bold mb-4">Log</h2>
      </div>

      <Card>
        {documentslogs.length > 0 ? (
          <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {[
                    "Log ID",
                    "Created At",
                    "Field",
                    "Previous",
                    "New",
                    "User",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-700"
                      >
                        {h}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {documentslogs.map(
                  ({ id, created_at, oldData, newData, UserId, User }, logIdx) => {
                    const className = `py-3 px-5 ${
                      logIdx === documentslogs.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    const changed = Array.from(
                      new Set([
                        ...Object.keys(oldData ?? {}),
                        ...Object.keys(newData ?? {}),
                      ])
                    );

                    return changed.map((field, fieldIdx) => (
                      <tr key={`${id}-${field}-${fieldIdx}`}>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {id}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {moment(created_at).format("DD-MM-YYYY HH:mm:ss")}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {fieldMappings[field] || field}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {formatValue(field, oldData?.[field])}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {formatValue(field, newData?.[field])}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {User?.name ?? UserId}
                          </Typography>
                        </td>
                      </tr>
                    ));
                  }
                )}
              </tbody>
            </table>
          </CardBody>
        ) : (
          <h2 className="text-lg font-medium p-4">No Logs</h2>
        )}
      </Card>
    </>
  );
};

export default MasterPriceLogParcel;