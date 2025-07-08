"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Eye, Clock, ThumbsUp, Share2, BookmarkPlus, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { db, getAthleteProfile } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

// Mock article data as fallback
const ARTICLE_DATA = {
  1: {
    id: 1,
    title: "Understanding Pressure in Competition",
    description: "Learn to identify and manage high-pressure scenarios in competitive sports.",
    content: `# Understanding Pressure in Competition

Pressure situations are inevitable in competitive sports. The key to success lies not in avoiding pressure, but in learning how to thrive under it.

## What Creates Pressure?

Pressure typically comes from several sources:

- **High stakes competitions**: Championships, playoffs, or career-defining moments
- **Expectations**: From coaches, teammates, fans, and yourself
- **Personal goals**: The desire to achieve specific outcomes or milestones
- **Fear of failure**: Worry about making mistakes or disappointing others
- **Media attention**: Scrutiny from press and social media
- **Time constraints**: Limited opportunities to achieve goals

## The Physiology of Pressure

When we experience pressure, our body activates the fight-or-flight response:

- Increased heart rate and blood pressure
- Elevated breathing and oxygen consumption
- Muscle tension and reduced fine motor control
- Heightened awareness and tunnel vision
- Release of stress hormones like cortisol and adrenaline

Understanding these physical responses helps athletes recognize when they're under pressure and implement appropriate coping strategies.

## Reframing Pressure as Opportunity

Elite athletes learn to view pressure differently:

- **A sign that the moment matters**: Pressure indicates you're in a position where your performance has significance
- **An opportunity to showcase skills**: High-pressure moments are chances to demonstrate your training and preparation
- **A chance to grow**: Overcoming pressure builds mental resilience and confidence
- **Energy that can be channeled**: The arousal from pressure can enhance performance when properly directed

## Practical Strategies for Managing Pressure

### 1. Breathing Techniques
- **Box breathing**: Inhale for 4 counts, hold for 4, exhale for 4, hold for 4
- **Diaphragmatic breathing**: Deep belly breathing to activate the parasympathetic nervous system
- **Rhythmic breathing**: Sync your breathing with your movement or routine

### 2. Positive Self-Talk
- Replace negative thoughts with constructive, encouraging statements
- Use present-tense, positive affirmations
- Focus on process rather than outcome
- Develop personal mantras or cue words

### 3. Visualization and Mental Rehearsal
- Practice performing successfully under pressure in your mind
- Visualize handling difficult situations with composure
- Mental rehearsal of your pre-performance routine
- Imagine the feelings of success and confidence

### 4. Focus on Process
- Concentrate on what you can control rather than outcomes
- Break down performance into smaller, manageable components
- Focus on technique and execution rather than results
- Stay present and avoid thinking too far ahead

### 5. Preparation and Routine
- Thorough physical and mental preparation builds confidence
- Develop consistent pre-performance routines
- Practice under pressure-like conditions in training
- Have contingency plans for different scenarios

## Building Pressure Tolerance

Like physical fitness, mental resilience can be developed through progressive training:

- **Gradual exposure**: Start with lower-pressure situations and gradually increase intensity
- **Simulation training**: Create practice environments that mimic competition pressure
- **Reflection and learning**: Analyze both successful and unsuccessful pressure situations
- **Seek pressure opportunities**: Volunteer for high-stakes moments to gain experience

## The Role of Support Systems

Having strong support systems helps manage pressure:

- **Coaches**: Provide guidance, perspective, and technical support
- **Teammates**: Offer encouragement and shared understanding
- **Family and friends**: Provide emotional support and grounding
- **Sports psychologists**: Offer professional mental training techniques

## Long-term Pressure Management

Developing a sustainable approach to pressure:

- **Maintain perspective**: Remember why you started and what you love about your sport
- **Balance**: Ensure sports don't become your entire identity
- **Recovery**: Allow time for mental and physical restoration
- **Continuous learning**: View each pressure situation as a learning opportunity

## Conclusion

Pressure is not the enemy of performance—it's often the catalyst for greatness. The athletes who learn to embrace pressure, rather than fear it, are the ones who consistently perform when it matters most.

Remember: Pressure is a privilege. It means you're in a position where your performance matters, where you have the opportunity to make a difference, and where you can showcase the skills you've worked so hard to develop.

The next time you feel pressure building, take a deep breath, remember your preparation, and step into the moment with confidence. You've earned the right to be there.`,
    readTime: "8 min read",
    views: 567,
    likes: 89,
    rating: 4.6,
    totalRatings: 124,
    category: "Mental Performance",
    tags: ["Mental", "Competition", "Pressure", "Psychology"],
    author: {
      name: "Dr. Sarah Mitchell",
      title: "Sports Psychologist",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "PhD in Sports Psychology with 15 years of experience working with elite athletes. Specializes in mental performance training and competitive psychology.",
    },
    publishedAt: "3 days ago",
  },
  2: {
    id: 2,
    title: "Nutrition for Peak Athletic Performance",
    description: "Comprehensive guide to fueling your body for optimal athletic performance and recovery.",
    content: `# Nutrition for Peak Athletic Performance

What you eat directly impacts your athletic performance. This comprehensive guide covers everything from pre-workout nutrition to recovery meals, helping you optimize your diet for peak performance.

## The Foundation: Macronutrients

### Carbohydrates: Your Primary Fuel Source

Carbohydrates are the body's preferred energy source for high-intensity exercise:

- **Simple carbs**: Quick energy for immediate use (fruits, sports drinks)
- **Complex carbs**: Sustained energy for longer activities (whole grains, vegetables)
- **Timing**: Consume carbs 1-4 hours before exercise for optimal glycogen stores

**Recommended intake**: 3-12g per kg of body weight daily, depending on training intensity and duration.

### Protein: Building and Repairing Muscle

Protein is essential for muscle repair, growth, and recovery:

- **Complete proteins**: Contain all essential amino acids (meat, fish, eggs, dairy)
- **Plant proteins**: May need combining for complete amino acid profile (beans, nuts, grains)
- **Timing**: Consume protein within 30 minutes post-workout for optimal recovery

**Recommended intake**: 1.2-2.0g per kg of body weight daily for athletes.

### Fats: Essential for Health and Performance

Healthy fats support hormone production and provide sustained energy:

- **Omega-3 fatty acids**: Reduce inflammation (fish, walnuts, flaxseeds)
- **Monounsaturated fats**: Support heart health (olive oil, avocados)
- **Timing**: Avoid high-fat meals immediately before exercise

**Recommended intake**: 20-35% of total daily calories.

## Micronutrients: The Performance Enhancers

### Iron
- Essential for oxygen transport
- Deficiency leads to fatigue and decreased performance
- Sources: Red meat, spinach, lentils, fortified cereals

### Calcium
- Critical for bone health and muscle function
- Important for injury prevention
- Sources: Dairy products, leafy greens, fortified foods

### Vitamin D
- Supports bone health and immune function
- May enhance muscle strength and power
- Sources: Sunlight exposure, fatty fish, fortified foods

### B Vitamins
- Essential for energy metabolism
- Support nervous system function
- Sources: Whole grains, meat, eggs, leafy greens

## Hydration: The Often Overlooked Factor

Proper hydration is crucial for performance:

### Pre-Exercise Hydration
- Drink 16-20 oz of fluid 2-3 hours before exercise
- Additional 8 oz 15-20 minutes before starting

### During Exercise
- 6-8 oz every 15-20 minutes during exercise
- Sports drinks for activities longer than 60 minutes

### Post-Exercise Recovery
- Drink 150% of fluid lost through sweat
- Include sodium to enhance fluid retention

## Meal Timing for Optimal Performance

### Pre-Workout Nutrition (1-4 hours before)
**Goals**: Maximize glycogen stores, prevent hunger, optimize hydration

**Ideal meal composition**:
- High in carbohydrates
- Moderate protein
- Low in fat and fiber
- Familiar foods to avoid digestive issues

**Examples**:
- Oatmeal with banana and honey
- Whole grain toast with peanut butter
- Greek yogurt with berries
- Sports drink and banana (30-60 minutes before)

### During Workout Nutrition
**For exercises longer than 60 minutes**:
- 30-60g carbohydrates per hour
- Sports drinks, gels, or easily digestible foods
- Maintain hydration

### Post-Workout Recovery (within 30 minutes)
**Goals**: Replenish glycogen, repair muscle tissue, rehydrate

**Ideal composition**:
- 3:1 or 4:1 ratio of carbohydrates to protein
- 1.0-1.5g carbs per kg body weight
- 0.25-0.3g protein per kg body weight

**Examples**:
- Chocolate milk
- Greek yogurt with fruit
- Turkey and avocado sandwich
- Protein smoothie with banana

## Sport-Specific Nutrition Strategies

### Endurance Sports
- Higher carbohydrate needs (8-12g per kg body weight)
- Focus on glycogen loading before long events
- Practice fueling strategies during training

### Strength and Power Sports
- Higher protein needs (1.6-2.0g per kg body weight)
- Adequate carbohydrates for high-intensity training
- Creatine supplementation may be beneficial

### Team Sports
- Balanced approach with adequate carbs and protein
- Focus on recovery nutrition between games
- Maintain hydration throughout tournaments

## Supplements: What Works and What Doesn't

### Evidence-Based Supplements
- **Creatine**: Improves power and strength in short bursts
- **Caffeine**: Enhances endurance and reduces perceived exertion
- **Beta-alanine**: May improve performance in 1-4 minute activities
- **Protein powder**: Convenient way to meet protein needs

### Questionable or Unnecessary
- Most fat burners and metabolism boosters
- Excessive vitamin and mineral supplements
- Expensive proprietary blends
- Detox products

## Common Nutrition Mistakes Athletes Make

### 1. Undereating
- Restricting calories too severely
- Not eating enough to support training demands
- Leads to fatigue, poor recovery, and increased injury risk

### 2. Poor Timing
- Skipping pre-workout meals
- Not refueling properly after training
- Inconsistent meal timing

### 3. Overcomplicating
- Following overly restrictive diets
- Constantly changing nutrition strategies
- Focusing on minor details while ignoring basics

### 4. Inadequate Hydration
- Not drinking enough throughout the day
- Waiting until thirsty to drink
- Relying only on water for long training sessions

## Building Your Nutrition Plan

### Step 1: Assess Your Current Intake
- Track food and fluid intake for 3-7 days
- Note energy levels and performance
- Identify patterns and potential issues

### Step 2: Set Specific Goals
- Performance goals (strength, endurance, power)
- Body composition goals (if appropriate)
- Health and wellness goals

### Step 3: Create a Framework
- Plan meals around training schedule
- Ensure adequate calories and macronutrients
- Include foods you enjoy and can sustain

### Step 4: Monitor and Adjust
- Track performance and energy levels
- Adjust based on training phases
- Be flexible and willing to modify

## Conclusion

Optimal nutrition is not about perfection—it's about consistency and making informed choices that support your training and performance goals. Focus on the fundamentals: adequate calories, proper macronutrient balance, good timing, and staying hydrated.

Remember that nutrition needs are highly individual. What works for one athlete may not work for another. Experiment during training, not during competition, and consider working with a sports nutritionist to develop a personalized plan.

Your body is your most important piece of equipment. Fuel it properly, and it will reward you with improved performance, faster recovery, and better overall health.`,
    readTime: "12 min read",
    views: 1089,
    likes: 156,
    rating: 4.8,
    totalRatings: 203,
    category: "Nutrition",
    tags: ["Nutrition", "Performance", "Recovery", "Health"],
    author: {
      name: "Lisa Martinez",
      title: "Registered Dietitian & Sports Nutritionist",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "Registered Dietitian with specialization in sports nutrition. Works with professional athletes and teams to optimize performance through nutrition.",
    },
    publishedAt: "1 week ago",
  },
}

