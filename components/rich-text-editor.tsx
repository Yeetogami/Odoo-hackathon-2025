"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Smile,
  Link,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  const insertText = (before: string, after = "") => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const toolbarButtons = [
    { icon: Bold, action: () => insertText("**", "**"), title: "Bold" },
    { icon: Italic, action: () => insertText("*", "*"), title: "Italic" },
    { icon: Strikethrough, action: () => insertText("~~", "~~"), title: "Strikethrough" },
    { icon: List, action: () => insertText("\n- "), title: "Bullet List" },
    { icon: ListOrdered, action: () => insertText("\n1. "), title: "Numbered List" },
    { icon: Link, action: () => insertText("[", "](url)"), title: "Link" },
    { icon: ImageIcon, action: () => insertText("![alt](", ")"), title: "Image" },
    { icon: Smile, action: () => insertText("😊"), title: "Emoji" },
    { icon: AlignLeft, action: () => insertText("\n<div align='left'>", "</div>"), title: "Align Left" },
    { icon: AlignCenter, action: () => insertText("\n<div align='center'>", "</div>"), title: "Align Center" },
    { icon: AlignRight, action: () => insertText("\n<div align='right'>", "</div>"), title: "Align Right" },
  ]

  return (
    <div className={`border rounded-lg ${className}`}>
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={button.action}
            title={button.title}
            className="h-8 w-8 p-0"
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="ml-auto">
          <Button variant="ghost" size="sm" onClick={() => setIsPreview(!isPreview)}>
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      <div className="p-3">
        {isPreview ? (
          <div
            className="min-h-[200px] prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, "<br>") }}
          />
        ) : (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[200px] border-0 p-0 resize-none focus-visible:ring-0"
          />
        )}
      </div>
    </div>
  )
}
