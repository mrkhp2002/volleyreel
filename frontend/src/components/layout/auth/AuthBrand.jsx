import Logo from "../../common/Logo";

export default function AuthBrand({ className = "" }) {
  return (
    <div className={`auth-brand ${className}`.trim()}>
      <div className="logo">
        <Logo size="30px" />
      </div>
      <div className="brand-copy">
        <h2>VolleyReel</h2>
        <p>Analytics Platform</p>
      </div>
    </div>
  );
}
