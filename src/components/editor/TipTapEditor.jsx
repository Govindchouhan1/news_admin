import React, { useCallback, useState, useRef, memo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Code2,
  Check,
  X,
} from 'lucide-react';

// Memoized to avoid re-renders on every editor state change
const ToolbarButton = memo(({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    aria-pressed={active}
    className={`p-1.5 rounded text-sm transition-colors ${
      active
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
    } disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
));

const Divider = () => (
  <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />
);

const TipTapEditor = ({ value, onChange, placeholder = 'Mazmunni kiriting...', error, label }) => {
  const [linkBarOpen, setLinkBarOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary-600 underline cursor-pointer' },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[300px] p-4 text-gray-900 dark:text-gray-100',
      },
    },
  });

  // Open inline link bar instead of window.prompt
  const openLinkBar = useCallback(() => {
    if (!editor) return;
    const existing = editor.getAttributes('link').href || '';
    setLinkUrl(existing);
    setLinkBarOpen(true);
    setTimeout(() => linkInputRef.current?.focus(), 30);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setLinkBarOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const closeLinkBar = useCallback(() => {
    setLinkBarOpen(false);
    setLinkUrl('');
    editor?.commands.focus();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Rasm URL kiriting:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters?.() ?? 0;

  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div
        className={`tiptap-editor border rounded-lg overflow-hidden transition-all ${
          error
            ? 'border-red-500'
            : 'border-gray-300 dark:border-gray-700 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20'
        } bg-white dark:bg-gray-900`}
      >
        {/* Toolbar */}
        <div
          role="toolbar"
          aria-label="Text formatting"
          className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80"
        >
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo className="w-4 h-4" /></ToolbarButton>
          <Divider />
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 className="w-4 h-4" /></ToolbarButton>
          <Divider />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight"><Highlighter className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code"><Code className="w-4 h-4" /></ToolbarButton>
          <Divider />
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify className="w-4 h-4" /></ToolbarButton>
          <Divider />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List"><ListOrdered className="w-4 h-4" /></ToolbarButton>
          <Divider />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block"><Code2 className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule"><Minus className="w-4 h-4" /></ToolbarButton>
          <Divider />
          <ToolbarButton onClick={openLinkBar} active={editor.isActive('link')} title="Insert Link"><LinkIcon className="w-4 h-4" /></ToolbarButton>
          {editor.isActive('link') && (
            <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link"><Unlink className="w-4 h-4" /></ToolbarButton>
          )}
          <ToolbarButton onClick={addImage} title="Insert Image"><ImageIcon className="w-4 h-4" /></ToolbarButton>
        </div>

        {/* Inline link input bar — replaces window.prompt */}
        {linkBarOpen && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-primary-200 dark:border-primary-800 bg-primary-50/60 dark:bg-primary-900/20">
            <LinkIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
                if (e.key === 'Escape') closeLinkBar();
              }}
              placeholder="https://..."
              className="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={applyLink}
              className="p-1 rounded text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              title="Apply"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={closeLinkBar}
              className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Editor Content */}
        <EditorContent editor={editor} />

        {/* Footer */}
        <div className="flex items-center justify-end px-3 py-1.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <span className="text-xs text-gray-400">{charCount} belgi</span>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500" role="alert">{error}</p>}
    </div>
  );
};

export default TipTapEditor;
