import React, { useState } from 'react'
import {
  useColorScheme,
  useWindowDimensions,
  View,
  Pressable,
  Text,
} from 'react-native'
import Animated, { Easing, FadeIn } from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import FreeButton from '@/components/FreeButton'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'

const screens = [
  {
    title: "Welcome to Open Blood",
    content: "The smartest way to donate blood and save lives in your community.",
    emoji: "🩸"
  },
  {
    title: "Everything you need",
    content: "• Quick 2-minute registration\n• Get notified when blood is needed\n• Track your donation history\n• Emergency alerts in your area",
    emoji: "✨"
  },
  {
    title: "Your privacy matters",
    content: "Your data is encrypted and secure. You control who sees what. No selling, no spam, just helping save lives.",
    emoji: "🔒"
  }
]

export default function WelcomeScreen() {
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const [screenIndex, setScreenIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const nextScreen = () => {
    if (transitioning) return
    setTransitioning(true)

    if (screenIndex < screens.length - 1) {
      setTimeout(() => {
        setScreenIndex((prev) => prev + 1)
        setTransitioning(false)
      }, 200)
    } else {
      SecureStore.setItemAsync('hasOnboarded', 'true').then(() => {
        router.replace('/')
      })
    }
  }

  const skipOnboarding = () => {
    SecureStore.setItemAsync('hasOnboarded', 'true').then(() => {
      router.replace('/')
    })
  }

  const currentScreen = screens[screenIndex]

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === 'dark' ? '#030303' : '#efeef7',
        paddingHorizontal: Math.max(20, width * 0.05),
      }}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View
          entering={FadeIn.duration(500).easing(Easing.inOut(Easing.ease))}
          style={[
            {
              alignItems: 'center',
              width: '100%',
              maxWidth: Math.min(400, width - 40),
              paddingHorizontal: 20,
              flex: 1,
              justifyContent: 'center',
            },
          ]}
        >
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Animated.Text
              key={screenIndex + 'emoji'}
              entering={FadeIn.duration(500)}
              style={{
                fontSize: 64,
                marginBottom: 20,
              }}
            >
              {currentScreen.emoji}
            </Animated.Text>
          </View>
          
          <View style={{ marginBottom: 20 }}>
            <Animated.Text
              key={screenIndex + 'title'}
              entering={FadeIn.duration(500)}
              style={{
                fontSize: Math.max(22, Math.min(32, width * 0.06)),
                fontWeight: 'bold',
                color: colorScheme === 'dark' ? '#fff' : '#000',
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              {currentScreen.title}
            </Animated.Text>
            
            <Animated.Text
              key={screenIndex + 'content'}
              entering={FadeIn.duration(800)}
              style={{
                fontSize: Math.max(16, Math.min(20, width * 0.045)),
                color: colorScheme === 'dark' ? '#bbb' : '#555',
                textAlign: screenIndex === 1 ? 'left' : 'center',
                lineHeight: Math.max(16, Math.min(20, width * 0.045)) * 1.5,
              }}
            >
              {currentScreen.content}
            </Animated.Text>
          </View>
        </Animated.View>
      </View>

      <View
        style={{
          paddingTop: 40,
          paddingBottom: insets.bottom + 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* <Pressable
          onPress={skipOnboarding}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Text
            style={{
              color: colorScheme === 'dark' ? '#888' : '#666',
              fontSize: 15,
              textAlign: 'center',
            }}
          >
            Skip
          </Text>
        </Pressable> */}
        
        <FreeButton
          onPress={nextScreen}
          style={{ flex: 1, marginLeft: 20 }}
        >
          {screenIndex < screens.length - 1 ? 'Next' : 'Get Started'}
        </FreeButton>
      </View>
    </SafeAreaView>
  )
}

