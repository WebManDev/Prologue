import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useMobileDetection() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isTablet, setIsTablet] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < MOBILE_BREAKPOINT)
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    }

    // Check immediately
    checkScreenSize()

    // Add event listener
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  return { isMobile, isTablet }
} 