function KpiCard({ title, value }) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
        <h3 className="text-gray-400 text-sm">{title}</h3>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
    );
  }
  
  export default KpiCard;