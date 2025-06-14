import styles from '@/assets/styles/styles'
import { Text, TextInput, View } from 'react-native'
export default function TwoRowInput(props: {
  placeholder: string
  value: string
  setValue: (value: string) => void
  keyboardType: any
  style?: any
  children: any
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        width: 300,
        justifyContent: 'space-between',
        ...props.style,
      }}
    >
      <TextInput
        placeholder={props.placeholder}
        keyboardType={props.keyboardType}
        value={props.value}
        placeholderTextColor={'grey'}
        onChangeText={props.setValue}
        style={{ ...styles.input, width: '72%' }}
      />
      <View
        style={{
          borderRadius: 9,
          padding: 5,
          backgroundColor: '#F3F3F3',
          width: '25%',
          height: 50,
          margin: 10,
          marginLeft: 0,
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            fontSize: 18,
          }}
        >
          {props.children}
        </Text>
      </View>
    </View>
  )
}
