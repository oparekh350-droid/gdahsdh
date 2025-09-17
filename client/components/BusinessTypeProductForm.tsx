"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { BusinessType } from "@shared/types"
import {
  Calendar,
  Barcode,
  User,
  Package,
  DollarSign,
  AlertCircle,
  Calculator,
  CheckCircle,
  XCircle,
  Tag,
  Factory,
  Store,
} from "lucide-react"
import { dataManager } from "@/lib/data-manager"

interface BusinessTypeProductFormProps {
  businessType: BusinessType
  onSubmit: (productData: any) => void
  onCancel: () => void
  initialData?: any
  isEditing?: boolean
}

interface ValidationErrors {
  [key: string]: string
}

interface FieldValidation {
  [key: string]: boolean
}

const BusinessTypeProductForm: React.FC<BusinessTypeProductFormProps> = ({
  businessType,
  onSubmit,
  onCancel,
  initialData = {},
  isEditing = false,
}) => {
  // Common fields for all business types
  const [commonFields, setCommonFields] = useState({
    productName: initialData.productName || "",
    category: initialData.category || "",
    quantityInStock: initialData.quantityInStock || 0,
    unitOfMeasure: initialData.unitOfMeasure || "pieces",
    buyingPrice: initialData.buyingPrice || 0,
    sellingPrice: initialData.sellingPrice || 0,
    dateOfPurchase: initialData.dateOfPurchase || new Date().toISOString().split("T")[0],
    supplierVendorName: initialData.supplierVendorName || "",
    minimumStockAlert: initialData.minimumStockAlert || 10,
    barcodeQrCode: initialData.barcodeQrCode || "",
    description: initialData.description || "",
    tags: initialData.tags || "",
  })

  // Business-specific fields
  const [specificFields, setSpecificFields] = useState({
    // Manufacturer specific
    costPerUnit: initialData.costPerUnit || 0,
    dateOfProduction: initialData.dateOfProduction || new Date().toISOString().split("T")[0],
    linkedRecipe: initialData.linkedRecipe || "",
    batchLotNumber: initialData.batchLotNumber || "",
    qualityGrade: initialData.qualityGrade || "A",
    productionLine: initialData.productionLine || "",
    rawMaterialCost: initialData.rawMaterialCost || 0,
    laborCost: initialData.laborCost || 0,
    overheadCost: initialData.overheadCost || 0,

    // Retailer specific
    expiryDate: initialData.expiryDate || "",
    brandName: initialData.brandName || "",
    warranty: initialData.warranty || "",
    returnPolicy: initialData.returnPolicy || "",
    shippingWeight: initialData.shippingWeight || 0,
    dimensions: initialData.dimensions || "",
    isFragile: initialData.isFragile || false,

    // Additional fields
    customField1: initialData.customField1 || "",
    customField2: initialData.customField2 || "",
    customField3: initialData.customField3 || "",
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [fieldValidation, setFieldValidation] = useState<FieldValidation>({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [showCalculations, setShowCalculations] = useState(false)

  const unitOfMeasureOptions = [
    "pieces",
    "kg",
    "gram",
    "litre",
    "ml",
    "meter",
    "cm",
    "inch",
    "feet",
    "box",
    "packet",
    "bottle",
    "can",
    "jar",
    "tube",
    "roll",
    "pair",
    "set",
    "dozen",
    "unit",
    "bundle",
    "carton",
    "pallet",
    "ton",
    "pound",
    "gallon",
  ]

  const qualityGradeOptions = ["A", "B", "C", "Premium", "Standard", "Economy"]

  const categoryOptions = {
    manufacturer: ["Raw Materials", "Components", "Finished Goods", "Industrial Equipment", "Tools"],
    retailer: ["Electronics", "Clothing", "Home & Garden", "Sports", "Books", "Food", "Health"],
  }

  // Real-time validation
  useEffect(() => {
    validateForm()
  }, [commonFields, specificFields])

  const validateField = (fieldName: string, value: any, fieldType = "common"): string => {
    const fields = fieldType === "common" ? commonFields : specificFields

    switch (fieldName) {
      case "productName":
        if (!value || !value.toString().trim()) return "Product name is required"
        if (value.toString().trim().length < 2) return "Name must be at least 2 characters"
        if (value.toString().trim().length > 100) return "Name cannot exceed 100 characters"
        return ""

      case "category":
        if (!value || !value.toString().trim()) return "Category is required"
        return ""

      case "quantityInStock":
        if (value < 0) return "Quantity cannot be negative"
        return ""

      case "buyingPrice":
      case "sellingPrice":
        if (value < 0) return "Price cannot be negative"
        if (fieldName === "sellingPrice") {
          if (value <= 0) return "Selling price must be greater than 0"
          if (value < fields.buyingPrice) {
            return "Selling price should be higher than buying price"
          }
        }
        return ""

      case "supplierVendorName":
        if (!value || !value.toString().trim()) return "Supplier/Vendor name is required"
        return ""

      case "minimumStockAlert":
        if (value < 0) return "Minimum stock alert cannot be negative"
        return ""

      case "batchLotNumber":
        if (businessType === "manufacturer" && (!value || !value.toString().trim())) {
          return "Batch/Lot number is required for manufactured products"
        }
        return ""

      default:
        return ""
    }
  }

  const validateForm = () => {
    const newErrors: ValidationErrors = {}
    const newValidation: FieldValidation = {}

    // Validate common fields
    Object.keys(commonFields).forEach((key) => {
      const error = validateField(key, commonFields[key as keyof typeof commonFields], "common")
      if (error) {
        newErrors[key] = error
        newValidation[key] = false
      } else {
        newValidation[key] = true
      }
    })

    // Validate business-specific fields
    Object.keys(specificFields).forEach((key) => {
      const error = validateField(key, specificFields[key as keyof typeof specificFields], "specific")
      if (error) {
        newErrors[key] = error
        newValidation[key] = false
      } else if (specificFields[key as keyof typeof specificFields]) {
        newValidation[key] = true
      }
    })

    setErrors(newErrors)
    setFieldValidation(newValidation)
    setIsFormValid(Object.keys(newErrors).length === 0 && isRequiredFieldsFilled())
  }

  const isRequiredFieldsFilled = (): boolean => {
    const requiredCommonFields = ["productName", "category", "sellingPrice", "supplierVendorName"]

    const requiredSpecificFields: string[] = []

    switch (businessType) {
      case "manufacturer":
        requiredSpecificFields.push("batchLotNumber")
        break
    }

    const commonCheck = requiredCommonFields.every((field) => {
      const value = commonFields[field as keyof typeof commonFields]
      return value !== undefined && value !== null && value.toString().trim() !== ""
    })

    const specificCheck = requiredSpecificFields.every((field) => {
      const value = specificFields[field as keyof typeof specificFields]
      return value !== undefined && value !== null && value.toString().trim() !== ""
    })

    return commonCheck && specificCheck
  }

  const handleSubmit = () => {
    if (!isFormValid) {
      setErrors((prev) => ({ ...prev, form: "Please fix all errors before submitting" }))
      return
    }

    try {
      const formData = {
        ...commonFields,
        ...specificFields,
        businessType,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Calculate profit margin
        profitMargin:
          commonFields.sellingPrice > 0 && commonFields.buyingPrice > 0
            ? ((commonFields.sellingPrice - commonFields.buyingPrice) / commonFields.buyingPrice) * 100
            : 0,
        // Calculate total cost for manufacturers
        totalCost:
          businessType === "manufacturer"
            ? specificFields.rawMaterialCost + specificFields.laborCost + specificFields.overheadCost
            : commonFields.buyingPrice,
      }

      // Validate final data before submission
      const finalValidation = dataManager.validateProductData(formData)
      if (!finalValidation.isValid) {
        setErrors({ form: finalValidation.errors.join(", ") })
        return
      }

      onSubmit(formData)
    } catch (error) {
      setErrors({ form: "Failed to submit product data. Please try again." })
    }
  }

  const generateBarcode = () => {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substr(2, 5).toUpperCase()
    const barcode = `${businessType.toUpperCase()}-${timestamp.slice(-6)}-${random}`
    setCommonFields((prev) => ({ ...prev, barcodeQrCode: barcode }))
  }

  const generateBatchNumber = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const batch = `BATCH-${date}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    setSpecificFields((prev) => ({ ...prev, batchLotNumber: batch }))
  }

  const calculateCostFromRecipe = () => {
    // In a real system, this would fetch from recipe management
    const recipes = dataManager.getAllRecipes
      ? dataManager.getAllRecipes()
      : [
          { id: "recipe1", name: "Industrial Grinding Wheel Recipe", costPerUnit: 1142.5 },
          { id: "recipe2", name: "Precision Ball Bearing Assembly Recipe", costPerUnit: 78.15 },
        ]

    const selectedRecipe = recipes.find((r) => r.id === specificFields.linkedRecipe)
    if (selectedRecipe) {
      setSpecificFields((prev) => ({ ...prev, costPerUnit: selectedRecipe.costPerUnit }))
      setCommonFields((prev) => ({ ...prev, buyingPrice: selectedRecipe.costPerUnit }))
    }
  }

  const calculateManufacturingCost = () => {
    const total = specificFields.rawMaterialCost + specificFields.laborCost + specificFields.overheadCost
    setSpecificFields((prev) => ({ ...prev, costPerUnit: total }))
    setCommonFields((prev) => ({ ...prev, buyingPrice: total }))
  }

  const getFieldIcon = (fieldName: string) => {
    const isValid = fieldValidation[fieldName]
    if (isValid === undefined) return null

    return isValid ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />
  }

  const getBusinessIcon = () => {
    const icons = {
      manufacturer: Factory,
      retailer: Store,
    }

    const IconComponent = icons[businessType] || Package
    return <IconComponent className="w-5 h-5 text-blue-600" />
  }

  const renderFieldInput = (
    fieldName: string,
    label: string,
    type = "text",
    placeholder = "",
    icon?: any,
    fieldType: "common" | "specific" = "common",
    extraProps?: any,
  ) => {
    const fields = fieldType === "common" ? commonFields : specificFields
    const setFields = fieldType === "common" ? setCommonFields : setSpecificFields
    const value = fields[fieldName as keyof typeof fields]
    const error = errors[fieldName]
    const IconComponent = icon

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName}>{label}</Label>
        <div className="relative">
          {IconComponent && <IconComponent className="absolute left-3 top-3 w-4 h-4 text-gray-400" />}
          <Input
            id={fieldName}
            type={type}
            value={value}
            onChange={(e) => {
              const newValue = type === "number" ? Number.parseFloat(e.target.value) || 0 : e.target.value
              setFields((prev) => ({ ...prev, [fieldName]: newValue }))
            }}
            placeholder={placeholder}
            className={`${IconComponent ? "pl-10" : ""} ${error ? "border-red-500 pr-10" : fieldValidation[fieldName] ? "border-green-500 pr-10" : "pr-10"}`}
            {...extraProps}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{getFieldIcon(fieldName)}</div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  const renderCommonFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderFieldInput("productName", "Product Name *", "text", "Enter product name", Package, "common", {
          maxLength: 100,
        })}

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <div className="relative">
            <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Select
              value={commonFields.category}
              onValueChange={(value) => setCommonFields((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger
                className={`pl-10 ${errors.category ? "border-red-500 pr-10" : fieldValidation.category ? "border-green-500 pr-10" : "pr-10"}`}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions[businessType]?.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{getFieldIcon("category")}</div>
          </div>
          {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderFieldInput("quantityInStock", "Quantity in Stock", "number", "0", Package, "common", {
          min: 0,
          step: 1,
        })}

        <div className="space-y-2">
          <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
          <Select
            value={commonFields.unitOfMeasure}
            onValueChange={(value) => setCommonFields((prev) => ({ ...prev, unitOfMeasure: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitOfMeasureOptions.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderFieldInput("buyingPrice", "Buying Price (Per Unit) *", "number", "0.00", DollarSign, "common", {
          min: 0,
          step: 0.01,
        })}

        {renderFieldInput("sellingPrice", "Selling Price (Per Unit) *", "number", "0.00", DollarSign, "common", {
          min: 0,
          step: 0.01,
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderFieldInput("dateOfPurchase", "Date of Purchase / Stock In", "date", "", Calendar, "common")}

        {renderFieldInput(
          "supplierVendorName",
          "Supplier/Vendor Name *",
          "text",
          "Enter supplier name",
          User,
          "common",
          { maxLength: 100 },
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderFieldInput("minimumStockAlert", "Minimum Stock Alert Level", "number", "10", AlertCircle, "common", {
          min: 0,
        })}

        <div className="space-y-2">
          <Label htmlFor="barcodeQrCode">Barcode / QR Code</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="barcodeQrCode"
                value={commonFields.barcodeQrCode}
                onChange={(e) => setCommonFields((prev) => ({ ...prev, barcodeQrCode: e.target.value }))}
                placeholder="Scan or enter manually"
                className="pl-10"
              />
            </div>
            <Button type="button" variant="outline" onClick={generateBarcode}>
              Generate
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={commonFields.description}
          onChange={(e) => setCommonFields((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Enter product description"
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-gray-500">{commonFields.description.length}/500 characters</p>
      </div>

      {renderFieldInput("tags", "Tags (comma-separated)", "text", "e.g., premium, bestseller, new", Tag, "common")}
    </>
  )

  const renderManufacturerFields = () => (
    <Card className="bg-orange-50 border-orange-200">
      <CardHeader>
        <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
          <Factory className="w-5 h-5" />
          Manufacturer Specific Fields
        </CardTitle>
        <CardDescription className="text-orange-700">Additional fields for manufactured products</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderFieldInput("rawMaterialCost", "Raw Material Cost *", "number", "0.00", DollarSign, "specific", {
            min: 0,
            step: 0.01,
          })}

          {renderFieldInput("laborCost", "Labor Cost *", "number", "0.00", User, "specific", { min: 0, step: 0.01 })}

          {renderFieldInput("overheadCost", "Overhead Cost *", "number", "0.00", Calculator, "specific", {
            min: 0,
            step: 0.01,
          })}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={calculateManufacturingCost}
            className="flex items-center gap-2 bg-transparent"
          >
            <Calculator className="w-4 h-4" />
            Calculate Total Cost
          </Button>
          {showCalculations && (
            <div className="flex items-center text-sm text-gray-600">
              Total: ₹
              {(specificFields.rawMaterialCost + specificFields.laborCost + specificFields.overheadCost).toFixed(2)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFieldInput("dateOfProduction", "Date of Production", "date", "", Calendar, "specific")}

          <div className="space-y-2">
            <Label htmlFor="qualityGrade">Quality Grade</Label>
            <Select
              value={specificFields.qualityGrade}
              onValueChange={(value) => setSpecificFields((prev) => ({ ...prev, qualityGrade: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {qualityGradeOptions.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedRecipe">Linked Recipe / BoM</Label>
            <div className="flex gap-2">
              <Select
                value={specificFields.linkedRecipe}
                onValueChange={(value) => {
                  setSpecificFields((prev) => ({ ...prev, linkedRecipe: value }))
                  if (value !== "none") {
                    setTimeout(calculateCostFromRecipe, 100)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select existing recipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recipe1">Industrial Grinding Wheel Recipe</SelectItem>
                  <SelectItem value="recipe2">Precision Ball Bearing Assembly Recipe</SelectItem>
                  <SelectItem value="none">No Recipe Linked</SelectItem>
                </SelectContent>
              </Select>
              {specificFields.linkedRecipe && specificFields.linkedRecipe !== "none" && (
                <Button type="button" variant="outline" onClick={calculateCostFromRecipe}>
                  <Calculator className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchLotNumber">Batch/Lot Number *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="batchLotNumber"
                  value={specificFields.batchLotNumber}
                  onChange={(e) => setSpecificFields((prev) => ({ ...prev, batchLotNumber: e.target.value }))}
                  placeholder="Enter batch number"
                  className={errors.batchLotNumber ? "border-red-500" : ""}
                />
              </div>
              <Button type="button" variant="outline" onClick={generateBatchNumber}>
                Generate
              </Button>
            </div>
            {errors.batchLotNumber && <p className="text-sm text-red-500">{errors.batchLotNumber}</p>}
          </div>
        </div>

        {renderFieldInput("productionLine", "Production Line", "text", "e.g., Line A, Assembly 1", Factory, "specific")}
      </CardContent>
    </Card>
  )

  const renderRetailerFields = () => (
    <Card className="bg-green-50 border-green-200">
      <CardHeader>
        <CardTitle className="text-lg text-green-800 flex items-center gap-2">
          <Store className="w-5 h-5" />
          Shop Owner Specific Fields
        </CardTitle>
        <CardDescription className="text-green-700">Additional fields for retail products</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFieldInput("brandName", "Brand Name", "text", "e.g., Apple, Samsung", Tag, "specific")}

          {renderFieldInput("expiryDate", "Expiry Date (if applicable)", "date", "", Calendar, "specific")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFieldInput("warranty", "Warranty Period", "text", "e.g., 1 year, 6 months", Tag, "specific")}

          {renderFieldInput("shippingWeight", "Shipping Weight (kg)", "number", "0", Package, "specific", {
            min: 0,
            step: 0.01,
          })}
        </div>

        {renderFieldInput(
          "dimensions",
          "Dimensions (L x W x H)",
          "text",
          "e.g., 30cm x 20cm x 10cm",
          Package,
          "specific",
        )}

        <div className="space-y-2">
          <Label htmlFor="returnPolicy">Return Policy</Label>
          <Textarea
            id="returnPolicy"
            value={specificFields.returnPolicy}
            onChange={(e) => setSpecificFields((prev) => ({ ...prev, returnPolicy: e.target.value }))}
            placeholder="Return and refund policy details"
            rows={2}
            maxLength={200}
          />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {getBusinessIcon()}
        <h3 className="text-lg font-semibold">
          {isEditing ? "Edit" : "Add"} Product -
          <Badge variant="outline" className="ml-2 capitalize">
            {businessType}
          </Badge>
        </h3>
      </div>

      {errors.form && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{errors.form}</AlertDescription>
        </Alert>
      )}

      {/* Common Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product Information</CardTitle>
          <CardDescription>Enter basic product details and pricing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{renderCommonFields()}</CardContent>
      </Card>

      {/* Business-Specific Fields */}
      {businessType === "manufacturer" && renderManufacturerFields()}
      {businessType === "retailer" && renderRetailerFields()}

      {/* Profit Margin Indicator */}
      {commonFields.buyingPrice > 0 && commonFields.sellingPrice > 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Profit Analysis:</span>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <Badge
                    variant={
                      ((commonFields.sellingPrice - commonFields.buyingPrice) / commonFields.buyingPrice) * 100 >= 20
                        ? "default"
                        : ((commonFields.sellingPrice - commonFields.buyingPrice) / commonFields.buyingPrice) * 100 >=
                            10
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {(
                      ((commonFields.sellingPrice - commonFields.buyingPrice) / commonFields.buyingPrice) *
                      100
                    ).toFixed(1)}
                    % Margin
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    ₹{(commonFields.sellingPrice - commonFields.buyingPrice).toFixed(2)} profit per unit
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Validation Summary */}
      {!isFormValid && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            {Object.keys(errors).length > 0
              ? `Please fix ${Object.keys(errors).length} error(s) above before submitting`
              : "Please complete all required fields"}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className={`min-w-32 ${isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
          disabled={!isFormValid}
        >
          {isEditing ? "Update" : "Add"} Product
        </Button>
      </div>
    </div>
  )
}

export default BusinessTypeProductForm
