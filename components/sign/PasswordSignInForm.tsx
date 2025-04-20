'use client';

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

interface Props {
  callbackUrl?: string;
}

const formSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .transform(val => val.trim()),
  password: z
    .string()
    .min(1, "Password is required"),
});

type FormData = z.infer<typeof formSchema>;

export function PasswordSignInForm({ callbackUrl = '/dashboard/profile' }: Props) {
  const t = useTranslations("Auth");
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/users/signin/', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username.trim(),
          password: data.password,
        }),
        credentials: 'include',
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.detail || t("errors.invalidCredentials");
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
        return;
      }

      // Store the tokens
      if (responseData.access && responseData.refresh) {
        localStorage.setItem('accessToken', responseData.access);
        localStorage.setItem('refreshToken', responseData.refresh);
        localStorage.setItem('userEmail', data.username);

        toast({
          title: "Success",
          description: t("success.signedIn"),
        });

        // Use Next.js router for navigation with locale
        const locale = params?.locale || 'en';
        const redirectUrl = callbackUrl.startsWith('/') ? `/${locale}${callbackUrl}` : callbackUrl;
        router.push(redirectUrl);
      } else {
        throw new Error('No authentication tokens received');
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : t("errors.unknown"),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("username")}</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder={t("usernamePlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("password")}</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder={t("passwordPlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? t("signingIn") : t("signIn")}
        </Button>
      </form>
    </Form>
  );
}
