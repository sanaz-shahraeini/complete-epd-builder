"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { useUserStore } from "@/lib/store/user"
import { MoreVertical, Reply, Forward, Paperclip, Image, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Message {
  id: number
  sender: number
  sender_name: string
  recipient: number
  recipient_name: string
  subject: string
  content: string
  status: 'unread' | 'read' | 'archived'
  epd_file?: string
  created_at: string
}

export function MessageView({ message }: { message?: Message }) {
  const [replyContent, setReplyContent] = useState("")
  const user = useUserStore((state) => state.user)
  const t = useTranslations('MessageView')

  const handleReply = async () => {
    if (!message || !replyContent.trim()) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: message.sender,
          subject: `Re: ${message.subject}`,
          content: replyContent,
        }),
      })

      if (response.ok) {
        setReplyContent("")
        // Optionally trigger a refresh of the message list
      }
    } catch (error) {
      console.error('Error sending reply:', error)
    }
  }

  if (!message) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a message to view
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{message.sender_name}</h3>
            <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Reply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6 text-muted-foreground">
        <h2 className="text-2xl font-semibold mb-4">{message.subject}</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p>{message.content}</p>
        </div>
        {message.epd_file && (
          <div className="mt-4 p-4 border rounded-lg">
            <p className="font-medium mb-2">Attached EPD File:</p>
            <a
              href={message.epd_file}
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View EPD File
            </a>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          <div>
            <h4 className="font-medium">Product Name 01</h4>
            <p className="text-sm text-green-600">{t('productFastLCA')}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <Button variant="outline" className="gap-2">
          <Reply className="h-4 w-4" />
          {t('reply')}
        </Button>
        <Button variant="outline" className="gap-2">
          <Forward className="h-4 w-4" />
          {t('forward')}
        </Button>
      </div>

      <div className="mt-6">
        <div className="relative flex flex-col gap-2">
          <Textarea
            placeholder={t('typePlaceholder')}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="pr-24 min-h-[100px] align-top mb-4"
            style={{ resize: 'vertical' }}
          />
          <div className="absolute right-2 top-2 flex gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Paperclip className="h-4 w-4" />
              {t('attach')}
            </Button>
            <Button variant="default" size="sm" className="gap-1 bg-teal-600 hover:bg-teal-500" onClick={handleReply} disabled={!replyContent.trim()}>
              <Send className="h-4 w-4" />
              {t('send')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
