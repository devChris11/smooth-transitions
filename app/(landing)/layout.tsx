export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark" style={{ height: "100dvh" }}>
      {children}
    </div>
  )
}
