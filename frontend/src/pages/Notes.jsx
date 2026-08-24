import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { NoteModal } from '../components/modals/NoteModal';
import { useApp } from '../context/AppContext';
import { FileText, Plus, ArrowRight, Sparkles, Tag, Pin, Search, Edit2 } from 'lucide-react';

export const Notes = () => {
  const { notes, convertNoteToTask, togglePinNote } = useApp();
  const [selectedTag, setSelectedTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const handleOpenNewNote = () => {
    setSelectedNote(null);
    setIsNoteModalOpen(true);
  };

  const handleOpenEditNote = (note) => {
    setSelectedNote(note);
    setIsNoteModalOpen(true);
  };

  const allTags = ['all', ...new Set(notes.flatMap(n => n.tags))];

  const filteredNotes = notes.filter(note => {
    const matchesTag = selectedTag === 'all' || note.tags.includes(selectedTag);
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  // Sort pinned notes to top
  const sortedNotes = [...filteredNotes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Notes & Ideas"
        subtitle="Capture thoughts, lecture points, and ideas to instantly convert into actionable tasks."
        action={
          <Button
            variant="ai"
            size="sm"
            onClick={handleOpenNewNote}
            icon={Plus}
          >
            New Note
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-panel p-4">
        {/* Tags Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-zinc-500 font-medium flex items-center gap-1 shrink-0">
            <Tag className="w-3.5 h-3.5 text-zinc-500" />
            Tags:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer shrink-0 ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-60">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedNotes.map((note) => (
          <div key={note.id} className="card-panel p-6 card-hover flex flex-col justify-between group relative">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((t, idx) => (
                    <Badge key={idx} variant="primary" size="sm">
                      {t}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => togglePinNote(note.id)}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      note.pinned ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100'
                    }`}
                    title={note.pinned ? "Unpin note" : "Pin note"}
                  >
                    <Pin className="w-3.5 h-3.5 fill-indigo-400/20" />
                  </button>
                  <button
                    onClick={() => handleOpenEditNote(note)}
                    className="p-1 text-zinc-500 hover:text-indigo-400 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Edit Note"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-zinc-100 mb-2">
                {note.title}
              </h3>

              <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line mb-4">
                {note.content}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
              <button
                onClick={() => convertNoteToTask(note.id)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Convert to Task
              </button>
              <span className="text-[10px] font-mono text-zinc-500">{note.createdAt}</span>
            </div>
          </div>
        ))}
      </div>

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        note={selectedNote}
      />
    </div>
  );
};
