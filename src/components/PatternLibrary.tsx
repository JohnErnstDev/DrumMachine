import { useState } from 'react';
import { useProjectStore } from '../store/useProjectStore.ts';

export function PatternLibrary() {
  const {
    patterns,
    activePatternId,
    addPattern,
    duplicatePattern,
    deletePattern,
    setActivePattern,
    renamePattern,
  } = useProjectStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  function startRename(id: string, currentName: string) {
    setEditingId(id);
    setEditName(currentName);
  }

  function commitRename(id: string) {
    const trimmed = editName.trim();
    if (trimmed) renamePattern(id, trimmed);
    setEditingId(null);
  }

  return (
    <div className="pattern-library">
      <div className="pattern-library__header">
        <span className="pattern-library__title">Patterns</span>
        <button className="pattern-library__add-btn" onClick={addPattern} title="New Pattern">
          + New
        </button>
      </div>

      <div className="pattern-library__scroll">
        {patterns.map((p) => {
          const isActive = p.id === activePatternId;
          const isEditing = editingId === p.id;

          return (
            <div
              key={p.id}
              className={`pattern-card${isActive ? ' pattern-card--active' : ''}`}
              onClick={() => !isEditing && setActivePattern(p.id)}
            >
              {isEditing ? (
                <input
                  className="pattern-card__rename-input"
                  value={editName}
                  autoFocus
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => commitRename(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(p.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="pattern-card__name"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startRename(p.id, p.name);
                  }}
                  title="Double-click to rename"
                >
                  {p.name}
                </span>
              )}

              <div className="pattern-card__actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="pattern-card__action-btn"
                  onClick={() => startRename(p.id, p.name)}
                  title="Rename"
                >
                  ✏️
                </button>
                <button
                  className="pattern-card__action-btn"
                  onClick={() => duplicatePattern(p.id)}
                  title="Duplicate"
                >
                  ⧉
                </button>
                <button
                  className="pattern-card__action-btn pattern-card__action-btn--delete"
                  onClick={() => deletePattern(p.id)}
                  disabled={patterns.length <= 1}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
