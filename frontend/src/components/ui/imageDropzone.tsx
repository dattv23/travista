'use client';

import { useEffect, useRef, useState } from "react";
import UploadImage from '@/assets/images/upload-img.png';
import Image from "next/image";

interface ImageDropzoneProps {
  onImageUpload: (file: File) => void;
}

export default function ImageDropzone ({ onImageUpload } : ImageDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      onImageUpload(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Only image files are allowed!');
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }

  const handleClick = () => {
    inputRef.current?.click();
  }

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

  return(
    <div
      className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition duration-300
      ${isDragging ? 'bg-primary/20 border-primary' : 'bg-divider border-sub-text hover:border-dark-text'} flex flex-col items-center gap-4 
      `}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Image 
        src={UploadImage}
        alt="upload image"
        width={300}
        height={150}
        className={`${previewUrl ? 'hidden' : 'block'}`}
      />
      <input 
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange} 
        className="hidden"
      />

      {previewUrl ? (
        <div>
          <img 
            src={previewUrl}
            alt="preview image"
            className="w-full max-h-[300px] object-contain mt-3 rounded"
          />
          <p className="mt-2 paragraph-p3-regular text-dark-text">Drag & drop or click to change image</p>
        </div>
      ) : (
        <p className="paragraph-p3-regular text-dark-text">Drag & drop an image here, or click to select one</p>
      )}
    </div>
  )
}