export default function NotAuthorized() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-red-500 mb-4">
        403 - Akses Ditolak
      </h1>
      <p className="text-gray-700">
        Anda tidak memiliki hak akses untuk halaman ini.
      </p>
      <a
        href="/dashboard"
        className="mt-6 px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
      >
        Kembali ke Dashboard
      </a>
    </div>
  );
}
