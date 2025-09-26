import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { FileUpload } from '@/components/FileUpload';
import { useAuthedFetch } from '@/hooks/useAuthedFetch';
import styles from '@/styles/AdminFiles.module.css';

interface FileItem {
  name: string;
  url: string;
  size: number;
  type: 'image' | 'audio';
  uploadedAt: string;
}

export default function AdminFilesPage() {
  const authedFetch = useAuthedFetch();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'images' | 'audio'>('all');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await authedFetch('/api/admin/files');
      if (!response.ok) throw new Error('Failed to fetch files');

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, type: 'cover' | 'audio'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await authedFetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${type} file`);
    }

    const data = await response.json();
    return data.url;
  };

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      const file = files[0];
      await uploadFile(file, 'cover');
      await loadFiles(); // Refresh file list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAudioUpload = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      const file = files[0];
      await uploadFile(file, 'audio');
      await loadFiles(); // Refresh file list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload audio');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await authedFetch('/api/admin/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) throw new Error('Failed to delete file');

      setFiles(prev => prev.filter(file => file.name !== fileName));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      // You could add a toast notification here
      console.log('URL copied to clipboard');
    });
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    if (filter === 'all') return true;
    if (filter === 'images') return file.type === 'image';
    if (filter === 'audio') return file.type === 'audio';
    return true;
  });

  if (loading) {
    return (
      <AdminLayout title="File Management">
        <div className={styles.loading}>Loading files...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="File Management">
      <div className={styles.container}>
        {error && (
          <div className={styles.error}>
            <span>⚠️</span>
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Upload Section */}
        <div className={styles.uploadSection}>
          <h2>Upload Files</h2>
          <div className={styles.uploadGrid}>
            <div className={styles.uploadCard}>
              <h3>📸 Upload Cover Images</h3>
              <FileUpload
                uploadType="image"
                onFilesSelected={handleImageUpload}
                maxSize={5}
                disabled={uploading}
              />
            </div>
            <div className={styles.uploadCard}>
              <h3>🎵 Upload Audio Files</h3>
              <FileUpload
                uploadType="audio"
                onFilesSelected={handleAudioUpload}
                maxSize={100}
                disabled={uploading}
              />
            </div>
          </div>
        </div>

        {/* Files Section */}
        <div className={styles.filesSection}>
          <div className={styles.sectionHeader}>
            <h2>Uploaded Files ({filteredFiles.length})</h2>
            <div className={styles.filterButtons}>
              {(['all', 'images', 'audio'] as const).map(filterType => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`${styles.filterButton} ${filter === filterType ? styles.active : ''}`}
                >
                  {filterType === 'all' ? 'All Files' :
                   filterType === 'images' ? 'Images' : 'Audio Files'}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filesList}>
            {filteredFiles.map(file => (
              <div key={file.name} className={styles.fileCard}>
                <div className={styles.filePreview}>
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} />
                  ) : (
                    <div className={styles.audioIcon}>🎵</div>
                  )}
                </div>

                <div className={styles.fileInfo}>
                  <div className={styles.fileName}>{file.name}</div>
                  <div className={styles.fileMeta}>
                    <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                    <span className={styles.fileType}>
                      {file.type === 'image' ? '📸 Image' : '🎵 Audio'}
                    </span>
                  </div>
                  <div className={styles.fileUrl}>
                    <code>{file.url}</code>
                  </div>
                </div>

                <div className={styles.fileActions}>
                  <button
                    onClick={() => copyToClipboard(file.url)}
                    className={styles.copyButton}
                    title="Copy URL"
                  >
                    📋
                  </button>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewButton}
                    title="View file"
                  >
                    👁️
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file.name)}
                    className={styles.deleteButton}
                    title="Delete file"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            {filteredFiles.length === 0 && (
              <div className={styles.emptyState}>
                <p>No files found. Upload some files to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}