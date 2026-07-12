import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">{children}</main>
    </div>
  )
}
