import Link from "next/link"
import { BarChart2, FileText, Settings, Search, MessageSquare, LogOut, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function MobileNav() {
  return (
    <div className="flex items-center gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
          <div className="p-6 flex justify-between items-center">
            <img src="/assets/images/logo.png" alt="TerraNEXT" className="h-8" />
          </div>
          
          <div className="p-4 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600">👤</span>
            </div>
            <div>
              <div className="font-medium dark:text-gray-100">User name</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Company name</div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <Link 
                href="#" 
                className="flex items-center space-x-3 px-3 py-2 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 rounded-lg"
              >
                <BarChart2 className="h-5 w-5" />
                <span>Product Portfolio</span>
              </Link>
              <Link 
                href="#" 
                className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              >
                <FileText className="h-5 w-5" />
                <span>Project Management</span>
              </Link>
              <Link 
                href="#" 
                className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              >
                <Settings className="h-5 w-5" />
                <span>Administrative</span>
              </Link>
              <Link 
                href="#" 
                className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              >
                <Search className="h-5 w-5" />
                <span>EPD Preview</span>
              </Link>
              <Link 
                href="#" 
                className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Requests</span>
                <span className="ml-auto bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 text-xs px-2 py-0.5 rounded-full">2</span>
              </Link>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <button 
                className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
      <ModeToggle />
    </div>
  )
}
