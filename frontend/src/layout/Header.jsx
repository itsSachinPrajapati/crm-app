function Header() {
    return (
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
  
        <div className="flex items-center gap-4">
          <div className="bg-gray-700 px-4 py-2 rounded-lg">
            👤 Admin
          </div>
        </div>
      </div>
    );
  }
  
  export default Header;