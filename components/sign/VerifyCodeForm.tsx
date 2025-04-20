'use client';
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import { useRouter, useParams } from 'next/navigation';

interface VerifyCodeFormProps {
  email: string;
  onSuccess: (code: string) => void | Promise<void>;
  onClose: () => void;
  callbackUrl?: string;
}

const formSchema = z.object({
  code: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must only contain numbers"),
});

type FormData = z.infer<typeof formSchema>;

export function VerifyCodeForm({ 
  email, 
  onSuccess, 
  onClose,
  callbackUrl = '/dashboard/profile'
}: VerifyCodeFormProps) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("Auth");
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      // Get email from session storage
      const storedEmail = sessionStorage.getItem('verificationEmail');
      if (!storedEmail) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Email not found. Please try again.",
        });
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/users/email-verification/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: storedEmail,
          code: data.code,
        }),
        credentials: 'include',
      });

      const responseData = await response.json();
      console.log('Verification response:', responseData);

      if (response.ok) {
        if (responseData.access && responseData.refresh) {
          // Store tokens
          localStorage.setItem('accessToken', responseData.access);
          localStorage.setItem('refreshToken', responseData.refresh);
          localStorage.setItem('userEmail', storedEmail);

          toast({
            title: "Success",
            description: "Email verified and signed in successfully",
          });

          // Use Next.js router for navigation with locale and callback
          const locale = params?.locale || 'en';
          const redirectUrl = callbackUrl.startsWith('/') ? `/${locale}${callbackUrl}` : callbackUrl;
          router.push(redirectUrl);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Authentication failed - no tokens received",
          });
        }
      } else {
        const errorMessage = responseData.error || 
          (Array.isArray(responseData.code) ? responseData.code[0] : responseData.code) || 
          "Verification failed";
        
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during verification",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '90%',
        maxWidth: 400,
        bgcolor: '#fff',
        borderRadius: 1,
        p: 4,
        color: '#1B4242',
        position: 'relative',
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: '#5C8374',
          '&:hover': {
            color: '#1B4242',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Typography
        variant="h5"
        component="h2"
        align="center"
        sx={{ mb: 3, color: '#1B4242' }}
      >
        Verify Code
      </Typography>

      <Typography
        variant="body1"
        align="center"
        sx={{ mb: 4, color: '#5C8374' }}
      >
        Enter the 6-digit code sent to {email}
      </Typography>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("verificationCode")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : t("verify")}
            </Button>
          </div>
        </form>
      </Form>
    </Box>
  );
}

export default VerifyCodeForm;
