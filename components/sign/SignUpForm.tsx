"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { FaGoogle } from "react-icons/fa";
import { 
  IoMailOutline, 
  IoBusinessOutline, 
  IoBriefcaseOutline, 
  IoCallOutline,
  IoPersonOutline,
  IoLocationOutline,
  IoKeyOutline,
  IoGridOutline,
  IoAtCircleOutline,
  IoLayersOutline
} from "react-icons/io5";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { checkUsername, checkEmail, signUp } from "@/lib/api/auth";
import { useRouter } from "@/i18n/navigation";

interface SignUpFormProps {
  open: boolean;
  onClose: () => void;
  setShowSignIn: (show: boolean) => void;
  setShowSignUp: (show: boolean) => void;
}

type Message = {
  text: string;
  type: "error" | "success";
};

// Define the type for form values
type FormValues = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  company_name: string;
  job_title: string;
  phone_number: string;
  industry: string;
  country: string;
  address: string;
};

interface InputFieldProps {
  name: keyof FormValues;
  label: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  formik: ReturnType<typeof useFormik<FormValues>>;
  isCheckingUsername?: boolean;
  isCheckingEmail?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ 
  name, 
  label, 
  type = "text", 
  icon, 
  formik,
  isCheckingUsername,
  isCheckingEmail 
}) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label}</Label>
    <div className="relative">
      <Input
        id={name}
        name={name}
        type={type}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className={cn(
          "pl-10",
          formik.touched[name] && formik.errors[name] ? "border-red-500" : ""
        )}
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      {((name === 'username' && isCheckingUsername) || (name === 'email' && isCheckingEmail)) && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <svg className="animate-spin h-5 w-5 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
    {formik.touched[name] && formik.errors[name] && (
      <div className="text-sm text-red-500 mt-1">
        {formik.errors[name] as string}
      </div>
    )}
  </div>
);

