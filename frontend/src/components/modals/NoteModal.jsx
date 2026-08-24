import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { FileText, Save, Trash2 } from 'lucide-react';

export const NoteModal = ({ isOpen, onClose, note }) => {
  const { addNote, updateNote, deleteNote } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('AI');

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTagInput((note.tags && note.tags.join(', ')) || 'General');
    } else {
      setTitle('');
      setContent('');
      setTagInput('AI');
    }
  }, [note, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);

    if (note) {
      updateNote(note.id, {
        title,
        content,
        tags: tags.length > 0 ? tags : ['General']
      });
    } else {
      addNote({
        title,
        content,
        tags: tags.length > 0 ? tags : ['General']
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (note) {
      deleteNote(note.id);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={note ? "Edit Note" : "Create New Note"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Note Title
          </label>
          <input
            type="text"
            placeholder="e.g. DBMS Lecture Highlights"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            placeholder="e.g. AI, Ideas, Architecture"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Content
          </label>
          <textarea
            rows={5}
            placeholder="Write down detailed notes or thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          {note ? (
            <Button variant="danger" size="sm" onClick={handleDelete} icon={Trash2}>
              Delete
            </Button>
          ) : <div />}

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="ai" size="sm" type="submit" icon={Save}>
              {note ? "Save Changes" : "Save Note"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
