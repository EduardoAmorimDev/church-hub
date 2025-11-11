type ButtonProps = {
  label: string
  onPress?: () => void
}

export const Button = ({ label }: ButtonProps) => {
  return (
    <button className="bg-background-fill-neutral-secondary m-10 border-8 border-amber-600 p-8">{`${label} teste`}</button>
  )
}
