export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) {
    return null;
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded p-6 max-w-4xl w-full relative">
        <button
          onClick={onClose}
          className="bg-white absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
