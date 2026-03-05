import React from "react";
import { Typography, Button } from "@material-tailwind/react";
import { METRIC_OPTIONS, PERIOD_OPTIONS, OP_OPTIONS, DISPATCH_SERVICE_KEYS } from "../shared/typeConstants";
import {
  BASE_DISPATCH_SERVICE_KEY,
  getConditionServiceOptions,
  getDispatchServiceLabel,
  MIN_DISPATCH_SERVICE_ACCESS_COUNT,
  getOptionLabel,
  getOptionValue,
  getUnlockTargetOptions,
} from "./dispatchRules.utils";

function DispatchTierRuleCard({
  tierKey,
  dispatchServiceAccess,
  dispatchUnlockConditions,
  onDispatchServiceAccessChange,
  onDispatchConditionChange,
  addDispatchCondition,
  removeDispatchCondition,
  showAllowedZones,
  serviceAreas,
  dispatchAllowedZones,
  onDispatchAllowedZonesChange,
}) {
  const unlockTargetOptions = getUnlockTargetOptions(tierKey, dispatchServiceAccess);
  const selectedAccessCount = Object.values(dispatchServiceAccess[tierKey] || {}).filter(Boolean).length;

  return (
    <details className="rounded-lg border border-blue-gray-100 p-4" open>
      <summary className="cursor-pointer select-none text-sm font-semibold text-blue-gray-800">
        {tierKey}
      </summary>
      <div className="mt-3 space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-semibold">
              Service Access
            </Typography>
            <div className="flex gap-3">
              {DISPATCH_SERVICE_KEYS.map((service) => {
                const serviceKey = getOptionValue(service);
                const isChecked = Boolean(dispatchServiceAccess[tierKey]?.[serviceKey]);
                const isBaseService = serviceKey === BASE_DISPATCH_SERVICE_KEY;
                const isMinimumLimitReached =
                  isChecked && selectedAccessCount <= MIN_DISPATCH_SERVICE_ACCESS_COUNT;
                return (
                  <label key={`${tierKey}-${serviceKey}`} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(event) =>
                        onDispatchServiceAccessChange(tierKey, serviceKey, event.target.checked)
                      }
                      disabled={isBaseService || isMinimumLimitReached}
                      className="h-4 w-4 rounded border-blue-gray-300"
                    />
                    <Typography variant="small" color="blue-gray">
                      {getOptionLabel(service)}
                    </Typography>
                  </label>
                )
              })}
            </div>
            <Typography variant="small" color="gray" className="mt-1 text-xs">
              Local is mandatory. Select at least 1 service.
            </Typography>
          </div>
        </div>

        {unlockTargetOptions.length > 0 ? (
          <div className="space-y-2 rounded-md border border-blue-gray-100 p-3">
            <Typography variant="small" color="blue-gray" className="mb-1 text-xs font-semibold">
              Unlock Rules
            </Typography>

            {unlockTargetOptions.map((serviceKey) => {
              const selectedConditions = dispatchUnlockConditions[tierKey]?.[serviceKey] || [];

              return (
                <div key={`${tierKey}-unlock-${serviceKey}`} className="space-y-2  p-3">
                  <div className="flex items-center justify-between">
                    <Typography variant="small" color="blue-gray" className="font-semibold">
                      {getDispatchServiceLabel(serviceKey)}
                    </Typography>
                    <Button
                      type="button"
                      size="sm"
                      variant="outlined"
                      color="blue"
                      onClick={() => addDispatchCondition(tierKey, serviceKey)}
                    >
                      Add Condition
                    </Button>
                  </div>

                  {selectedConditions.map((condition, index) => {
                    const conditionServiceOptions =
                      condition.metric === "onlineHours"
                        ? ["ANY"]
                        : getConditionServiceOptions(tierKey, serviceKey, dispatchServiceAccess);
                    const conditionServiceValue = conditionServiceOptions.includes(condition.conditionServiceKey)
                      ? condition.conditionServiceKey
                      : conditionServiceOptions[0] || "RIDES";

                    return (
                      <div
                        key={`${tierKey}-${serviceKey}-dispatch-condition-${index}`}
                        className="grid grid-cols-1 gap-2 rounded-md border border-blue-gray-100 p-3 md:grid-cols-7"
                      >
                        <div>
                          <Typography variant="small" color="blue-gray" className="mb-1 text-xs font-semibold">
                            Metric
                          </Typography>
                          <select
                            value={condition.metric}
                            onChange={(event) =>
                              onDispatchConditionChange(tierKey, serviceKey, index, "metric", event.target.value)
                            }
                            className="w-full rounded-md border border-blue-gray-200 bg-white px-2 py-2 text-sm"
                          >
                            {METRIC_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="mb-1 text-xs font-semibold">
                            Period
                          </Typography>
                          <select
                            value={condition.period}
                            onChange={(event) =>
                              onDispatchConditionChange(tierKey, serviceKey, index, "period", event.target.value)
                            }
                            className="w-full rounded-md border border-blue-gray-200 bg-white px-2 py-2 text-sm"
                          >
                            {PERIOD_OPTIONS.map((option) => (
                              <option key={getOptionValue(option)} value={getOptionValue(option)}>
                                {getOptionLabel(option)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="mb-1 text-xs font-semibold">
                            Service
                          </Typography>
                          <select
                            value={conditionServiceValue}
                            onChange={(event) =>
                              onDispatchConditionChange(tierKey, serviceKey, index, "conditionServiceKey", event.target.value)
                            }
                            className="w-full rounded-md border border-blue-gray-200 bg-white px-2 py-2 text-sm"
                            disabled={condition.metric === "onlineHours"}
                          >
                            {conditionServiceOptions.map((option) => (
                              <option key={option} value={option}>
                                {getDispatchServiceLabel(option)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="mb-1 text-xs font-semibold">
                            Operator
                          </Typography>
                          <select
                            value={condition.op}
                            onChange={(event) =>
                              onDispatchConditionChange(tierKey, serviceKey, index, "op", event.target.value)
                            }
                            className="w-full rounded-md border border-blue-gray-200 bg-white px-2 py-2 text-sm"
                          >
                            {OP_OPTIONS.map((option) => (
                              <option key={getOptionValue(option)} value={getOptionValue(option)}>
                                {getOptionLabel(option)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="mb-1 text-xs font-semibold">
                            Value
                          </Typography>
                          <input
                            type="number"
                            value={condition.value}
                            onChange={(event) =>
                              onDispatchConditionChange(tierKey, serviceKey, index, "value", Number(event.target.value))
                            }
                            className="w-full rounded-md border border-blue-gray-200 bg-white px-2 py-2 text-sm"
                            placeholder="value"
                          />
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="mb-1 text-xs font-semibold">
                            Mandatory
                          </Typography>
                          <label className="inline-flex items-center gap-2 py-2">
                            <input
                              type="checkbox"
                              checked={condition.isMandatory}
                              onChange={(event) =>
                                onDispatchConditionChange(tierKey, serviceKey, index, "isMandatory", event.target.checked)
                              }
                              className="h-4 w-4 rounded border-blue-gray-300"
                            />
                            <Typography variant="small" color="blue-gray">
                              Yes
                            </Typography>
                          </label>
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="mb-1 text-xs font-semibold">
                            Action
                          </Typography>
                          <Button
                            type="button"
                            size="sm"
                            variant="text"
                            color="red"
                            onClick={() => removeDispatchCondition(tierKey, serviceKey, index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {selectedConditions.length === 0 && (
                    <Typography variant="small" color="gray">
                      No conditions added for {getDispatchServiceLabel(serviceKey)}.
                    </Typography>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <Typography variant="small" color="gray">
            Select at least one additional service (with Local) to configure unlock rules.
          </Typography>
        )}

        <div className={showAllowedZones ? "hidden" : "hidden"}>
          <Typography variant="small" color="blue-gray" className="mb-2 font-semibold">
            Allowed Zones
          </Typography>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {serviceAreas.map((area) => (
              <label key={`${tierKey}-zone-${area.id || area.name}`} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(dispatchAllowedZones[tierKey] || []).includes(area.name)}
                  onChange={() => onDispatchAllowedZonesChange(tierKey, area.name)}
                  className="h-4 w-4 rounded border-blue-gray-300"
                />
                <Typography variant="small" color="blue-gray">
                  {area.name}
                </Typography>
              </label>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}

export default DispatchTierRuleCard;
