import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNote } from '../context/NoteContext';
import '../styles/Dashboard.css';

export const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { notes, fetchNotes, addNote, updateNote, deleteNote, togglePin } = useNote();

  // Add Note form state
  const [addTitle, setAddTitle] = useState<string>('');
  const [addContent, setAddContent] = useState<string>('');

  // Edit Note modal state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');

  // Modal visibility
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Error state
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, [currentUser]);

  const handleAddNote = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!addTitle.trim() || !addContent.trim()) {
      setError('Title and content are required.');
      setIsLoading(false);
      return;
    }

    try {
      await addNote(addTitle, addContent);
      setAddTitle('');
      setAddContent('');
      setShowAddModal(false);
    } catch (err) {
      setError('Failed to add note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (noteId: string, title: string, content: string): void => {
    setEditingNoteId(noteId);
    setEditTitle(title);
    setEditContent(content);
    setShowEditModal(true);
    setError('');
  };

  const handleUpdateNote = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!editingNoteId) {
      setIsLoading(false);
      return;
    }

    if (!editTitle.trim() || !editContent.trim()) {
      setError('Title and content are required.');
      setIsLoading(false);
      return;
    }

    try {
      await updateNote(editingNoteId, editTitle, editContent);
      setEditingNoteId(null);
      setEditTitle('');
      setEditContent('');
      setShowEditModal(false);
    } catch (err) {
      setError('Failed to update note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await deleteNote(noteId);
    } catch (err) {
      setError('Failed to delete note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePin = async (noteId: string, isPinned: boolean): Promise<void> => {
    setError('');
    setIsLoading(true);

    try {
      await togglePin(noteId, isPinned);
    } catch (err) {
      setError('Failed to update note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch (err) {
      setError('Failed to logout. Please try again.');
    }
  };

  const closeAddModal = (): void => {
    setShowAddModal(false);
    setAddTitle('');
    setAddContent('');
    setError('');
  };

  const closeEditModal = (): void => {
    setShowEditModal(false);
    setEditingNoteId(null);
    setEditTitle('');
    setEditContent('');
    setError('');
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort notes: pinned first, then by creation date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned === b.isPinned) {
      return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
    }
    return a.isPinned ? -1 : 1;
  });

  const formatDate = (timestamp: any): string => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <img src="/favicon.svg" alt="Quick-Note" className="logo-icon" />
          <h1>Quick-Note</h1>
        </div>

        <div className="header-center">
          <input
            type="text"
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="header-right">
          <span className="user-email">{currentUser?.email || 'User'}</span>
          <button onClick={handleLogout} className="logout-button" title="Logout">
            →|
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Error Message */}
        {error && <div className="error-banner">{error}</div>}

        {/* Section Title */}
        <div className="section-header">
          <div>
            <h2>My Board</h2>
            <p>{sortedNotes.length} notes captured</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="new-note-button"
            disabled={isLoading}
          >
            New Note
          </button>
        </div>

        {/* Notes Grid */}
        <div className="notes-grid">
          {sortedNotes.length === 0 ? (
            <div className="empty-state">
              <p>No notes yet. Create one to get started!</p>
            </div>
          ) : (
            sortedNotes.map((note) => (
              <div
                key={note.id}
                className={`note-card ${note.isPinned ? 'pinned' : ''}`}
              >
                {note.isPinned && <div className="pinned-badge">PINNED</div>}

                <h3 className="note-title">{note.title}</h3>
                <p className="note-content">{note.content}</p>

                <div className="note-footer">
                  <span className="note-date">{formatDate(note.createdAt)}</span>
                  <div className="note-actions">
                    <button
                      onClick={() => handleTogglePin(note.id, note.isPinned)}
                      className="action-button pin-button"
                      title={note.isPinned ? 'Unpin' : 'Pin'}
                      disabled={isLoading}
                    >
                      {note.isPinned ? '★' : '☆'}
                    </button>
                    <button
                      onClick={() =>
                        handleEditClick(note.id, note.title, note.content)
                      }
                      className="action-button edit-button"
                      title="Edit"
                      disabled={isLoading}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="action-button delete-button"
                      title="Delete"
                      disabled={isLoading}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Note</h2>
              <button onClick={closeAddModal} className="modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNote} className="note-form">
              <div className="form-group">
                <label htmlFor="add-title">Title</label>
                <input
                  id="add-title"
                  type="text"
                  placeholder="Give your note a title..."
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  disabled={isLoading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-content">Note Content</label>
                <textarea
                  id="add-content"
                  placeholder="Start typing your thoughts..."
                  value={addContent}
                  onChange={(e) => setAddContent(e.target.value)}
                  disabled={isLoading}
                  className="form-textarea"
                  rows={8}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="cancel-button"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Note</h2>
              <button onClick={closeEditModal} className="modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateNote} className="note-form">
              <div className="form-group">
                <label htmlFor="edit-title">Title</label>
                <input
                  id="edit-title"
                  type="text"
                  placeholder="Give your note a title..."
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={isLoading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-content">Note Content</label>
                <textarea
                  id="edit-content"
                  placeholder="Start typing your thoughts..."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  disabled={isLoading}
                  className="form-textarea"
                  rows={8}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="cancel-button"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
