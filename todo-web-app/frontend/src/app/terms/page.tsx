import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
                <div className="prose dark:prose-invert max-w-none space-y-4">
                    <p className="text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using TodoApp, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mt-8 mb-4">2. Use License</h2>
                        <p>
                            Permission is granted to temporarily download one copy of the materials (information or software) on TodoApp's website for personal, non-commercial transitory viewing only.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mt-8 mb-4">3. Disclaimer</h2>
                        <p>
                            The materials on TodoApp's website are provided on an 'as is' basis. TodoApp makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mt-8 mb-4">4. Limitations</h2>
                        <p>
                            In no event shall TodoApp or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TodoApp's website.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
