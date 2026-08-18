import AuthLayout from "../../components/layout/auth/AuthLayout";
import RegisterForm from "../../components/layout/auth/RegisterForm";
import "../../styles/auth.css";

const registerFeatures = [
  "Unlimited match uploads and analysis",
  "AI-powered highlight generation",
  "Team and player management",
  "Advanced performance analytics",
];

export default function RegisterPage() {
  return (
    <AuthLayout
      pageEyebrow="Create account"
      heading="Start Your Journey"
      description="Join coaches, analysts, and tournament organizers using VolleyReel to elevate their game."
      features={registerFeatures}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
