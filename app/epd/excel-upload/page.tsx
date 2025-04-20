'use client'

import { useState } from 'react'
import { ArrowLeft, Upload, FileSpreadsheet, ExternalLink, Lightbulb } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import Link from 'next/link'
import { ModeToggle } from '@/components/mode-toggle'
import { ChevronLeft } from 'lucide-react'
import { MobileNav } from "@/components/mobile-nav"

export default function ExcelUploadPage() {
  const [files, setFiles] = useState<{ component?: File; material?: File }>({})

  const handleFileUpload = (type: 'component' | 'material') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }))
    }
  }

  const handleDrop = (type: 'component' | 'material') => (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div>
      <div className="fixed top-4 right-4 z-50">
        <MobileNav />
      </div>
      <div className="flex min-h-screen bg-gray-50 dark:bg-black">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.history.back()}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-full w-9 h-9 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Go back</span>
                </Button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Input Your Data</h1>
              </div>
              <ModeToggle />
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content */}
              <div className="flex-1">
                <div className="mb-8">
             
                  <p className="text-gray-600 dark:text-gray-300">
                    Choose your preferred method to input data and upload Excel files if needed.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Component Upload Section */}
                  <section className="border rounded-xl p-8 bg-white dark:bg-black dark:border-gray-800">
                    <div className="flex items-start gap-4 mb-6">
                      <FileSpreadsheet className="h-6 w-6 text-teal-600 mt-1" />
                      <div>
                        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Upload Excel File</h2>
                        <p className="text-gray-600 dark:text-gray-300">
                          Quick and efficient way to upload large amounts of data using our Excel templates.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Download Template</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Use our template to ensure your data is formatted correctly.
                        </p>
                        <Button 
                          variant="outline" 
                          className="bg-teal-50 dark:bg-teal-900 text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400 hover:bg-teal-100 dark:hover:bg-teal-800"
                          asChild
                        >
                          <a href="/templates/component-template.xlsx" download>
                            Download component Template
                          </a>
                        </Button>
                      </div>

                      <div
                        onDrop={handleDrop('component')}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed rounded-lg p-8 text-center hover:border-teal-600 dark:hover:border-teal-400 transition-colors"
                      >
                        <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          Drag & drop your Excel file here
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          or click to select file
                        </p>
                        <input
                          type="file"
                          id="component-upload"
                          accept=".xlsx,.xls"
                          className="hidden"
                          onChange={handleFileUpload('component')}
                        />
                        <Button 
                          variant="outline"
                          className="bg-teal-50 dark:bg-teal-900 text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400 hover:bg-teal-100 dark:hover:bg-teal-800"
                          onClick={() => document.getElementById('component-upload')?.click()}
                        >
                          Browse Files
                        </Button>
                      </div>
                    </div>
                  </section>

                  {/* Material Upload Section */}
                  <section className="border rounded-xl p-8 bg-white dark:bg-black dark:border-gray-800">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Download Template</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Use our template to ensure your data is formatted correctly.
                        </p>
                        <Button 
                          variant="outline" 
                          className="bg-teal-50 dark:bg-teal-900 text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400 hover:bg-teal-100 dark:hover:bg-teal-800"
                          asChild
                        >
                          <a href="/templates/material-template.xlsx" download>
                            Download material Template
                          </a>
                        </Button>
                      </div>

                      <div
                        onDrop={handleDrop('material')}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed rounded-lg p-8 text-center hover:border-teal-600 dark:hover:border-teal-400 transition-colors"
                      >
                        <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          Drag & drop your Excel file here
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          or click to select file
                        </p>
                        <input
                          type="file"
                          id="material-upload"
                          accept=".xlsx,.xls"
                          className="hidden"
                          onChange={handleFileUpload('material')}
                        />
                        <Button 
                          variant="outline"
                          className="bg-teal-50 dark:bg-teal-900 text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400 hover:bg-teal-100 dark:hover:bg-teal-800"
                          onClick={() => document.getElementById('material-upload')?.click()}
                        >
                          Browse Files
                        </Button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="lg:w-80 space-y-6">
                <Card className="p-6 dark:bg-black dark:border-gray-800">
                  <div className="flex items-start gap-4">
                    <Lightbulb className="h-5 w-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-1" />
                    <div>
                      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Tips & Guidelines</h2>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Choose Excel Upload:
                          </p>
                          <ul className="text-sm text-gray-500 dark:text-gray-400 list-disc pl-4 space-y-1">
                            <li>for large datasets</li>
                            <li>when you have existing data in spreadsheets</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Manual Entry is best for:
                          </p>
                          <ul className="text-sm text-gray-500 dark:text-gray-400 list-disc pl-4 space-y-1">
                            <li>new products</li>
                            <li>when you need to enter data gradually</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 dark:bg-black dark:border-gray-800">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Quick Links</h2>
                  <div className="space-y-3">
                    <Link 
                      href="#"
                      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      View Documentation
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Link 
                      href="#"
                      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      Get Support
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
