import React from "react";
import AreaWiseHourlyDemandAllTripTypes from "./areaWiseHourlyDemandAllTripTypes";

const AreaWiseHourlyDemandOutstation = ({ filterParams }) => (
  <AreaWiseHourlyDemandAllTripTypes filterParams={filterParams} serviceType="Outstation" />
);

export default AreaWiseHourlyDemandOutstation;
