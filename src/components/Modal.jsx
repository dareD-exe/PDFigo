import React from 'react';
import { FiX, FiDownload, FiEdit2, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  fileName,
  onFileNameChange,
  onDownload,
  downloadable = false,
  editableName = false,
  type = 'info', // 'info', 'success', 'error'
}) => {
  if (!isOpen) return null;

  const IconComponent = type === 'success' ? FiCheckCircle : type === 'error' ? FiAlertTriangle : FiAlertTriangle;
  const iconColor = type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : 'text-yellow-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <IconComponent className={`mr-2 ${iconColor}`} size={24} />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {message && <p className="text-gray-300 mb-4 whitespace-pre-wrap">{message}</p>}

        {downloadable && editableName && (
          <div className="mb-4">
            <label htmlFor="fileNameInput" className="block text-sm font-medium text-gray-300 mb-1">
              File Name:
            </label>
            <div className="flex items-center bg-dark-bg border border-dark-border rounded-md">
              <input
                type="text"
                id="fileNameInput"
                value={fileName}
                onChange={onFileNameChange}
                className="input-field flex-grow !border-0 focus:!ring-0"
              />
              <FiEdit2 className="text-gray-400 mx-2" />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
          {downloadable && (
            <button
              onClick={onDownload}
              disabled={!fileName && editableName}
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload className="mr-2" />
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;