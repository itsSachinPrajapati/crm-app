function Select({ children, ...props }) {
    return (
      <select
        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-neutral-600"
        {...props}
      >
        {children}
      </select>
    );
  }
  
  export default Select;