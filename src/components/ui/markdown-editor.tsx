"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const TOOLBAR_CONFIG = [
  { icon: Bold, label: "Bold", action: "bold" },
  { icon: Italic, label: "Italic", action: "italic" },
  { icon: Underline, label: "Underline", action: "underline" },
  { type: "divider" as const },
  { icon: Heading1, label: "Heading 1", action: "h1" },
  { icon: Heading2, label: "Heading 2", action: "h2" },
  { icon: Heading3, label: "Heading 3", action: "h3" },
  { type: "divider" as const },
  { icon: List, label: "Bullet List", action: "ul" },
  { icon: ListOrdered, label: "Numbered List", action: "ol" },
  { icon: Quote, label: "Quote", action: "quote" },
  { icon: Code, label: "Code", action: "code" },
  { icon: Minus, label: "Divider", action: "hr" },
  { type: "divider" as const },
  { icon: Link2, label: "Link", action: "link" },
] as const;

type ToolbarAction = (typeof TOOLBAR_CONFIG)[number];

function Divider() {
  return <div className="mx-1 h-6 w-px bg-border" />;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write something...",
  minHeight = "200px",
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const undoStack = useRef<string[]>([""]);
  const redoStack = useRef<string[]>([]);

  const insertText = useCallback(
    (before: string, after: string = "", placeholderText: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end) || placeholderText;

      undoStack.current.push(value);
      redoStack.current = [];

      const newValue =
        value.substring(0, start) +
        before +
        selectedText +
        after +
        value.substring(end);
      onChange(newValue);

      // Restore cursor position
      requestAnimationFrame(() => {
        textarea.focus();
        const cursorPos = start + before.length;
        textarea.setSelectionRange(cursorPos, cursorPos + selectedText.length);
      });
    },
    [value, onChange],
  );

  const handleAction = useCallback(
    (action: string) => {
      switch (action) {
        case "bold":
          insertText("**", "**", "bold text");
          break;
        case "italic":
          insertText("*", "*", "italic text");
          break;
        case "underline":
          insertText("<u>", "</u>", "underlined text");
          break;
        case "h1":
          insertText("# ", "", "Heading 1");
          break;
        case "h2":
          insertText("## ", "", "Heading 2");
          break;
        case "h3":
          insertText("### ", "", "Heading 3");
          break;
        case "ul":
          insertText("- ", "", "List item");
          break;
        case "ol":
          insertText("1. ", "", "List item");
          break;
        case "quote":
          insertText("> ", "", "Quote");
          break;
        case "code":
          insertText("`", "`", "code");
          break;
        case "hr":
          insertText("\n---\n", "", "");
          break;
        case "link":
          insertText("[", "](url)", "link text");
          break;
      }
    },
    [insertText],
  );

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    redoStack.current.push(value);
    onChange(undoStack.current.pop()!);
  }, [value, onChange]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    undoStack.current.push(value);
    onChange(redoStack.current.pop()!);
  }, [value, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
    },
    [handleUndo, handleRedo],
  );

  // Render toolbar from static config (NOT from a ref)
  const toolbarElements = useMemo(
    () =>
      TOOLBAR_CONFIG.map((item, index) => {
        if ("type" in item) {
          return <Divider key={`div-${index}`} />;
        }
        const btnItem = item as {
          icon: typeof Bold;
          label: string;
          action: string;
        };
        return (
          <Button
            key={btnItem.action}
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title={btnItem.label}
            onClick={() => handleAction(btnItem.action)}
          >
            <btnItem.icon className="h-3.5 w-3.5" />
          </Button>
        );
      }),
    [handleAction],
  );

  return (
    <div className="overflow-hidden rounded-md border border-border focus-within:ring-1 focus-within:ring-ring">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 border-b border-border bg-muted/50 px-2 py-1.5">
        {toolbarElements}
        <Divider />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title="Undo"
          onClick={handleUndo}
        >
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title="Redo"
          onClick={handleRedo}
        >
          <Redo2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full resize-none bg-background p-3 font-mono text-sm outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}
