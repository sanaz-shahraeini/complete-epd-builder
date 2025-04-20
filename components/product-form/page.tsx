"use client"
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { API_ROUTES, buildApiUrl } from '@/lib/api/config'
import {
  Box,
  Button,
  TextField,
  Select,
  TextArea,
} from '@radix-ui/themes'
import { Cross2Icon } from '@radix-ui/react-icons'

interface ProductFormData {
  product_name: string
  description: string
  industry_solution: string
  category_name: string
  epd_verification_year: number
  geo: string
}

interface ProductFormProps {
  onClose: () => void
}

export default function ProductForm({ onClose }: ProductFormProps) {
  const { data: session } = useSession()
  const t = useTranslations('productForm')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>()

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(buildApiUrl(API_ROUTES.PRODUCTS.CREATE), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }

      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          title={t('close')}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Cross2Icon />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          {t('title')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <TextField.Root>
              <RadixTextField.Input
                placeholder={t('productName')}
                {...register('product_name', { required: true })}
                className="w-full"
              />
            </TextField.Root>
            {errors.product_name && (
              <span className="text-red-500 text-sm">{t('required')}</span>
            )}
          </div>

          <div>
            <TextArea
              placeholder={t('description')}
              {...register('description', { required: true })}
              className="w-full min-h-[100px]"
            />
            {errors.description && (
              <span className="text-red-500 text-sm">{t('required')}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <TextField.Root>
                <RadixTextField.Input
                      placeholder={t('industrySolution')}
                      {...register('industry_solution', { required: true })}
                    />
              </TextField.Root>
              {errors.industry_solution && (
                <span className="text-red-500 text-sm">{t('required')}</span>
              )}
            </div>

            <div>
              <TextField.Root>
                <RadixTextField.Input
                      placeholder={t('category')}
                      {...register('category_name', { required: true })}
                    />
              </TextField.Root>
              {errors.category_name && (
                <span className="text-red-500 text-sm">{t('required')}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <TextField.Root>
                <RadixTextField.Input
                      type="number"
                      placeholder={t('verificationYear')}
                      {...register('epd_verification_year', {
                        required: true,
                        min: 1900,
                        max: new Date().getFullYear(),
                      })}
                    />
              </TextField.Root>
              {errors.epd_verification_year && (
                <span className="text-red-500 text-sm">{t('invalidYear')}</span>
              )}
            </div>

            <div>
              <TextField.Root>
                <RadixTextField.Input
                      placeholder={t('country')}
                      {...register('geo', { required: true })}
                    />
              </TextField.Root>
              {errors.geo && (
                <span className="text-red-500 text-sm">{t('required')}</span>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={onClose}
              variant="soft"
              className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#42B7B0] text-white hover:bg-[#3AA19B] dark:bg-[#1B4242] dark:hover:bg-[#2C5C5C]"
            >
              {isSubmitting ? t('creating') : t('create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
