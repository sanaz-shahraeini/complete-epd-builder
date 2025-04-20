"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Package2,
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  HelpCircle,
  MapPin,
  Factory,
  Trash2,
  Zap,
  Brain,
  FileCheck,
  Settings,
  Menu,
  Lightbulb,
  BarChart2,
  FileText,
  LogOut,
  MessageSquare,
  Search,
  ChevronLeft,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { SectionHeader } from "./section-header";
import { SectionTitle } from "./section-title";
import Link from "next/link";
import { LanguageSwitcher } from "./language-switcher";
import { useTranslations } from "next-intl";

const Map = dynamic(() => import("./map"), { ssr: false });

interface Material {
  id: string;
  name: string;
  weight: number;
  unit: "g" | "kg";
}

export interface ProductFormProps {
  onClose: () => void;
}

export default function ProductForm({ onClose }: ProductFormProps) {
  const router = useRouter();
  const [files, setFiles] = useState<{ image?: File; document?: File }>({});
  const [isWeightSummaryOpen, setIsWeightSummaryOpen] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [productName, setProductName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [weight, setWeight] = useState("");
  const [errors, setErrors] = useState<{
    productName?: string;
    projectName?: string;
    weight?: string;
  }>({});

  const handleFileUpload =
    (type: "image" | "document") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFiles((prev) => ({ ...prev, [type]: file }));
      }
    };

  const handleCreateProduct = () => {
    if (validateForm()) {
      setShowNextSteps(true);
    }
  };

  const handleNextStepClick = (path: string) => {
    setShowNextSteps(false);
    router.push(path);
  };

  const handleBrowseClick = (inputId: string) => {
    document.getElementById(inputId)?.click();
  };

  const addMaterial = () => {
    setMaterials([
      ...materials,
      { id: Math.random().toString(), name: "", weight: 0, unit: "kg" },
    ]);
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(
      materials.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const calculateTotalWeight = () => {
    return materials.reduce((total, material) => {
      const weight =
        material.unit === "kg" ? material.weight * 1000 : material.weight;
      return total + weight;
    }, 0);
  };

  const validateForm = () => {
    let newErrors: {
      productName?: string;
      projectName?: string;
      weight?: string;
    } = {};
    if (!productName) newErrors.productName = "Product name is required.";
    if (!projectName) newErrors.projectName = "Project name is required.";
    if (!weight) newErrors.weight = "Weight is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const t = useTranslations("ProductForm");

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-full w-9 h-9 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">{t("goBack")}</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("createNewProduct")}
          </h1>
        </div>

        <div className="space-y-8">
          <section>
            <SectionHeader
              icon={Info}
              title={t("basicInformation")}
              className="mb-6 text-teal-600"
            />
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                  {t("productName")}*
                </label>
                <Input
                  placeholder={t("enterProductName")}
                  required
                  onChange={(e) => setProductName(e.target.value)}
                />
                {errors.productName && (
                  <p className="text-red-500 text-sm">{errors.productName}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                  {t("projectName")}*
                </label>
                <Select
                  required
                  onValueChange={(value) => setProjectName(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectProject")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project1">{t("project1")}</SelectItem>
                    <SelectItem value="project2">{t("project2")}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.projectName && (
                  <p className="text-red-500 text-sm">{errors.projectName}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                  {t("weight")}*
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder={t("enterWeight")}
                    required
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  <Select defaultValue="kg" required>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder={t("unit")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.weight && (
                  <p className="text-red-500 text-sm">{errors.weight}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                  {t("dimension")} (optional)
                </label>
                <Input placeholder={t("1x1x1 cm")} />
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <SectionHeader
              icon={Package2}
              title={t("productPackaging")}
              className="mb-6 font-bold"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addMaterial}
              className="text-teal-600 border-teal-600 hover:bg-teal-50 bg-teal-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("addMaterial")}
            </Button>

            <div className="mt-4 space-y-4">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="grid sm:grid-cols-4 items-end gap-4"
                >
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block font-semibold">
                      {t("materialName")}*
                    </label>
                    <Input
                      placeholder={t("enterMaterialName")}
                      value={material.name}
                      onChange={(e) =>
                        updateMaterial(material.id, { name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block font-semibold">
                      {t("quantity")}*
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={material.weight}
                        onChange={(e) =>
                          updateMaterial(material.id, {
                            weight: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24"
                      />
                      <Select
                        value={material.unit}
                        onValueChange={(value: "g" | "kg") =>
                          updateMaterial(material.id, { unit: value })
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMaterial(material.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button
                onClick={() => setIsWeightSummaryOpen(!isWeightSummaryOpen)}
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
              >
                {isWeightSummaryOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {isWeightSummaryOpen ? t("hide") : t("show")}{" "}
                {t("weightSummary")}
              </button>

              {isWeightSummaryOpen && (
                <div className="mt-4 space-y-4 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-base font-medium text-teal-600">
                    {t("weightCalculations")}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("packagingWeight")}:</span>
                      <span>{calculateTotalWeight().toFixed(2)} g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("productWeight")}:</span>
                      <span>0.00 g</span>
                    </div>
                  </div>

                  <div className="flex justify-between bg-teal-500 text-white p-4 rounded-lg">
                    <span className="font-medium">{t("totalWeight")}:</span>
                    <span>{calculateTotalWeight().toFixed(2)} g</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <Separator />

          <section>
            <SectionHeader
              icon={MapPin}
              title={t("productionPlant")}
              className="mb-6"
            />
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                  {t("supplierCountry")}*
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCountry")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spain">Spain</SelectItem>
                    <SelectItem value="france">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                  {t("productLifetime")}*
                </label>
                <div className="flex gap-2">
                  <Input placeholder={t("enterLifetime")} />
                  <Select defaultValue="year">
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder={t("selectUnit")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="year">{t("year")}</SelectItem>
                      <SelectItem value="month">{t("month")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <SectionHeader
              icon={Factory}
              title={t("technicalInformation")}
              className="mb-6"
            />
            <Textarea
              placeholder={t("enterProductDescription")}
              className="h-[150px]"
            />
          </section>

          <div className="h-[200px] rounded-lg overflow-hidden relative z-0">
            <Map />
          </div>

          {/* Create Button - Desktop only */}
          <div className="hidden lg:flex justify-center">
            <Button
              size="lg"
              className="px-8 bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleCreateProduct}
            >
              {t("createProduct")}
            </Button>
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-full lg:w-80 order-2 lg:order-none">
        <div className="flex justify-end mb-6">
          <LanguageSwitcher />
          <ModeToggle />
        </div>

        <div className="space-y-6">
          {/* Product Image Card */}
          <Card className="p-6">
            <SectionTitle className="mb-4">{t("productImage")}</SectionTitle>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) setFiles((prev) => ({ ...prev, image: file }));
              }}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 mb-2">
                {t("dragAndDropImage")}
              </p>
              <button
                onClick={() => handleBrowseClick("image-upload")}
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                {t("orBrowse")}
              </button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload("image")}
              />
            </div>
          </Card>

          {/* Product Document Card */}
          <Card className="p-6 w-full lg:w-80">
            <SectionTitle className="mb-4">{t("productDocument")}</SectionTitle>

            <div
              className="border-2 border-dashed rounded-lg p-6 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) setFiles((prev) => ({ ...prev, document: file }));
              }}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 mb-2">
                {t("dragAndDropDocument")}
              </p>
              <button
                onClick={() => handleBrowseClick("document-upload")}
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                {t("orBrowse")}
              </button>
              <input
                id="document-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileUpload("document")}
              />
            </div>
          </Card>

          {/* Need Help Card */}
          <Card className="p-6 w-full lg:w-80">
            <div className="flex items-start gap-4">
              <HelpCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
              <div>
                <SectionTitle className="mb-4">{t("needHelp")}</SectionTitle>
                <p className="text-sm text-gray-500 mb-4">{t("supportTeam")}</p>
                <Button
                  variant="outline"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {t("askQuestions")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Button - Mobile only */}
      <div className="lg:hidden order-last w-full">
        <div className="flex justify-center mt-6">
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 bg-teal-600 hover:bg-teal-700 text-white"
            onClick={handleCreateProduct}
          >
            {t("createProduct")}
          </Button>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={showNextSteps} onOpenChange={setShowNextSteps}>
        <DialogContent className="sm:max-w-lg w-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
          <DialogHeader>
            <DialogTitle className="text-center">
              {t("chooseYourLCA")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-14"
              onClick={() => handleNextStepClick("/fast-lca")}
            >
              <Zap className="h-5 w-5 text-teal-600" />
              <div className="text-left">
                <div className="font-semibold">{t("fastLCA")}</div>
                <div className="text-sm text-gray-500">
                  {t("quickAssessment")}
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-14"
              onClick={() => handleNextStepClick("/intelligent-lca")}
            >
              <Brain className="h-5 w-5 text-teal-600" />
              <div className="text-left">
                <div className="font-semibold">{t("intelligentLCA")}</div>
                <div className="text-sm text-gray-500">
                  {t("aiPoweredAssessment")}
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-14"
              onClick={() =>
                handleNextStepClick("/product-portfolio/input-data")
              }
            >
              <FileCheck className="h-5 w-5 text-teal-600" />
              <div className="text-left">
                <div className="font-semibold">{t("epdBuilder")}</div>
                <div className="text-sm text-gray-500">{t("manageEPD")}</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-14"
              onClick={() => handleNextStepClick("/optimizer-lca")}
            >
              <Settings className="h-5 w-5 text-teal-600" />
              <div className="text-left">
                <div className="font-semibold">{t("optimizerLCA")}</div>
                <div className="text-sm text-gray-500">
                  {t("optimizeEnvironmentalImpact")}
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
        {showNextSteps && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9998]"></div>
        )}
      </Dialog>
    </div>
  );
}
