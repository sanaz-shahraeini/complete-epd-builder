"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, EyeOff, Camera, Menu, Loader2, Search, Users, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { useRouter } from '@/i18n/navigation'
import { getUserProfile, updateUserProfile, type UserProfile, changePassword } from "@/lib/api/auth"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect, useRef } from "react"

import { signOut, useSession } from "next-auth/react"
import { useUserStore } from '@/lib/store/user'
import { useUsers } from "@/lib/context/UsersContext"


const tabs = ["myEPDs", "inbox", "dataDirectory", "myProfile"] as const

const countries = [
  { value: "afghanistan", label: "Afghanistan" },
  { value: "albania", label: "Albania" },
  { value: "algeria", label: "Algeria" },
  { value: "andorra", label: "Andorra" },
  { value: "angola", label: "Angola" },
  { value: "antigua_and_barbuda", label: "Antigua and Barbuda" },
  { value: "argentina", label: "Argentina" },
  { value: "armenia", label: "Armenia" },
  { value: "australia", label: "Australia" },
  { value: "austria", label: "Austria" },
  { value: "azerbaijan", label: "Azerbaijan" },
  { value: "bahamas", label: "Bahamas" },
  { value: "bahrain", label: "Bahrain" },
  { value: "bangladesh", label: "Bangladesh" },
  { value: "barbados", label: "Barbados" },
  { value: "belarus", label: "Belarus" },
  { value: "belgium", label: "Belgium" },
  { value: "belize", label: "Belize" },
  { value: "benin", label: "Benin" },
  { value: "bhutan", label: "Bhutan" },
  { value: "bolivia", label: "Bolivia" },
  { value: "bosnia_and_herzegovina", label: "Bosnia and Herzegovina" },
  { value: "botswana", label: "Botswana" },
  { value: "brazil", label: "Brazil" },
  { value: "brunei", label: "Brunei" },
  { value: "bulgaria", label: "Bulgaria" },
  { value: "burkina_faso", label: "Burkina Faso" },
  { value: "burundi", label: "Burundi" },
  { value: "cambodia", label: "Cambodia" },
  { value: "cameroon", label: "Cameroon" },
  { value: "canada", label: "Canada" },
  { value: "cape_verde", label: "Cape Verde" },
  { value: "central_african_republic", label: "Central African Republic" },
  { value: "chad", label: "Chad" },
  { value: "chile", label: "Chile" },
  { value: "china", label: "China" },
  { value: "colombia", label: "Colombia" },
  { value: "comoros", label: "Comoros" },
  { value: "congo", label: "Congo" },
  { value: "costa_rica", label: "Costa Rica" },
  { value: "croatia", label: "Croatia" },
  { value: "cuba", label: "Cuba" },
  { value: "cyprus", label: "Cyprus" },
  { value: "czech_republic", label: "Czech Republic" },
  { value: "denmark", label: "Denmark" },
  { value: "djibouti", label: "Djibouti" },
  { value: "dominica", label: "Dominica" },
  { value: "dominican_republic", label: "Dominican Republic" },
  { value: "east_timor", label: "East Timor" },
  { value: "ecuador", label: "Ecuador" },
  { value: "egypt", label: "Egypt" },
  { value: "el_salvador", label: "El Salvador" },
  { value: "equatorial_guinea", label: "Equatorial Guinea" },
  { value: "eritrea", label: "Eritrea" },
  { value: "estonia", label: "Estonia" },
  { value: "ethiopia", label: "Ethiopia" },
  { value: "fiji", label: "Fiji" },
  { value: "finland", label: "Finland" },
  { value: "france", label: "France" },
  { value: "gabon", label: "Gabon" },
  { value: "gambia", label: "Gambia" },
  { value: "georgia", label: "Georgia" },
  { value: "germany", label: "Germany" },
  { value: "ghana", label: "Ghana" },
  { value: "greece", label: "Greece" },
  { value: "grenada", label: "Grenada" },
  { value: "guatemala", label: "Guatemala" },
  { value: "guinea", label: "Guinea" },
  { value: "guinea_bissau", label: "Guinea-Bissau" },
  { value: "guyana", label: "Guyana" },
  { value: "haiti", label: "Haiti" },
  { value: "honduras", label: "Honduras" },
  { value: "hungary", label: "Hungary" },
  { value: "iceland", label: "Iceland" },
  { value: "india", label: "India" },
  { value: "indonesia", label: "Indonesia" },
  { value: "iran", label: "Iran" },
  { value: "iraq", label: "Iraq" },
  { value: "ireland", label: "Ireland" },
  { value: "israel", label: "Israel" },
  { value: "italy", label: "Italy" },
  { value: "ivory_coast", label: "Ivory Coast" },
  { value: "jamaica", label: "Jamaica" },
  { value: "japan", label: "Japan" },
  { value: "jordan", label: "Jordan" },
  { value: "kazakhstan", label: "Kazakhstan" },
  { value: "kenya", label: "Kenya" },
  { value: "kiribati", label: "Kiribati" },
  { value: "north_korea", label: "North Korea" },
  { value: "south_korea", label: "South Korea" },
  { value: "kuwait", label: "Kuwait" },
  { value: "kyrgyzstan", label: "Kyrgyzstan" },
  { value: "laos", label: "Laos" },
  { value: "latvia", label: "Latvia" },
  { value: "lebanon", label: "Lebanon" },
  { value: "lesotho", label: "Lesotho" },
  { value: "liberia", label: "Liberia" },
  { value: "libya", label: "Libya" },
  { value: "liechtenstein", label: "Liechtenstein" },
  { value: "lithuania", label: "Lithuania" },
  { value: "luxembourg", label: "Luxembourg" },
  { value: "macedonia", label: "Macedonia" },
  { value: "madagascar", label: "Madagascar" },
  { value: "malawi", label: "Malawi" },
  { value: "malaysia", label: "Malaysia" },
  { value: "maldives", label: "Maldives" },
  { value: "mali", label: "Mali" },
  { value: "malta", label: "Malta" },
  { value: "marshall_islands", label: "Marshall Islands" },
  { value: "mauritania", label: "Mauritania" },
  { value: "mauritius", label: "Mauritius" },
  { value: "mexico", label: "Mexico" },
  { value: "micronesia", label: "Micronesia" },
  { value: "moldova", label: "Moldova" },
  { value: "monaco", label: "Monaco" },
  { value: "mongolia", label: "Mongolia" },
  { value: "montenegro", label: "Montenegro" },
  { value: "morocco", label: "Morocco" },
  { value: "mozambique", label: "Mozambique" },
  { value: "myanmar", label: "Myanmar" },
  { value: "namibia", label: "Namibia" },
  { value: "nauru", label: "Nauru" },
  { value: "nepal", label: "Nepal" },
  { value: "netherlands", label: "Netherlands" },
  { value: "new_zealand", label: "New Zealand" },
  { value: "nicaragua", label: "Nicaragua" },
  { value: "niger", label: "Niger" },
  { value: "nigeria", label: "Nigeria" },
  { value: "norway", label: "Norway" },
  { value: "oman", label: "Oman" },
  { value: "pakistan", label: "Pakistan" },
  { value: "palau", label: "Palau" },
  { value: "panama", label: "Panama" },
  { value: "papua_new_guinea", label: "Papua New Guinea" },
  { value: "paraguay", label: "Paraguay" },
  { value: "peru", label: "Peru" },
  { value: "philippines", label: "Philippines" },
  { value: "poland", label: "Poland" },
  { value: "portugal", label: "Portugal" },
  { value: "qatar", label: "Qatar" },
  { value: "romania", label: "Romania" },
  { value: "russia", label: "Russia" },
  { value: "rwanda", label: "Rwanda" },
  { value: "saint_kitts_and_nevis", label: "Saint Kitts and Nevis" },
  { value: "saint_lucia", label: "Saint Lucia" },
  { value: "saint_vincent", label: "Saint Vincent and the Grenadines" },
  { value: "samoa", label: "Samoa" },
  { value: "san_marino", label: "San Marino" },
  { value: "sao_tome", label: "Sao Tome and Principe" },
  { value: "saudi_arabia", label: "Saudi Arabia" },
  { value: "senegal", label: "Senegal" },
  { value: "serbia", label: "Serbia" },
  { value: "seychelles", label: "Seychelles" },
  { value: "sierra_leone", label: "Sierra Leone" },
  { value: "singapore", label: "Singapore" },
  { value: "slovakia", label: "Slovakia" },
  { value: "slovenia", label: "Slovenia" },
  { value: "solomon_islands", label: "Solomon Islands" },
  { value: "somalia", label: "Somalia" },
  { value: "south_africa", label: "South Africa" },
  { value: "spain", label: "Spain" },
  { value: "sri_lanka", label: "Sri Lanka" },
  { value: "sudan", label: "Sudan" },
  { value: "suriname", label: "Suriname" },
  { value: "swaziland", label: "Swaziland" },
  { value: "sweden", label: "Sweden" },
  { value: "switzerland", label: "Switzerland" },
  { value: "syria", label: "Syria" },
  { value: "taiwan", label: "Taiwan" },
  { value: "tajikistan", label: "Tajikistan" },
  { value: "tanzania", label: "Tanzania" },
  { value: "thailand", label: "Thailand" },
  { value: "togo", label: "Togo" },
  { value: "tonga", label: "Tonga" },
  { value: "trinidad_and_tobago", label: "Trinidad and Tobago" },
  { value: "tunisia", label: "Tunisia" },
  { value: "turkey", label: "Turkey" },
  { value: "turkmenistan", label: "Turkmenistan" },
  { value: "tuvalu", label: "Tuvalu" },
  { value: "uganda", label: "Uganda" },
  { value: "ukraine", label: "Ukraine" },
  { value: "united_arab_emirates", label: "United Arab Emirates" },
  { value: "united_kingdom", label: "United Kingdom" },
  { value: "united_states", label: "United States" },
  { value: "uruguay", label: "Uruguay" },
  { value: "uzbekistan", label: "Uzbekistan" },
  { value: "vanuatu", label: "Vanuatu" },
  { value: "vatican_city", label: "Vatican City" },
  { value: "venezuela", label: "Venezuela" },
  { value: "vietnam", label: "Vietnam" },
  { value: "yemen", label: "Yemen" },
  { value: "zambia", label: "Zambia" },
  { value: "zimbabwe", label: "Zimbabwe" }
] as const;

