import AuthBrand from "./AuthBrand";

export default function AuthCenteredLayout({ children }) {
  return (
    <div className="auth-centered-page">
      <AuthBrand className="auth-brand--centered" />
      {children}
    </div>
  );
}
