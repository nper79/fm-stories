import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Story } from '@/types/index'
import { stories as mockStories } from '@/data/mockContent'

export interface SupabaseStory {
  id: string
  title: string
  author: string
  description: string
  cover_image_url: string
  audio_url: string
  tags: string[]
  is_premium: boolean
  duration_minutes: number
  created_at: string
  updated_at: string
}

const mapSupabaseStory = (story: SupabaseStory): Story => ({
  id: story.id,
  title: story.title,
  author: story.author,
  description: story.description,
  coverImageUrl: story.cover_image_url,
  audioUrl: story.audio_url,
  tags: story.tags,
  isPremium: story.is_premium,
  durationMinutes: story.duration_minutes
})

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        // Check if Supabase is configured
        if (!supabase) {
          // Fall back to mock data
          setStories(mockStories)
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        const mappedStories = data.map(mapSupabaseStory)
        setStories(mappedStories)
      } catch (err) {
        console.warn('Failed to fetch from Supabase, falling back to mock data:', err)
        setStories(mockStories)
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  return { stories, loading, error }
}

export const useStory = (id: string | string[] | undefined) => {
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || Array.isArray(id)) {
      setLoading(false)
      return
    }

    const fetchStory = async () => {
      try {
        // Check if Supabase is configured
        if (!supabase) {
          // Fall back to mock data
          const mockStory = mockStories.find(s => s.id === id)
          setStory(mockStory || null)
          if (!mockStory) setError('Story not found')
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        setStory(mapSupabaseStory(data))
      } catch (err) {
        console.warn('Failed to fetch story from Supabase, falling back to mock data:', err)
        const mockStory = mockStories.find(s => s.id === id)
        setStory(mockStory || null)
        if (!mockStory) setError('Story not found')
      } finally {
        setLoading(false)
      }
    }

    fetchStory()
  }, [id])

  return { story, loading, error }
}