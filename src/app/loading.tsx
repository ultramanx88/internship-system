export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">กำลังโหลด...</p>
      </div>
    </div>
  );
}