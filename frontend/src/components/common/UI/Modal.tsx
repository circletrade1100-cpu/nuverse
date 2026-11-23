import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showCloseButton?: boolean;
  showHeader?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  showHeader = true
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Add modal-open class for CSS
      document.body.classList.add('modal-open');
      
      // Save the current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Remove modal-open class
      document.body.classList.remove('modal-open');
      
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-full max-w-[90vw] sm:max-w-md',
    md: 'w-full max-w-[95vw] sm:max-w-lg lg:max-w-xl xl:max-w-2xl',
    lg: 'w-full max-w-[98vw] sm:max-w-xl lg:max-w-2xl xl:max-w-4xl',
    xl: 'w-full max-w-[98vw] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl',
    '2xl': 'w-full max-w-[98vw] sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90vw]',
    full: 'w-full max-w-[98vw] h-full max-h-[98vh]'
  };

  const maxHeightBySize = {
    sm: 'max-h-[70vh]',
    md: 'max-h-[75vh]', 
    lg: 'max-h-[80vh]',
    xl: 'max-h-[85vh]',
    '2xl': 'max-h-[90vh]',
    full: 'max-h-[95vh]'
  };

  return (
    <div className="modal-with-sidebar">
      {/* Enhanced Backdrop with Animation */}
      <div 
        className={`modal-backdrop bg-gradient-to-br from-slate-900/60 via-blue-900/40 to-indigo-900/60 backdrop-blur-md backdrop-animate ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="modal-content-container p-4 lg:p-6 pt-8 lg:pt-10 pb-8 lg:pb-10">
        <div 
          className={`relative w-full ${sizeClasses[size]} modal-animate modal-container container-responsive ${
            isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modern Glass Card */}
          <div className={`bg-white/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20 overflow-hidden ${maxHeightBySize[size]} flex flex-col`}>
            
            {/* Enhanced Header */}
            {showHeader && (
              <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/50 px-4 lg:px-8 py-4 lg:py-6 flex items-center justify-between relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-indigo-50/30 opacity-50"></div>
                
                {/* Title Section */}
                <div className="relative flex items-center gap-3 lg:gap-4">
                  <div className=""></div>
                  <div>
                    <h3 className="">
                      {title}
                    </h3>
                    <div className=""></div>
                  </div>
                </div>
                
                {/* Close Button */}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="relative w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-red-50 hover:to-red-100 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-200 group shadow-lg hover:shadow-xl border border-slate-200/50"
                  >
                    <XMarkIcon className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600 group-hover:text-red-500 transition-colors duration-200" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-xl lg:rounded-2xl"></div>
                  </button>
                )}
              </div>
            )}
            
            {/* Content Container with Custom Scrollbar */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 px-4 lg:px-8 py-4 lg:py-6 modal-responsive" style={{scrollBehavior: 'smooth'}}>
                {children}
              </div>
            </div>
          </div>
          
          {/* Floating Close Button for No Header Mode */}
          {!showHeader && showCloseButton && (
            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 lg:-top-4 lg:-right-4 w-10 h-10 lg:w-12 lg:h-12 bg-white shadow-2xl rounded-full flex items-center justify-center hover:bg-red-50 transition-all duration-200 group border-2 lg:border-4 border-white"
            >
              <XMarkIcon className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600 group-hover:text-red-500 transition-colors duration-200" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
