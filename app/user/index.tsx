import React from 'react'
import { Alert, Platform, Text, useColorScheme, View } from 'react-native'
import Octicons from '@expo/vector-icons/Octicons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
const Tab = createBottomTabNavigator()
const ModalStack = createStackNavigator()
import Home from './home'
import QR from './qr'
import Settings from './settings'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useRef, useState } from 'react'
import Constants from 'expo-constants'
import { router, useLocalSearchParams } from 'expo-router'
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})
export default function Index() {
  const [expoPushToken, setExpoPushToken] = useState('')
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    []
  )
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined)
  const notificationListener = useRef<Notifications.Subscription>()
  const responseListener = useRef<Notifications.Subscription>()

  let local: any = useLocalSearchParams()
  async function checkNotifs() {
    let uuid = await SecureStore.getItemAsync('token')
    const perms = await Notifications.getPermissionsAsync()
    let existingStatus = perms.status
    if (existingStatus !== 'granted') {
      console.log('Requesting permissions')
      registerForPushNotificationsAsync().then(async (token) => {
        if (token) {
          setExpoPushToken(token)
          console.log('notif token', token)
          fetch('http://localhost:3000/donor/update-notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uuid: uuid,
              notificationToken: token,
            }),
          })
            .then((response) => response.json())
            .then((response) => {
              if (response.error) {
                Alert.alert('Error', response.error)
              } else {
                console.log('Notification token updated')
              }
            })
            .catch((error) => {
              console.log('Error', "Couldn't update notification token")
            })
        } else {
          Alert.alert('Error', 'Failed to get notification token')
        }
      })
      if (Platform.OS === 'android') {
        Notifications.getNotificationChannelsAsync().then((value) =>
          setChannels(value ?? [])
        )
      }
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification)
        })

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log(response)
        })

      return () => {
        notificationListener.current &&
          Notifications.removeNotificationSubscription(
            notificationListener.current
          )
        responseListener.current &&
          Notifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }
  useEffect(() => {
    //checkNotifs()
    async function askUser() {
      let uuid = await SecureStore.getItemAsync('token')

      if (!uuid) {
        Alert.alert('Error', 'Please login to continue', [
          {
            text: 'Login',
            onPress: () => {
              router.navigate('/')
            },
          },
        ])
      } else {
        const perms = await Notifications.getPermissionsAsync()
        let existingStatus = perms.status
        console.log(`Existing status: ${existingStatus}`)
        if (existingStatus !== 'granted' && Device.isDevice) {
          console.log('Requesting permissions')
          Alert.alert(
            `Notifications`,
            `We need your permission to send you critical notifications when the blood center needs your help. Please allow notifications to continue.`,
            [
              {
                text: 'Allow',
                onPress: checkNotifs,
              },
              {
                text: 'Log out',
                onPress: () => {
                  SecureStore.deleteItemAsync('token')
                  router.navigate('/')
                },
                style: 'destructive',
              },
            ]
          )
        }
      }
    }
    askUser()
  }, [])
  let isDarkMode = useColorScheme() === 'dark'
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          width: '100%',
          height: 80,
          justifyContent: 'center',
          alignSelf: 'center',
          shadowColor: '#7469B6',
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
          backgroundColor: isDarkMode ? '#3a3b3c' : '#fff',
          borderTopWidth: 0,
        },
        sceneStyle: {
          backgroundColor: isDarkMode ? '#030303' : '#efeef7',
        },
        tabBarActiveTintColor: '#7469B6',
        tabBarIconStyle: {
          verticalAlign: 'middle',
          marginTop: 20,
        },
      }}
      initialRouteName="home"
    >
      <Tab.Screen
        name="qr"
        component={QR}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Octicons name="heart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Octicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="settings"
        component={Settings}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Octicons name="gear" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

async function registerForPushNotificationsAsync() {
  let token
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowCriticalAlerts: true,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowVibration: true,
        },
      })
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      throw new Error('Failed to get push token for push notification!')
      return
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId
      if (!projectId) {
        throw new Error('Project ID not found')
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data
      console.log(token)
    } catch (e) {
      token = `${e}`
    }
  } else {
    throw new Error('physical device required for notifications')
  }

  return token
}
