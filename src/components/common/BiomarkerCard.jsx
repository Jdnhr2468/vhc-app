// src/components/BiomarkerCard.jsx
export const BiomarkerCard = ({ title, value, unit, status, colorClass }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
    <span className="text-gray-400 font-medium">{title}</span>
    <div className="flex items-baseline gap-1 my-2">
      <span className="text-3xl font-bold text-gray-800">{value}</span>
      <span className="text-gray-400 text-sm">{unit}</span>
    </div>
    <div className={`text-xs font-semibold py-1 px-3 rounded-full w-fit ${colorClass}`}>
      {status}
    </div>
  </div>
);