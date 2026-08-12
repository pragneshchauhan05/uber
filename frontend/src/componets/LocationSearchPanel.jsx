import React from "react";

function LocationSearchPanel({ setPanelOpen, setVehiclePanelOpen }) {
  // sample array

  const location = [
    "103 Amrut Flet new triveni sco near swimming pool katargam surat",
    "102 Amrut Flet new triveni sco near swimming pool katargam surat",
    "104 Amrut Flet new triveni sco near swimming pool katargam surat",
    "101 Amrut Flet new triveni sco near swimming pool katargam surat",
  ];
  return (
    <div>
      {/* this is example data */}

      {location.map(function (elem, idx) {
        return (
          <div
            key={idx}
            onClick={() => {
              setPanelOpen(false);
              setVehiclePanelOpen(true);
            }}
            className="flex gap-4 border-2 border-gray-50 active:border-black p-3 rounded-xl items-center my-2 justify-start cursor-pointer"
          >
            <h2 className="bg-[#eee] h-6 flex items-center justify-center w-12 rounded-full">
              <i className="ri-map-pin-line"></i>
            </h2>
            <h4 className="font-medium text-lg">{elem}</h4>
          </div>
        );
      })}
    </div>
  );
}

export default LocationSearchPanel;
