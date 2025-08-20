import React, { useState } from 'react'
import {
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native'
import Animated, { Easing, FadeIn } from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import FreeButton from '@/components/FreeButton'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'

const messages = [
  "We're really glad you're here.",
  "Open Blood is built to make donating easier, safer, and smarter. We'll help you:",
  'Register in under 2 minutes',
  'Know when and where your blood is needed',
  'Keep track of your donations, eligibility, and history',
  'Get notified during critical shortages in your area',
  "We're not here to sell you anything. Your data is encrypted and kept private. Only you decide who gets access to it.",
]

export default function WelcomeScreen() {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const [messageIndex, setMessageIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [headline, setHeadline] = useState('Hey there.')
  const [headlineKey, setHeadlineKey] = useState(0)

  const nextMessage = () => {
    if (transitioning) return
    setTransitioning(true)

    if (messageIndex === 0) {
      setTimeout(() => {
        setHeadline('Welcome to Open Blood.')
        setHeadlineKey((prev) => prev + 1)
      }, 100)
    }

    if (messageIndex < messages.length) {
      setTimeout(
        () => {
          setMessageIndex((prev) => prev + 1)
          setTransitioning(false)
        },
        messageIndex == 0 ? 1000 : 200
      )
    } else {
      SecureStore.setItemAsync('hasOnboarded', 'true').then(() => {
        router.replace('/')
      })
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === 'dark' ? '#030303' : '#efeef7',
        paddingBottom: insets.bottom + 80,
        paddingHorizontal: 20,
      }}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View
          entering={FadeIn.duration(500).easing(Easing.inOut(Easing.ease))}
          style={[{ alignItems: 'center' }]}
        >
          <View
            style={{
              height: 80,
            }}
          >
            <Animated.Text
              key={headlineKey}
              entering={FadeIn.duration(500)}
              style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: colorScheme === 'dark' ? '#fff' : '#000',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              {headline}
            </Animated.Text>
          </View>
          {messageIndex >= 0 && messageIndex < messages.length && (
            <Animated.Text
              key={messageIndex + 'ms'}
              entering={FadeIn.duration(800)}
              style={{
                fontSize: 18,
                color: colorScheme === 'dark' ? '#aaa' : '#444',
                textAlign: 'center',
                marginVertical: 10,
                lineHeight: 26,
              }}
            >
              {messages[messageIndex]}
            </Animated.Text>
          )}
        </Animated.View>
      </View>

      {messageIndex <= messages.length && (
        <View
          style={{
            position: 'absolute',
            bottom: insets.bottom + 20,
            left: 20,
            right: 20,
          }}
        >
          <FreeButton onPress={nextMessage}>
            {messageIndex < messages.length ? 'Next' : 'Get Started'}
          </FreeButton>
        </View>
      )}
    </SafeAreaView>
  )
}
