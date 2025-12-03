'use client';

import { useEffect, useRef, useState } from "react";
import UploadImage from '@/assets/images/upload-img.png';
import Image from "next/image";

interface ImageDropzoneProps {
  onImageUpload: (file: File) => void;
}

export default function ImageDropzone({ onImageUpload }: ImageDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      onImageUpload(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Only image files are allowed!');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 sm:p-5 text-center cursor-pointer transition duration-300
      ${isDragging ? 'bg-primary/20 border-primary' : 'bg-divider border-sub-text hover:border-dark-text'} flex flex-col items-stretch gap-4`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden input */}
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {!previewUrl && (
        <>
          <Image
            src={UploadImage}
            alt="upload image"
            width={260}
            height={140}
            className="mx-auto"
          />
          <p className="paragraph-p3-regular text-dark-text">
            Drag & drop an image here, or click to select one
          </p>
        </>
      )}

      {previewUrl && (
        <div className="flex w-full items-center gap-4">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 shadow-sm flex-shrink-0">
            <img
              src={previewUrl}
              alt="preview image"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-1 flex-col items-start text-left gap-1">
            <p className="paragraph-p3-medium text-dark-text line-clamp-2">
              {selectedFile?.name || 'Selected image'}
            </p>
            <p className="paragraph-p4-regular text-sub-text text-xs sm:text-sm">
              Drag & drop or click <span className="font-medium">Change photo</span> to update.
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="mt-2 inline-flex items-center rounded-full border border-primary px-3 py-1.5 text-xs sm:text-sm text-primary hover:bg-primary/5 transition"
            >
              Change photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}