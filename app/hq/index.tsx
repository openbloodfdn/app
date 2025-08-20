import Octicons from '@expo/vector-icons/Octicons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useColorScheme } from 'react-native'
import Camera from './camera'
import HQHome from './home'
import Query from './query'
import Settings from './settings'
const Tab = createBottomTabNavigator()

export default function HQIndex() {
  let isDarkMode = useColorScheme() === 'dark'
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            position: 'absolute',
            width: '100%',
            height: 100,
            justifyContent: 'center',
            alignSelf: 'center',
            elevation: 10,
            shadowColor: '#7469B6',
            shadowOpacity: 0.3,
            shadowRadius: 20,
            backgroundColor: isDarkMode ? '#3a3b3c' : '#fff',
            borderTopWidth: 0,

          },
          sceneStyle: {
            backgroundColor: isDarkMode ? '#030303' : '#efeef7',
          },
          tabBarActiveTintColor: '#7469B6',
          tabBarIconStyle: {
            verticalAlign: 'middle',
            marginTop: 10,
          },
          tabBarLabelStyle: {
            paddingTop: 5,
            textTransform: 'uppercase',
            fontWeight: 'bold',
          }
        }}
        initialRouteName="Home"
      >
        <Tab.Screen
          name="Camera"
          component={Camera}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="device-camera" color={color} size={size} />
            ),
          }}
          
        />
        <Tab.Screen
          name="Home"
          component={HQHome}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Donors"
          component={Query}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="database" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="More"
          component={Settings}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="kebab-horizontal" color={color} size={size} />
            ),
            
          }}
        />
      </Tab.Navigator>
    </>
  )
}
