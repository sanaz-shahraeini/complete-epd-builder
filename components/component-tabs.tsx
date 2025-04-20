'use client'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Truck, PenToolIcon as Tool, Info, Plus, Trash2, Factory, Zap, Lightbulb } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MaintenanceMaterial {
  id: string
  name: string
  quantity: number
  unit: string
}

interface Material {
  id: string
  name: string
  quantity: number
  unit: 'kg' | 'g'
  recycled: number
}

interface ComponentTabsProps {
  componentId: string
  subComponentId: string
}

export function ComponentTabs({ componentId, subComponentId }: ComponentTabsProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [maintenanceMaterials, setMaintenanceMaterials] = useState<MaintenanceMaterial[]>([])
  const [activeTab, setActiveTab] = useState("materials")
  const [maintenanceType, setMaintenanceType] = useState("")
  const [maintenanceFrequency, setMaintenanceFrequency] = useState("")
  const [equalToFunctionalUnit, setEqualToFunctionalUnit] = useState(false)
  const [requiresEnergy, setRequiresEnergy] = useState(false)

  const addMaterial = () => {
    setMaterials([
      ...materials,
      {
        id: Math.random().toString(),
        name: '',
        quantity: 0,
        unit: 'kg',
        recycled: 0
      }
    ])
  }

  const addMaintenanceMaterial = () => {
    setMaintenanceMaterials([
      ...maintenanceMaterials,
      {
        id: Math.random().toString(),
        name: '',
        quantity: 0,
        unit: 'kg'
      }
    ])
  }

  const removeMaterial = (materialId: string) => {
    setMaterials(materials.filter(m => m.id !== materialId))
  }

  const removeMaintenanceMaterial = (materialId: string) => {
    setMaintenanceMaterials(maintenanceMaterials.filter(m => m.id !== materialId))
  }

  const updateMaterial = (materialId: string, updates: Partial<Material>) => {
    setMaterials(materials.map(material =>
      material.id === materialId ? { ...material, ...updates } : material
    ))
  }

  const updateMaintenanceMaterial = (materialId: string, updates: Partial<MaintenanceMaterial>) => {
    setMaintenanceMaterials(maintenanceMaterials.map(material =>
      material.id === materialId ? { ...material, ...updates } : material
    ))
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 dark:bg-gray-900/20 p-1 gap-2">
        <TabsTrigger 
          value="materials" 
          className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-teal-600 dark:text-gray-400 dark:data-[state=active]:text-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <Tool className="h-4 w-4" />
          Materials
        </TabsTrigger>
        <TabsTrigger 
          value="details" 
          className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-teal-600 dark:text-gray-400 dark:data-[state=active]:text-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <Info className="h-4 w-4" />
          Details
        </TabsTrigger>
        <TabsTrigger 
          value="manufacturing" 
          className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-teal-600 dark:text-gray-400 dark:data-[state=active]:text-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <Factory className="h-4 w-4" />
          Manufacturing
        </TabsTrigger>
      </TabsList>

      <TabsContent value="materials" className="space-y-4 mt-4">
        <div className="space-y-6">
          {materials.map((material) => (
            <div key={material.id} className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Material Name</span>
                  <Input
                    placeholder="Enter material name"
                    value={material.name}
                    onChange={(e) => updateMaterial(material.id, { name: e.target.value })}
                    className="mt-1 dark:bg-black dark:border-gray-800"
                  />
                </label>
              </div>
              <div className="w-24">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Quantity</span>
                  <Input
                    type="number"
                    value={material.quantity}
                    onChange={(e) => updateMaterial(material.id, { quantity: parseFloat(e.target.value) })}
                    className="mt-1 dark:bg-black dark:border-gray-800"
                  />
                </label>
              </div>
              <div className="w-24">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Unit</span>
                  <Select
                    value={material.unit}
                    onValueChange={(value) => updateMaterial(material.id, { unit: value as 'kg' | 'g' })}
                  >
                    <SelectTrigger className="mt-1 dark:bg-black dark:border-gray-800">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <div className="w-24">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Recycled %</span>
                  <Input
                    type="number"
                    value={material.recycled}
                    onChange={(e) => updateMaterial(material.id, { recycled: parseFloat(e.target.value) })}
                    className="mt-1 dark:bg-black dark:border-gray-800"
                  />
                </label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMaterial(material.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:text-red-200 dark:hover:bg-red-950/30 h-10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addMaterial}
            className="border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="details" className="mt-6 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Transport Information</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Transport</span>
                <Select>
                  <SelectTrigger className="mt-1 dark:bg-black dark:border-gray-800">
                    <SelectValue placeholder="Select transport type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="road">Road</SelectItem>
                    <SelectItem value="rail">Rail</SelectItem>
                    <SelectItem value="sea">Sea</SelectItem>
                    <SelectItem value="air">Air</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
            <div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Origin</span>
                <Select>
                  <SelectTrigger className="mt-1 dark:bg-black dark:border-gray-800">
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="factory">Factory</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="port">Port</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
            <div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Destination</span>
                <Select>
                  <SelectTrigger className="mt-1 dark:bg-black dark:border-gray-800">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="factory">Factory</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="port">Port</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
            <div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Distance (km)</span>
                <Input type="number" placeholder="Enter distance" className="mt-1 dark:bg-black dark:border-gray-800" />
              </label>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Tool className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Maintenance & Replacement</h3>
          </div>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Type</span>
                  <Select value={maintenanceType} onValueChange={setMaintenanceType}>
                    <SelectTrigger className="mt-1 dark:bg-black dark:border-gray-800">
                      <SelectValue placeholder="Select maintenance type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="replacement">Replacement</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <div>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Frequency (per year)</span>
                  <Input 
                    type="number" 
                    placeholder="Enter frequency"
                    value={maintenanceFrequency}
                    onChange={(e) => setMaintenanceFrequency(e.target.value)}
                    className="mt-1 dark:bg-black dark:border-gray-800"
                  />
                </label>
              </div>
            </div>

            {maintenanceType && (
              <div className="space-y-4 pt-4">
                {maintenanceMaterials.map((material) => (
                  <div key={material.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-end">
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Material Name</span>
                        <Input
                          placeholder="Enter material name"
                          value={material.name}
                          onChange={(e) => updateMaintenanceMaterial(material.id, { name: e.target.value })}
                          className="mt-1 dark:bg-black dark:border-gray-800"
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Quantity</span>
                        <Input
                          type="number"
                          value={material.quantity}
                          onChange={(e) => updateMaintenanceMaterial(material.id, { quantity: parseFloat(e.target.value) })}
                          className="mt-1 w-24 dark:bg-black dark:border-gray-800"
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Unit</span>
                        <Select
                          value={material.unit}
                          onValueChange={(value) => updateMaintenanceMaterial(material.id, { unit: value })}
                        >
                          <SelectTrigger className="w-24 dark:bg-black dark:border-gray-800">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">Kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="l">L</SelectItem>
                            <SelectItem value="ml">mL</SelectItem>
                          </SelectContent>
                        </Select>
                      </label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMaintenanceMaterial(material.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addMaintenanceMaterial}
                  className="border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Component Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Number of components used</span>
                <Input type="number" placeholder="Enter number of components" className="mt-1 dark:bg-black dark:border-gray-800" />
              </label>
            </div>
            <div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Component description</span>
                <Textarea 
                  placeholder="Enter component description"
                  className="mt-1 min-h-[100px] dark:bg-black dark:border-gray-800"
                />
              </label>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="manufacturing" className="mt-6 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Factory className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Manufacturing</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="functionalUnit" 
                checked={equalToFunctionalUnit}
                onCheckedChange={(checked) => setEqualToFunctionalUnit(checked as boolean)}
              />
              <label 
                htmlFor="functionalUnit" 
                className="text-sm font-medium text-gray-700 dark:text-gray-100 cursor-pointer"
              >
                Equal to functional unit
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Check if the manufacturing quantity equals the functional unit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Production Quantity</span>
                  <Input placeholder="Enter production quantity" className="mt-1 dark:bg-black dark:border-gray-800" />
                </label>
              </div>
              <div>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Production Unit</span>
                  <Select>
                    <SelectTrigger className="mt-1 dark:bg-black dark:border-gray-800">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="units">Units</SelectItem>
                      <SelectItem value="sets">Sets</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Manufacturing Energy Use</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Utility Type</span>
                <Select>
                  <SelectTrigger className="mt-1 dark:bg-black dark:border-gray-800">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="gas">Natural Gas</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
            <div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Utility Quantity</span>
                <Input placeholder="Enter quantity" className="mt-1 dark:bg-black dark:border-gray-800" />
              </label>
            </div>
            <div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Utility Unit</span>
                <Select>
                  <SelectTrigger className="mt-1 dark:bg-black dark:border-gray-800">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kwh">kWh</SelectItem>
                    <SelectItem value="mj">MJ</SelectItem>
                    <SelectItem value="m3">m³</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Operation Energy</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="requiresEnergy" 
                checked={requiresEnergy}
                onCheckedChange={(checked) => setRequiresEnergy(checked as boolean)}
              />
              <label 
                htmlFor="requiresEnergy" 
                className="text-sm font-medium text-gray-700 dark:text-gray-100 cursor-pointer"
              >
                Requires Energy
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Check if operation requires energy consumption</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {requiresEnergy && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Operation Quantity</span>
                    <Input placeholder="Enter operation quantity" className="mt-1 dark:bg-black dark:border-gray-800" />
                  </label>
                </div>
                <div>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Operation Unit</span>
                    <Select>
                      <SelectTrigger className="mt-1 dark:bg-black dark:border-gray-800">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kwh">kWh</SelectItem>
                        <SelectItem value="mj">MJ</SelectItem>
                        <SelectItem value="m3">m³</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
