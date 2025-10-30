type ButtonProps = {
  label: string
  onPress?: () => void
}

export const Button = ({ label }: ButtonProps) => {
  return <button className="bg-amber-100 p-8">{`${label} teste`}</button>
}
