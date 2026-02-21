function Badge({ children, color = "green" }) {
    const colors = {
      green: "bg-green-500/10 text-green-400",
      yellow: "bg-yellow-500/10 text-yellow-400",
      blue: "bg-blue-500/10 text-blue-400",
      red: "bg-red-500/10 text-red-400",
    };
  
    return (
      <span className={`${colors[color]} px-3 py-1 rounded-full text-xs`}>
        {children}
      </span>
    );
  }
  
  export default Badge;