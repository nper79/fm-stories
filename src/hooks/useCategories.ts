import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Story } from '@/types/index'
import { categories as mockCategories, stories as mockStories } from '@/data/mockContent'

export interface Category {
  id: string
  title: string
  description?: string
  stories: Story[]
}

interface SupabaseCategory {
  id: string
  title: string
  description?: string
}

interface CategoryWithStories extends SupabaseCategory {
  category_stories: {
    stories: {
      id: string
      title: string
      author: string
      description: string
      cover_image_url: string
      audio_url: string
      tags: string[]
      is_premium: boolean
      duration_minutes: number
    }
  }[]
}

const mapCategoryWithStories = (category: CategoryWithStories): Category => ({
  id: category.id,
  title: category.title,
  description: category.description,
  stories: category.category_stories.map(cs => ({
    id: cs.stories.id,
    title: cs.stories.title,
    author: cs.stories.author,
    description: cs.stories.description,
    coverImageUrl: cs.stories.cover_image_url,
    audioUrl: cs.stories.audio_url,
    tags: cs.stories.tags,
    isPremium: cs.stories.is_premium,
    durationMinutes: cs.stories.duration_minutes
  }))
})

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Check if Supabase is configured
        if (!supabase) {
          // Fall back to mock data
          const mappedMockCategories = mockCategories.map(cat => ({
            id: cat.id,
            title: cat.title,
            description: cat.description,
            stories: cat.storyIds.map(id => mockStories.find(s => s.id === id)!).filter(Boolean)
          }))
          setCategories(mappedMockCategories)
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('categories')
          .select(`
            id,
            title,
            description,
            category_stories (
              stories (
                id,
                title,
                author,
                description,
                cover_image_url,
                audio_url,
                tags,
                is_premium,
                duration_minutes
              )
            )
          `)
          .order('created_at', { ascending: true })

        if (error) throw error

        const mappedCategories = (data as unknown as CategoryWithStories[]).map(mapCategoryWithStories)
        setCategories(mappedCategories)
      } catch (err) {
        console.warn('Failed to fetch categories from Supabase, falling back to mock data:', err)
        const mappedMockCategories = mockCategories.map(cat => ({
          id: cat.id,
          title: cat.title,
          description: cat.description,
          stories: cat.storyIds.map(id => mockStories.find(s => s.id === id)!).filter(Boolean)
        }))
        setCategories(mappedMockCategories)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}