function SignUpForm({ open, onClose, setShowSignIn, setShowSignUp }: SignUpFormProps) {
  const router = useRouter();
  const t = useTranslations("SignUp");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'regular' | 'company'>('regular');
  const [message, setMessage] = useState<Message | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  // Define valid tab types
  type TabType = 'regular' | 'company';

  const validationSchema: Record<TabType, yup.ObjectSchema<any>> = {
    regular: yup.object({
      first_name: yup
        .string()
        .trim()
        .min(2, t("validation.first_name.min"))
        .max(50, t("validation.first_name.max"))
        .matches(
          /^[a-zA-Z\s-']+$/,
          t("validation.first_name.matches")
        )
        .required(t("validation.first_name.required")),
      last_name: yup
        .string()
        .trim()
        .min(2, t("validation.last_name.min"))
        .max(50, t("validation.last_name.max"))
        .matches(
          /^[a-zA-Z\s-']+$/,
          t("validation.last_name.matches")
        )
        .required(t("validation.last_name.required")),
      username: yup
        .string()
        .trim()
        .min(3, t("validation.username.min"))
        .max(50, t("validation.username.max"))
        .required(t("validation.username.required")),
      email: yup
        .string()
        .email(t("validation.email.invalid"))
        .required(t("validation.email.required")),
      password: yup
        .string()
        .min(8, t("validation.password.min"))
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
          t("validation.password.matches")
        )
        .required(t("validation.password.required")),
      confirm_password: yup
        .string()
        .oneOf([yup.ref('password')], t("validation.confirm_password.mustMatch"))
        .required(t("validation.confirm_password.required")),
      company_name: yup
        .string()
        .trim()
        .min(2, t("validation.company_name.min"))
        .max(100, t("validation.company_name.max"))
        .required(t("validation.company_name.required")),
      job_title: yup.string().optional(),
      phone_number: yup.string().optional(),
      industry: yup.string().optional(),
      country: yup.string().optional()
    }),
    company: yup.object({
      first_name: yup
        .string()
        .trim()
        .min(2, t("validation.first_name.min"))
        .max(50, t("validation.first_name.max"))
        .matches(
          /^[a-zA-Z\s-']+$/,
          t("validation.first_name.matches")
        )
        .required(t("validation.first_name.required")),
      last_name: yup
        .string()
        .trim()
        .min(2, t("validation.last_name.min"))
        .max(50, t("validation.last_name.max"))
        .matches(
          /^[a-zA-Z\s-']+$/,
          t("validation.last_name.matches")
        )
        .required(t("validation.last_name.required")),
      username: yup
        .string()
        .trim()
        .min(3, t("validation.username.min"))
        .max(50, t("validation.username.max"))
        .required(t("validation.username.required")),
      email: yup
        .string()
        .email(t("validation.email.invalid"))
        .required(t("validation.email.required")),
      password: yup
        .string()
        .min(8, t("validation.password.min"))
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
          t("validation.password.matches")
        )
        .required(t("validation.password.required")),
      confirm_password: yup
        .string()
        .oneOf([yup.ref('password')], t("validation.confirm_password.mustMatch"))
        .required(t("validation.confirm_password.required")),
      company_name: yup
        .string()
        .trim()
        .min(2, t("validation.company_name.min"))
        .max(100, t("validation.company_name.max"))
        .required(t("validation.company_name.required")),
      job_title: yup
        .string()
        .trim()
        .min(2, t("validation.job_title.min"))
        .max(50, t("validation.job_title.max"))
        .required(t("validation.job_title.required")),
      phone_number: yup
        .string()
        .matches(
          /^(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
          t("validation.phone_number.matches")
        )
        .required(t("validation.phone_number.required")),
      industry: yup
        .string()
        .trim()
        .min(2, t("validation.industry.min"))
        .max(50, t("validation.industry.max"))
        .required(t("validation.industry.required")),
      country: yup
        .string()
        .trim()
        .min(2, t("validation.country.min"))
        .max(50, t("validation.country.max"))
        .required(t("validation.country.required")),
    }),
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password: '',
      confirm_password: '',
      company_name: '',
      job_title: '',
      phone_number: '',
      industry: '',
      country: '',
      address: ''
    },
    enableReinitialize: false,
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: validationSchema[activeTab],
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setMessage(null);

        // Check username and email availability
        const [usernameAvailable, emailAvailable] = await Promise.all([
          checkUsername(values.username),
          checkEmail(values.email)
        ]);

        if (!usernameAvailable) {
          setMessage({ type: 'error', text: t('errors.usernameTaken') });
          return;
        }

        if (!emailAvailable) {
          setMessage({ type: 'error', text: t('errors.emailRegistered') });
          return;
        }

        // Submit signup data
        const { confirm_password, ...signUpData } = values;
        
        // For regular users, include only necessary fields including company_name
        const dataToSend = activeTab === 'regular' 
          ? {
              first_name: signUpData.first_name,
              last_name: signUpData.last_name,
              username: signUpData.username,
              email: signUpData.email,
              password: signUpData.password,
              company_name: signUpData.company_name,
              user_type: activeTab
            }
          : {
              ...signUpData,
              user_type: activeTab
            };
        
        console.log('Sending signup data:', dataToSend);
        await signUp(dataToSend);

        // Show success message
        setMessage({ type: 'success', text: t('success.registrationComplete') });

        // Redirect to signin
        setTimeout(() => {
          setShowSignIn(true);
        }, 2000);
      } catch (error) {
        console.error('Signup error:', error);
        setMessage({ 
          type: 'error', 
          text: t('errors.serverError')
        });
      } finally {
        setLoading(false);
      }
    }
  });

  const handleTabChange = (value: string) => {
    if (value === 'regular' || value === 'company') {
      setActiveTab(value as TabType);
    }
  };

  // Debounced username check
  useEffect(() => {
    let isActive = true; // For handling race conditions
    const timer = setTimeout(async () => {
      const username = formik.values.username;
      if (username && username.length >= 3 && !formik.errors.username) {
        setIsCheckingUsername(true);
        try {
          const available = await checkUsername(username);
          if (isActive) {
            if (!available) {
              formik.setFieldError('username', t('errors.usernameTaken'));
            } else {
              // Clear the error if username is available
              formik.setFieldError('username', undefined);
            }
          }
        } catch (error) {
          console.error('Username check failed:', error);
          // Only set error if component is still mounted
          if (isActive) {
            // Don't set username taken error for network or server errors
            if (error instanceof Error && error.message.includes('HTTP error')) {
              formik.setFieldError('username', t('errors.networkError'));
            } else if (error instanceof Error && error.message.includes('Invalid response')) {
              formik.setFieldError('username', t('errors.serverError'));
            }
          }
        } finally {
          if (isActive) {
            setIsCheckingUsername(false);
          }
        }
      }
    }, 500);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [formik.values.username]);

  // Debounced email check
  useEffect(() => {
    let isActive = true; // For handling race conditions
    const timer = setTimeout(async () => {
      const email = formik.values.email;
      if (email && !formik.errors.email) {
        setIsCheckingEmail(true);
        try {
          const available = await checkEmail(email);
          if (isActive) {
            if (!available) {
              formik.setFieldError('email', t('errors.emailRegistered'));
            } else {
              // Clear the error if email is available
              formik.setFieldError('email', undefined);
            }
          }
        } catch (error) {
          console.error('Email check failed:', error);
        } finally {
          if (isActive) {
            setIsCheckingEmail(false);
          }
        }
      }
    }, 500);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [formik.values.email]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <IoPersonOutline className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>

          {message && (
            <Alert 
              variant={message.type === "error" ? "destructive" : "default"}
              className={cn(
                "border-l-4",
                message.type === "error" 
                  ? "border-l-red-500"
                  : "border-l-teal-600"
              )}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sticky top-0 bg-background z-10">
              <TabsTrigger 
                value="regular" 
                className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
              >
                {t("tabs.regular")}
              </TabsTrigger>
              <TabsTrigger 
                value="company" 
                className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
              >
                {t("tabs.company")}
              </TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto max-h-[calc(90vh-400px)] mt-4">
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    name="first_name" 
                    label={t("first_name")} 
                    type="text" 
                    icon={<IoPersonOutline className="text-teal-500" />}
                    formik={formik}
                    isCheckingUsername={isCheckingUsername}
                    isCheckingEmail={isCheckingEmail}
                  />
                  <InputField 
                    name="last_name" 
                    label={t("last_name")} 
                    type="text" 
                    icon={<IoPersonOutline className="text-teal-500" />}
                    formik={formik}
                    isCheckingUsername={isCheckingUsername}
                    isCheckingEmail={isCheckingEmail}
                  />
                </div>
                <InputField 
                  name="username" 
                  label={t("username")} 
                  type="text" 
                  icon={<IoAtCircleOutline className="text-teal-500" />}
                  formik={formik}
                  isCheckingUsername={isCheckingUsername}
                  isCheckingEmail={isCheckingEmail}
                />
                <InputField 
                  name="email" 
                  label={t("email")} 
                  type="email" 
                  icon={<IoMailOutline className="text-teal-500" />}
                  formik={formik}
                  isCheckingUsername={isCheckingUsername}
                  isCheckingEmail={isCheckingEmail}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    name="password" 
                    label={t("password")} 
                    type="password" 
                    icon={<IoKeyOutline className="text-teal-500" />}
                    formik={formik}
                    isCheckingUsername={isCheckingUsername}
                    isCheckingEmail={isCheckingEmail}
                  />
                  <InputField 
                    name="confirm_password" 
                    label={t("confirm_password")} 
                    type="password" 
                    icon={<IoKeyOutline className="text-teal-500" />}
                    formik={formik}
                    isCheckingUsername={isCheckingUsername}
                    isCheckingEmail={isCheckingEmail}
                  />
                </div>
                <InputField 
                  name="company_name" 
                  label={t("company_name")} 
                  type="text" 
                  icon={<IoBusinessOutline className="text-teal-500" />}
                  formik={formik}
                  isCheckingUsername={isCheckingUsername}
                  isCheckingEmail={isCheckingEmail}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    name="industry" 
                    label={t("industry")} 
                    type="text" 
                    icon={<IoLayersOutline className="text-teal-500" />}
                    formik={formik}
                    isCheckingUsername={isCheckingUsername}
                    isCheckingEmail={isCheckingEmail}
                  />
                  <InputField 
                    name="country" 
                    label={t("country")} 
                    type="text" 
                    icon={<IoLocationOutline className="text-teal-500" />}
                    formik={formik}
                    isCheckingUsername={isCheckingUsername}
                    isCheckingEmail={isCheckingEmail}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    name="job_title" 
                    label={t("job_title")} 
                    type="text" 
                    icon={<IoBriefcaseOutline className="text-teal-500" />}
                    formik={formik}
                    isCheckingUsername={isCheckingUsername}
                    isCheckingEmail={isCheckingEmail}
                  />
                  <InputField 
                    name="phone_number" 
                    label={t("phone_number")} 
                    type="tel" 
                    icon={<IoCallOutline className="text-teal-500" />}
                    formik={formik}
                    isCheckingUsername={isCheckingUsername}
                    isCheckingEmail={isCheckingEmail}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={loading || isCheckingUsername || isCheckingEmail}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t("creatingAccount")}</span>
                    </div>
                  ) : (
                    t("createAccount")
                  )}
                </Button>
              </form>
            </div>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("continueWithGoogle")}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn("google")}
            disabled={true}
          >
            <FaGoogle className="mr-2 h-4 w-4 text-align-middle"  />
            Google
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {t("alreadyAccount")}{" "}
            </span>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-teal-600 hover:underline"
              onClick={() => setShowSignIn(true)}
              disabled={loading}
            >
              {t("signIn")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SignUpForm;