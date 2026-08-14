import { Button } from '@church/ui/atoms/Button'
import { Icon } from '@church/ui/atoms/Icon'

export default function Web() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Button color="destructive" size="medium" variant="filled">
        Button text
        <Icon name="brightness_1" />
      </Button>

      <Icon name="brightness_1" weight={400} />
    </div>
  )
}
