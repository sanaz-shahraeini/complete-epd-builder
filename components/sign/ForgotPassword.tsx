"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { IoMailOutline } from "react-icons/io5";
import { RiLockPasswordLine } from "react-icons/ri";
import { API_ROUTES } from "@/lib/api/config";

interface ForgotPasswordProps {
  open: boolean;
  onClose: () => void;
  setShowSignIn: (show: boolean) => void;
}

interface Message {
  text: string;
  type: "error" | "success";
}

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  verificationCode: yup
    .string()
    .matches(/^\d{6}$/, "Verification code must be 6 digits")
    .required("Verification code is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)"
    )
    .required("New password is required"),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password"),
});

function ForgotPassword({ open, onClose, setShowSignIn }: ForgotPasswordProps) {
  const t = useTranslations("ForgotPassword");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [step, setStep] = useState<"email" | "verify" | "reset">("email");
  const [emailSent, setEmailSent] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      verificationCode: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setMessage(null);

        if (step === "email") {
          // Send verification code to email
          const response = await fetch(API_ROUTES.AUTH.FORGOT_PASSWORD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: values.email }),
          });
          const data = await response.json();

          if (response.ok) {
            setEmailSent(true);
            setStep("verify");
            setMessage({ text: t("emailSent"), type: "success" });
          } else {
            setMessage({ text: data.error || t("emailError"), type: "error" });
          }
        } else if (step === "verify") {
          // Verify code
          const response = await fetch(API_ROUTES.AUTH.VERIFY_CODE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: values.email,
              code: values.verificationCode,
            }),
          });
          const data = await response.json();

          if (response.ok) {
            setStep("reset");
            setMessage({ text: t("codeVerified"), type: "success" });
          } else {
            setMessage({ text: data.error || t("codeError"), type: "error" });
          }
        } else {
          // Reset password
          const response = await fetch(API_ROUTES.AUTH.RESET_PASSWORD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: values.email,
              code: values.verificationCode,
              newPassword: values.newPassword,
            }),
          });
          const data = await response.json();

          if (response.ok) {
            setMessage({ text: t("passwordReset"), type: "success" });
            setTimeout(() => {
              onClose();
              setShowSignIn(true);
            }, 2000);
          } else {
            setMessage({ text: data.error || t("resetError"), type: "error" });
          }
        }
      } catch (error) {
        console.error("Password reset error:", error);
        setMessage({ text: t("networkError"), type: "error" });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleBackToSignIn = () => {
    onClose();
    setShowSignIn(true);
  };

  const resendVerificationCode = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const response = await fetch(API_ROUTES.AUTH.RESEND_CODE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formik.values.email }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ text: t("codeSentAgain"), type: "success" });
      } else {
        setMessage({ text: data.error || t("resendError"), type: "error" });
      }
    } catch (error) {
      console.error("Resend code error:", error);
      setMessage({ text: t("networkError"), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        <div className="p-6 bg-gradient-to-b from-[#42B7B0]/10 to-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <div className="flex justify-center mb-4">
                  {step === "email" ? (
                    <IoMailOutline className="w-12 h-12 text-[#42B7B0]" />
                  ) : (
                    <RiLockPasswordLine className="w-12 h-12 text-[#42B7B0]" />
                  )}
                </div>
                <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-[#42B7B0] to-[#1B4242] bg-clip-text text-transparent">
                  {step === "email"
                    ? t("title")
                    : step === "verify"
                    ? t("verifyTitle")
                    : t("resetTitle")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {step === "email"
                    ? t("description")
                    : step === "verify"
                    ? t("verifyDescription")
                    : t("resetDescription")}
                </p>
              </div>

              {message && (
                <Alert
                  variant={message.type === "error" ? "destructive" : "default"}
                  className={cn(
                    "border-l-4",
                    message.type === "error"
                      ? "border-l-red-500"
                      : "border-l-[#42B7B0]"
                  )}
                >
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {step === "email" && (
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("email")}</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        disabled={loading}
                        {...formik.getFieldProps("email")}
                        className={cn(
                          "pl-10 focus-visible:ring-[#42B7B0]",
                          formik.touched.email &&
                            formik.errors.email &&
                            "border-red-500"
                        )}
                      />
                      <IoMailOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-sm text-red-500">{formik.errors.email}</p>
                    )}
                  </div>
                )}

                {step === "verify" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="verificationCode">
                        {t("verificationCode")}
                      </Label>
                      <Input
                        id="verificationCode"
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        disabled={loading}
                        {...formik.getFieldProps("verificationCode")}
                        className={cn(
                          "text-center text-2xl tracking-[1em] font-mono focus-visible:ring-[#42B7B0]",
                          formik.touched.verificationCode &&
                            formik.errors.verificationCode &&
                            "border-red-500"
                        )}
                      />
                      {formik.touched.verificationCode &&
                        formik.errors.verificationCode && (
                          <p className="text-sm text-red-500">
                            {formik.errors.verificationCode}
                          </p>
                        )}
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      onClick={resendVerificationCode}
                      disabled={loading}
                      className="w-full text-[#42B7B0] hover:text-[#42B7B0]/80"
                    >
                      {t("resendCode")}
                    </Button>
                  </div>
                )}

                {step === "reset" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">{t("newPassword")}</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder={t("newPasswordPlaceholder")}
                          disabled={loading}
                          {...formik.getFieldProps("newPassword")}
                          className={cn(
                            "pl-10 focus-visible:ring-[#42B7B0]",
                            formik.touched.newPassword &&
                              formik.errors.newPassword &&
                              "border-red-500"
                          )}
                        />
                        <RiLockPasswordLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                      {formik.touched.newPassword &&
                        formik.errors.newPassword && (
                          <p className="text-sm text-red-500">
                            {formik.errors.newPassword}
                          </p>
                        )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">
                        {t("confirmNewPassword")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          placeholder={t("confirmNewPasswordPlaceholder")}
                          disabled={loading}
                          {...formik.getFieldProps("confirmNewPassword")}
                          className={cn(
                            "pl-10 focus-visible:ring-[#42B7B0]",
                            formik.touched.confirmNewPassword &&
                              formik.errors.confirmNewPassword &&
                              "border-red-500"
                          )}
                        />
                        <RiLockPasswordLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                      {formik.touched.confirmNewPassword &&
                        formik.errors.confirmNewPassword && (
                          <p className="text-sm text-red-500">
                            {formik.errors.confirmNewPassword}
                          </p>
                        )}
                    </div>
                  </>
                )}

                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#42B7B0] to-[#1B4242] text-white hover:from-[#3aa39d] hover:to-[#163636]"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                    ) : step === "email" ? (
                      t("sendCode")
                    ) : step === "verify" ? (
                      t("verifyCode")
                    ) : (
                      t("resetPassword")
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={handleBackToSignIn}
                    disabled={loading}
                  >
                    {t("backToSignIn")}
                  </Button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ForgotPassword;
