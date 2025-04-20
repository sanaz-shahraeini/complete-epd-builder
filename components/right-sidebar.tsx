import { Card } from "@/components/ui/card"
import { Lightbulb, Download, HelpCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { SectionTitle } from './section-title'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { getUserProfile, type UserProfile } from "@/lib/api/auth"

export function RightSidebar() {
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        const profile = await getUserProfile()
        setUserData(profile)
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserData()
  }, [])

  const userInitials = userData ? 
    `${userData.first_name?.[0] || ''}${userData.last_name?.[0] || ''}` : '?'

  return (
    <div className="w-full lg:w-80 space-y-4">
      <Card className="p-4">
        <div className="flex items-center space-x-4 mb-2">
          {isLoading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : (
            <>
              <Avatar>
                <AvatarImage src={userData?.profile?.profile_picture || ''} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {userData ? `${userData.first_name} ${userData.last_name}` : 'Unknown User'}
                </div>
                <div className="text-sm text-gray-500">
                  {userData?.company_name || 'No Company'}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <SectionTitle className="mb-4">
          Tips & Guidelines
        </SectionTitle>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-shrink-0">
              <span className="inline-block p-1 rounded-full bg-teal-50">
                <Lightbulb className="h-3 w-3 text-teal-600" />
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose Excel Upload for large datasets or when you have existing data in spreadsheets
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex-shrink-0">
              <span className="inline-block p-1 rounded-full bg-teal-50">
                <Lightbulb className="h-3 w-3 text-teal-600" />
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manual Entry is best for new products or when you need to enter data gradually
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex-shrink-0">
              <span className="inline-block p-1 rounded-full bg-teal-50">
                <Lightbulb className="h-3 w-3 text-teal-600" />
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Phase Base UI provides structured guidance, while Free UI offers more flexibility
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle className="mb-4">
          Resources
        </SectionTitle>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="#">
              <Download className="mr-2 h-4 w-4" />
              Download Templates
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="#">
              <Download className="mr-2 h-4 w-4" />
              User Guide PDF
            </Link>
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-start gap-4">
          <HelpCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-base font-bold text-teal-600 mb-2">Need Help?</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Our support team is here to assist you with any questions about the EPD creation process.
            </p>
            <Button className="w-full bg-teal-600 hover:bg-teal-700">
              Contact Support
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
