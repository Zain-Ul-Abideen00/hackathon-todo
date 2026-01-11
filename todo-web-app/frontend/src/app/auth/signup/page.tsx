/**
 * Sign Up Page
 *
 * User registration page with SignUpForm component.
 */

import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <SignUpForm />
    </main>
  );
}
