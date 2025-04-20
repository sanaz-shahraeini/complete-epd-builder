'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, ChevronDown, ChevronUp, Package } from 'lucide-react'

interface Material {
  id: string
  name: string
  weight: number
  unit: 'g' | 'kg'
}

export function MaterialSection() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isWeightSummaryVisible, setIsWeightSummaryVisible] = useState(true)
  
  const addMaterial = () => {
    setMaterials([
      ...materials,
      { id: Math.random().toString(), name: '', weight: 0, unit: 'kg' }
    ])
  }

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id))
  }

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(materials.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ))
  }

  const calculateTotalWeight = () => {
    return materials.reduce((total, material) => {
      const weight = material.unit === 'kg' ? material.weight * 1000 : material.weight
      return total + weight
    }, 0)
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-teal-600" />
        <h2 className="text-lg font-medium text-teal-600">Product Packaging</h2>
      </div>

      <div className="space-y-4">
        {materials.map((material) => (
          <div key={material.id} className="grid grid-cols-[1fr_auto_100px_auto] gap-4 items-start">
            <div className="space-y-2">
              <label className="text-sm font-medium">Material 1*</label>
              <Select
                value={material.name}
                onValueChange={(value) => updateMaterial(material.id, { name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plastic">Plastic</SelectItem>
                  <SelectItem value="paper">Paper</SelectItem>
                  <SelectItem value="metal">Metal</SelectItem>
                  <SelectItem value="glass">Glass</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-8">
              <label className="text-sm font-medium">Weight*</label>
            </div>

            <div className="space-y-2 pt-8">
              <Input
                type="number"
                value={material.weight || ''}
                onChange={(e) => updateMaterial(material.id, { weight: parseFloat(e.target.value) || 0 })}
                className="w-full"
              />
            </div>

            <div className="space-y-2 pt-8 flex items-center gap-2">
              <Select
                value={material.unit}
                onValueChange={(value: 'g' | 'kg') => updateMaterial(material.id, { unit: value })}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMaterial(material.id)}
                className="text-gray-400 hover:text-gray-500"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={addMaterial}
          className="text-teal-600 border-teal-600"
        >
          Add Material
        </Button>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setIsWeightSummaryVisible(!isWeightSummaryVisible)}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
        >
          {isWeightSummaryVisible ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          {isWeightSummaryVisible ? 'Hide' : 'Show'} Weight Summary
        </button>

        {isWeightSummaryVisible && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-medium text-teal-600">Weight Calculations</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Packaging Weight:</span>
                <span>{calculateTotalWeight().toFixed(2)} g</span>
              </div>
              <div className="flex justify-between">
                <span>Product Weight:</span>
                <span>0.00 g</span>
              </div>
            </div>

            <div className="flex justify-between bg-teal-500 text-white p-4 rounded-lg">
              <span className="font-medium">Total Weight:</span>
              <span>{calculateTotalWeight().toFixed(2)} g</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

