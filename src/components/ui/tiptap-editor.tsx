"use client"

import type React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Bold from "@tiptap/extension-bold"
import Italic from "@tiptap/extension-italic"
import Underline from "@tiptap/extension-underline"
import Strike from "@tiptap/extension-strike"
import Code from "@tiptap/extension-code"
import CodeBlock from "@tiptap/extension-code-block"
import Heading from "@tiptap/extension-heading"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import ListItem from "@tiptap/extension-list-item"
import Link from "@tiptap/extension-link"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import Color from "@tiptap/extension-color"
import FontFamily from "@tiptap/extension-font-family"
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  Strikethrough,
  CodeIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Palette,
  Type,
  Minus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useCallback, useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const TiptapEditor = ({
  content,
  onChange,
  placeholder = "Start writing your product description...",
  className,
  disabled = false,
}: TiptapEditorProps) => {
  const [linkUrl, setLinkUrl] = useState("")
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false)
  const [isColorPopoverOpen, setIsColorPopoverOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      Bold,
      Italic,
      Underline,
      Strike,
      Code,
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm border-l-4 border-orange-500",
        },
      }),
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: "font-bold text-gray-900 dark:text-gray-100",
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc list-inside space-y-1",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal list-inside space-y-1",
        },
      }),
      ListItem,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-orange-600 hover:text-orange-800 underline cursor-pointer transition-colors",
        },
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: "bg-yellow-200 dark:bg-yellow-800 px-1 rounded",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
     
      Color,
      FontFamily.configure({
        types: ["textStyle"],
      }),
    ],
    content,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[300px] p-6",
          "prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h1:mb-4 prose-h2:mb-3 prose-h3:mb-2",
          "prose-p:my-3 prose-p:leading-relaxed prose-ul:my-3 prose-ol:my-3 prose-li:my-1",
          "prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm",
          "prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic",
          "dark:prose-invert dark:prose-code:bg-gray-800 dark:prose-blockquote:border-gray-600",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          className,
        ),
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    setLinkUrl("")
    setIsLinkPopoverOpen(false)
  }, [editor, linkUrl])

  const unsetLink = useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
  }, [editor])

  const setColor = useCallback(
    (color: string) => {
      if (!editor) return
      editor.chain().focus().setColor(color).run()
      setIsColorPopoverOpen(false)
    },
    [editor],
  )

  if (!isMounted || !editor) {
    return (
      <div
        className={cn(
          "border rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm",
          disabled && "opacity-50",
        )}
      >
        <div className="border-b bg-gray-50 dark:bg-gray-800 p-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
        <div className="min-h-[300px] p-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    )
  }

   const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={ `h-12 w-12 p-0 ${isActive ?"bg-primary text-primary-foreground":""}`}
    >
      {children}
    </Button>
  )

  const colors = [
    "#000000",
    "#374151",
    "#6B7280",
    "#9CA3AF",
    "#EF4444",
    "#F97316",
    "#EAB308",
    "#22C55E",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#F43F5E",
  ]

  return (
    <div
      className={cn("border rounded-xl overflow-hidden bg-white dark:bg-dark shadow-sm", disabled && "opacity-50")}
    >
      {/* Toolbar */}
      <div className="border-b bg-gray-50 dark:bg-dark p-3">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-lg p-1 border">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold (Ctrl+B)"
            >
              <BoldIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic (Ctrl+I)"
            >
              <ItalicIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive("code")}
              title="Inline Code"
            >
              <CodeIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Separator orientation="vertical" className="h-8 mx-1" />

          {/* Headings */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-lg p-1 border">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4"  size={22}/>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Separator orientation="vertical" className="h-8 mx-1" />

          {/* Lists */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-lg p-1 border">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive("codeBlock")}
              title="Code Block"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Separator orientation="vertical" className="h-8 mx-1" />

          {/* Text Alignment */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-lg p-1 border">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              isActive={editor.isActive({ textAlign: "left" })}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              isActive={editor.isActive({ textAlign: "center" })}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              isActive={editor.isActive({ textAlign: "right" })}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              isActive={editor.isActive({ textAlign: "justify" })}
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Separator orientation="vertical" className="h-8 mx-1" />

          {/* Link & Color
         {/* <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-lg p-1 border">
            <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  className={cn(
                    "h-9 w-9 p-0 flex items-center justify-center transition-all duration-200",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    editor.isActive("link") &&
                      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300",
                  )}
                  title="Add Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Add Link</h4>
                  <Input
                    placeholder="Enter URL (e.g., https://example.com)"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        setLink()
                      }
                    }}
                    className="text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline"  onClick={() => setIsLinkPopoverOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={setLink}>
                      Add Link
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <ToolbarButton onClick={unsetLink} disabled={!editor.isActive("link")} title="Remove Link">
              <Unlink className="h-4 w-4" />
            </ToolbarButton>

            <Popover open={isColorPopoverOpen} onOpenChange={setIsColorPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  className="h-9 w-9 p-0 flex items-center justify-center transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Text Color"
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Text Color</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors"
                        style={{ backgroundColor: color }}
                        onClick={() => setColor(color)}
                        title={color}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      editor.chain().focus().unsetColor().run()
                      setIsColorPopoverOpen(false)
                    }}
                    className="w-full"
                  >
                    Remove Color
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Separator orientation="vertical" className="h-8 mx-1" /> */}

          {/* Highlight & More */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-lg p-1 border">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive("highlight")}
              title="Highlight Text"
            >
              <Highlighter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
              <Minus className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Separator orientation="vertical" className="h-8 mx-1" />

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-lg p-1 border">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[300px] max-h-[500px] overflow-y-auto bg-white dark:bg-[#424242]">
        <EditorContent editor={editor} />
      </div>

      {/* Footer with word count */}
      <div className="border-t bg-gray-50 dark:bg-gray-800 px-4 py-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span>{editor.storage.characterCount?.characters() || 0} characters</span>
          <span>{editor.storage.characterCount?.words() || 0} words</span>
        </div>
        <div className="flex items-center gap-2">
          <Type className="h-3 w-3" />
          <span>Rich Text Editor</span>
        </div>
      </div>
    </div>
  )
}

export default TiptapEditor
