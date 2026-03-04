import SocialLoginButtons from './SocialLoginButtons';

export default function SignupForm() {
  const handleProviderClick = (provider) => {
    alert(`Redirect to ${provider} OAuth flow (to be implemented)`);
  };
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>
      {/* Email/password signup can go here */}
      <div className="mb-4">Or sign up with:</div>
      <SocialLoginButtons onProviderClick={handleProviderClick} />
    </div>
  );
}
