import AuthLayout from "../../components/layout/auth/AuthLayout";
import LoginForm from "../../components/layout/auth/LoginForm";
import "../../styles/auth.css";

export default function LoginPage() {
  return (
    <AuthLayout
      heading="Analyze. Track. Win."
      description="Transform your volleyball matches into powerful insights with AI-powered video analysis and comprehensive team management."
    >
      <LoginForm />
    </AuthLayout>
  );
}