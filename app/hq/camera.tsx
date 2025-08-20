import Button from '@/components/Button'
import Octicons from '@expo/vector-icons/Octicons'
import { useIsFocused } from '@react-navigation/native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
export default function Camera() {
  const isFocused = useIsFocused()
  const [permission, requestPermission] = useCameraPermissions()
  const [flash, setFlash] = useState(false)
  const [side, setSide] = useState<'front' | 'back'>('back')
  const [currentData, setCurrentData] = useState<any>('')
  const [token, setToken] = useState<string | null>('')
  const [bankCode, setBankCode] = useState<string | null>('')
  const [bbName, setBbName] = useState<string>('')
  useEffect(() => {
    async function getToken() {
      let t = await SecureStore.getItemAsync('token')
      let id = await SecureStore.getItemAsync('id')
      let name = await SecureStore.getItemAsync('bbName')
      setBbName(name || '')
      setToken(t)
      setBankCode(id)
    }
    getToken()
  }, [])
  function toggleFlash() {
    setFlash(!flash)
  }
  function toggleFront() {
    setSide(side === 'front' ? 'back' : 'front')
  }
  if (!permission) {
    // Camera permissions are still loading.
    return <View />
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: '#7469B6',
          }}
        >
          We need your permission to show the camera.
        </Text>
        <Button onPress={requestPermission} disabled={false}>
          Allow Camera Access
        </Button>
      </View>
    )
  }
  return (
    <SafeAreaView style={styles.container}>
      {isFocused && (
        <CameraView
          style={styles.camera}
          facing={side}
          onCameraReady={() => {
            console.log('Camera is ready')
          }}
          onMountError={(error) => {
            console.log('Camera error: ', error)
            Alert.alert('Error', 'Camera not available. Please try again later.')
          }}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={(result) => {
            if (result.data == 'ob-notfound') {
              Alert.alert(
                'Error',
                "The donor's identity could not be confirmed. Please reload the donor app or check the donor's internet connection and try again."
              )
            } else if (result.data.startsWith('ob-') !== true) {
              setCurrentData('')
            } else {
              setCurrentData(result.data)
            }
          }}
          enableTorch={flash}
        />
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignSelf: 'center',
          width: '80%',
          position: 'absolute',
          bottom: '15%',
          borderRadius: 64,
          padding: 10,
          elevation: 10,
        }}
      >
        <Pressable
          style={{
            borderRadius: 64,
            backgroundColor: '#fff',
            padding: 10,
            elevation: 10,
          }}
          onPress={toggleFront}
        >
          <Octicons name="sync" size={28} color="#7469B6" />
        </Pressable>
        {currentData !== '' ? (
          <Pressable
            style={{
              borderRadius: 64,
              backgroundColor: '#fff',
              padding: 15,
            }}
            onPress={() => {
              router.push({
                pathname: '/logdonor',
                params: {
                  uuid: currentData,
                  id: bankCode,
                  token: token,
                },
              })
            }}
          >
            <Text
              style={{
                fontSize: 24,
                color: '#7469B6',
              }}
            >
              Scan!
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          style={{
            borderRadius: 64,
            backgroundColor: '#fff',
            padding: 10,
            elevation: 10,
          }}
          onPress={toggleFlash}
        >
          <Octicons name="sun" size={28} color="#7469B6" />
        </Pressable>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    elevation: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
})
