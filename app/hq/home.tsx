import Button from '@/components/Button'
import Card from '@/components/Card'
import Octicons from '@expo/vector-icons/Octicons'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import fx from '@/components/Fetch'

export default function HQHome() {
  let [refreshing, setRefreshing] = useState<boolean>(false)
  let [totalDonators, setTotalDonators] = useState<number>(0)
  let [verifiedDonors, setVerifiedDonors] = useState<number>(0)
  let [unverifiedDonors, setUnverifiedDonors] = useState<number>(0)
  let [totalDonations, setTotalDonations] = useState<number | null>(null)
  let [token, setToken] = useState<string | null>('')
  let [bankCode, setBankCode] = useState<string | null>('')
  let [bbName, setBbName] = useState<string>('')
  let [appReady, setAppReady] = useState(false)
  useEffect(() => {
    async function getToken() {
      let t = await SecureStore.getItemAsync('token')
      console.log(t)
      setToken(t)
      let id = await SecureStore.getItemAsync('id')
      setBankCode(id)
      //console.log(id)
    }
    getToken()
  }, [])
  async function load(refresh = false) {
    if (refresh) setRefreshing(true)
    let id = await SecureStore.getItemAsync('id')
  console.log('getting stats')
    fx(`/hq/get-stats`, {
      method: 'POST',
      body: {
        bankCode: id,
      },
    })
      .then(async (response) => {
        if (refresh) setRefreshing(false)
        if (response.error) {
          Alert.alert('Error', 'Unauthorized Access', [
            {
              text: 'Go back',
              onPress: () => {
                SecureStore.deleteItemAsync('token')
                router.navigate('/')
              },
            },
          ])
        } else {
          setTotalDonations(response.data.totalDonated)
          await SecureStore.setItemAsync('bbName', response.data.name)
          setBbName(response.data.name)
          setTotalDonators(parseInt(response.data.totalDonors))
          setVerifiedDonors(parseInt(response.data.verified))
          setUnverifiedDonors(
            parseInt(response.data.totalDonors) -
              parseInt(response.data.verified)
          )
          //setInstalled(((response.data.installed*100)/response.data.totalDonors).toPrecision(2))
        }
      })
      .catch((error) => {
        if (refresh) setRefreshing(false)
        Alert.alert('Error', 'Failed to fetch data')
      })
  }
  useEffect(() => {
    load(false)
    setAppReady(true)
  }, [])

  if (!appReady) {
    return null
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '85%',
          marginBottom: 40,
          marginTop: 20,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Image
            source={require('../../assets/images/home.png')}
            style={{
              width: 40,
              height: 40,
              marginRight: 10,
            }}
          />
          <Text
            style={{
              fontSize: 26,
              color: '#7469B6',
              fontFamily: 'PlayfairDisplay_600SemiBold',
            }}
          >
            {bbName ? bbName : 'Open Blood HQ'}
          </Text>
        </View>
        <Pressable
          onPress={() => load(true)}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Octicons name="sync" size={24} color="#7469B6" />
        </Pressable>
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
        <View
          style={{
            alignContent: 'flex-start',
            width: '80%',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 28,
              textAlign: 'left',
              color: '#7469B6',
              fontWeight: 'bold',
              fontFamily: 'PlayfairDisplay_600SemiBold',
            }}
          >
            Stats
          </Text>
        </View>
        <View
          style={{
            marginTop: 20,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <View
            style={{
              width: '100%',
              gap: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Card
              icon="code-of-conduct"
              iconColor="#AD88C6"
              title={totalDonators?.toString() || ''}
              subtitle="total donors"
            />
            <Card
              icon="verified"
              iconColor="#AD88C6"
              title={verifiedDonors?.toString() || ''}
              subtitle="verified"
            />
          </View>
          <View
            style={{
              width: '100%',
              gap: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Card
              icon="unverified"
              iconColor="#AD88C6"
              title={unverifiedDonors?.toString() || ''}
              subtitle="unverified"
            />
            <Card
              icon="heart-fill"
              iconColor="#AD88C6"
              title={totalDonations?.toString() || ''}
              subtitle="units donated"
            />
          </View>
          <View
            style={{
              width: '100%',
              gap: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}
          ></View>
          <Button
            onPress={() =>
              router.push({
                pathname: '/requestblood',
                params: {
                  token: token,
                  bankCode: bankCode,
                },
              })
            }
          >
            <Octicons name="megaphone" size={20} color="white" />
            {'  '}Send Blood Alert
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
