"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { X, Plus, Download, Image } from 'lucide-react'
import { IbuData } from '@/types/ibu'
import { API_ROUTES, buildApiUrl } from "@/lib/api/config";

interface ProductComparisonProps {
  selectedProducts: IbuData[]
  onRemoveProduct: (productId: string) => void
  onAddProduct: () => void
  maxProducts?: number
}

export function ProductComparison({
  selectedProducts,
  onRemoveProduct,
  onAddProduct,
  maxProducts = 3
}: ProductComparisonProps) {
  const [activeTab, setActiveTab] = useState("summary")

  const handleDownload = async (categoryId: string) => {
    try {
      // Get the UUIDs of selected products
      const uuids = selectedProducts.map(p => p.uuid).join(',');
      
      // Create download URL with filters
      const downloadUrl = buildApiUrl(`${API_ROUTES.PRODUCTS.IBU_DATA}/download_excel/?uuids=${uuids}`);
      
      // Trigger download
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading Excel:', error);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-6">Product Comparison</h2>

      {/* Products Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {selectedProducts.map((product) => (
          <div key={product.uuid} className="bg-[#F7FCFC] rounded-lg p-6 relative">
            <button
              onClick={() => onRemoveProduct(product.uuid)}
              className="absolute right-4 top-4 hover:bg-[#E7F1F1] p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="bg-[#E7F1F1] aspect-video rounded-lg flex items-center justify-center mb-4">
              <Image className="w-12 h-12 text-teal-500" />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium line-clamp-1" title={product.name}>
                {product.name}
              </h3>

              <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                <span className="text-gray-500">Industry Solutions</span>
                <span className="text-right line-clamp-1" title={product.classific}>{product.classific}</span>
                
                <span className="text-gray-500">Country</span>
                <span className="text-right">{product.geo}</span>
                
                <span className="text-gray-500">ID</span>
                <span className="text-right font-mono bg-[#E7F1F1] px-2 py-0.5 rounded inline-block ml-auto">
                  {product.uuid.slice(0, 8)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {selectedProducts.length < maxProducts && (
          <button
            onClick={onAddProduct}
            className="border-2 border-dashed border-[#E7F1F1] rounded-lg flex items-center justify-center hover:border-teal-500 transition-colors h-full min-h-[200px]"
          >
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Plus className="w-8 h-8" />
              <span>Add more products</span>
            </div>
          </button>
        )}
      </div>

      <div className="flex justify-between items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={onAddProduct}
          className="text-teal-500 border-teal-500 hover:bg-teal-50"
        >
          Add more products
        </Button>
        <Button
          variant="outline"
          onClick={() => onRemoveProduct(selectedProducts[0].uuid)}
          className="text-teal-500 border-teal-500 hover:bg-teal-50"
        >
          Remove product
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-teal-600 border-teal-600 hover:bg-teal-50"
          onClick={() => handleDownload('all')}
        >
          <Download className="w-4 h-4 mr-2" />
          Download All
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-[#F7FCFC] p-1 rounded-lg flex gap-1 mb-6">
        {["Summary", "Analysis", "Details", "Impact"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.toLowerCase() 
                ? 'bg-white text-teal-500' 
                : 'hover:bg-[#E7F1F1] text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {[
          {
            id: "basic-info",
            name: "Basic Information",
            rows: [
              { name: "Product Name", values: selectedProducts.map(p => p.name) },
              { name: "Version", values: selectedProducts.map(p => p.version) },
              { name: "Registration No.", values: selectedProducts.map(p => p.reg_no) },
              { name: "Product ID", values: selectedProducts.map(p => p.uuid.slice(0, 8)) }
            ]
          },
          {
            id: "classification",
            name: "Classification",
            rows: [
              { name: "Industry Solution", values: selectedProducts.map(p => p.classific) },
              { name: "Classification System", values: selectedProducts.map(p => p.classific_system) },
              { name: "Type", values: selectedProducts.map(p => p.type) },
              { name: "Sub Type", values: selectedProducts.map(p => p.sub_type) }
            ]
          },
          {
            id: "location",
            name: "Location Information",
            rows: [
              { name: "Country", values: selectedProducts.map(p => p.geo) },
              { 
                name: "Coordinates", 
                values: selectedProducts.map(p => 
                  p.latitude && p.longitude 
                    ? `${p.latitude}°, ${p.longitude}°`
                    : "N/A"
                )
              }
            ]
          },
          {
            id: "validity",
            name: "Validity Period",
            rows: [
              { name: "Reference Year", values: selectedProducts.map(p => p.ref_year.toString()) },
              { name: "Valid Until", values: selectedProducts.map(p => p.valid_until?.toString() || "N/A") },
              { 
                name: "Last Updated", 
                values: selectedProducts.map(p => 
                  p.updated_at 
                    ? new Date(p.updated_at).toLocaleDateString()
                    : "N/A"
                ) 
              }
            ]
          },
          {
            id: "documentation",
            name: "Documentation",
            rows: [
              { 
                name: "EPD Document", 
                values: selectedProducts.map(p => 
                  p.pdf_url ? (
                    <a 
                      href={p.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      View PDF
                    </a>
                  ) : "Not available"
                ),
                isComponent: true
              },
              { name: "Owner", values: selectedProducts.map(p => p.owner || "N/A") },
              { name: "Dataset Type", values: selectedProducts.map(p => p.ds_type || "N/A") }
            ]
          }
        ].map((category) => (
          <div key={category.id} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{category.name}</h3>
              <Button
                variant="outline"
                size="sm"
                className="text-teal-600 border-teal-600 hover:bg-teal-50"
                onClick={() => handleDownload(category.id)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              {category.rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`grid grid-cols-[200px_1fr] ${rowIndex !== category.rows.length - 1 ? 'border-b' : ''}`}
                >
                  <div className="p-4 bg-gray-50 border-r font-medium">
                    {row.name}
                  </div>
                  <div className="grid grid-cols-3 divide-x">
                    {row.isComponent 
                      ? row.values.map((value, valueIndex) => (
                          <div key={valueIndex} className="p-4">
                            {value}
                          </div>
                        ))
                      : row.values.map((value, valueIndex) => (
                          <div key={valueIndex} className="p-4 break-words">
                            {value || "N/A"}
                          </div>
                        ))
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
