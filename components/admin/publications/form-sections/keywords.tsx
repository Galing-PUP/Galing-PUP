'use client'

import { Label } from '@/components/ui/label'
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from '@/components/ui/shadcn-io/tags'
import { PublicationFormData } from '@/lib/validations/publication-schema'
import { CheckIcon, Loader2, PlusIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface KeywordsSectionProps {
  formData: PublicationFormData
  setFormData: React.Dispatch<React.SetStateAction<PublicationFormData>>
  errors: Record<string, string>
}

export function KeywordsSection({
  formData,
  setFormData,
  errors,
}: KeywordsSectionProps) {
  const [keywordSearch, setKeywordSearch] = useState('')
  const [availableKeywords, setAvailableKeywords] = useState<string[]>([])
  const [isKeywordLoading, setIsKeywordLoading] = useState(false)

  // Debounced keyword search
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchKeywords = async () => {
        setIsKeywordLoading(true)
        try {
          const response = await fetch(
            `/api/keywords?q=${encodeURIComponent(keywordSearch)}`,
          )
          if (response.ok) {
            const data = await response.json()
            setAvailableKeywords(
              data.map((k: { keywordText: string }) => k.keywordText),
            )
          }
        } catch (error) {
          console.error('Failed to fetch keywords:', error)
        } finally {
          setIsKeywordLoading(false)
        }
      }

      if (keywordSearch || availableKeywords.length === 0) {
        fetchKeywords()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [keywordSearch])

  const handleKeywordSelect = (value: string) => {
    if (formData.keywords.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        keywords: prev.keywords.filter((k) => k !== value),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, value],
      }))
    }
  }

  const handleKeywordRemove = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== value),
    }))
  }

  const handleCreateKeyword = () => {
    const trimmed = keywordSearch.trim()
    if (trimmed && !formData.keywords.includes(trimmed)) {
      // Add to form data
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, trimmed],
      }))
      // Add to available keywords if not already there (optimistic UI)
      if (!availableKeywords.includes(trimmed)) {
        setAvailableKeywords((prev) => [...prev, trimmed].sort())
      }
      setKeywordSearch('')
    }
  }

  const FieldError = ({ name }: { name: string }) => {
    if (!errors[name]) return null
    return (
      <p className="text-sm text-red-600 mt-1" data-error="true">
        {errors[name]}
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">Keywords / Tags</Label>
      <Tags className="w-full">
        <TagsTrigger className="w-full justify-start min-h-[42px]">
          {formData.keywords.map((keyword) => (
            <TagsValue
              key={keyword}
              onRemove={() => handleKeywordRemove(keyword)}
            >
              {keyword}
            </TagsValue>
          ))}
        </TagsTrigger>
        <TagsContent>
          <TagsInput
            onValueChange={setKeywordSearch}
            value={keywordSearch}
            placeholder="Search or create tag..."
          />
          <TagsList>
            <TagsEmpty>
              {isKeywordLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                </div>
              ) : (
                <button
                  className="mx-auto flex cursor-pointer items-center gap-2 text-sm"
                  onClick={handleCreateKeyword}
                  type="button"
                >
                  <PlusIcon className="text-muted-foreground" size={14} />
                  Create new tag: {keywordSearch}
                </button>
              )}
            </TagsEmpty>
            <TagsGroup>
              {availableKeywords.map((keyword) => (
                <TagsItem
                  key={keyword}
                  onSelect={handleKeywordSelect}
                  value={keyword}
                >
                  {keyword}
                  {formData.keywords.includes(keyword) && (
                    <CheckIcon className="text-muted-foreground" size={14} />
                  )}
                </TagsItem>
              ))}
            </TagsGroup>
          </TagsList>
        </TagsContent>
      </Tags>
      <FieldError name="keywords" />
    </div>
  )
}
