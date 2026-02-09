import React from "react";
import AreaWiseHourlyDemandAllTripTypes from "./areaWiseHourlyDemandAllTripTypes";

const AreaWiseHourlyDemandLocal = ({ filterParams }) => (
  <AreaWiseHourlyDemandAllTripTypes filterParams={filterParams} serviceType="Local" />
);

export default AreaWiseHourlyDemandLocal;
