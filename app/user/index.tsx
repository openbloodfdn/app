import Button from '@/components/Button'
import Octicons from '@expo/vector-icons/Octicons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { BlurView } from 'expo-blur'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import Home from './home'
import QR from './qr'
import Settings from './settings'
import * as Linking from 'expo-linking'
import fx from '@/components/Fetch'
import checkSecret, { logoutUser } from '@/components/CheckSecret'
const Tab = createBottomTabNavigator()
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
  const notificationListener = useRef<Notifications.EventSubscription>()
  const responseListener = useRef<Notifications.EventSubscription>()

  let [showModal, setShowModal] = useState<boolean>(false)

  async function checkNotifs() {
    const perms = await Notifications.getPermissionsAsync()
    let existingStatus = perms.status
    console.log(`Existing status: ${existingStatus}`)
    //if (existingStatus !== 'granted') {
    //console.log('Requesting permissions')
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        let os =
          Device.osName === 'Android'
            ? 'a'
            : Device.osName === 'iOS' || Device.osName === 'iPadOS'
            ? 'i'
            : ''
        setExpoPushToken(token)

        fx('donor/update-notifications', {
          method: 'POST',
          body: {
            notificationToken: token,
            os: os,
          },
        })
          .then((response) => {
            if (response.error) {
              Alert.alert('Error', response.error)
            } else {
              console.log('Notification token updated successfully')
            }
          })
          .catch((error) => {
            console.log("Couldn't update notification token", error)
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
        //console.log(response)
      })

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        )
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current)
    }
    //}
  }
  useEffect(() => {
    async function askUser() {
      let uuid = await checkSecret()

      if (uuid === false) {
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
          if (existingStatus === 'denied') {
            setShowModal(true)
          } else {
            //console.log('Requesting permissions')
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
                    logoutUser()
                    router.navigate('/')
                  },
                  style: 'destructive',
                },
              ]
            )
          }
        } else if (Device.isDevice) {
          checkNotifs()
        }
      }
    }
    askUser()
  }, [])
  let isDarkMode = useColorScheme() === 'dark'
  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowModal(false)
        }}
        visible={showModal}
      >
        <BlurView
          intensity={10}
          tint="systemMaterial"
          style={{ position: 'absolute', height: '100%', width: '100%' }}
        />
        <View
          style={{
            height: '55%',
            borderRadius: 25,
            padding: 16,
            marginTop: 'auto',
            backgroundColor: isDarkMode ? '#121212' : 'white',
          }}
        >
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 26,
                textAlign: 'left',
                color: isDarkMode ? 'white' : 'black',
                paddingBottom: 10,
                fontFamily: 'PlayfairDisplay_600SemiBold',
              }}
            >
              Your blood bank needs you.
            </Text>
            <Text
              style={{
                fontSize: 18,
                textAlign: 'center',
                color: isDarkMode ? 'white' : 'black',
                alignSelf: 'center',
                paddingBottom: 10,
                paddingTop: 10,
              }}
            >
              Open Blood sends you alerts when every second counts.{'\n\n'}Turn
              on notifications in settings so we can reach you when it matters
              most.
            </Text>
          </View>
          <View
            style={{
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <Button
              onPress={() => {
                Linking.openSettings()
              }}
            >
              <Text style={{ color: 'white', fontSize: 20 }}>
                Open App Settings
              </Text>
            </Button>
            <Pressable onPress={() => setShowModal(false)}>
              <Text
                style={{
                  color: '#7469B6',
                  fontSize: 20,
                  textAlign: 'center',
                }}
              >
                Not now
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
            elevation: 0,
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
          },
        }}
        initialRouteName="Home"
      >
        <Tab.Screen
          name="Code"
          component={QR}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="heart" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={Settings}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="gear" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  )
}

async function registerForPushNotificationsAsync() {
  let token
  if (Platform.OS === 'android') {
    //console.log('android')
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
          //allowCriticalAlerts: true,
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
    } catch (e) {
      //console.log(e)
    }
  } else {
    throw new Error('physical device required for notifications')
  }

  return token
}
