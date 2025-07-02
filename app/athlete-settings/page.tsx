"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { User, Bell, CreditCard, Shield, Lock, Eye, EyeOff, Save, ArrowLeft, Trash2, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEnhancedLogout } from "@/hooks/use-enhanced-logout"
import { LogoutLoadingScreen } from "@/components/ui/logout-loading-screen"
import { AthleteHeader } from "@/components/navigation/athlete-header"

const AthleteSettingsPage = () => {
  // Loading states
  const [isLoading, setIsLoading] = useState({
    account: false,
    password: false,
    notifications: false,
    subscription: false,
    privacy: false,
    billing: false,
    banking: false,
  })

  // Account Settings State
  const [accountData, setAccountData] = useState({
    firstName: "Sarah",
    lastName: "Martinez",
    email: "sarah.martinez@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Professional tennis coach with 10+ years of experience helping athletes reach their potential.",
    location: "Los Angeles, CA",
    website: "https://sarahcoaching.com",
    specialties: ["Tennis", "Mental Performance", "Youth Development"],
    certifications: [
      "USPTA Certified Professional",
      "Mental Performance Certified",
      "Youth Development Specialist",
      "Sports Psychology Certificate",
    ],
  })

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    newSubscribers: true,
    messages: true,
    profileViews: false,
    weeklyReports: true,
    contentPerformance: true,
    paymentAlerts: true,
  })

  // Subscription Tiers State
  const [subscriptionTiers, setSubscriptionTiers] = useState([
    { id: 1, name: "Basic", price: 29, features: ["Monthly coaching calls", "Training plans", "Email support"] },
    {
      id: 2,
      name: "Pro",
      price: 59,
      features: ["Weekly coaching calls", "Custom nutrition plans", "Video analysis", "Priority support"],
    },
    {
      id: 3,
      name: "Elite",
      price: 99,
      features: ["Daily support", "1-on-1 sessions", "Competition prep", "24/7 access"],
    },
  ])

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: "card", last4: "4242", brand: "Visa", isDefault: true, expiryDate: "12/25" },
    { id: 2, type: "card", last4: "5555", brand: "Mastercard", isDefault: false, expiryDate: "08/26" },
  ])

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    showOnlineStatus: true,
    dataCollection: true,
  })

  // Banking Information State
  const [bankingInfo, setBankingInfo] = useState({
    bankName: "",
    accountHolderName: "Sarah Martinez",
    accountNumber: "",
    routingNumber: "",
    accountType: "checking",
    bankAddress: "",
    bankCity: "",
    bankState: "",
    bankZip: "",
  })

  const { logout, loadingState, retryLogout, cancelLogout } = useEnhancedLogout()

  const handleLogout = async () => {
    console.log("🔄 Athlete logout initiated from settings")

    await logout({
      customMessage: "Saving settings and logging you out...",
      redirectUrl: "/login",
      onComplete: () => {
        console.log("✅ Athlete logout completed successfully from settings")
        toast({
          title: "Logged Out Successfully",
          description: "Your settings have been saved and you've been logged out.",
          duration: 2000,
        })
      },
      onError: (error) => {
        console.error("❌ Athlete logout failed from settings:", error)
        toast({
          title: "Logout Failed",
          description: "There was an issue logging you out. Please try again.",
          variant: "destructive",
          duration: 3000,
        })
      },
    })
  }

  const handleSaveAccount = async () => {
    setIsLoading({ ...isLoading, account: true })

    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      console.log("Saving account settings:", accountData)

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading({ ...isLoading, account: false })
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords don't match. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setIsLoading({ ...isLoading, password: true })

    await new Promise((resolve) => setTimeout(resolve, 2000))

    try {
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading({ ...isLoading, password: false })
    }
  }

  const handleNotificationChange = async (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))

    try {
      console.log(`Updated ${key} to ${value}`)

      toast({
        title: "Notification Updated",
        description: "Your notification preference has been saved.",
        duration: 2000,
      })
    } catch (error) {
      setNotifications((prev) => ({ ...prev, [key]: !value }))
      toast({
        title: "Error",
        description: "Failed to update notification setting.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const addSpecialty = () => {
    setAccountData({
      ...accountData,
      specialties: [...accountData.specialties, "New Specialty"],
    })
  }

  const removeSpecialty = (index: number) => {
    setAccountData({
      ...accountData,
      specialties: accountData.specialties.filter((_, i) => i !== index),
    })
  }

  const updateSpecialty = (index: number, value: string) => {
    const newSpecialties = [...accountData.specialties]
    newSpecialties[index] = value
    setAccountData({
      ...accountData,
      specialties: newSpecialties,
    })
  }

  const addCertification = () => {
    setAccountData({
      ...accountData,
      certifications: [...accountData.certifications, "New Certification"],
    })
  }

  const removeCertification = (index: number) => {
    setAccountData({
      ...accountData,
      certifications: accountData.certifications.filter((_, i) => i !== index),
    })
  }

  const updateCertification = (index: number, value: string) => {
    const newCertifications = [...accountData.certifications]
    newCertifications[index] = value
    setAccountData({
      ...accountData,
      certifications: newCertifications,
    })
  }

  const saveSubscriptionTiers = async () => {
    setIsLoading({ ...isLoading, subscription: true })

    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      console.log("Saving subscription tiers:", subscriptionTiers)

      toast({
        title: "Subscription Tiers Updated",
        description: "Your subscription tiers have been saved successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save subscription tiers. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading({ ...isLoading, subscription: false })
    }
  }

  const savePrivacySettings = async () => {
    setIsLoading({ ...isLoading, privacy: true })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    try {
      console.log("Saving privacy settings:", privacySettings)

      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy settings have been saved successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save privacy settings. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading({ ...isLoading, privacy: false })
    }
  }

  const saveBankingInfo = async () => {
    setIsLoading({ ...isLoading, banking: true })

    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      console.log("Saving banking information:", bankingInfo)

      toast({
        title: "Banking Information Updated",
        description: "Your banking information has been saved successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save banking information. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading({ ...isLoading, banking: false })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AthleteHeader currentPath="/athlete-settings" onLogout={handleLogout} />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="account" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2 relative">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Subscription</span>
            </TabsTrigger>
            <TabsTrigger value="banking" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Banking</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={accountData.firstName}
                      onChange={(e) => setAccountData({ ...accountData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={accountData.lastName}
                      onChange={(e) => setAccountData({ ...accountData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={accountData.phone}
                      onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={accountData.location}
                      onChange={(e) => setAccountData({ ...accountData, location: e.target.value })}
                      placeholder="City, State"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={accountData.website}
                    onChange={(e) => setAccountData({ ...accountData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={accountData.bio}
                    onChange={(e) => setAccountData({ ...accountData, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell people about yourself..."
                  />
                  <p className="text-sm text-gray-500 mt-1">{accountData.bio.length}/500 characters</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Specialties</Label>
                    <Button variant="outline" size="sm" onClick={addSpecialty}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Specialty
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {accountData.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={specialty}
                          onChange={(e) => updateSpecialty(index, e.target.value)}
                          placeholder="Enter specialty"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpecialty(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Certifications</Label>
                    <Button variant="outline" size="sm" onClick={addCertification}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Certification
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {accountData.certifications.map((certification, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={certification}
                          onChange={(e) => updateCertification(index, e.target.value)}
                          placeholder="Enter certification"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCertification(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSaveAccount}
                  className="bg-prologue-electric hover:bg-prologue-blue"
                  disabled={isLoading.account}
                >
                  {isLoading.account ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Notification Preferences</CardTitle>
                    <p className="text-sm text-gray-600">Choose how you want to be notified about activity</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Delivery Methods</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Email Notifications</h5>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Push Notifications</h5>
                      <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">SMS Notifications</h5>
                      <p className="text-sm text-gray-600">Receive notifications via text message</p>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("smsNotifications", checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Content & Business</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">New Subscribers</h5>
                      <p className="text-sm text-gray-600">When someone subscribes to your content</p>
                    </div>
                    <Switch
                      checked={notifications.newSubscribers}
                      onCheckedChange={(checked) => handleNotificationChange("newSubscribers", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Messages</h5>
                      <p className="text-sm text-gray-600">When you receive new messages</p>
                    </div>
                    <Switch
                      checked={notifications.messages}
                      onCheckedChange={(checked) => handleNotificationChange("messages", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Content Performance</h5>
                      <p className="text-sm text-gray-600">Updates on how your content is performing</p>
                    </div>
                    <Switch
                      checked={notifications.contentPerformance}
                      onCheckedChange={(checked) => handleNotificationChange("contentPerformance", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Payment Alerts</h5>
                      <p className="text-sm text-gray-600">Payment confirmations and billing updates</p>
                    </div>
                    <Switch
                      checked={notifications.paymentAlerts}
                      onCheckedChange={(checked) => handleNotificationChange("paymentAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Weekly Reports</h5>
                      <p className="text-sm text-gray-600">Weekly summary of your activity</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => handleNotificationChange("weeklyReports", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Marketing Emails</h5>
                      <p className="text-sm text-gray-600">Updates about new features and tips</p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => handleNotificationChange("marketingEmails", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Settings */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Tiers</CardTitle>
                <p className="text-sm text-gray-600">Manage your subscription offerings</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscriptionTiers.map((tier) => (
                  <div key={tier.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <Input
                          value={tier.name}
                          onChange={(e) => {
                            setSubscriptionTiers(
                              subscriptionTiers.map((t) => (t.id === tier.id ? { ...t, name: e.target.value } : t)),
                            )
                          }}
                          className="font-medium max-w-xs"
                          placeholder="Tier name"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">$</span>
                          <Input
                            type="number"
                            value={tier.price}
                            onChange={(e) => {
                              setSubscriptionTiers(
                                subscriptionTiers.map((t) =>
                                  t.id === tier.id ? { ...t, price: Number.parseInt(e.target.value) || 0 } : t,
                              )
                            }}
                            className="w-24"
                            min="0"
                          />
                          <span className="text-sm text-gray-600">/month</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Features</Label>
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={feature}
                            onChange={(e) => {
                              const newTiers = subscriptionTiers.map((t) =>
                                t.id === tier.id
                                  ? {
                                      ...t,
                                      features: t.features.map((f, i) => (i === index ? e.target.value : f)),
                                    }
                                  : t,
                              )
                              setSubscriptionTiers(newTiers)
                            }}
                            placeholder="Feature description"
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <Button
                  onClick={saveSubscriptionTiers}
                  className="bg-prologue-electric hover:bg-prologue-blue"
                  disabled={isLoading.subscription}
                >
                  {isLoading.subscription ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Subscription Tiers
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banking Settings */}
          <TabsContent value="banking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Banking Information</CardTitle>
                <p className="text-sm text-gray-600">Add your banking details to receive payments from the platform</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={bankingInfo.bankName}
                      onChange={(e) => setBankingInfo({ ...bankingInfo, bankName: e.target.value })}
                      placeholder="e.g., Chase Bank"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                    <Input
                      id="accountHolderName"
                      value={bankingInfo.accountHolderName}
                      onChange={(e) => setBankingInfo({ ...bankingInfo, accountHolderName: e.target.value })}
                      placeholder="Full name on account"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="routingNumber">Routing Number *</Label>
                    <Input
                      id="routingNumber"
                      value={bankingInfo.routingNumber}
                      onChange={(e) => setBankingInfo({ ...bankingInfo, routingNumber: e.target.value })}
                      placeholder="9-digit routing number"
                      maxLength={9}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">9-digit number found on your checks</p>
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      value={bankingInfo.accountNumber}
                      onChange={(e) => setBankingInfo({ ...bankingInfo, accountNumber: e.target.value })}
                      placeholder="Account number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accountType">Account Type *</Label>
                  <Select
                    value={bankingInfo.accountType}
                    onValueChange={(value) => setBankingInfo({ ...bankingInfo, accountType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking Account</SelectItem>
                      <SelectItem value="savings">Savings Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Bank Address</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bankAddress">Street Address</Label>
                      <Input
                        id="bankAddress"
                        value={bankingInfo.bankAddress}
                        onChange={(e) => setBankingInfo({ ...bankingInfo, bankAddress: e.target.value })}
                        placeholder="Bank street address"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="bankCity">City</Label>
                        <Input
                          id="bankCity"
                          value={bankingInfo.bankCity}
                          onChange={(e) => setBankingInfo({ ...bankingInfo, bankCity: e.target.value })}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bankState">State</Label>
                        <Input
                          id="bankState"
                          value={bankingInfo.bankState}
                          onChange={(e) => setBankingInfo({ ...bankingInfo, bankState: e.target.value })}
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bankZip">ZIP Code</Label>
                        <Input
                          id="bankZip"
                          value={bankingInfo.bankZip}
                          onChange={(e) => setBankingInfo({ ...bankingInfo, bankZip: e.target.value })}
                          placeholder="ZIP"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900">Secure Banking Information</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Your banking information is encrypted and securely stored. We use bank-level security to protect
                        your data and only use this information to process payments to you.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={saveBankingInfo}
                  className="bg-prologue-electric hover:bg-prologue-blue"
                  disabled={
                    isLoading.banking ||
                    !bankingInfo.bankName ||
                    !bankingInfo.accountHolderName ||
                    !bankingInfo.routingNumber ||
                    !bankingInfo.accountNumber
                  }
                >
                  {isLoading.banking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Banking Information
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <p className="text-sm text-gray-600">Control who can see your information</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  <Select
                    value={privacySettings.profileVisibility}
                    onValueChange={(value) => setPrivacySettings({ ...privacySettings, profileVisibility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can view</SelectItem>
                      <SelectItem value="private">Private - Only you can view</SelectItem>
                      <SelectItem value="subscribers">Subscribers Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Contact Information</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Show Email Address</h5>
                      <p className="text-sm text-gray-600">Display your email on your public profile</p>
                    </div>
                    <Switch
                      checked={privacySettings.showEmail}
                      onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showEmail: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Show Phone Number</h5>
                      <p className="text-sm text-gray-600">Display your phone number on your public profile</p>
                    </div>
                    <Switch
                      checked={privacySettings.showPhone}
                      onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showPhone: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Communication</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Allow Messages</h5>
                      <p className="text-sm text-gray-600">Allow users to send you direct messages</p>
                    </div>
                    <Switch
                      checked={privacySettings.allowMessages}
                      onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, allowMessages: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Show Online Status</h5>
                      <p className="text-sm text-gray-600">Show when you're online to other users</p>
                    </div>
                    <Switch
                      checked={privacySettings.showOnlineStatus}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({ ...privacySettings, showOnlineStatus: checked })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Data & Analytics</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Data Collection</h5>
                      <p className="text-sm text-gray-600">Allow us to collect analytics to improve your experience</p>
                    </div>
                    <Switch
                      checked={privacySettings.dataCollection}
                      onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, dataCollection: checked })}
                    />
                  </div>
                </div>

                <Button
                  onClick={savePrivacySettings}
                  className="bg-prologue-electric hover:bg-prologue-blue"
                  disabled={isLoading.privacy}
                >
                  {isLoading.privacy ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Privacy Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password *</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password *</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Must be at least 8 characters long</p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleChangePassword}
                  variant="outline"
                  disabled={
                    isLoading.password ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                >
                  {isLoading.password ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Logout Loading Screen */}
      <LogoutLoadingScreen
        isVisible={loadingState.isVisible}
        stage={loadingState.stage}
        progress={loadingState.progress}
        message={loadingState.message}
        error={loadingState.error}
        onRetry={retryLogout}
        onCancel={cancelLogout}
      />
    </div>
  )
}

export default AthleteSettingsPage 