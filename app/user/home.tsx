import Button from '@/components/Button'
import Card from '@/components/Card'
import FreeButton from '@/components/FreeButton'
import Octicons from '@expo/vector-icons/Octicons'
import { BlurView } from 'expo-blur'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import fx from '@/components/Fetch'
SplashScreen.preventAutoHideAsync()

export default function Home() {
  let [refreshing, setRefreshing] = useState<boolean>(false)
  let [name, setName] = useState<string>('')
  let [donated, setDonated] = useState<number | null>(null)
  let [verified, setVerified] = useState<boolean>(true)
  let [lastDonation, setLastDonation] = useState<string>('')
  let [totalDonators, setTotalDonators] = useState<number | null>(null)
  let [log, setLog] = useState<{ x: string; y: number }[]>([])
  let [donatingSince, setDonatingSince] = useState<string>('')
  let [appReady, setAppReady] = useState<boolean>(false)
  let [bbName, setBBName] = useState<string>('')
  let [bbId, setBBId] = useState<string | null>('')
  let [bbPhone, setBBPhone] = useState<string>('')
  let [switchModalLoading, setSwitchModalLoading] = useState<boolean>(false)
  let [showModal, setShowModal] = useState<boolean>(false)
  let [allBanks, setAllBanks] = useState<
    {
      name: string
      uuid: string
      phone: string
      coords: string
      region: string
    }[]
  >([])

  function humanizeDate(isoString: string): string {
    const WEEKDAYS = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    const MONTHS = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]

    const date = new Date(isoString)
    const now = new Date()

    const dateYMD = [date.getFullYear(), date.getMonth(), date.getDate()]
    const nowYMD = [now.getFullYear(), now.getMonth(), now.getDate()]

    const msPerDay = 86400000
    const diffInDays = Math.floor(
      (new Date(nowYMD[0], nowYMD[1], nowYMD[2]).getTime() -
        new Date(dateYMD[0], dateYMD[1], dateYMD[2]).getTime()) /
        msPerDay
    )

    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const hour12 = hours % 12 || 12
    const minuteStr = minutes.toString().padStart(2, '0')
    const timeStr = `${hour12}:${minuteStr} ${ampm}`

    if (diffInDays === 0) {
      return `Today at ${timeStr}`
    } else if (diffInDays === 1) {
      return `Yesterday at ${timeStr}`
    } else if (diffInDays <= 6) {
      return `${WEEKDAYS[date.getDay()]} at ${timeStr}`
    } else {
      return `${
        MONTHS[date.getMonth()]
      } ${date.getDate()}, ${date.getFullYear()} at ${timeStr}`
    }
  }

  function callBank() {
    if (bbPhone === '') {
      Alert.alert(
        'Phone number not found',
        'The blood bank has not provided a phone number, or something else went wrong. Please try contacting the bank from your settings page.'
      )
    } else {
      router.push(`tel:${bbPhone}`)
    }
  }
  async function load(refresh = false) {
    if (refresh) setRefreshing(true)
    let bbId = await SecureStore.getItemAsync('bbId')

    fx(`/donor/user-stats`, {
      method: 'POST',
      body: {
        bank: bbId,
      },
    })
      .then(async (response) => {
        //console.log(response)
        if (refresh) setRefreshing(false)
        if (response.error) {
          await SecureStore.deleteItemAsync('token')
          setName('')
          setDonated(null)
          setLastDonation('')
          setTotalDonators(null)
          setDonatingSince('')
          setLog([])

          Alert.alert(
            'User not found.',
            response.error, //login again redirect
            [
              {
                text: 'Sign in',
                onPress: () => {
                  SecureStore.deleteItemAsync('token')
                  router.navigate('/')
                },
              },
            ]
          )
        } else {
          setName(response.data.name)
          setDonated(response.data.donated)
          setLastDonation(response.data.lastDonated)
          setTotalDonators(response.data.totalDonators)
          setDonatingSince(response.data.donatingSince)
          setLog(response.data.log.reverse())
          setVerified(response.data.verified)
          setBBName(response.data.bank.name)
          await SecureStore.setItemAsync('bbName', response.data.bank.name)
          await SecureStore.setItemAsync('bbid', response.data.bank.id)
          setBBPhone(response.data.bank.phone)
          //console.log(response.data.installed)
          if (response.data.installed === false) {
            router.push({
              pathname: '/accountmigration',
              params: {
                name: response.data.name,
                phone: response.data.phone,
                coords: response.data.coords,
              },
            })
          }
        }
      })
      .catch((error) => {
        if (refresh) setRefreshing(true)
        //console.log(error)
      })
  }
  useEffect(() => {
    async function init() {
      //console.log('loading')
      let id = await SecureStore.getItemAsync('bbId')
      //console.log(id)
      setBBId(id)
      load(false)
      setAppReady(true)
    }
    init()
  }, [])
  let isDarkMode = useColorScheme() === 'dark'

  if (!appReady) {
    return null
  }

  async function initiateSwitchBankModal() {
    setShowModal(true)
    setSwitchModalLoading(true)
    fx(`/donor/get-banks`, {
      method: 'POST',
      body: {
        bank: bbId,
      },
    }).then(async (response) => {
      if (response.error) {
        Alert.alert('Error', response.message)
      } else {
        let localBanks = response.data
        let index = localBanks.findIndex(
          (x: {
            name: string
            uuid: string
            phone: string
            coords: string
            region: string
          }) => x.uuid === bbId
        )
        localBanks.splice(index, 1)
        setAllBanks(localBanks)
        setSwitchModalLoading(false)
      }
    })
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Modal
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowModal(false)
        }}
        visible={showModal}
      >
        <TouchableOpacity
          onPressOut={() => {
            setShowModal(false)
          }}
          style={{
            flex: 1,
          }}
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
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 24,
                textAlign: 'left',
                color: isDarkMode ? 'white' : 'black',
                paddingBottom: 10,
                fontFamily: 'PlayfairDisplay_600SemiBold',
              }}
            >
              Switch Blood Banks
            </Text>
            <Pressable
              onPress={() => {
                setShowModal(false)
              }}
              style={{
                backgroundColor: '#7469B6',
                width: 45,
                height: 45,
                borderRadius: 9,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Octicons name="x" size={24} color="white" />
            </Pressable>
          </View>
          {switchModalLoading ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                marginTop: 50,
              }}
            >
              <ActivityIndicator
                size="small"
                color={isDarkMode ? 'white' : 'black'}
              />
            </View>
          ) : (
            <FlatList
              data={allBanks}
              keyExtractor={(item) => item.uuid}
              contentContainerStyle={{
                paddingTop: 20,
              }}
              ListFooterComponent={
                <Text
                  style={{
                    fontSize: 18,
                    paddingTop: 10,
                    textAlign: 'center',
                    color: isDarkMode ? 'white' : 'black',
                  }}
                >
                  You can add more banks in the Settings tab.
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={async () => {
                    setBBName(item.name)
                    await SecureStore.setItemAsync('bbName', item.name)
                    setBBId(item.uuid)
                    await SecureStore.setItemAsync('bbId', item.uuid)
                    load(true)
                    setShowModal(false)
                  }}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                    backgroundColor: isDarkMode ? '#242526' : '#f3f3f3',
                    padding: 16,
                    borderRadius: 9,
                  }}
                >
                  <View style={{ flexDirection: 'column', gap: 5 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        textAlign: 'left',
                        color: isDarkMode ? 'white' : 'black',
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        textAlign: 'left',
                        color: isDarkMode ? 'white' : 'black',
                      }}
                    >
                      {item.region}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View
                      style={{
                        backgroundColor: '#7469B6',
                        width: 45,
                        height: 45,
                        borderRadius: 22.5,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Octicons name="chevron-right" size={24} color="white" />
                    </View>
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>
      </Modal>
      <Pressable
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '85%',
          marginBottom: 20,
          marginTop: 10,
        }}
        onPress={initiateSwitchBankModal}
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
            {bbName ? bbName : 'Open Blood'}
          </Text>
        </View>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Octicons name="chevron-down" size={24} color="#7469B6" />
        </View>
      </Pressable>
      <ScrollView
        style={{
          width: '100%',
        }}
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
              fontSize: 22,
              textAlign: 'left',
              color: isDarkMode ? 'white' : 'black',
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}
          >
            <Text>Hello{name.trim() === '' ? '!' : ', '}</Text>
            <Text style={{ color: '#7469B6', fontWeight: 'bold' }}>
              {name}
            </Text>{' '}
            <Pressable
              onPress={() => {
                if (verified === true) {
                  Alert.alert(
                    'Verified!',
                    'Your details have been verified by the blood center.'
                  )
                } else {
                  Alert.alert(
                    'Unverified',
                    'Your details have not been verified yet. Please allow a few days for verification. Alternatively, you can visit or call the blood center to get verified.'
                  )
                }
              }}
            >
              {verified === true && name !== '' ? (
                <Octicons
                  name="verified"
                  size={24}
                  color="#7469B6"
                  style={{ marginLeft: 5 }}
                />
              ) : name !== '' ? (
                <Octicons
                  name="unverified"
                  size={24}
                  color="#FF3B2F"
                  style={{ marginLeft: 5 }}
                />
              ) : null}
            </Pressable>
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
              gap: '5%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Card
              icon="heart-fill"
              iconColor="#AD88C6"
              title={donated?.toString() || ''}
              subtitle="units donated"
            />
            <Card
              icon="calendar"
              iconColor="#AD88C6"
              title={lastDonation}
              subtitle="last donation"
            />
          </View>
          <View
            style={{
              width: '100%',
              gap: '5%',
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
              icon="graph"
              iconColor="#AD88C6"
              title={donatingSince}
              subtitle="donating since"
            />
          </View>
          {verified == false ? (
            <View
              style={{
                width: '80%',
                backgroundColor: isDarkMode ? '#242526' : '#fff',
                borderRadius: 10,
                justifyContent: 'flex-start',
                padding: 20,
                alignItems: 'center',
                flexDirection: 'column',
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: isDarkMode ? 'white' : 'black',
                  marginBottom: 10,
                }}
              >
                Verification status:{' '}
                <Text
                  style={{
                    color: '#FF3B2F',
                  }}
                >
                  Unverified
                </Text>
              </Text>
              <Text
                style={{ fontSize: 16, color: isDarkMode ? 'white' : 'black' }}
              >
                Your profile is awaiting verification. This may take a few days.
                For faster processing, you can also visit the blood center
                directly.
              </Text>
            </View>
          ) : null}

          <FreeButton
            onPress={callBank}
            style={{
              width: '85%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Octicons name="device-mobile" size={20} color="white" />
            {'  '}
            Call Blood Bank
          </FreeButton>
        </View>
        <Text
          style={{
            fontSize: 24,
            textAlign: 'left',
            marginBottom: 20,
            width: '80%',
            marginTop: 20,
          }}
        >
          {log.length == 0 ? '' : 'Log'}
        </Text>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '85%',
            gap: 20,
            marginBottom: 100,
          }}
        >
          {log.map((item, index) => {
            let { x, y } = item
            let parsedXString = ''
            if (x.startsWith('v')) {
              parsedXString = `Verified blood type as ${x.split('-')[1]}`
            } else if (x.startsWith('d')) {
              parsedXString = `Donated blood`
            }

            return (
              <View
                key={index}
                style={{
                  width: '100%',
                  backgroundColor: isDarkMode ? '#242526' : '#fff',
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  padding: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 10,
                    color: isDarkMode ? '#fff' : '#000',
                  }}
                >
                  {parsedXString}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: 'gray',
                  }}
                >
                  {humanizeDate(y.toString())}
                </Text>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
