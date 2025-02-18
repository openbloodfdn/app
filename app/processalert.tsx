import {
  View,
  Platform,
  Text,
  Alert,
  TextInput,
  useColorScheme,
  Pressable,
} from 'react-native'
import { Link, router, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useRef, useState } from 'react'
import Octicons from '@expo/vector-icons/Octicons'
import { Picker } from '@react-native-picker/picker'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Button from '@/components/Button'
import TwoRowInput from '@/components/TwoRowInput'
import styles from '@/assets/styles/styles'
import * as Progress from 'react-native-progress'
import Card from '@/components/Card'
export default function Modal() {
  const local = useLocalSearchParams()
  const token = local.token
  const bankCode = local.bankCode
  const bloodtype = local.bloodtype
  const units = local.units
  const months = local.months
  const contact = local.contact
  /**
   * bankCode: bankCode,
        token: token,
        bloodtype: bloodtype,
        units: parseInt(unitsRequired),
        months: parseInt(minimumMonths),
        contact: phoneNumber,
   */
  console.log(token, bankCode)
  let [loading, setLoading] = useState<boolean>(false)
  let isDarkMode = useColorScheme() === 'dark'
  let responsiveColor = isDarkMode ? 'white' : 'black'
  let [notificationsSent, setNotificationsSent] = useState<{
    x: number
    y: number
    e: number
  }>({ x: 0, y: 0, e: 0 })
  let [progress, setProgress] = useState<number>(0)
  useEffect(() => {
  console.log('connecting to server')
  const ws = new WebSocket('ws://localhost:3000/request')
    // catch connection errors
    ws.onerror = (error) => {
      console.log('error', error)
      Alert.alert('Error', 'Could not connect to server')
    }
    ws.onopen = () => {
      console.log('connected')
      ws.send(
        JSON.stringify({
          bankCode: bankCode,
          token: token,
          type: bloodtype,
          units: units,
          months: months,
          contact: contact,
        })
      )

      ws.onmessage = (message) => {
        //format of message: %ckpt%event%data%
        //event: 0: auth, 1 (pull eligible donors), 2 (calc distances), 3 (send notifications)
        //data: 0: true/false, 1: {x: 10, y: 100} (10/100 donors are eligible), 2: {x: 1} | {x: 0} (distances calculated), 3: {x: 10, y: 9, e: 5} (10 notifications, 9 whatsapp/sms messages, 5 errors)
        let msg = message.data.split('%')
        let event = parseInt(msg[1])
        let data = JSON.parse(msg[2])
        if(msg[0] === 'err') {
          Alert.alert('Error', msg[2]);
          router.dismiss();
        }
        if (event === 0) {
          if (data) {
            console.log('authenticated')
            setProgress(0.25)
          } else {
            console.log('unauthenticated')
            Alert.alert('Error', 'Authentication failed')
            router.dismiss()
          }
        } else if (event === 1) {
          console.log('eligible donors pulled')
          setProgress(0.5)
          console.log(`${data.x} donors are eligible`)
        } else if (event === 2) {
          console.log(`distances ${data.x == 1 ? '' : 'not'} calculated`)
          setProgress(0.75)
        } else if (event === 3) {
          setProgress(1)
          console.log(
            `${data.x} notifications sent, ${data.y} messages sent, ${data.e} errors`
          )
          setNotificationsSent(data)
        }
      }
    }
  }, [])
  let doneIcon = ''
  return (
    <KeyboardAwareScrollView
      style={{
        backgroundColor: isDarkMode ? '#121212' : '#fff',
      }}
    >
      <View
        style={{
          justifyContent: 'center',
          width: '90%',
          margin: 'auto',
          gap: 20,
        }}
      >
        <Text
          style={{
            fontSize: 36,
            fontWeight: 'bold',
            textAlign: 'center',
            color: responsiveColor,
            fontFamily: 'PlayfairDisplay_600SemiBold',
          }}
        >
          Alert Updates
        </Text>
        <View style={{ margin: 'auto' }}>
          <Progress.Bar
            progress={progress}
            width={300}
            height={10}
            color="#7469B6"
            borderRadius={10}
          />
        </View>
        <View style={{ margin: 'auto' }}>
          <Text
            style={{
              fontSize: 28,
              color: responsiveColor,
              fontFamily: 'PlayfairDisplay_600SemiBold',
            }}
          >
            {progress == 0
              ? 'Authenticating request'
              : progress == 0.25
              ? 'Pulling eligible donors'
              : progress == 0.5
              ? 'Calculating distances'
              : progress == 0.75
              ? 'Sending notifications'
              : 'Done'}
          </Text>
          <View>
            <Text style={{ fontSize: 18, color: responsiveColor }}>
              {progress == 0
                ? 'The server is authenticating your blood request.'
                : progress == 0.25
                ? 'Retrieving data of all eligible donors.'
                : progress == 0.5
                ? 'Calculating distances between you and eligible donors.'
                : progress == 0.75
                ? 'Sending notifications to eligible donors.'
                : 'Your blood request has been authenticated.'}
            </Text>
            {progress >= 0.75 ? (
              <>
                <View style={{ flexDirection: 'row', gap: 20, margin: 'auto' }}>
                  <Card
                    icon="megaphone"
                    iconColor="#AD88C6"
                    title={notificationsSent.x.toString()}
                    subtitle="notifications"
                  />
                  <Card
                    icon="inbox"
                    iconColor="#AD88C6"
                    title={notificationsSent.y.toString()}
                    subtitle="messages"
                  />
                </View>
                <View style={{ flexDirection: 'row', gap: 20, margin: 'auto' }}>
                  <Card
                    icon="alert"
                    iconColor="#AD88C6"
                    title={notificationsSent.e.toString()}
                    subtitle="bounces"
                  />
                </View>
              </>
            ) : null}
          </View>
        </View>
        {progress == 1 ? (
          <View
            style={{
              margin: 'auto',
              marginBottom: 50,
            }}
          >
            <Button onPress={() => router.dismiss()}>Close</Button>
          </View>
        ) : null}
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
    </KeyboardAwareScrollView>
  )
}
