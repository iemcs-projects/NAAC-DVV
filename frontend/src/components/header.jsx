import react from 'react'

const Header = () => {
    return (
        <header className="bg-blue-900 text-white p-3 flex justify-between items-center">
        <h1 className="text-lg font-medium">NAAC DVV System</h1>
        <div>
          <button className="text-sm text-white hover:text-blue-200 cursor-pointer">Admin</button>
        </div>
      </header>
    )
}
export default Header;