type CountryValue = typeof countries[number]['value'];

interface ProfilePageProps {}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("myProfile")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [avatarKey, setAvatarKey] = useState(0)
  const { users, isLoading: isLoadingUsers } = useUsers()
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<{
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    country: string;
    city: string;
    company_name: string;
    user_type: 'regular' | 'company' | 'admin';
    profile_picture?: File;
  }>({
    id: 0,
    first_name: "",
    last_name: "",
    email: "",
    country: "",
    city: "",
    company_name: "",
    user_type: "regular",
    profile_picture: undefined
  })

  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [isFetchingProfile, setIsFetchingProfile] = useState(false)

  const t = useTranslations()
  const n = useTranslations('navigation')
  const p = useTranslations('Profile')
  const router = useRouter()
  const { updateUser } = useUserStore()
  const { data: session } = useSession()
  const user = useUserStore((state) => state.user)

  // Initialize component
  useEffect(() => {
    let isSubscribed = true

    const initializeComponent = async () => {
      try {
        setIsLoading(true)
        const profile = await getUserProfile()
        
        if (!isSubscribed) return
        
        if (profile) {
          const profileData = {
            id: profile.id,
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            email: profile.email || "",
            country: profile.country || "",
            city: profile.profile?.city || "", // Fix: Access city from profile.profile
            company_name: profile.company_name || "",
            user_type: profile.user_type || "regular",
            profile_picture: undefined
          }

          setFormData(profileData)
          setOriginalProfile(profile)

          if (profile.profile?.profile_picture_url) {
            const timestamp = new Date().getTime()
            const newAvatarUrl = `${profile.profile.profile_picture_url}?t=${timestamp}`
            setAvatarUrl(newAvatarUrl)
            setAvatarKey(prev => prev + 1)
          }
        }
      } catch (error) {
        console.error('Error initializing component:', error)
        toast({
          description: (
            <div className="flex items-center gap-2 p-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p>{p('errors.profileFetchFailed')}</p>
            </div>
          ),
          className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-black dark:text-white border border-gray-200/20 dark:border-gray-700/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg",
        })
      } finally {
        if (isSubscribed) {
          setIsLoading(false)
          setMounted(true)
        }
      }
    }

    if (!mounted) {
      initializeComponent()
    }

    return () => {
      isSubscribed = false
    }
  }, [mounted, toast, p])

  const fetchUserProfile = async () => {
    try {
      setIsFetchingProfile(true)
      const profile = await getUserProfile()
      
      if (!profile) return

      const profileData = {
        id: profile.id,
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        country: profile.country || "",
        city: profile.profile?.city || "", // Fix: Access city from profile.profile
        company_name: profile.company_name || "",
        user_type: profile.user_type || "regular",
        profile_picture: undefined
      }

      setFormData(profileData)

      if (profile.profile?.profile_picture_url) {
        const timestamp = new Date().getTime()
        const newAvatarUrl = `${profile.profile.profile_picture_url}?t=${timestamp}`
        setAvatarUrl(newAvatarUrl)
        setAvatarKey(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        description: (
          <div className="flex items-center gap-2 p-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p>{p('errors.profileFetchFailed')}</p>
          </div>
        ),
        className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-black dark:text-white border border-gray-200/20 dark:border-gray-700/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg",
      })
    } finally {
      setIsFetchingProfile(false)
    }
  }

  // Add password validation function
  const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    if (password.length < 8) {
      return { isValid: false, error: p('errors.passwordTooShort') }
    }
    
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    if (!hasUpperCase || !hasLowerCase) {
      return { isValid: false, error: p('errors.passwordNeedsCases') }
    }
    
    if (!hasNumbers) {
      return { isValid: false, error: p('errors.passwordNeedsNumber') }
    }
    
    if (!hasSpecialChar) {
      return { isValid: false, error: p('errors.passwordNeedsSpecial') }
    }
    
    return { isValid: true }
  }

  const handleSubmit = async () => {
    try {
      setIsProfileSaving(true)
      
      // Only include fields that have changed
      const changedFields = {} as Partial<UserProfile>
      const profileChanges = {} as any

      if (user && formData.first_name !== user.first_name) {
        changedFields.first_name = formData.first_name
      }
      if (user && formData.last_name !== user.last_name) {
        changedFields.last_name = formData.last_name
      }
      if (user && formData.country !== user.country) {
        changedFields.country = formData.country
      }
      if (user && formData.city !== user.city) {
        profileChanges.city = formData.city
      }
      if (user && formData.company_name !== user.company_name) {
        changedFields.company_name = formData.company_name
      }
      if (user && formData.email !== user.email) {
        changedFields.email = formData.email
      }

      // Add profile picture if it exists
      if (formData.profile_picture) {
        profileChanges.profile_picture = formData.profile_picture
      }

      // Only add profile to changedFields if there are profile changes
      if (Object.keys(profileChanges).length > 0) {
        changedFields.profile = profileChanges
      }

      console.log('Sending update with fields:', changedFields)

      // Only proceed if there are changes
      if (Object.keys(changedFields).length === 0) {
        toast({
          description: (
            <div className="flex items-center gap-2 p-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p>{p('errors.noChanges')}</p>
            </div>
          ),
          className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-black dark:text-white border border-gray-200/20 dark:border-gray-700/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg",
        })
        setIsProfileSaving(false)
        return
      }

      // Add a delay before fetching updated profile to ensure database save is complete
      const updatedProfile = await updateUserProfile(changedFields)
      console.log('Server response:', updatedProfile)

      // Wait a moment to ensure the file is processed
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (updatedProfile?.profile?.profile_picture_url) {
        // Add timestamp to URL to prevent caching
        const timestamp = new Date().getTime()
        const newAvatarUrl = `${updatedProfile.profile.profile_picture_url}?t=${timestamp}`
        console.log('Setting new avatar URL:', newAvatarUrl)
        setAvatarUrl(newAvatarUrl)
        setAvatarKey(prev => prev + 1)
      }

      // Update form data with fresh data from server
      setFormData({
        id: updatedProfile.id,
        first_name: updatedProfile.first_name || "",
        last_name: updatedProfile.last_name || "",
        email: updatedProfile.email || "",
        country: updatedProfile.country || "",
        city: updatedProfile.profile?.city || "",
        company_name: updatedProfile.company_name || "",
        user_type: updatedProfile.user_type || "regular",
        profile_picture: undefined // Reset the file input
      })

      // Update user store with new profile data
      updateUser({
        first_name: updatedProfile.first_name || "",
        last_name: updatedProfile.last_name || "",
        email: updatedProfile.email || "",
        company_name: updatedProfile.company_name || "",
        country: updatedProfile.country || "",
        city: updatedProfile.profile?.city || "",
        profile_picture_url: updatedProfile.profile?.profile_picture_url ? 
          `${updatedProfile.profile.profile_picture_url}?t=${Date.now()}` : undefined
      })

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      toast({
        description: (
          <div className="flex items-center gap-2 p-1">
            <CheckCircle2 className="h-4 w-4 text-teal-500" />
            <p>{p('success.profileUpdated')}</p>
          </div>
        ),
        className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-black dark:text-white border border-gray-200/20 dark:border-gray-700/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      
      // Handle token expiration
      if (error instanceof Error && error.message.includes('token_not_valid')) {
        toast({
          description: (
            <div className="flex items-center gap-2 p-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p>{p('errors.sessionExpired')}</p>
            </div>
          ),
          className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-black dark:text-white border border-gray-200/20 dark:border-gray-700/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg",
        })
        // Sign out and redirect to sign in
        await signOut({ redirect: true, callbackUrl: '/signin' })
        return
      }

      // Handle database connection errors
      if (error instanceof Error && 
          (error.message.includes('connection') || 
           error.message.includes('server closed') ||
           error.message.includes('OperationalError'))) {
        toast({
          description: (
            <div className="flex items-center gap-2 p-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p>{p('errors.connectionError')}</p>
            </div>
          ),
          className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-black dark:text-white border border-gray-200/20 dark:border-gray-700/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg",
        })
        return
      }

      // Handle specific API errors
      if (error instanceof Error && error.message.includes('email')) {
        toast({
          description: (
            <div className="flex items-center gap-2 p-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p>{p('errors.emailInUse')}</p>
            </div>
          ),
          className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-black dark:text-white border border-gray-200/20 dark:border-gray-700/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg",
        })
        return
      }

      toast({
        description: (
          <div className="flex items-center gap-2 p-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p>{p('errors.profileUpdateFailed')}</p>
          </div>
        ),
        className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-black dark:text-white border border-gray-200/20 dark:border-gray-700/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg",
      })
    } finally {
      setIsProfileSaving(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create a preview URL for the selected file
      const previewUrl = URL.createObjectURL(file)
      setAvatarUrl(previewUrl)
      setAvatarKey(prev => prev + 1)
      
      setFormData(prev => ({
        ...prev,
        profile_picture: file
      }))
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordChange = async () => {
    try {
      setIsPasswordSaving(true)
      
      // Check password strength
      const passwordCheck = validatePassword(passwordData.newPassword)
      if (!passwordCheck.isValid) {
        toast({
          description: (
            <div className="flex items-center gap-2 p-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p>{passwordCheck.error}</p>
            </div>
          ),
          className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-black dark:text-white border border-gray-200/20 dark:border-gray-700/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg",
        })
        setIsPasswordSaving(false)
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          description: (
            <div className="flex items-center gap-2 p-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p>{p('errors.passwordsDoNotMatch')}</p>
            </div>
          ),
          className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-black dark:text-white border border-gray-200/20 dark:border-gray-700/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg",
        })
        setIsPasswordSaving(false)
        return
      }

      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      toast({
        description: (
          <div className="flex items-center gap-2 p-1">
            <CheckCircle2 className="h-4 w-4 text-teal-500" />
            <p>{p('success.passwordChanged')}</p>
          </div>
        ),
        className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-black dark:text-white border border-gray-200/20 dark:border-gray-700/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg",
      })
    } catch (error) {
      console.error('Error changing password:', error)
      let errorMessage = p('errors.passwordChangeFailed')
      
      if (error instanceof Error) {
        const errorText = error.message
        if (errorText === 'Current password is incorrect') {
          errorMessage = p('errors.currentPasswordIncorrect')
        } else if (errorText.includes('endpoint not found')) {
          errorMessage = p('errors.serverError')
        }
      }
      
      toast({
        description: (
          <div className="flex items-center gap-2 p-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p>{errorMessage}</p>
          </div>
        ),
        className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-black dark:text-white border border-gray-200/20 dark:border-gray-700/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-lg",
      })
      
      // Clear the current password field on incorrect password
      if (error instanceof Error && error.message === 'Current password is incorrect') {
        setPasswordData(prev => ({
          ...prev,
          currentPassword: ''
        }))
      }
    } finally {
      setIsPasswordSaving(false)
    }
  }

  // Only render content after mounting to avoid hydration issues
  if (!mounted || isLoading || isFetchingProfile) {
    return (
      <div className="space-y-6">
        {/* Avatar Loading Skeleton */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>

        {/* Form Section Loading Skeleton */}
        <div className="space-y-6">
          {/* Personal Info Section */}
          <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="grid gap-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse" />
                    <div className="h-10 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse" />
                  <div className="h-10 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>

          {/* Save Button */}
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex justify-center">
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            title="Upload profile picture"
          />
          <div className="relative">
            <Avatar 
              className="h-20 w-20 ring-4 ring-white dark:ring-gray-800 shadow-lg cursor-pointer"
              onClick={handleAvatarClick}
            >
              {avatarUrl ? (
                <AvatarImage 
                  src={avatarUrl}
                  alt="Profile picture"
                  key={avatarKey}
                />
              ) : (
                <AvatarFallback className="text-lg">
                  {(formData.first_name?.[0] || "U") + (formData.last_name?.[0] || "N")}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-[#8CC63F] text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">{p('personalInfo')}</h2>
          </div>
          <div className="grid gap-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {p('firstName')}
                </label>
                <Input 
                  className="w-full bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700" 
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {p('lastName')}
                </label>
                <Input 
                  className="w-full bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700" 
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {p('email')}
              </label>
              <Input 
                className="w-full bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700" 
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {p('country')}
              </label>
              <Select 
                value={formData.country || ''} 
                onValueChange={(value) => handleInputChange('country', value)}
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700">
                  <SelectValue placeholder={p('selectCountry')} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {p('city')}
              </label>
              <Input 
                className="w-full bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700" 
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">{p('passwordManager')}</h2>
          </div>
          {isChangingPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {p('currentPassword')}
                </label>
                <div className="relative">
                  <Input 
                    type={showCurrentPassword ? "text" : "password"}
                    className="w-full bg-gray-50 border-gray-100 pr-10 dark:bg-gray-900/50 dark:border-gray-700" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      currentPassword: e.target.value
                    }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {p('newPassword')}
                </label>
                <div className="relative">
                  <Input 
                    type={showNewPassword ? "text" : "password"}
                    className="w-full bg-gray-50 border-gray-100 pr-10 dark:bg-gray-900/50 dark:border-gray-700" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {p('confirmPassword')}
                </label>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full bg-gray-50 border-gray-100 pr-10 dark:bg-gray-900/50 dark:border-gray-700" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    })
                  }}
                >
                  {p('cancel')}
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-500 text-white"
                  onClick={handlePasswordChange}
                  disabled={isPasswordSaving}
                >
                  {isPasswordSaving ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{p('saving')}</span>
                    </div>
                  ) : (
                    p('savePassword')
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                className="text-teal-500 text-sm hover:underline"
                onClick={() => setIsChangingPassword(true)}
              >
                {p('changePassword')}
              </button>
            </div>
          )}
        </div>

        <Button 
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium" 
          onClick={handleSubmit}
          disabled={isProfileSaving || isSaving}
        >
          {isProfileSaving || isSaving ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
              <span>{p('saving')}</span>
            </div>
          ) : (
            p('saveChanges')
          )}
        </Button>
      </div>
    </div>
  );
}

export default ProfilePage;
