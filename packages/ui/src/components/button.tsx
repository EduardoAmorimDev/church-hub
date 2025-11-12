type ButtonProps = {
  label: string
  onPress?: () => void
}

export const Button = ({ label }: ButtonProps) => {
  return (
    <button className="bg-accent-light-red-100 m-10 border-8 border-amber-600 p-8">{`${label} teste`}</button>
  )
}
