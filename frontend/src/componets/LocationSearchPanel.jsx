import React from "react";

function LocationSearchPanel({
  suggestions = [],
  setPickup,
  setDestination,
  activeField,
  setPanelOpen,
  setVehiclePanelOpen,
}) {
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setPickup("Locating current position...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            if (data && data.display_name) {
              setPickup(data.display_name);
            } else {
              setPickup(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
            }
          } catch (err) {
            console.error("Reverse geocoding error:", err);
            setPickup(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setPickup("Current Location");
        }
      );
    } else {
      setPickup("Current Location");
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    const text =
      typeof suggestion === "string"
        ? suggestion
        : suggestion?.display_name || suggestion;

    if (text === "Current Location") {
      handleUseCurrentLocation();
      return;
    }

    if (activeField === "pickup") {
      setPickup(text);
    } else if (activeField === "destination") {
      setDestination(text);
    }
  };

  const list = Array.isArray(suggestions) ? suggestions : [];

  const defaultLocations = [
    { title: "Current Location", subtitle: "Use GPS position", icon: "ri-navigation-fill text-blue-600 bg-blue-50" },
    { title: "Home", subtitle: "Saved location", icon: "ri-home-4-fill text-emerald-600 bg-emerald-50" },
    { title: "Work", subtitle: "Saved location", icon: "ri-briefcase-fill text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="space-y-2 py-2">
      {list.length === 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1 mb-2">
            Quick Actions
          </p>
          {defaultLocations.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectSuggestion(item.title)}
              className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
            >
              <div className={`h-10 w-10 flex items-center justify-center rounded-xl shrink-0 ${item.icon}`}>
                <i className={`${item.icon.split(" ")[0]} text-lg`}></i>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-900">{item.title}</h4>
                <p className="text-xs text-gray-500">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {list.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1 mb-2">
            Search Suggestions
          </p>
          {list.map(function (elem, idx) {
            const text =
              typeof elem === "string" ? elem : elem?.display_name || elem;
            return (
              <div
                key={idx}
                onClick={() => handleSelectSuggestion(elem)}
                className="flex items-center gap-4 p-3.5 rounded-2xl border border-gray-100 hover:border-black/20 hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer shadow-sm mb-2"
              >
                <div className="h-9 w-9 bg-gray-100 text-gray-700 flex items-center justify-center rounded-xl shrink-0">
                  <i className="ri-map-pin-2-fill text-base"></i>
                </div>
                <h4 className="font-medium text-sm text-gray-800 line-clamp-2 leading-snug">
                  {text}
                </h4>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LocationSearchPanel;


