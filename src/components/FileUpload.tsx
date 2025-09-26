import { useState, useRef, useCallback } from 'react';
import styles from '@/styles/FileUpload.module.css';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onFilesSelected: (files: File[]) => void;
  uploadType: 'image' | 'audio' | 'any';
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  accept,
  multiple = false,
  maxSize = 10,
  onFilesSelected,
  uploadType,
  disabled = false,
  className = ''
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptTypes = () => {
    if (accept) return accept;
    switch (uploadType) {
      case 'image':
        return 'image/*';
      case 'audio':
        return 'audio/*,.mp3,.wav,.ogg,.m4a';
      default:
        return '*/*';
    }
  };

  const getUploadIcon = () => {
    switch (uploadType) {
      case 'image':
        return '🖼️';
      case 'audio':
        return '🎵';
      default:
        return '📁';
    }
  };

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const maxSizeBytes = maxSize * 1024 * 1024;

    for (const file of files) {
      if (file.size > maxSizeBytes) {
        setError(`File "${file.name}" is too large. Maximum size is ${maxSize}MB.`);
        continue;
      }

      if (uploadType === 'image' && !file.type.startsWith('image/')) {
        setError(`File "${file.name}" is not a valid image file.`);
        continue;
      }

      if (uploadType === 'audio' && !file.type.startsWith('audio/')) {
        setError(`File "${file.name}" is not a valid audio file.`);
        continue;
      }

      validFiles.push(file);
    }

    return validFiles;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    const fileArray = Array.from(files);
    const validFiles = validateFiles(fileArray);

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [maxSize, uploadType, onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    handleFiles(e.dataTransfer.files);
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const openFilePicker = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${disabled ? styles.disabled : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptTypes()}
          multiple={multiple}
          onChange={handleFileInput}
          className={styles.fileInput}
          disabled={disabled}
        />

        <div className={styles.uploadContent}>
          <div className={styles.uploadIcon}>{getUploadIcon()}</div>
          <div className={styles.uploadText}>
            <p className={styles.mainText}>
              {isDragging
                ? `Drop your ${uploadType === 'any' ? 'files' : uploadType + ' files'} here`
                : `Drag & drop ${uploadType === 'any' ? 'files' : uploadType + ' files'} here`}
            </p>
            <p className={styles.subText}>
              or <span className={styles.browseText}>browse files</span>
            </p>
          </div>
          <div className={styles.uploadInfo}>
            <p>Max file size: {maxSize}MB</p>
            {uploadType !== 'any' && (
              <p>Supported formats: {uploadType === 'image' ? 'JPG, PNG, GIF, WebP' : 'MP3, WAV, OGG, M4A'}</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
}