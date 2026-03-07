import { SisuNav } from "@/components/sisu/SisuNav"

export default function SisuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <SisuNav />
      <main>{children}</main>
    </div>
  )
}
