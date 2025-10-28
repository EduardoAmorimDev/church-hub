type ButtonProps = {
  label: string
  onPress?: () => void
}

export const Button = ({ label }: ButtonProps) => {
  return (
    <button className="h-10 w-10 border-8 border-cyan-700 bg-red-300 p-8 text-amber-900">
      {label}
    </button>
  )
}
