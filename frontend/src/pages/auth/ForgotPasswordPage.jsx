import AuthCenteredLayout from "../../components/layout/auth/AuthCenteredLayout";
import ForgotPasswordForm from "../../components/layout/auth/ForgotPasswordForm";
import "../../styles/auth.css";

export default function ForgotPasswordPage() {
  return (
    <AuthCenteredLayout>
      <ForgotPasswordForm />
    </AuthCenteredLayout>
  );
}
