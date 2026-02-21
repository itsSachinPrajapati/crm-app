function Input({ ...props }) {
    return (
      <input
        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-neutral-600"
        {...props}
      />
    );
  }
  
  export default Input;