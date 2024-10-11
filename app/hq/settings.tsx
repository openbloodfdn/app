import {
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import QRCode from 'react-native-qrcode-svg'
import { router } from 'expo-router'
import Button from '@/components/Button'
export default function Settings() {
  let [uuid, setUUID] = useState<string | null>('notfound')
  let [refreshing, setRefreshing] = useState<boolean>(false)
  async function load(refresh = false) {
    if (refresh) setRefreshing(true)
    let token = await SecureStore.getItemAsync('token')
    setUUID(token)
    setRefreshing(false)
  }

  useEffect(() => {
    console.log('loading')
    load(false)
  }, [])
  let responsiveColor = useColorScheme() === 'dark' ? '#fff' : '#000'
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 24,
            textAlign: 'center',
            margin: 20,
            color: responsiveColor,
          }}
        >
          JIPMER <Text style={{ color: '#7469B6' }}>Blood Center HQ</Text>
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
        //refresh control
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              load(true)
            }}
          />
        }
      >
        <Button
          onPress={() => {
            SecureStore.deleteItemAsync('token')
            router.replace('/')
          }}
        >
          Log out
        </Button>
        <Button
          onPress={() => {
            router.push('mailto:mihir@pidgon.com')
          }}
        >
          Get Support
        </Button>
      </ScrollView>
    </SafeAreaView>
  )
}
