"use client";
import React, { useCallback } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $generateHtmlFromNodes } from "@lexical/html";
import { EditorState, LexicalEditor, FORMAT_TEXT_COMMAND } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

// Fallback ErrorBoundary for RichTextPlugin
function ErrorBoundary({ error }: { error: Error }) {
  return <div className="text-red-500">Error: {error.message}</div>;
}

interface LexicalRichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
}

// Toolbar component for bold/italic
function Toolbar() {
  const [editor] = useLexicalComposerContext();
  return (
    <div className="mb-2 flex gap-2">
      <button
        type="button"
        className="px-2 py-1 border rounded hover:bg-gray-100"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <b>B</b>
      </button>
      <button
        type="button"
        className="px-2 py-1 border rounded hover:bg-gray-100"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <i>I</i>
      </button>
    </div>
  );
}

export default function LexicalRichTextEditor({ value, onChange }: LexicalRichTextEditorProps) {
  const initialConfig = {
    namespace: "ContentDescriptionEditor",
    theme: {},
    onError(error: Error) {
      throw error;
    },
  };

  // Handle editor state changes and convert to HTML
  const handleChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      editor.update(() => {
        const htmlString = $generateHtmlFromNodes(editor, null);
        onChange(htmlString);
      });
    },
    [onChange]
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Toolbar />
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="border rounded p-2 min-h-[120px] max-h-[300px] overflow-y-auto" />
        }
        placeholder={<div className="text-gray-400">Describe your content...</div>}
        ErrorBoundary={ErrorBoundary}
      />
      <HistoryPlugin />
      <OnChangePlugin onChange={handleChange} />
    </LexicalComposer>
  );
} 