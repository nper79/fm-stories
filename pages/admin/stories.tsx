import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { FileUpload } from '@/components/FileUpload';
import { useAuthedFetch } from '@/hooks/useAuthedFetch';
import { Story } from '@/types/index';
import styles from '@/styles/AdminStories.module.css';

interface StoryForm {
  title: string;
  author: string;
  description: string;
  tags: string;
  durationMinutes: number;
  isPremium: boolean;
  coverFile: File | null;
  audioFile: File | null;
  coverUrl: string;
  audioUrl: string;
}

const initialForm: StoryForm = {
  title: '',
  author: '',
  description: '',
  tags: '',
  durationMinutes: 0,
  isPremium: false,
  coverFile: null,
  audioFile: null,
  coverUrl: '',
  audioUrl: '',
};

export default function AdminStoriesPage() {
  const authedFetch = useAuthedFetch();
  const [stories, setStories] = useState<Story[]>([]);
  const [storyForm, setStoryForm] = useState<StoryForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await authedFetch('/api/admin/stories');
      if (!response.ok) throw new Error('Failed to fetch stories');
      const data = await response.json();
      setStories(data.stories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories');
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

  const handleCoverUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setStoryForm(prev => ({ ...prev, coverFile: file }));

    try {
      setUploading(true);
      const url = await uploadFile(file, 'cover');
      setStoryForm(prev => ({ ...prev, coverUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload cover');
    } finally {
      setUploading(false);
    }
  };

  const handleAudioUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setStoryForm(prev => ({ ...prev, audioFile: file }));

    try {
      setUploading(true);
      const url = await uploadFile(file, 'audio');
      setStoryForm(prev => ({ ...prev, audioUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload audio');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.title || !storyForm.author || (!storyForm.audioUrl && !storyForm.audioFile)) {
      setError('Please fill in all required fields and upload an audio file');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Upload files if needed
      let coverUrl = storyForm.coverUrl;
      let audioUrl = storyForm.audioUrl;

      if (storyForm.coverFile && !coverUrl) {
        coverUrl = await uploadFile(storyForm.coverFile, 'cover');
      }

      if (storyForm.audioFile && !audioUrl) {
        audioUrl = await uploadFile(storyForm.audioFile, 'audio');
      }

      const storyData = {
        title: storyForm.title,
        author: storyForm.author,
        description: storyForm.description,
        coverImageUrl: coverUrl,
        audioUrl: audioUrl,
        tags: storyForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        durationMinutes: storyForm.durationMinutes,
        isPremium: storyForm.isPremium,
      };

      const url = editingId ? `/api/admin/stories/${editingId}` : '/api/admin/stories';
      const method = editingId ? 'PUT' : 'POST';

      const response = await authedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyData),
      });

      if (!response.ok) throw new Error('Failed to save story');

      setStoryForm(initialForm);
      setEditingId(null);
      await loadStories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save story');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (story: Story) => {
    setStoryForm({
      title: story.title,
      author: story.author,
      description: story.description,
      tags: story.tags.join(', '),
      durationMinutes: story.durationMinutes,
      isPremium: story.isPremium,
      coverFile: null,
      audioFile: null,
      coverUrl: story.coverImageUrl,
      audioUrl: story.audioUrl,
    });
    setEditingId(story.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    try {
      const response = await authedFetch(`/api/admin/stories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete story');

      setStories(prev => prev.filter(story => story.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete story');
    }
  };

  const resetForm = () => {
    setStoryForm(initialForm);
    setEditingId(null);
  };

  if (loading) {
    return (
      <AdminLayout title="Stories Management">
        <div className={styles.loading}>Loading stories...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Stories Management">
      <div className={styles.container}>
        {error && (
          <div className={styles.error}>
            <span>⚠️</span>
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className={styles.formSection}>
          <h2>{editingId ? 'Edit Story' : 'Add New Story'}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Author *</label>
                <input
                  type="text"
                  value={storyForm.author}
                  onChange={(e) => setStoryForm(prev => ({ ...prev, author: e.target.value }))}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={storyForm.durationMinutes}
                  onChange={(e) => setStoryForm(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={storyForm.isPremium}
                    onChange={(e) => setStoryForm(prev => ({ ...prev, isPremium: e.target.checked }))}
                  />
                  Premium Content
                </label>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Description</label>
              <textarea
                value={storyForm.description}
                onChange={(e) => setStoryForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                value={storyForm.tags}
                onChange={(e) => setStoryForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="romance, drama, thriller"
              />
            </div>

            <div className={styles.uploadSection}>
              <h3>Cover Image</h3>
              {storyForm.coverUrl && (
                <div className={styles.preview}>
                  <img src={storyForm.coverUrl} alt="Cover preview" />
                </div>
              )}
              <FileUpload
                uploadType="image"
                onFilesSelected={handleCoverUpload}
                maxSize={5}
                disabled={uploading}
              />
            </div>

            <div className={styles.uploadSection}>
              <h3>Audio File *</h3>
              {storyForm.audioUrl && (
                <div className={styles.preview}>
                  <audio controls src={storyForm.audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              <FileUpload
                uploadType="audio"
                onFilesSelected={handleAudioUpload}
                maxSize={100}
                disabled={uploading}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                disabled={saving || uploading}
                className={styles.submitButton}
              >
                {saving ? 'Saving...' : editingId ? 'Update Story' : 'Create Story'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className={styles.storiesSection}>
          <h2>Existing Stories ({stories.length})</h2>
          <div className={styles.storiesList}>
            {stories.map(story => (
              <div key={story.id} className={styles.storyCard}>
                <div className={styles.storyInfo}>
                  <div className={styles.storyHeader}>
                    <h3>{story.title}</h3>
                    <span className={`${styles.badge} ${story.isPremium ? styles.premium : styles.free}`}>
                      {story.isPremium ? 'Premium' : 'Free'}
                    </span>
                  </div>
                  <p className={styles.author}>by {story.author}</p>
                  <p className={styles.description}>{story.description}</p>
                  <div className={styles.storyMeta}>
                    <span>⏱️ {story.durationMinutes}min</span>
                    <span>🏷️ {story.tags.join(', ')}</span>
                  </div>
                </div>
                <div className={styles.storyActions}>
                  <button
                    onClick={() => handleEdit(story)}
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(story.id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {stories.length === 0 && (
              <div className={styles.emptyState}>
                <p>No stories yet. Create your first story above!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}