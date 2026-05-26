import AuthLayout from "../../components/layout/auth/AuthLayout";
import LoginForm from "../../components/layout/auth/LoginForm";
import "../../styles/auth.css";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}