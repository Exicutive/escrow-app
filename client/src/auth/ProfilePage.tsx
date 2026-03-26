const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-purple-600 uppercase mb-1">
            Account
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            This page represents the response from /apps/account/auth-user/.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">User ID</span>
            <span className="font-semibold text-gray-900">1</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Username</span>
            <span className="font-semibold text-gray-900">TechGadgets</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-semibold text-gray-900">techgadgets@example.com</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Role</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
              seller
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
