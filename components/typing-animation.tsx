"use client"

import { useState, useEffect } from "react"

const topics = [
  "React hooks",
  "JavaScript arrays",
  "CSS flexbox",
  "Node.js APIs",
  "SQL queries",
  "Python functions",
  "TypeScript types",
  "Database design",
  "API integration",
  "Web performance",
]

export function TypingAnimation() {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const currentTopic = topics[currentTopicIndex]
    const typingSpeed = isDeleting ? 50 : 100
    const pauseTime = isPaused ? 2000 : 0

    const timeout = setTimeout(
      () => {
        if (isPaused) {
          setIsPaused(false)
          setIsDeleting(true)
          return
        }

        if (isDeleting) {
          if (currentText.length > 0) {
            setCurrentText(currentText.slice(0, -1))
          } else {
            setIsDeleting(false)
            setCurrentTopicIndex((prev) => (prev + 1) % topics.length)
          }
        } else {
          if (currentText.length < currentTopic.length) {
            setCurrentText(currentTopic.slice(0, currentText.length + 1))
          } else {
            setIsPaused(true)
          }
        }
      },
      isPaused ? pauseTime : typingSpeed,
    )

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, isPaused, currentTopicIndex])

  return (
    <span className="inline-flex items-center">
      Search for{" "}
      <span className="ml-1 text-[#096A00] font-medium">
        {currentText}
        <span className="animate-pulse">|</span>
      </span>
    </span>
  )
}
