import React from 'react';
import Modal from '@mui/material/Modal';

export default function CustomModal({ open, onClose, children }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="z-50" // modal z-index
    >
      <div className="fixed inset-0 w-screen h-screen flex justify-center items-center bg-[#1e1e1e]/90 backdrop-blur-sm">
        <div className="flex flex-col max-h-[90vh] overflow-hidden rounded-lg mx-2">
          <div className="p-5 flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </Modal>
  );
}
