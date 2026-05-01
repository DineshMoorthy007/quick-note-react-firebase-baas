import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Timestamp;
}

interface NoteContextType {
  notes: Note[];
  fetchNotes: () => Promise<void>;
  addNote: (title: string, content: string) => Promise<void>;
  updateNote: (id: string, title: string, content: string) => Promise<void>;
  togglePin: (id: string, isPinned: boolean) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

interface NoteProviderProps {
  children: ReactNode;
}

export const NoteProvider: React.FC<NoteProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);

  const fetchNotes = async (): Promise<void> => {
    if (!currentUser) {
      setNotes([]);
      return;
    }

    try {
      const notesQuery = query(
        collection(db, 'notes'),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(notesQuery);
      const fetchedNotes: Note[] = [];

      querySnapshot.forEach((docSnapshot) => {
        fetchedNotes.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as Note);
      });

      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  };

  const addNote = async (title: string, content: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('User must be authenticated to add notes');
    }

    try {
      await addDoc(collection(db, 'notes'), {
        userId: currentUser.uid,
        title,
        content,
        isPinned: false,
        createdAt: Timestamp.now(),
      });
      await fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  };

  const updateNote = async (
    id: string,
    title: string,
    content: string
  ): Promise<void> => {
    if (!currentUser) {
      throw new Error('User must be authenticated to update notes');
    }

    try {
      const noteRef = doc(db, 'notes', id);
      await updateDoc(noteRef, {
        title,
        content,
      });
      await fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  const togglePin = async (id: string, isPinned: boolean): Promise<void> => {
    if (!currentUser) {
      throw new Error('User must be authenticated to pin notes');
    }

    try {
      const noteRef = doc(db, 'notes', id);
      await updateDoc(noteRef, {
        isPinned: !isPinned,
      });
      await fetchNotes();
    } catch (error) {
      console.error('Error toggling pin:', error);
      throw error;
    }
  };

  const deleteNote = async (id: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('User must be authenticated to delete notes');
    }

    try {
      const noteRef = doc(db, 'notes', id);
      await deleteDoc(noteRef);
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  // Fetch notes whenever the current user changes
  useEffect(() => {
    if (currentUser) {
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [currentUser]);

  const value: NoteContextType = {
    notes,
    fetchNotes,
    addNote,
    updateNote,
    togglePin,
    deleteNote,
  };

  return (
    <NoteContext.Provider value={value}>{children}</NoteContext.Provider>
  );
};

export const useNote = (): NoteContextType => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNote must be used within a NoteProvider');
  }
  return context;
};