interface ArticlePageProps {
  params: {
    id: string
  }
}

// Utility to allow only <b>, <strong>, <i>, <em> tags in HTML and filter out meaningless content
function sanitizeDescription(html: string) {
  if (!html) return "";
  
  // Remove all tags except <b>, <strong>, <i>, <em>
  let cleaned = html
    .replace(/<(?!\/?(b|strong|i|em)\b)[^>]*>/gi, "")
    .replace(/<\/?(script|style)[^>]*>/gi, "");
  
  // Filter out single letters or very short meaningless content
  const lines = cleaned.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmedLine = line.trim();
    // Remove lines that are just single letters, single characters, or very short meaningless content
    if (trimmedLine.length <= 2) return false;
    if (/^[a-zA-Z]$/.test(trimmedLine)) return false; // Single letters
    if (/^[a-zA-Z]{1,2}$/.test(trimmedLine)) return false; // 1-2 character strings
    return true;
  });
  
  return filteredLines.join('\n');
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { isMobile, isTablet } = useMobileDetection()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [instructor, setInstructor] = useState<any>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true)
      try {
        // Try to fetch from Firestore first
        const articleRef = doc(db, "articles", params.id)
        const articleSnap = await getDoc(articleRef)
        
        if (articleSnap.exists()) {
          const articleData: any = { id: articleSnap.id, ...articleSnap.data() }
          
          // Transform Firestore data to match our UI structure
          const transformedArticle = {
            id: articleData.id,
            title: articleData.title || "Untitled Article",
            description: articleData.description || articleData.subtitle || "",
            content: articleData.content || articleData.description || "",
            readTime: articleData.readTime || "5 min read",
            views: articleData.views || 0,
            likes: articleData.likes || 0,
            rating: articleData.rating || 4.5,
            totalRatings: articleData.totalRatings || 0,
            category: articleData.category || "General",
            tags: articleData.tags || [],
            author: {
              name: articleData.authorName || articleData.author?.name || "Unknown Author",
              title: articleData.authorTitle || articleData.author?.title || "",
              avatar: articleData.authorAvatar || articleData.author?.avatar || "/placeholder.svg?height=40&width=40",
              bio: articleData.authorBio || articleData.author?.bio || "",
            },
            publishedAt: articleData.publishedAt || articleData.createdAt?.toDate?.()?.toLocaleDateString() || "Recently",
          }
          
          setArticle(transformedArticle)
          
          // Fetch instructor profile if authorId exists
          if (articleData.authorId) {
            const profile = await getAthleteProfile(articleData.authorId)
            setInstructor(profile)
          } else {
            setInstructor(null)
          }
        } else {
          // Fallback to mock data
          const articleId = Number.parseInt(params.id)
          const mockArticleData = ARTICLE_DATA[articleId as keyof typeof ARTICLE_DATA]
          if (mockArticleData) {
            setArticle(mockArticleData)
            setInstructor(null)
          } else {
            setArticle(null)
            setInstructor(null)
          }
        }
      } catch (error) {
        console.error("Error fetching article:", error)
        // Fallback to mock data
        const articleId = Number.parseInt(params.id)
        const mockArticleData = ARTICLE_DATA[articleId as keyof typeof ARTICLE_DATA]
        if (mockArticleData) {
          setArticle(mockArticleData)
          setInstructor(null)
        } else {
          setArticle(null)
          setInstructor(null)
        }
      }
      setLoading(false)
    }
    
    fetchArticle()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500 text-lg">Loading...</div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Article not found</h2>
          <p className="text-gray-600 mb-4">The article you're looking for doesn't exist.</p>
          <Link href="/content">
            <Button>Back to Content Library</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleLike = () => {
    setHasLiked(!hasLiked)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  // Parse content into structured format
  const parseContent = (content: string) => {
    const lines = content.split("\n")
    const elements: any[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line.startsWith("# ")) {
        elements.push({ type: "h1", content: line.substring(2) })
      } else if (line.startsWith("## ")) {
        elements.push({ type: "h2", content: line.substring(3) })
      } else if (line.startsWith("### ")) {
        elements.push({ type: "h3", content: line.substring(4) })
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        // Handle list items
        const listItems = [line.substring(2)]
        let j = i + 1
        while (j < lines.length && (lines[j].trim().startsWith("- ") || lines[j].trim().startsWith("* "))) {
          listItems.push(lines[j].trim().substring(2))
          j++
        }
        elements.push({ type: "ul", items: listItems })
        i = j - 1
      } else if (line.startsWith("**") && line.endsWith("**")) {
        elements.push({ type: "bold", content: line.slice(2, -2) })
      } else if (line.length > 0) {
        elements.push({ type: "p", content: line })
    } else {
        elements.push({ type: "br" })
      }
    }

    return elements
  }

  const contentElements = parseContent(article.content)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/content">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Library
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className={`text-lg font-semibold text-gray-900 truncate max-w-md ${isMobile ? 'hidden' : ''}`}>{article.title}</h1>
                <p className={`text-sm text-gray-600 ${isMobile ? 'hidden' : ''}`}>
                  by {instructor
                    ? `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim()
                    : (article.author.name === "Unknown Author" && article.author.firstName && article.author.lastName)
                      ? `${article.author.firstName} ${article.author.lastName}`
                      : article.author.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleBookmark} className={isMobile ? "px-2" : ""}>
                <BookmarkPlus className={`h-4 w-4 ${isMobile ? "" : "mr-2"} ${isBookmarked ? "fill-current" : ""}`} />
                {isMobile ? "" : (isBookmarked ? "Bookmarked" : "Bookmark")}
                </Button>
              <Button variant="outline" size="sm" className={isMobile ? "px-2" : ""}>
                <Share2 className={`h-4 w-4 ${isMobile ? "" : "mr-2"}`} />
                {isMobile ? "" : "Share"}
                </Button>
              </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`${isMobile ? "p-4" : "max-w-4xl mx-auto px-6 py-8"}`}>
        <div className="space-y-8">
          {/* Article Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Badge variant="outline">{article.category}</Badge>
              {article.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className={`${isMobile ? "text-2xl" : "text-4xl"} font-bold text-gray-900 leading-tight`}>
              {article.title}
            </h1>
            <p className={`${isMobile ? "text-base" : "text-lg"} text-gray-600 max-w-2xl mx-auto`}>
              {article.description}
            </p>

            {/* Article Meta */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
                <span>{article.publishedAt}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{article.readTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
                <span>{article.views} views</span>
            </div>
            <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span>
                  {article.rating} ({article.totalRatings} ratings)
                </span>
              </div>
            </div>
          </div>

          {/* Author Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Image
                  src={instructor?.profilePicture || instructor?.profileImageUrl || article.author.avatar || "/placeholder.svg"}
                  alt={instructor?.firstName || article.author.name}
                  width={60}
                  height={60}
                  className="rounded-full object-cover w-[60px] h-[60px]"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {instructor
                      ? `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim()
                      : (article.author.name === "Unknown Author" && article.author.firstName && article.author.lastName)
                        ? `${article.author.firstName} ${article.author.lastName}`
                        : article.author.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {instructor ? "Athlete" : article.author.title}
                  </p>
                  <p className="text-sm text-gray-700">
                    {instructor?.bio || article.author.bio}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Follow
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Article Content */}
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <div
                  className="text-gray-700 mb-4 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeDescription(article.content) }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Article Actions */}
          <div className="flex items-center justify-between py-6 border-t border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleLike}
                className={hasLiked ? "text-blue-600 border-blue-600" : ""}
              >
                <ThumbsUp className={`h-4 w-4 mr-2 ${hasLiked ? "fill-current" : ""}`} />
                {hasLiked ? article.likes + 1 : article.likes}
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={handleBookmark}>
                <BookmarkPlus className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 