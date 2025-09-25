import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { episodes as mockEpisodes } from '@/data/mockContent'

export interface Episode {
  id: string
  storyId: string
  title: string
  duration: string
  listens: string
  isPremium: boolean
  episodeNumber: number
  audioUrl?: string
}

interface SupabaseEpisode {
  id: string
  story_id: string
  title: string
  duration: string
  listens: string
  is_premium: boolean
  episode_number: number
  audio_url?: string
}

const mapSupabaseEpisode = (episode: SupabaseEpisode): Episode => ({
  id: episode.id,
  storyId: episode.story_id,
  title: episode.title,
  duration: episode.duration,
  listens: episode.listens,
  isPremium: episode.is_premium,
  episodeNumber: episode.episode_number,
  audioUrl: episode.audio_url
})

export const useEpisodes = (storyId: string | string[] | undefined) => {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!storyId || Array.isArray(storyId)) {
      setLoading(false)
      return
    }

    const fetchEpisodes = async () => {
      try {
        // Check if Supabase is configured
        if (!supabase) {
          // Fall back to mock data
          const mockEpisodesForStory = mockEpisodes.filter(ep => ep.storyId === storyId)
          setEpisodes(mockEpisodesForStory)
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('episodes')
          .select('*')
          .eq('story_id', storyId)
          .order('episode_number', { ascending: true })

        if (error) throw error

        const mappedEpisodes = data.map(mapSupabaseEpisode)
        setEpisodes(mappedEpisodes)
      } catch (err) {
        console.warn('Failed to fetch episodes from Supabase, falling back to mock data:', err)
        const mockEpisodesForStory = mockEpisodes.filter(ep => ep.storyId === storyId)
        setEpisodes(mockEpisodesForStory)
      } finally {
        setLoading(false)
      }
    }

    fetchEpisodes()
  }, [storyId])

  return { episodes, loading, error }
}