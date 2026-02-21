function Button({ children, variant = "primary", ...props }) {
    const base = "px-4 py-2 rounded-lg text-sm font-medium transition";
  
    const styles = {
      primary: "bg-white text-black hover:bg-neutral-200",
      secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
      danger: "bg-red-600 text-white hover:bg-red-700"
    };
  
    return (
      <button className={`${base} ${styles[variant]}`} {...props}>
        {children}
      </button>
    );
  }
  
  export default Button;