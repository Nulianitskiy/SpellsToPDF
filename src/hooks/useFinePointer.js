import { useEffect, useState } from 'react'

function getFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function useFinePointer() {
  const [finePointer, setFinePointer] = useState(getFinePointer)

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    const onChange = () => setFinePointer(media.matches)

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return finePointer
}

export default useFinePointer
