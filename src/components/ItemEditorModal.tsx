import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, RotateCcw, Check, Image as ImageIcon, HelpCircle, FileSpreadsheet, Wand2, Code, Download, Upload, Copy, AlertCircle } from 'lucide-react';
import { PictureItem, Choice } from '../types/game';
import { savePictureItems, resetToDefaultItems } from '../data/pictureGameData';

interface ItemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PictureItem[];
  onItemsUpdated: (updated: PictureItem[]) => void;
}

export const ItemEditorModal: React.FC<ItemEditorModalProps> = ({
  isOpen,
  onClose,
  items,
  onItemsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'batch' | 'csv' | 'json'>('list');
  const [editingItem, setEditingItem] = useState<PictureItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Batch Formulator State
  const [batchPrompt, setBatchPrompt] = useState('Sex Offender or Tweaker?');
  const [batchCategory, setBatchCategory] = useState('Deductions');
  const [batchOptionA, setBatchOptionA] = useState('Sex Offender');
  const [batchOptionB, setBatchOptionB] = useState('Tweaker');
  const [batchLines, setBatchLines] = useState(
    'https://example.com/mug1.jpg | A | Arrested in 2021 in Ohio.\nhttps://example.com/mug2.jpg | B | Caught in Florida with methamphetamine.'
  );

  // CSV Import State
  const [csvText, setCsvText] = useState('');

  // JSON Import State
  const [jsonText, setJsonText] = useState('');

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setEditingItem({
      id: `item_${Date.now()}`,
      prompt: 'Sex Offender or Tweaker?',
      category: 'Deductions',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=640&q=80',
      optionA: {
        label: 'Sex Offender',
        description: 'Possibility A',
      },
      optionB: {
        label: 'Tweaker',
        description: 'Possibility B',
      },
      correctAnswer: 'A',
      correctFeedbackMessage: 'Great guess! You identified the subject correctly.',
      incorrectFeedbackMessage: 'Not quite! That was not the right answer.',
      informationBehindPicture: 'Background story and revealed details go here.',
      funFact: 'Optional trivia fact.',
      globalAccuracy: 70,
    });
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let updated: PictureItem[];
    if (isCreatingNew) {
      updated = [editingItem, ...items];
    } else {
      updated = items.map(item => (item.id === editingItem.id ? editingItem : item));
    }

    savePictureItems(updated);
    onItemsUpdated(updated);
    setEditingItem(null);
    setIsCreatingNew(false);
    showNotification('Item saved successfully!');
  };

  const handleDeleteItem = (id: string) => {
    if (items.length <= 1) {
      alert('You must have at least one picture item in the game.');
      return;
    }
    const updated = items.filter(item => item.id !== id);
    savePictureItems(updated);
    onItemsUpdated(updated);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all items back to starter defaults?')) {
      const reset = resetToDefaultItems();
      onItemsUpdated(reset);
      setEditingItem(null);
      setIsCreatingNew(false);
      showNotification('Restored default starter items.');
    }
  };

  // 1:1 Batch Formulator
  const handleRunBatchFormulator = () => {
    const lines = batchLines.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) {
      alert('Please enter at least one line in the format: image_url | A or B | backstory');
      return;
    }

    const newItems: PictureItem[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split('|').map(s => s.trim());
      if (parts.length < 2) continue;

      const imgUrl = parts[0];
      const answerChar = parts[1].toUpperCase() === 'B' ? 'B' : 'A';
      const backstory = parts[2] || `Subject confirmed as ${answerChar === 'A' ? batchOptionA : batchOptionB}.`;

      newItems.push({
        id: `batch_${Date.now()}_${i}`,
        prompt: batchPrompt,
        category: batchCategory,
        imageUrl: imgUrl,
        optionA: { label: batchOptionA },
        optionB: { label: batchOptionB },
        correctAnswer: answerChar,
        correctFeedbackMessage: `Spot on! Subject is a ${answerChar === 'A' ? batchOptionA : batchOptionB}.`,
        incorrectFeedbackMessage: `Incorrect. The subject is a ${answerChar === 'A' ? batchOptionA : batchOptionB}.`,
        informationBehindPicture: backstory,
        globalAccuracy: 75,
      });
    }

    if (newItems.length === 0) {
      alert('Could not parse items. Ensure lines follow: [Image URL] | [A or B] | [Story]');
      return;
    }

    const updated = [...newItems, ...items];
    savePictureItems(updated);
    onItemsUpdated(updated);
    setActiveTab('list');
    showNotification(`Successfully formulated and added ${newItems.length} items 1:1!`);
  };

  // CSV Generator
  const generateCSV = (): string => {
    const headers = ['imageUrl', 'prompt', 'optionA_label', 'optionB_label', 'correctAnswer', 'backstory', 'funFact', 'category'];
    const rows = items.map(item => [
      `"${item.imageUrl.replace(/"/g, '""')}"`,
      `"${item.prompt.replace(/"/g, '""')}"`,
      `"${item.optionA.label.replace(/"/g, '""')}"`,
      `"${item.optionB.label.replace(/"/g, '""')}"`,
      `"${item.correctAnswer}"`,
      `"${(item.informationBehindPicture || '').replace(/"/g, '""')}"`,
      `"${(item.funFact || '').replace(/"/g, '""')}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  const handleCopyCSV = async () => {
    const csv = generateCSV();
    try {
      await navigator.clipboard.writeText(csv);
      showNotification('CSV copied to clipboard! Ready to paste into Google Sheets or Excel.');
    } catch {
      setCsvText(csv);
    }
  };

  const handleImportCSV = () => {
    if (!csvText.trim()) return;
    try {
      const lines = csvText.split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        alert('CSV must contain a header row and at least one data row.');
        return;
      }

      const parsed: PictureItem[] = [];
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // simple CSV split regex handling quotes
        const match = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!match || match.length < 5) continue;

        const clean = (s: string) => s.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
        const imageUrl = clean(match[0]);
        const prompt = clean(match[1]);
        const optionA = clean(match[2]);
        const optionB = clean(match[3]);
        const answer = clean(match[4]).toUpperCase() === 'B' ? 'B' : 'A';
        const backstory = match[5] ? clean(match[5]) : '';
        const funFact = match[6] ? clean(match[6]) : '';
        const category = match[7] ? clean(match[7]) : 'Deductions';

        parsed.push({
          id: `csv_${Date.now()}_${i}`,
          imageUrl,
          prompt,
          category,
          optionA: { label: optionA },
          optionB: { label: optionB },
          correctAnswer: answer,
          correctFeedbackMessage: `Correct!`,
          incorrectFeedbackMessage: `Incorrect!`,
          informationBehindPicture: backstory,
          funFact,
          globalAccuracy: 75,
        });
      }

      if (parsed.length === 0) {
        alert('Could not parse any valid rows from the CSV text.');
        return;
      }

      savePictureItems(parsed);
      onItemsUpdated(parsed);
      setActiveTab('list');
      showNotification(`Replaced database with ${parsed.length} rows imported from spreadsheet!`);
    } catch (err) {
      alert('Error parsing CSV format. Check syntax.');
    }
  };

  const handleExportJSON = async () => {
    const str = JSON.stringify(items, null, 2);
    try {
      await navigator.clipboard.writeText(str);
      showNotification('JSON schema copied to clipboard for direct database seeding!');
    } catch {
      setJsonText(str);
    }
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        alert('Invalid JSON. Must be an array of PictureItem objects.');
        return;
      }
      savePictureItems(parsed);
      onItemsUpdated(parsed);
      setActiveTab('list');
      showNotification(`Loaded ${parsed.length} items from JSON!`);
    } catch {
      alert('Invalid JSON syntax.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/70 dark:bg-zinc-850/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg sm:text-xl text-zinc-950 dark:text-zinc-50">
                Database & Item Management
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold">
                {items.length} Total Items
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Edit individual items or sync hundreds of items 1:1 via Batch Formulator or Spreadsheets
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in shrink-0">
            <Check className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Sub-Tabs Navigation */}
        {!editingItem && (
          <div className="px-5 pt-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto shrink-0 bg-zinc-50/30 dark:bg-zinc-900">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span>Items List ({items.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'batch'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>1:1 Batch Formulator</span>
            </button>

            <button
              onClick={() => setActiveTab('csv')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'csv'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV Spreadsheet Sync</span>
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Database JSON</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {editingItem ? (
            /* Single Item Form Editor */
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {isCreatingNew ? 'Create Picture Item' : 'Edit Item'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsCreatingNew(false);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Question / Prompt
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.prompt}
                  onChange={e => setEditingItem({ ...editingItem, prompt: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Image URL & Preview */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Picture Image URL (HTTPS)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={editingItem.imageUrl}
                    onChange={e => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    className="flex-1 h-10 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
                    {editingItem.imageUrl ? (
                      <img
                        src={editingItem.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Options A & B */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-2">
                    Option A
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Label (e.g. Sex Offender)"
                    value={editingItem.optionA.label}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        optionA: { ...editingItem.optionA, label: e.target.value },
                      })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Subtitle description (optional)"
                    value={editingItem.optionA.description || ''}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        optionA: { ...editingItem.optionA, description: e.target.value },
                      })
                    }
                    className="w-full h-8 px-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mb-2">
                    Option B
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Label (e.g. Tweaker)"
                    value={editingItem.optionB.label}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        optionB: { ...editingItem.optionB, label: e.target.value },
                      })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Subtitle description (optional)"
                    value={editingItem.optionB.description || ''}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        optionB: { ...editingItem.optionB, description: e.target.value },
                      })
                    }
                    className="w-full h-8 px-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px]"
                  />
                </div>
              </div>

              {/* Correct Answer */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Which is the Correct Answer?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, correctAnswer: 'A' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      editingItem.correctAnswer === 'A'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    Option A is Correct ({editingItem.optionA.label || 'A'})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, correctAnswer: 'B' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      editingItem.correctAnswer === 'B'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    Option B is Correct ({editingItem.optionB.label || 'B'})
                  </button>
                </div>
              </div>

              {/* Backstory */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Information & Backstory Behind The Picture (Revealed after guess)
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.informationBehindPicture}
                  onChange={e =>
                    setEditingItem({ ...editingItem, informationBehindPicture: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-normal focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          ) : activeTab === 'batch' ? (
            /* 1:1 Batch Formulator */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 leading-relaxed flex items-start gap-2.5">
                <Wand2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">1:1 Automated Batch Generator</strong>
                  Paste a list of image URLs, correct answers (A or B), and backstories. The generator automatically formulates full 1:1 game items without manual clicking!
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Question / Prompt
                  </label>
                  <input
                    type="text"
                    value={batchPrompt}
                    onChange={e => setBatchPrompt(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={batchCategory}
                    onChange={e => setBatchCategory(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    Option A Label
                  </label>
                  <input
                    type="text"
                    value={batchOptionA}
                    onChange={e => setBatchOptionA(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                    Option B Label
                  </label>
                  <input
                    type="text"
                    value={batchOptionB}
                    onChange={e => setBatchOptionB(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Paste Items (One line per picture): <code className="text-purple-600 dark:text-purple-400 font-mono">[Image URL] | [A or B] | [Story]</code>
                </label>
                <textarea
                  rows={8}
                  value={batchLines}
                  onChange={e => setBatchLines(e.target.value)}
                  placeholder="https://example.com/mugshot1.jpg | A | Arrested in Texas in 2022.&#10;https://example.com/mugshot2.jpg | B | Caught in Phoenix with paraphernalia."
                  className="w-full p-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={handleRunBatchFormulator}
                className="w-full h-11 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
                <span>Formulate & Synchronize All Items</span>
              </button>
            </div>
          ) : activeTab === 'csv' ? (
            /* CSV Spreadsheet Sync */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed flex items-start gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Google Sheets / Excel 1:1 Schema Sync</strong>
                  Export all game items to a spreadsheet CSV, edit hundreds of entries in Google Sheets or Excel, and paste them back in to update the entire game database in one second.
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyCSV}
                  className="h-10 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full CSV to Clipboard</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Import CSV from Spreadsheet
                </label>
                <textarea
                  rows={8}
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  placeholder="Paste CSV from Google Sheets / Excel here..."
                  className="w-full p-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleImportCSV}
                className="w-full h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Import & Replace With Spreadsheet Data</span>
              </button>
            </div>
          ) : activeTab === 'json' ? (
            /* Raw Database JSON Sync */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed flex items-start gap-2.5">
                <Code className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Raw Database Schema (JSON)</strong>
                  Matches your SQL / Firestore / Supabase schema 1:1. Use this for programmatic database migrations and API backups.
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Complete JSON</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Import / Paste JSON Array
                </label>
                <textarea
                  rows={8}
                  value={jsonText}
                  onChange={e => setJsonText(e.target.value)}
                  placeholder="Paste JSON array here..."
                  className="w-full p-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleImportJSON}
                className="w-full h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Import JSON Data</span>
              </button>
            </div>
          ) : (
            /* Items List View */
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Single Item</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="h-9 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Defaults</span>
                </button>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-850/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                        <img
                          src={item.imageUrl}
                          alt="Thumb"
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-display font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          #{idx + 1}: {item.prompt}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                          [A] {item.optionA.label} vs [B] {item.optionB.label} · Answer: <strong className="text-indigo-600 dark:text-indigo-400">{item.correctAnswer}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem({ ...item });
                          setIsCreatingNew(false);
                        }}
                        className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
