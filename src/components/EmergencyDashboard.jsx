import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const getMarkerColor = (type) => {
  switch (type) {
    case "Accident":
      return "blue";
    case "Assault":
      return "red";
    default:
      return "gray";
  }
};

const createIcon = (color) =>
  new L.Icon({
    iconUrl: `https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: `https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png`,
    shadowSize: [41, 41],
  });

export default function EmergencyDashboard({ token, onLogout }) {
  const [emergencyData, setEmergencyData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [address, setAddress] = useState("");

  // Fetch emergency data from backend on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/emergencies");
        const data = await res.json();
        setEmergencyData(data);
      } catch (error) {
        console.error("Failed to fetch emergency data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDetailClick = async (incident) => {
    setSelectedUser(incident);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${incident.location.lat}&lon=${incident.location.lng}`
      );
      const data = await res.json();
      setAddress(data.display_name || "Unknown location");
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      setAddress("Unknown location");
    }
  };

  const MapCenterUpdater = ({ position }) => {
    const map = useMap();

    useEffect(() => {
      if (position) {
        map.flyTo(position, 13);
      }
    }, [position, map]);

    return null;
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedUser) return;

    if (!token) {
      console.error("No valid token found.");
      alert("You are not logged in.");
      return;
    }

    // Update on server
    try {
      const response = await fetch(
        `http://localhost:3000/api/emergencies/${selectedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update status. Status: ${response.status}`);
      }

      // If successful, update local state
      const updatedData = emergencyData.map((incident) =>
        incident._id === selectedUser._id
          ? { ...incident, status: newStatus }
          : incident
      );
      setEmergencyData(updatedData);
      setSelectedUser((prev) => ({ ...prev, status: newStatus }));
      console.log("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setAddress("");
  };

  return (
    <div className="p-4 space-y-6  min-h-screen">
      <header className="fixed top-0 left-0 w-full bg-gray-800 text-white py-3 shadow-md z-50 text-3xl font-bold mb-4 justify-center">
        <div className="text-center font-sans font-light text-m">
          Emergency data for Pauri
        </div>
        <button
          onClick={onLogout}
          className="absolute top-2 right-2 bg-red-500/70 text-white text-sm h-12 w-24 rounded"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-col lg:flex-row  gap-4">
        {/* Table View */}
        <div className="flex-1 mt-10 bg-white h-[600px] overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-left text-sm font-semibold text-gray-700 dark:text-gray-100">
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Latitude</th>
                <th className="px-4 py-3">Longitude</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {emergencyData.map((incident) => (
                <tr
                  key={incident._id}
                  className="border-t dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100"
                >
                  <td className="px-4 py-2 text-gray-600">{incident.id}</td>
                  <td className="px-4 py-2 text-gray-600">{incident.name}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {incident.location.lat}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {incident.location.lng}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(incident.time).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{incident.type}</td>
                  <td className="px-4 py-2 flex items-center gap-2 text-gray-600">
                    <span
                      className={`h-3 w-3 rounded-full ${incident.status === "New"
                        ? "bg-green-500"
                        : incident.status === "In Progress"
                          ? "bg-orange-500"
                          : incident.status === "Resolved"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                    ></span>
                    {incident.status}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    <button
                      className="text-blue-500 underline"
                      onClick={() => handleDetailClick(incident)}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Map View */}
        <div className="mt-10 flex-1 h-screen z-10 border-4 border-gray-700 rounded-xl shadow">
          <MapContainer
            center={[30.5937, 78.9629]} // Initial center
            zoom={13}
            className="w-full h-screen rounded-xl"
          >
            <MapCenterUpdater
              position={
                emergencyData.length > 0
                  ? [
                    emergencyData[0].location.lat,
                    emergencyData[0].location.lng,
                  ]
                  : null
              }
            />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {emergencyData.map((incident) => (
              <Marker
                key={incident._id}
                position={[incident.location.lat, incident.location.lng]}
                icon={createIcon(getMarkerColor(incident.type))}
              >
                <Tooltip direction="top" offset={[0, -20]} permanent>
                  {incident.name}
                </Tooltip>

                <Popup>
                  <div>
                    <p>
                      <strong>User:</strong> {incident.name} ({incident.id})
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {new Date(incident.time).toLocaleString()}
                    </p>
                    <p>
                      <strong>Type:</strong> {incident.type}
                    </p>
                    <p>
                      <strong>Status:</strong> {incident.status}
                    </p>
                    <p>
                      <strong>Location:</strong> {incident.location.lat},{" "}
                      {incident.location.lng}
                    </p>
                    <button
                      className="text-blue-500 underline"
                      onClick={() => handleDetailClick(incident)}
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Popup Modal for User Details */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              onClick={closeModal}
            >
              ✕
            </button>
            <div className="flex items-center justify-center mb-4">
              <span
                className={`h-3 w-3 rounded-full mr-2 ${selectedUser.status === "New"
                  ? "bg-green-500"
                  : selectedUser.status === "In Progress"
                    ? "bg-orange-500"
                    : selectedUser.status === "Resolved"
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
              ></span>
              <h2 className="text-xl font-bold">User Detail</h2>
            </div>

            <img
              src={`https://randomuser.me/api/portraits/men/${Math.min(
                Math.abs(parseInt((selectedUser.id || "").replace(/\D/g, ""))) %
                100,
                99
              )}.jpg`}
              alt="User"
              className="w-24 h-24 rounded-full mb-4 mx-auto"
            />

            <div className="text-sm space-y-2">
              <p>
                <strong>Name:</strong> {selectedUser.name}
              </p>
              <p>
                <strong>User ID:</strong> {selectedUser.id}
              </p>
              <p>
                <strong>Type:</strong> {selectedUser.type}
              </p>
              <p>
                <strong>Status:</strong>
                <div className="mt-1">
                  {["New", "In Progress", "Resolved", "Reopen the case"]
                    .filter((statusOption) => {
                      const currentStatus = selectedUser.status;
                      if (currentStatus === "In Progress") {
                        return (
                          statusOption !== "New" &&
                          statusOption !== "Reopen the case"
                        );
                      } else if (currentStatus === "Resolved") {
                        return ["Resolved", "Reopen the case"].includes(
                          statusOption
                        );
                      } else if (currentStatus.status === "new") {
                        return statusOption !== "Reopen the case";
                      }
                      return true; // Show all when status is "New"
                    })
                    .map((status) => (
                      <label
                        key={status}
                        className="inline-flex items-center mr-4"
                      >
                        <input
                          type="radio"
                          className="form-radio text-blue-600"
                          name="status"
                          value={status}
                          checked={selectedUser.status === status}
                          onChange={() => handleStatusChange(status)}
                        />
                        <span className="ml-1">{status}</span>
                      </label>
                    ))}
                </div>
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {new Date(selectedUser.time).toLocaleString()}
              </p>
              <p>
                <strong>Location:</strong> {address}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
