function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg p-6 relative">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
  
          {children}
  
        </div>
      </div>
    );
  }
  
  export default Modal;