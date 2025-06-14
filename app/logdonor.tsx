import Button from '@/components/Button'
import fx from '@/components/Fetch'
import Octicons from '@expo/vector-icons/Octicons'
import { router, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  useColorScheme,
  View,
} from 'react-native'
export default function Modal() {
  function convertTimestampToShortString(timestamp: string) {
    if (
      timestamp?.toString().trim() === '' ||
      timestamp === undefined ||
      timestamp === null
    )
      return 'Never'
    let date = new Date(timestamp)
    let month = date.toLocaleString('default', { month: 'short' })
    let year = date.getFullYear().toString().substring(2)
    return `${month} '${year}`
  }
  function checkIfTimestampUnsafeToDonate(timestamp: string) {
    if (timestamp === 'Never') return false
    let date = new Date(timestamp)
    let now = new Date()
    let diff = now.getTime() - date.getTime()
    let diffMonths = diff / (1000 * 60 * 60 * 24 * 30)
    return diffMonths < 3
  }
  const local = useLocalSearchParams()
  let [uuid, setUUID] = useState(local.uuid ?? '')
  let [bloodtype, setBloodtype] = useState<string>('A+')
  const token = local.token
  const bankCode = local.id
  let [donorData, setDonorData] = useState<any>({})
  let [marking, setMarking] = useState<boolean>(false)
  let [extending, setExtending] = useState<boolean>(false)
  let [loading, setLoading] = useState<boolean>(true)
  let [oos, setOos] = useState<boolean>(false)
  let isDarkMode = useColorScheme() === 'dark'
  let responsiveColor = isDarkMode ? 'white' : 'black'

  useEffect(() => {
    fx(`/hq/get-donor`, {
      method: 'POST',
      body: {
        bankCode: bankCode,
        token: token,
        uuid: uuid,
      },
    })
      .then(async (response) => {
        if (response.error) {
          alert(response.message)
          router.dismiss()
        } else {
          //console.log(response.data)
          setLoading(false)
          let localDonor = response.data
          localDonor.age =
            new Date().getFullYear() - new Date(localDonor.dob).getFullYear()
          setDonorData(localDonor)
          setBloodtype(response.data.bloodtype)
          setOos(response.data.oos)
          setUUID(response.data.uuid)
        }
      })
      .catch((error) => {
        Alert.alert(
          'Error',
          'An error occurred while fetching donor data. The QR code may have expired. Please ask the donor to refresh their code.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.dismiss()
              },
            },
          ]
        )
      })
  }, [])

  function markAsDonated() {
    setMarking(true)
    fx(`/hq/mark-donated`, {
      method: 'POST',
      body: {
        bankCode: bankCode,
        token: token,
        uuid: uuid,
      },
    })
      .then(async (response) => {
        if (response.error) {
          setMarking(false)
          alert(response.message)
        } else {
          setMarking(false)
          alert(response.message)
          router.dismiss()
        }
      })
      .catch((error) => {
        setMarking(false)
        alert('An error occurred while marking the donor as donated')
      })
  }

  function extendDonorScope() {
    setExtending(true)
    fx(`/hq/extend-donor-scope`, {
      method: 'POST',
      body: {
        bankCode: bankCode,
        token: token,
        uuid: uuid,
      },
    })
      .then(async (response) => {
        if (response.error) {
          setExtending(false)
          alert(response.message)
        } else {
          setExtending(false)
          alert(response.message)
          setOos(false)
        }
      })
      .catch((error) => {
        setMarking(false)
        alert('An error occurred while marking the donor as donated')
      })
  }
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDarkMode ? '#121212' : '#fff',
        }}
      >
        <ActivityIndicator size="large" color={responsiveColor} />
      </View>
    )
  }
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        margin: 20,
      }}
    >
      <View
        style={{
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <Pressable
          onPress={() => router.dismiss()}
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 36,
              fontWeight: 'bold',
              textAlign: 'center',
              fontFamily: 'PlayfairDisplay_600SemiBold',
            }}
          >
            {donorData.name}
          </Text>
          <Octicons name="x" size={36} color="black" />
        </Pressable>
        <Text style={{ fontSize: 24, color: 'grey' }}>
          +91 {donorData.phone}
        </Text>
        <Text style={{ fontSize: 24 }}>
          Blood group: {donorData.bloodtype}{' '}
          {donorData.verified ? (
            <Octicons name="verified" size={24} color="#26CD41" />
          ) : (
            <Octicons name="unverified" size={24} color="#FF3B2F" />
          )}
        </Text>
        <Text style={{ fontSize: 24 }}>{donorData.age} years old</Text>
        <Text style={{ fontSize: 24 }}>
          Last donated:{' '}
          <Text
            style={{
              color: checkIfTimestampUnsafeToDonate(donorData.lastdonated)
                ? '#FF3B2F'
                : '#26CD41',
            }}
          >
            {convertTimestampToShortString(donorData.lastdonated)}
          </Text>
        </Text>
        {!donorData.verified ? (
          <View
            style={{
              borderColor: '#FF3B2F',
              borderWidth: 2,
              backgroundColor: '#FAF9F6',
              padding: 10,
              borderRadius: 5,
              width: '100%',
            }}
          >
            <Text
              style={{
                fontSize: 24,
                color: '#FF3B2F',
                fontWeight: 'bold',
              }}
            >
              This donor is not verified.
            </Text>
            <Text style={{ fontSize: 18 }}>
              You cannot mark them as donated until they are verified. Click the
              button below to verify {donorData.name}.
            </Text>
            <Button
              onPress={() => {
                router.push({
                  pathname: '/verifydonor',
                  params: {
                    bankCode: bankCode,
                    uuid: uuid,
                    token: token,
                  },
                })
              }}
            >
              Verify donor
            </Button>
          </View>
        ) : (
          <View style={{ margin: 'auto' }}>
            <Pressable
              onPress={() => {
                router.push({
                  pathname: '/verifydonor',
                  params: {
                    uuid: uuid,
                    bankCode: bankCode,
                    token: token,
                  },
                })
              }}
              disabled={oos}
            >
              <Text
                style={{
                  fontSize: 22,
                  color: oos ? '#FF3B2F' : '#7469B6',
                  textAlign: 'center',
                }}
              >
                {oos
                  ? 'This donor is out of your scope. You can still mark them as donated.'
                  : '📋 View more donor data'}
              </Text>
            </Pressable>
          </View>
        )}
        <View style={{ margin: 'auto' }}>
          <Pressable
            onPress={markAsDonated}
            disabled={!donorData.verified || marking}
            style={{
              backgroundColor: '#7469B6',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              width: 300,
              margin: 'auto',
            }}
          >
            <Text style={{ fontSize: 24, color: 'white' }}>
              Mark{marking ? 'ing' : ''} as donated
              {marking ? '...' : ''}
            </Text>
          </Pressable>
          {oos ? (
            <View
              style={{
                margin: 'auto',
                padding: 10,
              }}
            >
              <Text
                style={{ fontSize: 17, margin: 'auto', textAlign: 'center' }}
              >
                {'\n\n'}
                This donor is out of your scope. You cannot view their donor
                data unless you add them into your list.
              </Text>
              <Button
                style={{
                  margin: 'auto',
                }}
                onPress={extendDonorScope}
                disabled={extending}
              >
                Includ{extending ? 'ing' : 'e'} donor{extending ? '...' : ''}
              </Button>
              <Text
                style={{ fontSize: 17, margin: 'auto', textAlign: 'center' }}
              >
                If this donor does not live in your region and/or does not
                donate frequently to this blood bank, please reconsider.
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  )
}
