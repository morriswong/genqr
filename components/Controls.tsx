import React, { useState } from 'react';
import { QRConfig, QRMode, BadgeConfig } from '../types';
import { Type, Link as LinkIcon, X, User, Upload, Trash2 } from 'lucide-react';

interface ControlsProps {
  config: QRConfig | BadgeConfig;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  isOpen: boolean;
  onClose: () => void;
  isBadgeMode?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ config, setConfig, isOpen, onClose, isBadgeMode = false }) => {
  const [mode, setMode] = useState<QRMode>(QRMode.URL);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isBadgeMode) {
      setConfig((prev: any) => ({ ...prev, qrUrl: e.target.value }));
    } else {
      setConfig((prev: any) => ({ ...prev, value: e.target.value }));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig((prev: any) => ({ ...prev, fullName: e.target.value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setConfig((prev: any) => ({
        ...prev,
        profilePhoto: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setConfig((prev: any) => ({
      ...prev,
      profilePhoto: undefined
    }));
  };

  if (!isOpen) return null;

  const badgeConfig = isBadgeMode ? (config as BadgeConfig) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="bg-white w-full max-w-2xl rounded-t-3xl shadow-2xl p-6 pointer-events-auto transform transition-transform duration-300 ease-out max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {isBadgeMode ? 'Create Badge' : 'Edit Content'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {isBadgeMode ? (
            <>
              {/* Name Input */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <User size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  value={badgeConfig?.fullName || ''}
                  onChange={handleNameChange}
                  placeholder="e.g., John Doe"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-700 text-lg"
                  autoFocus
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Upload size={16} />
                  Profile Photo
                </label>

                {badgeConfig?.profilePhoto && (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <img
                      src={badgeConfig.profilePhoto}
                      alt="Profile preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">Photo uploaded</p>
                      <p className="text-xs text-slate-500">Click upload to change</p>
                    </div>
                    <button
                      onClick={handleRemovePhoto}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      aria-label="Remove photo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}

                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl hover:border-slate-400 hover:bg-slate-100 transition-all cursor-pointer text-center">
                    <Upload size={24} className="mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-medium text-slate-600">
                      {badgeConfig?.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">JPG, PNG, or WebP</p>
                  </div>
                </label>
              </div>

              {/* QR URL Input */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <LinkIcon size={16} />
                  QR Code URL
                </label>
                <input
                  type="url"
                  value={badgeConfig?.qrUrl || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-700 text-base"
                />
                <p className="text-xs text-slate-500">
                  This URL will be encoded in the QR code
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Mode Selection Pills */}
              <div className="flex p-1 bg-slate-100 rounded-xl">
                {[
                  { id: QRMode.URL, icon: LinkIcon, label: 'URL' },
                  { id: QRMode.TEXT, icon: Type, label: 'Text' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-medium transition-all ${
                      mode === m.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <m.icon size={16} />
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Input Areas */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="relative flex items-center">
                    <input
                      type={mode === QRMode.URL ? 'url' : 'text'}
                      value={(config as QRConfig).value}
                      onChange={handleInputChange}
                      placeholder={mode === QRMode.URL ? 'https://example.com' : 'Enter your text here...'}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-700 text-lg"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* Text Overlay Section */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Type size={16} />
                  Center Text Overlay
                </label>
                <input
                  type="text"
                  value={(config as QRConfig).overlayText || ''}
                  onChange={(e) => setConfig((prev: any) => ({
                    ...prev,
                    overlayText: e.target.value,
                    overlayEnabled: e.target.value.length > 0
                  }))}
                  placeholder="e.g., SAVILLS"
                  maxLength={20}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-700 text-base"
                />
                <p className="text-xs text-slate-500">
                  Short text works best (e.g., brand name or identifier)
                </p>
              </div>
            </>
          )}

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold text-lg hover:bg-slate-800 transition-colors shadow-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};