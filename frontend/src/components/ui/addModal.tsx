'use client';

import { useState } from "react";

import { FmdGoodOutlined, CloseOutlined } from '@mui/icons-material';
import ImageDropzone from "./imageDropzone";

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (locationName: string) => void;
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
}

export function AddModal({ isOpen, onClose, onConfirm } : AddModalProps) {
  if (!isOpen) return null;

  const [modeActive, setModeActive] = useState("input");
  const [inputValue, setInputValue] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

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
    setUploadedImage(file);
  }

  const handleSendImage = async () => {
    if (!uploadedImage) return;

    setIsLoading(true);
    setScanResult(null);

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
          note: result.data?.note
        });
      }
    } catch (error) {
      console.error("Error: ", error);
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
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sub-text"><FmdGoodOutlined /></div>
              <input 
                type='text'
                placeholder={'Enter a location'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full rounded-lg border-2 border-sub-text p-3 pl-10 text-dark-text paragraph-p3-medium placeholder-[color-mix(in_srgb,var(--color-hover),black_20%)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              />
              <button
                className="bg-primary text-light-text rounded-[8px] px-4 transition cursor-pointer hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)]"
              >Add</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ImageDropzone onImageUpload={handleImageUpload} />
            {uploadedImage && (
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
                        <button
                          onClick={() => {
                            if (onConfirm) {
                              onConfirm(scanResult.name);
                              onClose();
                            }
                          }}
                          className="bg-primary text-light-text px-4 py-2.5 ml-2 rounded-[8px] transition cursor-pointer hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)] whitespace-nowrap"
                        >
                          Add
                        </button>
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