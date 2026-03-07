"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "motion/react"

const animationConfig = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const },
}

const staggerDelays = [0.1, 0.22, 0.34, 0.46, 0.54, 0.62]

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <main
      className="flex w-full overflow-hidden"
      style={{ height: "100dvh", backgroundColor: "var(--background)" }}
    >
      {/* Left Column - Team Photo */}
      <div
        className="relative h-full w-1/2"
        style={{
          boxShadow: "inset -20px 0 40px -10px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src="/images/placeholder-team-photo.jpg"
          alt="Smooth Transitions team photo"
          fill
          className="object-cover"
          priority
        />
        <motion.div
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)",
          }}
          animate={{ x: isHovered ? "100%" : "-100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </div>

      {/* Right Column - Content Panel */}
      <div
        className="flex h-full w-1/2 items-center"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderTopLeftRadius: "var(--rounded-xl)",
          borderBottomLeftRadius: "var(--rounded-xl)",
          borderRight: "none",
          padding: "var(--spacing-4)",
        }}
      >
        <div className="flex flex-col" style={{ maxWidth: "480px" }}>
          {/* Eyebrow Label */}
          <motion.span
            {...animationConfig}
            transition={{ ...animationConfig.transition, delay: staggerDelays[0] }}
            style={{
              fontFamily: "var(--font-micro)",
              fontSize: "10px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
            }}
          >
            DEMOLA · 2025
          </motion.span>

          {/* Project Title */}
          <motion.h1
            {...animationConfig}
            transition={{ ...animationConfig.transition, delay: staggerDelays[1] }}
            style={{
              fontSize: "48px",
              lineHeight: "57px",
              letterSpacing: "-0.17px",
              fontWeight: 700,
              color: "var(--foreground)",
              marginTop: "var(--spacing-1)",
            }}
          >
            Smooth Transitions
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            {...animationConfig}
            transition={{ ...animationConfig.transition, delay: staggerDelays[2] }}
            style={{
              fontSize: "20px",
              lineHeight: "32px",
              fontWeight: 500,
              color: "var(--primary)",
              marginTop: "var(--spacing-1)",
            }}
          >
            Lorem ipsum dolor sit amet
          </motion.p>

          {/* Description */}
          <motion.p
            {...animationConfig}
            transition={{ ...animationConfig.transition, delay: staggerDelays[3] }}
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              fontWeight: 400,
              color: "var(--muted-foreground)",
              marginTop: "var(--spacing-1-5)",
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </motion.p>

          {/* Team Names */}
          <motion.p
            {...animationConfig}
            transition={{ ...animationConfig.transition, delay: staggerDelays[4] }}
            style={{
              fontSize: "14px",
              fontWeight: 400,
              color: "var(--muted-foreground)",
              opacity: 0.6,
              marginTop: "var(--spacing-1)",
            }}
          >
            Angelica · Ai Le · Christo · Colette · Harri · Mayowa
          </motion.p>

          {/* Buttons */}
          <motion.div
            {...animationConfig}
            transition={{ ...animationConfig.transition, delay: staggerDelays[5] }}
            className="flex flex-col"
            style={{
              marginTop: "var(--spacing-2)",
              gap: "var(--spacing-0-75)",
            }}
          >
            {/* Button 1 - Open SISU (Outlined) */}
            <a
              href="/sisu"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center transition-all duration-200"
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                fontWeight: 500,
                padding: "12px 0",
                borderRadius: "var(--rounded-md)",
                display: "block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(251, 250, 247, 0.3)"
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)"
                e.currentTarget.style.backgroundColor = "transparent"
              }}
            >
              Open SISU
            </a>

            {/* Button 2 - Open DeOS (Filled) */}
            <a
              href="/deos"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center transition-all duration-200"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                fontWeight: 500,
                padding: "12px 0",
                borderRadius: "var(--rounded-md)",
                display: "block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.85"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1"
              }}
            >
              Open DeOS
            </a>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
