import React, { useEffect, useState } from "react";
import { Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import DriverIncentiveTabs from "./DriverIncentiveTabs";
import DriverIncentiveFilters from "./DriverIncentiveFilters";
import DriverIncentiveTable from "./DriverIncentiveTable";
import { fetchDriverIncentiveList } from "./driverIncentiveApi";
import { mapDriverIncentiveRows } from "./driverIncentiveMapper";
import { fetchZoneOptions } from "./zoneOptions";

function DriverIncentiveList() {
  const navigate = useNavigate();
  const [code, setCode] = useState("ONLINE_HOURS_BONUS");
  const [partnerType, setPartnerType] = useState("CAB");
  const [zone, setZone] = useState("");
  const [zoneOptions, setZoneOptions] = useState([{ label: "ALL", value: "" }]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadZones = async () => {
      const options = await fetchZoneOptions();
      setZoneOptions(options);
    };

    loadZones();
  }, []);

  useEffect(() => {
    const loadList = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetchDriverIncentiveList({
          code,
          partnerType,
          zone,
          vehicleType: "ALL",
        });
        const rawRows = Array.isArray(response?.rows)
          ? response.rows
          : Array.isArray(response?.data)
            ? response.data
            : response?.data && typeof response.data === "object"
              ? [response.data]
              : [];
        setRows(mapDriverIncentiveRows(rawRows));
      } catch (apiError) {
        console.error("Failed to fetch driver incentive list:", apiError);
        setRows([]);
        setError(apiError?.message || "Failed to load driver incentive list");
      } finally {
        setLoading(false);
      }
    };

    loadList();
  }, [code, partnerType, zone]);

  return (
    <div className="mb-10 mt-5 space-y-4 bg-white p-2 px-4 shadow-sm">
      <div>
        <Typography variant="h5" color="blue-gray" className="font-bold">
          Driver Incentive
        </Typography>
        <Typography color="gray" className="mt-1 text-base font-normal">
          Review driver incentive components by code and scope
        </Typography>
      </div>
      <DriverIncentiveFilters
        partnerType={partnerType}
        zone={zone}
        zoneOptions={zoneOptions}
        onPartnerTypeChange={setPartnerType}
        onZoneChange={setZone}
      />
      <DriverIncentiveTabs value={code} onChange={setCode} />
      <DriverIncentiveTable
        rows={rows}
        loading={loading}
        error={error}
        onEdit={(row) =>
          navigate(`/dashboard/vendors/driver-incentive/edit/${row?.raw?.settingId || row.settingId}?code=${code}`, {
            state: { row: row?.raw || row },
          })
        }
      />
    </div>
  );
}

export default DriverIncentiveList;
