import React from "react";

function LocationSearchPanel({
  suggestions = [],
  setPickup,
  setDestination,
  activeField,
  setPanelOpen,
  setVehiclePanelOpen,
}) {
  const handleSelectSuggestion = (suggestion) => {
    const text =
      typeof suggestion === "string"
        ? suggestion
        : suggestion?.display_name || suggestion;
    if (activeField === "pickup") {
      setPickup(text);
    } else if (activeField === "destination") {
      setDestination(text);
    }
  };

  const list = Array.isArray(suggestions) ? suggestions : [];

  return (
    <div>
      {list.map(function (elem, idx) {
        const text =
          typeof elem === "string" ? elem : elem?.display_name || elem;
        return (
          <div
            key={idx}
            onClick={() => handleSelectSuggestion(elem)}
            className="flex gap-4 border-2 border-gray-50 active:border-black p-3 rounded-xl items-center my-2 justify-start cursor-pointer"
          >
            <h2 className="bg-[#eee] h-8 w-8 flex items-center justify-center rounded-full shrink-0">
              <i className="ri-map-pin-line text-lg"></i>
            </h2>
            <h4 className="font-medium text-sm text-gray-800 line-clamp-2">
              {text}
            </h4>
          </div>
        );
      })}
    </div>
  );
}

export default LocationSearchPanel;
