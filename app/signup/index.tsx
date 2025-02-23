import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useColorScheme } from 'react-native'

import { useLocalSearchParams } from 'expo-router'
import Five from './five'
import Four from './four'
import ThreeAlpha from './one'
import One from './ta'
import Three from './three'
import Two from './two'
import TwoBeta from './twobeta'
const Stack = createNativeStackNavigator()

export default function Signup() {
  const local = useLocalSearchParams()
  let isDarkMode = useColorScheme() === 'dark'
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: isDarkMode ? '#030303' : '#efeef7',
            },
            animation: 'fade',
          }}
        >

          <Stack.Screen name="one" component={ThreeAlpha} initialParams={{ phoneNumber: local.phoneNumber }}/>
          <Stack.Screen name="two" component={Two} />
          <Stack.Screen name="twobeta" component={TwoBeta} />
          <Stack.Screen name="three" component={Three} />
          <Stack.Screen name="four" component={Four} />
          <Stack.Screen name="five" component={Five} />

          <Stack.Screen
            name="ta"
            component={One}
            initialParams={{ phoneNumber: local.phoneNumber }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  )
}
