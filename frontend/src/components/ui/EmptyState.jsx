function EmptyState({ title, subtitle }) {
    return (
      <div className="text-center py-20">
        <h3 className="text-white text-lg font-medium">{title}</h3>
        <p className="text-gray-500 text-sm mt-2">{subtitle}</p>
      </div>
    );
  }
  
  export default EmptyState;