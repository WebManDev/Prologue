"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Creator {
  id: string
  name: string
  sport: string
  type: "athlete" | "coach" | "mentor"
  avatar: string
  followers: string
  rating: number
  specialty: string
  bio: string
  location: string
  university?: string
  achievements: string[]
  isVerified: boolean
  subscriptionPrice: number
  responseRate: string
  totalStudents: number
  experience: string
}

interface MemberSubscriptionContextType {
  // Following state
  followingCreators: string[]
  isFollowing: (creatorId: string) => boolean
  followCreator: (creator: Creator) => void
  unfollowCreator: (creatorId: string) => void
  
  // Subscription state
  subscribedCreators: string[]
  isSubscribed: (creatorId: string) => boolean
  subscribeToCreator: (creator: Creator) => void
  unsubscribeFromCreator: (creatorId: string) => void
  
  // Content methods
  getCreatorContent: () => any[]
  getSubscribedContent: () => any[]
  hasNewContent: boolean
  hasNewSubscribedContent: boolean
  markContentAsViewed: () => void
  
  // Stats
  totalFollowing: number
  totalSubscribed: number
  
  // Actions
  clearAllFollowing: () => void
  clearAllSubscriptions: () => void
}

const MemberSubscriptionContext = createContext<MemberSubscriptionContextType | undefined>(undefined)

export function MemberSubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [followingCreators, setFollowingCreators] = useState<string[]>([])
  const [subscribedCreators, setSubscribedCreators] = useState<string[]>([])
  const [hasNewContent, setHasNewContent] = useState(false)
  const [hasNewSubscribedContent, setHasNewSubscribedContent] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFollowing = localStorage.getItem("member-following-creators")
    const savedSubscribed = localStorage.getItem("member-subscribed-creators")
    
    if (savedFollowing) {
      try {
        setFollowingCreators(JSON.parse(savedFollowing))
      } catch (error) {
        console.error("Error parsing saved following creators:", error)
      }
    }
    
    if (savedSubscribed) {
      try {
        setSubscribedCreators(JSON.parse(savedSubscribed))
      } catch (error) {
        console.error("Error parsing saved subscribed creators:", error)
      }
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("member-following-creators", JSON.stringify(followingCreators))
  }, [followingCreators])

  useEffect(() => {
    localStorage.setItem("member-subscribed-creators", JSON.stringify(subscribedCreators))
  }, [subscribedCreators])

  const isFollowing = (creatorId: string): boolean => {
    return followingCreators.includes(creatorId)
  }

  const followCreator = (creator: Creator) => {
    setFollowingCreators((prev) => {
      if (!prev.includes(creator.id)) {
        return [...prev, creator.id]
      }
      return prev
    })
    
    // Simulate API call
    console.log(`Following creator: ${creator.name} (${creator.id})`)
  }

  const unfollowCreator = (creatorId: string) => {
    setFollowingCreators((prev) => prev.filter((id) => id !== creatorId))
    
    // Simulate API call
    console.log(`Unfollowing creator: ${creatorId}`)
  }

  const isSubscribed = (creatorId: string): boolean => {
    return subscribedCreators.includes(creatorId)
  }

  const subscribeToCreator = (creator: Creator) => {
    setSubscribedCreators((prev) => {
      if (!prev.includes(creator.id)) {
        return [...prev, creator.id]
      }
      return prev
    })
    
    // Simulate API call for subscription
    console.log(`Subscribing to creator: ${creator.name} (${creator.id}) for $${creator.subscriptionPrice}/month`)
    
    // In a real app, this would trigger a payment flow
    // For now, we'll just add to the list
  }

  const unsubscribeFromCreator = (creatorId: string) => {
    setSubscribedCreators((prev) => prev.filter((id) => id !== creatorId))
    
    // Simulate API call
    console.log(`Unsubscribing from creator: ${creatorId}`)
  }

  // Content methods
  const getCreatorContent = (): any[] => {
    // Mock content from followed creators
    return followingCreators.map((creatorId, index) => ({
      id: `content-${creatorId}-${index}`,
      creatorId,
      creatorName: `Creator ${index + 1}`,
      creatorAvatar: "/placeholder.svg?height=40&width=40",
      creatorVerified: true,
      type: "blog" as const,
      title: `Content from ${creatorId}`,
      content: `This is content from creator ${creatorId}`,
      timestamp: "2 hours ago",
      likes: 100 + index * 10,
      comments: 10 + index,
      shares: 5 + index,
      views: 500 + index * 50,
      isNew: index === 0,
      isPremium: false,
      isRecommendation: false,
    }))
  }

  const getSubscribedContent = (): any[] => {
    // Mock premium content from subscribed creators
    return subscribedCreators.map((creatorId, index) => ({
      id: `premium-${creatorId}-${index}`,
      creatorId,
      creatorName: `Premium Creator ${index + 1}`,
      creatorAvatar: "/placeholder.svg?height=40&width=40",
      creatorVerified: true,
      type: "video" as const,
      title: `Premium Content from ${creatorId}`,
      content: `This is premium content from creator ${creatorId}`,
      timestamp: "1 hour ago",
      likes: 200 + index * 20,
      comments: 20 + index * 2,
      shares: 10 + index,
      views: 1000 + index * 100,
      isNew: index === 0,
      isPremium: true,
      isRecommendation: false,
      media: {
        type: "video",
        thumbnail: "/placeholder.svg?height=300&width=400",
        duration: "5:30",
      },
    }))
  }

  const markContentAsViewed = () => {
    setHasNewContent(false)
    setHasNewSubscribedContent(false)
  }

  const clearAllFollowing = () => {
    setFollowingCreators([])
    console.log("Cleared all following")
  }

  const clearAllSubscriptions = () => {
    setSubscribedCreators([])
    console.log("Cleared all subscriptions")
  }

  return (
    <MemberSubscriptionContext.Provider
      value={{
        followingCreators,
        isFollowing,
        followCreator,
        unfollowCreator,
        subscribedCreators,
        isSubscribed,
        subscribeToCreator,
        unsubscribeFromCreator,
        getCreatorContent,
        getSubscribedContent,
        hasNewContent,
        hasNewSubscribedContent,
        markContentAsViewed,
        totalFollowing: followingCreators.length,
        totalSubscribed: subscribedCreators.length,
        clearAllFollowing,
        clearAllSubscriptions,
      }}
    >
      {children}
    </MemberSubscriptionContext.Provider>
  )
}

export function useMemberSubscriptions() {
  const context = useContext(MemberSubscriptionContext)
  if (context === undefined) {
    throw new Error("useMemberSubscriptions must be used within a MemberSubscriptionProvider")
  }
  return context
} 