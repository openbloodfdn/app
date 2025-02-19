import styles from '@/assets/styles/styles'
import { Pressable, Text } from 'react-native'

export default function Button(props: {
  onPress: () => void
  children: any
  disabled?: boolean
  style?: any
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={props.disabled ? styles.disabledButton : styles.button}
      disabled={props.disabled}
    >
      <Text
        style={{
          textAlign: 'center',
          fontSize: 20,
          color: props.disabled ? 'grey' : 'white',
        }}
      >
        {props.children}
      </Text>
    </Pressable>
  )
}
