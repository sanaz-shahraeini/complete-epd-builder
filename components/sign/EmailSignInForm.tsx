import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
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
import { VerifyCodeForm } from "./VerifyCodeForm";
import toast from "@/components/ui/toast";
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

interface Props {
  callbackUrl?: string;
}

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof formSchema>;

export function EmailSignInForm({ callbackUrl = '/dashboard/profile' }: Props) {
  const t = useTranslations("Auth");
  const [showVerification, setShowVerification] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();
  const params = useParams();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/users/email-verification/send/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email.trim(),
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to send verification code');
      }

      const responseData = await response.json();
      console.log('Email verification response:', responseData);

      // Store email in session storage for verification
      sessionStorage.setItem('verificationEmail', data.email.trim());
      
      setEmail(data.email);
      setShowVerification(true);
    } catch (error) {
      console.error('Error sending verification code:', error);
    }
  };

  const handleVerificationSuccess = async (code: string) => {
    try {
      // Get email from session storage
      const storedEmail = sessionStorage.getItem('verificationEmail');
      if (!storedEmail) {
        throw new Error('Email not found in session');
      }

      const response = await fetch('http://127.0.0.1:8000/users/email-verification/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: storedEmail,
          code: code,
        }),
        credentials: 'include',
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.error || responseData.code?.[0] || 'Verification failed';
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
        throw new Error(errorMessage);
      }

      // Store tokens in localStorage
      if (responseData.access && responseData.refresh) {
        localStorage.setItem('accessToken', responseData.access);
        localStorage.setItem('refreshToken', responseData.refresh);
        localStorage.setItem('userEmail', storedEmail);
        
        // Clean up session storage
        sessionStorage.removeItem('verificationEmail');

        toast({
          title: "Success",
          description: "Successfully signed in!",
        });

        // Use Next.js router for navigation with locale and callback
        const locale = params?.locale || 'en';
        const redirectUrl = callbackUrl.startsWith('/') ? `/${locale}${callbackUrl}` : callbackUrl;
        router.push(redirectUrl);
      } else {
        throw new Error('No authentication tokens received');
      }

    } catch (error) {
      console.error('Verification error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Authentication failed",
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log("Email form submit event triggered");
    form.handleSubmit(onSubmit)(e);
  };

  if (showVerification) {
    return (
      <VerifyCodeForm
        email={email}
        onSuccess={handleVerificationSuccess}
        onClose={() => setShowVerification(false)}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full"
          onClick={() => console.log("Send code button clicked")}
        >
          {t("sendCode")}
        </Button>
      </form>
    </Form>
  );
}
