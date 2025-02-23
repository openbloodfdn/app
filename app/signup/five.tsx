import FreeButton from '@/components/FreeButton'
import { Octicons } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useState } from 'react'
import {
  Pressable,
  Text,
  useColorScheme,
  View
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Progress from 'react-native-progress'
import { SafeAreaView } from 'react-native-safe-area-context'
export default function Five({
  navigation,
  route,
}: {
  navigation: any
  route: any
}) {
  console.log(route.params)
  let [birthdayHero, setBirthdayHero] = useState<boolean>(
    route.params?.birthdayHero || false
  )
  let [loadingProcess, setLoadingProcess] = useState<boolean>(false)
  delete route.params?.birthdayHero
  console.log(route.params)

  function signup() {
    setLoadingProcess(true)
    /**
     * @params {phoneNumber} string [EXISTS]
     * @params {affiliated} string (convert to boolean)
     * @params {affiliatedata} object {designation: string, yearOfJoining: number, department: string}
     * @params {name} string [EXISTS]
     * @params {sex} string
     * @params {dob} timestampz
     * @params {weight} number [EXISTS]
     * @params {height} number [EXISTS]
     * @params {bloodgroup} string [EXISTS]
     * @params {conditions} string
     * @params {medications} string
     * @params {distance} number
     * @params {birthdayHero} boolean
     */
    console.log(route.params.location.latitude, route.params.location.longitude)
    var payload = {
      phonenumber: route.params.phoneNumber,
      name: route.params.name,
      sex: route.params.sex,
      dob: route.params.dob,
      weight: route.params.weight,
      height: route.params.height,
      bloodtype: route.params.bloodtype,
      conditions: route.params.conditions,
      medications: route.params.medications,
      distance: route.params.distance,
      birthdayhero: birthdayHero,
      scope: route.params.baseBank.uuid,
      coords: route.params.location
        ? route.params.location.hasOwnProperty('latitude') ?
        `${route.params.location.latitude},${route.params.location.longitude}`
        : route.params.location.address
        : '',
      lookupid: route.params.location ? route.params.location.hasOwnProperty('lookup') ? route.params.location.lookup : '' : ''
    }
    fetch(`http://localhost:3000/donor/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then(async (response) => {
        if (response.error) {
          setLoadingProcess(false)
          alert(response.message)
        } else {
          await SecureStore.setItemAsync('token', response.data.uuid)
          await SecureStore.deleteItemAsync('lookup')
          router.push({
            pathname: '/signupcomplete',
            params: response.data,
          })
        }
      })
      .catch((error) => {
        setLoadingProcess(false)
        alert(error)
      })
  }
  let responsiveDark = useColorScheme() === 'dark' ? 'white' : 'black'

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <SafeAreaView>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: 40,
            marginTop: 20,
            gap: 20,
            alignSelf: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <Pressable onPress={() => router.push('/')}>
              <Octicons name="arrow-left" size={24} color={responsiveDark} />
            </Pressable>
            <Text
              style={{
                fontSize: 24,
                textAlign: 'center',
                color: responsiveDark,
              }}
            >
              <Text style={{ color: '#7469B6' }}>Open Blood</Text> Internal
            </Text>
          </View>
          <Progress.Bar
            progress={1}
            width={300}
            height={10}
            color="#7469B6"
            borderRadius={10}
          />
        </View>
        <Text
          style={{
            fontSize: 28,
            textAlign: 'center',
            margin: 'auto',
            marginBottom: 20,
            color: responsiveDark,
          }}
        >
          Sign up | <Text style={{ color: '#7469B6' }}>Extras</Text>
        </Text>
        <View
          style={{
            width: '80%',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              marginBottom: 20,
              color: responsiveDark,
            }}
          >
            As you celebrate yet another year of life, give someone else the
            chance too. Be a real hero in your life by participating in
            "Birthday Heroes" initiative.
          </Text>
          <Text
            style={{
              fontSize: 18,
              marginBottom: 20,
              color: responsiveDark,
            }}
          >
            Kindly give your consent for the Birthday Heroes project and be a
            hero!
          </Text>
          <View>
            <Picker
              selectedValue={birthdayHero}
              onValueChange={(itemValue) => {
                setBirthdayHero(itemValue)
              }}
            >
              <Picker.Item label="Yes" value={true} color={responsiveDark} />
              <Picker.Item label="No" value={false} color={responsiveDark} />
            </Picker>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            flexGrow: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '80%',
            gap: 20,
          }}
        >
          <FreeButton
            onPress={() => {
              navigation.navigate(`four`, {
                ...route.params,
                birthdayHero,
              })
            }}
            style={{
              width: '25%',
            }}
          >
            Back
          </FreeButton>
          <FreeButton
            onPress={signup}
            style={{
              width: '50%',
            }}
            disabled={loadingProcess}
          >
            {loadingProcess ? 'Loading...' : 'Sign Up!'}
          </FreeButton>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  )
}
