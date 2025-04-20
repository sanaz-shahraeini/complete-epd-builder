import { FC } from 'react';


interface ProductFormProps {
  onClose: () => void;
}

const ProductForm: FC<ProductFormProps> = ({ onClose }) => {
  return (
    <div className="py-6 bg-white dark:bg-black rounded-lg shadow-lg">
      {/* Add your form content */}
      <button 
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
      >
        Close
      </button>
    </div>
  );
};

export default ProductForm;
