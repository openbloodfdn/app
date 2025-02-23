import Button from '@/components/Button'
import { Octicons } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { router } from 'expo-router'
import { useState } from 'react'
import {
  Pressable,
  Text,
  useColorScheme,
  View
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Progress from 'react-native-progress'
import { SafeAreaView } from 'react-native-safe-area-context'
export default function One({
  navigation,
  route,
}: {
  navigation: any
  route: any
}) {
  console.log(route.params)
  let [phoneNumber, setPhoneNumber] = useState<string>(
    route.params?.phoneNumber || ''
  )
  let [affiliated, setAffiliated] = useState<string | null>(
    route.params?.affiliated || 'no'
  )
  delete route.params?.affiliated
  console.log(route.params)
  let isDarkMode = useColorScheme() === 'dark'
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <SafeAreaView>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: 40,
            marginTop: 20,
            gap: 20,
            alignSelf: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <Pressable onPress={() => router.push('/')}>
              <Octicons
                name="arrow-left"
                size={24}
                color={isDarkMode ? 'white' : 'black'}
              />
            </Pressable>
            <Text
              style={{
                fontSize: 24,
                textAlign: 'center',
                color: isDarkMode ? 'white' : 'black',
              }}
            >
              <Text style={{ color: '#7469B6' }}>Open Blood</Text> Internal
            </Text>
          </View>
          <Progress.Bar
            progress={0.2}
            width={300}
            height={10}
            color="#7469B6"
            borderRadius={10}
          />
        </View>
        <Text
          style={{
            fontSize: 28,
            textAlign: 'center',
            margin: 'auto',
            marginBottom: 20,
            color: isDarkMode ? 'white' : 'black',
          }}
        >
          Sign up | <Text style={{ color: '#7469B6' }}>General</Text>
        </Text>
        <Text
          style={{
            fontSize: 20,
            marginBottom: 20,
            color: isDarkMode ? 'white' : 'black',
          }}
        >
          Are you affiliated with JIPMER?
        </Text>
        <View>
          <Picker
            selectedValue={affiliated}
            onValueChange={(itemValue) => setAffiliated(itemValue)}
            style={{
              color: isDarkMode ? 'white' : 'black',
            }}
          >
            <Picker.Item
              label="No"
              value="no"
              color={isDarkMode ? 'white' : 'black'}
            />
            <Picker.Item
              label="Yes"
              value="yes"
              color={isDarkMode ? 'white' : 'black'}
            />
          </Picker>
        </View>
        <Button
          onPress={() => {
            navigation.navigate(`two${affiliated == 'yes' ? 'beta' : ''}`, {
              ...route.params,
              phoneNumber,
              affiliated,
            })
          }}
        >
          Next
        </Button>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  )
}
