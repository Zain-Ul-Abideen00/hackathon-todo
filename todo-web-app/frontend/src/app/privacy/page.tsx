import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                <div className="prose dark:prose-invert max-w-none space-y-4">
                    <p className="text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
                        <p>
                            We collect information that you provide directly to us, such as when you create an account, create tasks, or communicate with us. This information may include your name, email address, and any other information you choose to provide.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to provide, maintain, and improve our services, including to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Process your registration and maintain your account</li>
                            <li>Send you technical notices, updates, security alerts, and support messages</li>
                            <li>Respond to your comments, questions, and requests</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mt-8 mb-4">3. Data Security</h2>
                        <p>
                            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mt-8 mb-4">4. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at support@todoapp.com.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
