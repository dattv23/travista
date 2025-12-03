'use client';

import { useState } from "react";

import { FmdGoodOutlined, CloseOutlined } from '@mui/icons-material';
import ImageDropzone from "./imageDropzone";
import SearchLocationInput from "./searchLocationInput";

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (location: { name: string; lat: number; lng: number }, forceAdd?: boolean) => void;
  validationWarning?: string | null;
  validationError?: string | null;
  isValidating?: boolean;
  onValidationChange?: (warning: string | null) => void;
  onAddAnyway?: () => void;
  onCancel?: () => void;
}

interface AnalyzeResponse {
  success: boolean;
  locationName?: string; 
  data?: {
    nameKR?: string;
    nameEN?: string;
    description?: string;
    lat?: number | null;
    lng?: number | null;
    note?: string | null;
  };
}

interface ScanResult {
  name: string;          
  description?: string;  
  note?: string | null;  
  lat?: number | null;
  lng?: number | null;
}

export function AddModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  validationWarning: externalWarning, 
  validationError: externalError,
  isValidating = false,
  onValidationChange,
  onAddAnyway,
  onCancel
} : AddModalProps) {
  if (!isOpen) return null;

  const [modeActive, setModeActive] = useState("input");
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [internalWarning, setInternalWarning] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null)

  const validationWarning = externalWarning || internalWarning;

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const handleLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    setSelectedLocation(location);
    setInternalWarning(null);
    if (onValidationChange) {
      onValidationChange(null);
    }
  };

  const handleAddLocation = () => {
    if (selectedLocation && onConfirm) {
      onConfirm(selectedLocation);
      setSelectedLocation(null);
      setInternalWarning(null);
      if (onValidationChange) {
        onValidationChange(null);
      }
    }
  };

  // const isValidLocation = detectedLocation && detectedLocation !== "Unknown location" && !note;

  const getButtonClasses = (mode: string) => {
    const isActive = modeActive === mode;
    return `
      w-1/2 py-2 px-4 paragraph-p4-medium transition cursor-pointer
      ${isActive ? 'bg-light-text text-light-text bg-primary rounded-lg' : 'text-dark-text hover:text-primary'}
    `;
  };

  const handleImageUpload = (file: File) => {
    console.log('Image upload: ', file);
    setUploadError(null); 
    setScanResult(null);  

    // Check if file is larger than 5MB 
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("This image is too large. Please upload a file smaller than 5MB.");
      setUploadedImage(null); // Prevent setting the invalid image
      return;
    }

    setUploadedImage(file);
  }

  const handleSendImage = async () => {
    if (!uploadedImage) return;

    setIsLoading(true);
    setScanResult(null);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedImage);

      const response = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/analyze/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error Detail:", errorData); 
        throw new Error(errorData.message || 'Failed to analyze');
      }

      const result: AnalyzeResponse = await response.json();

      if (result.success) {
        const name: any = result.data?.nameEN || result.data?.nameKR || result.locationName;
        setScanResult({
          name: name,
          description: result.data?.description,
          note: result.data?.note,
          lat: result.data?.lat ?? null,
          lng: result.data?.lng ?? null
        });
      }
    } catch (error) {
      console.error("Error: ", error);
      setUploadError("An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  } 

  return(
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-start">
        <p className="paragraph-p1-semibold text-dark-text mb-4">Add new stop</p>
        <button 
          onClick={onClose}
          className="flex items-start transition cursor-pointer p-2 rounded-full hover:bg-hover"
        >
          <CloseOutlined />
        </button>
      </div>
      <div>
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-4">
          <button
            className={getButtonClasses("input")}
            onClick={() => setModeActive("input")}
          >Input</button>
          <button
            className={getButtonClasses("image")}
            onClick={() => setModeActive("image")}
          >Image</button>
        </div>
        {modeActive === "input" ? (
          <div className="flex flex-col gap-3">
            <div className="relative w-full flex gap-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sub-text z-10"><FmdGoodOutlined /></div>
              <div className="relative w-full">
                <SearchLocationInput onSelect={handleLocationSelect} />
              </div>
              <button
                onClick={handleAddLocation}
                disabled={!selectedLocation || isValidating}
                className="bg-primary text-light-text rounded-[8px] px-4 transition cursor-pointer hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isValidating ? 'Validating...' : 'Add'}
              </button>
            </div>
            {selectedLocation && (
              <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm text-dark-text">
                  <span className="font-medium">Selected:</span> {selectedLocation.name}
                </p>
              </div>
            )}
            {externalWarning && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 mb-3">{externalWarning}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (onAddAnyway) {
                        onAddAnyway();
                      }
                    }}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-[8px] transition cursor-pointer hover:bg-yellow-700 text-sm font-medium"
                  >
                    Add Anyway
                  </button>
                  <button
                    onClick={() => {
                      if (onCancel) {
                        onCancel();
                      }
                      setSelectedLocation(null);
                      setInternalWarning(null);
                      if (onValidationChange) {
                        onValidationChange(null);
                      }
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-[8px] transition cursor-pointer hover:bg-gray-300 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {externalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800 mb-3">{externalError}</p>
                <button
                  onClick={() => {
                    if (onCancel) {
                      onCancel();
                    }
                    setSelectedLocation(null);
                    setInternalWarning(null);
                    if (onValidationChange) {
                      onValidationChange(null);
                    }
                  }}
                  className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-[8px] transition cursor-pointer hover:bg-gray-300 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ImageDropzone onImageUpload={handleImageUpload} />

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 paragraph-p3-medium">Error</p>
                <p className="text-sm text-red-500 paragraph-p3-medium">{uploadError}</p>
              </div>
            )}

            {uploadedImage && !uploadError && (
              <>
                <div className="flex justify-between">
                  <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-700 font-medium">Uploaded file: {uploadedImage.name}</p>
                  </div>
                  <button
                    className="bg-primary text-light-text px-4 mt-2 rounded-[8px] transition cursor-pointer hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)]"
                    onClick={handleSendImage}
                  >
                    {isLoading ? 'Processing...' : 'Scan'}
                  </button>
                </div>
                {scanResult && (
                  <>
                    <hr className="text-divider my-2" />
                    <div className="flex justify-between items-center">
                      
                      <div className="flex flex-col gap-1">
                        {scanResult.name === "Unknown location" ? (
                          <p className="paragraph-p4-regular text-red-600">
                            * Cannot identify this location. Please try another image.
                          </p>
                        ) : (
                          <>
                            {scanResult.note && <p className="paragraph-p4-regular text-red-600">
                              * Location is not in Korea. Please try another image.
                            </p>}
                            <p className="paragraph-p3-medium text-dark-text">
                              This location is <span className="text-primary">{scanResult.name}</span>
                            </p>
                            {scanResult.description && (
                              <p className="paragraph-p4-regular text-sub-text">
                                {scanResult.description}
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {(scanResult.name !== "Unknown location" && !scanResult.note) && (
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={() => {
                              if (
                                onConfirm &&
                                scanResult.lat != null &&
                                scanResult.lng != null
                              ) {
                                onConfirm({
                                  name: scanResult.name,
                                  lat: scanResult.lat,
                                  lng: scanResult.lng
                                });
                                setInternalWarning(null);
                                if (onValidationChange) {
                                  onValidationChange(null);
                                }
                                onClose();
                              }
                            }}
                            className="bg-primary text-light-text px-4 py-2.5 rounded-[8px] transition cursor-pointer hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)] whitespace-nowrap"
                          >
                            Add &amp; Close
                          </button>
                          <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-[8px] border border-divider text-sub-text hover:bg-hover transition cursor-pointer whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}