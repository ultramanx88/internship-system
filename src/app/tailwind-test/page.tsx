export default function TailwindTestPage() {
    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Tailwind Test Page</h1>
                <p className="text-gray-600 mb-8">Testing if Tailwind CSS works properly.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Card 1</h2>
                        <p className="text-gray-600">This is a test card with Tailwind styles.</p>
                    </div>
                    
                    <div className="bg-blue-500 p-6 rounded-lg shadow-md text-white">
                        <h2 className="text-xl font-semibold mb-2">Card 2</h2>
                        <p>This card has a blue background.</p>
                    </div>
                    
                    <div className="bg-green-500 p-6 rounded-lg shadow-md text-white">
                        <h2 className="text-xl font-semibold mb-2">Card 3</h2>
                        <p>This card has a green background.</p>
                    </div>
                </div>
                
                <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Debug Information</h2>
                    <ul className="space-y-2 text-gray-600">
                        <li>✅ Next.js routing works</li>
                        <li>✅ Tailwind CSS classes work</li>
                        <li>✅ Responsive grid works</li>
                        <li>✅ Colors and shadows work</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}