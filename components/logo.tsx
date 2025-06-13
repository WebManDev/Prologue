"use client"

export function Logo() {
  const handleClick = () => {
    window.location.href = "/"
  }

  return (
    <div 
      onClick={handleClick}
      className="flex items-center space-x-2 cursor-pointer"
    >
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-xl">P</span>
      </div>
      <span className="text-2xl font-bold text-blue-600">PROLOGUE</span>
    </div>
  )
} 