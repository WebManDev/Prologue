"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import {
  Users,
  Eye,
  Heart,
  MessageSquare,
  DollarSign,
  Download,
  Share2,
  Play,
  Clock,
  Award,
  ChevronDown,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AthleteNav } from "@/components/navigation/athlete-nav"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

export default function AnalyticsPage() {
  const { isMobile, isTablet } = useMobileDetection()
  const [timeRange, setTimeRange] = useState("30d")
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for analytics
  const overviewStats = [
    {
      title: "Total Views",
      value: "45,231",
      change: "+12.5%",
      trend: "up",
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Subscribers",
      value: "1,247",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Engagement Rate",
      value: "7.8%",
      change: "-2.1%",
      trend: "down",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Revenue",
      value: "$2,847",
      change: "+15.3%",
      trend: "up",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const viewsData = [
    { date: "Jan 1", views: 1200, subscribers: 45 },
    { date: "Jan 8", views: 1800, subscribers: 52 },
    { date: "Jan 15", views: 2400, subscribers: 61 },
    { date: "Jan 22", views: 1900, subscribers: 58 },
    { date: "Jan 29", views: 2800, subscribers: 73 },
    { date: "Feb 5", views: 3200, subscribers: 89 },
    { date: "Feb 12", views: 2900, subscribers: 82 },
    { date: "Feb 19", views: 3800, subscribers: 95 },
    { date: "Feb 26", views: 4200, subscribers: 108 },
    { date: "Mar 5", views: 3600, subscribers: 102 },
    { date: "Mar 12", views: 4800, subscribers: 125 },
    { date: "Mar 19", views: 5200, subscribers: 142 },
  ]

  const contentPerformance = [
    {
      title: "Mental Performance in High-Pressure Situations",
      views: 12500,
      likes: 890,
      comments: 156,
      shares: 78,
      duration: "12:34",
      publishDate: "Mar 15, 2024",
      thumbnail: "/placeholder.svg?height=60&width=100",
    },
    {
      title: "Nutrition for Peak Athletic Performance",
      views: 8900,
      likes: 654,
      comments: 89,
      shares: 45,
      duration: "8:45",
      publishDate: "Mar 10, 2024",
      thumbnail: "/placeholder.svg?height=60&width=100",
    },
    {
      title: "NIL Opportunities and Brand Building",
      views: 7200,
      likes: 523,
      comments: 67,
      shares: 34,
      duration: "15:22",
      publishDate: "Mar 5, 2024",
      thumbnail: "/placeholder.svg?height=60&width=100",
    },
    {
      title: "College Recruitment Strategy Guide",
      views: 6800,
      likes: 445,
      comments: 78,
      shares: 29,
      duration: "10:15",
      publishDate: "Feb 28, 2024",
      thumbnail: "/placeholder.svg?height=60&width=100",
    },
  ]

  const audienceData = [
    { name: "18-24", value: 45, color: "#3B82F6" },
    { name: "25-34", value: 30, color: "#10B981" },
    { name: "35-44", value: 15, color: "#F59E0B" },
    { name: "45+", value: 10, color: "#EF4444" },
  ]

  const revenueData = [
    { month: "Oct", subscriptions: 1200, tips: 340, sponsorships: 800 },
    { month: "Nov", subscriptions: 1450, tips: 420, sponsorships: 950 },
    { month: "Dec", subscriptions: 1680, tips: 380, sponsorships: 1200 },
    { month: "Jan", subscriptions: 1890, tips: 520, sponsorships: 1100 },
    { month: "Feb", subscriptions: 2100, tips: 610, sponsorships: 1350 },
    { month: "Mar", subscriptions: 2350, tips: 580, sponsorships: 1500 },
  ]

  const DesktopHeader = () => (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/home" className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
                <Image
                  src="/Prologue LOGO-1.png"
                  alt="PROLOGUE"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-athletic font-bold text-gray-900 group-hover:text-blue-500 transition-colors tracking-wider">
                PROLOGUE
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <AthleteNav currentPath="/analytics" />

            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                      <Image
                        src="/placeholder.svg?height=32&width=32"
                        alt="User"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="flex items-center w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/promote" className="flex items-center w-full">
                      Promote
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/settings" className="flex items-center w-full">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/analytics" className="flex items-center w-full">
                      Analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  )

  const MainContent = () => (
    <main className={`${isMobile ? "px-4 py-6 pb-24" : "max-w-7xl mx-auto px-6 py-8"}`}>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold text-gray-900`}>Analytics</h1>
              <p className="text-gray-600 mt-1">Track your content performance and audience growth</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`${isMobile ? "grid w-full grid-cols-2" : "grid w-full grid-cols-4"}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          {!isMobile && <TabsTrigger value="audience">Audience</TabsTrigger>}
          {!isMobile && <TabsTrigger value="revenue">Revenue</TabsTrigger>}
        </TabsList>

        {isMobile && (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>
        )}

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-4`}>
            {overviewStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="flex items-center space-x-1">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Views & Subscribers Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Views & Subscribers Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="views"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                    />
                    <Line yAxisId="right" type="monotone" dataKey="subscribers" stroke="#10B981" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Performing Content</CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentPerformance.slice(0, 3).map((content, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                    <div className="w-16 h-10 bg-gray-200 rounded overflow-hidden">
                      <Image
                        src={content.thumbnail || "/placeholder.svg"}
                        alt={content.title}
                        width={64}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 line-clamp-1">{content.title}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{content.views.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{content.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{content.duration}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{index + 1}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content Performance</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Export Data</DropdownMenuItem>
                      <DropdownMenuItem>Share Report</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentPerformance.map((content, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-20 h-12 bg-gray-200 rounded overflow-hidden relative">
                      <Image
                        src={content.thumbnail || "/placeholder.svg"}
                        alt={content.title}
                        width={80}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{content.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">Published {content.publishDate}</p>
                      <div className="flex items-center space-x-6 mt-2">
                        <span className="flex items-center space-x-1 text-sm text-gray-600">
                          <Eye className="h-4 w-4" />
                          <span>{content.views.toLocaleString()} views</span>
                        </span>
                        <span className="flex items-center space-x-1 text-sm text-gray-600">
                          <Heart className="h-4 w-4" />
                          <span>{content.likes} likes</span>
                        </span>
                        <span className="flex items-center space-x-1 text-sm text-gray-600">
                          <MessageSquare className="h-4 w-4" />
                          <span>{content.comments} comments</span>
                        </span>
                        <span className="flex items-center space-x-1 text-sm text-gray-600">
                          <Share2 className="h-4 w-4" />
                          <span>{content.shares} shares</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{content.duration}</div>
                      <Badge variant="outline" className="mt-1">
                        {((content.likes / content.views) * 100).toFixed(1)}% engagement
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-6`}>
            {/* Age Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={audienceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {audienceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {audienceData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600">
                        {item.name}: {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscriber Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={viewsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="subscribers" stroke="#10B981" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audience Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Audience Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-6`}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">68%</div>
                  <div className="text-sm text-gray-600">Male Audience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">4.2 min</div>
                  <div className="text-sm text-gray-600">Avg. Watch Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">85%</div>
                  <div className="text-sm text-gray-600">Retention Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue Overview */}
          <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">+15.3%</span>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-gray-900">$2,847</h3>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">+8.2%</span>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-gray-900">$2,350</h3>
                  <p className="text-sm text-gray-600">Subscriptions</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">+22.1%</span>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-gray-900">$497</h3>
                  <p className="text-sm text-gray-600">Tips & Donations</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="subscriptions" stackId="a" fill="#3B82F6" />
                    <Bar dataKey="tips" stackId="a" fill="#10B981" />
                    <Bar dataKey="sponsorships" stackId="a" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Subscriptions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Tips</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Sponsorships</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Revenue Goal</span>
                    <span className="text-sm text-gray-600">$2,847 / $3,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "94.9%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Subscriber Goal</span>
                    <span className="text-sm text-gray-600">1,247 / 1,500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "83.1%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="athlete"
        currentPath="/analytics"
        showBottomNav={true}
        unreadNotifications={0}
        unreadMessages={0}
        hasNewContent={false}
      >
        <MainContent />
      </MobileLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopHeader />
      <MainContent />
    </div>
  )
} 