/**
 * Sign In Page
 *
 * User login page with SignInForm component.
 */

import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <SignInForm />
    </main>
  );
}
