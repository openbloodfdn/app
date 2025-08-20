import styles from '@/assets/styles/styles'
import Button from '@/components/Button'
import { logoutUser } from '@/components/CheckSecret'
import fx from '@/components/Fetch'
import FreeButton from '@/components/FreeButton'
import { Octicons } from '@expo/vector-icons'
import * as Application from 'expo-application'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
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
import { SafeAreaView } from 'react-native-safe-area-context'
export default function Settings() {
  let [refreshing, setRefreshing] = useState<boolean>(false)
  let [showModal, setShowModal] = useState<boolean>(false)
  let [isRegenerating, setRegenerating] = useState<boolean>(false)
  let [allBanks, setAllBanks] = useState<
    {
      name: string
      uuid: string
      phone: string
      coords: string
      region: string
    }[]
  >([])
  let [scopes, setScopes] = useState<
    {
      name: string
      uuid: string
      phone: string
      region: string
    }[]
  >([])

  async function regenerateUUID() {
    setRegenerating(true)
    fx(`/donor/regenerate-id`, {
      method: 'POST',
      body: {
        regenerate: true,
      },
    })
      .then(async (response) => {
        if (response.error) {
          alert(response.message)
        } else {
          SecureStore.setItemAsync('token', response.uuid)
          Alert.alert('ID Regenerated!', 'Please restart your app.', [
            {
              text: 'OK',
              onPress: () => {
                load()
              },
            },
          ])
        }
        setRegenerating(false)
      })
      .catch((error) => {
        //console.log(error)
        alert(error)
        setRegenerating(false)
      })
  }

  async function delBank(bankcode: string) {
    fx(`/donor/remove-bank`, {
      method: 'POST',
      body: {
        bankcode: bankcode,
      },
    })
      .then(async (response) => {
        if (response.error) {
          alert(response.message)
        } else {
          alert(
            'Bank deleted successfully! They will no longer be able to view your data.'
          )
          let localScopes = scopes
          let index = localScopes.findIndex((x) => x.uuid === bankcode)
          localScopes.splice(index, 1)
          setScopes(localScopes)
          load(true)
        }
      })
      .catch((error) => {
        //console.log(error)
        alert(error)
      })
  }
  async function addBank(bankcode: string) {
    ////console.log(bankcode)
    fx(`/donor/add-bank`, {
      method: 'POST',
      body: {
        bankcode: bankcode,
      },
    })
      .then(async (response) => {
        if (response.error) {
          alert(response.message)
        } else {
          //add to scopes
          let localScopes = scopes
          const foundBank = allBanks.find((x) => x.uuid === bankcode)
          if (foundBank) {
            localScopes.push({
              name: foundBank.name,
              uuid: foundBank.uuid,
              phone: foundBank.phone,
              region: foundBank.region,
            })
            alert(
              'Bank added successfully! You will now receive alerts from this bank.'
            )
            setScopes(localScopes)
            setShowModal(false)
            load(true)
          }
        }
      })
      .catch((error) => {
        //console.log(error)
        alert(error)
      })
  }

  async function getAllBanks() {
    fx('/donor/banks', {
      method: 'POST',
      body: {
        'getBanks': true,
      },
    })
      .then(async (response) => {
        setAllBanks(
          response.banks.filter((x: any) => {
            return scopes
          })
        )
        setShowModal(true)
      })
      .catch((error) => {
        console.error(error)
        Alert.alert('Error', 'Could not fetch blood banks')
      })
  }
  async function load(refresh = false) {
    if (refresh) setRefreshing(true)
    fx(`/donor/get-banks`, {
      method: 'POST',
      body: {
        'get-banks': true,
      },
    })
      .then(async (response) => {
        if (response.error) {
          alert(response.message)
        } else {
          setScopes(response.data)
        }
      })
      .catch((error) => {
        //console.log(error)
        alert(error)
      })
    setRefreshing(false)
  }

  useEffect(() => {
    load(false)
  }, [])
  let isDarkMode = useColorScheme() === 'dark'
  function reportBug() {
    router.push(
      'mailto:openblood@pidgon.com?subject=Open%20Blood%20Bug%20Report'
    )
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
              Add a Bank
            </Text>
            <Pressable
              onPress={() => {
                setShowModal(false)
              }}
              style={{
                width: 45,
                height: 45,
                borderRadius: 9,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Octicons
                name="x"
                size={24}
                color={isDarkMode ? 'white' : 'black'}
              />
            </Pressable>
          </View>
          <FlatList
            data={allBanks}
            keyExtractor={(item) => item.uuid}
            ListEmptyComponent={
              <Text
                style={{
                  fontSize: 18,
                  paddingTop: 10,
                  textAlign: 'center',
                  color: isDarkMode ? 'white' : 'black',
                }}
              >
                No banks found.
              </Text>
            }
            contentContainerStyle={{
              marginTop: 10,
            }}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                  backgroundColor: isDarkMode ? '#404040' : '#f2f0ef',
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
                  {
                    //check if bank is already added
                    scopes.some((x) => x.uuid === item.uuid) ? (
                      <Pressable
                        onPress={() => {
                          Alert.alert(
                            `Delete ${item.name}?`,
                            'This bank will no longer be able to view your data, and you will no longer receive alerts from them.',
                            [
                              {
                                text: 'Cancel',
                                style: 'cancel',
                              },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: () => {
                                  delBank(item.uuid)
                                },
                              },
                            ]
                          )
                        }}
                        style={{
                          backgroundColor: '#FF463A',
                          width: 45,
                          height: 45,
                          borderRadius: 22.5,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Octicons name="trash" size={24} color="white" />
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => {
                          Alert.alert(
                            `Add ${item.name}?`,
                            'You will start receiving alerts from this bank and they will be able to view your data.',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Add',
                                onPress: () => addBank(item.uuid),
                              },
                            ]
                          )
                        }}
                        style={{
                          backgroundColor: '#7469B6',
                          width: 45,
                          height: 45,
                          borderRadius: 22.5,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Octicons name="plus" size={24} color="white" />
                      </Pressable>
                    )
                  }
                </View>
              </View>
            )}
          />
        </View>
      </Modal>
      <View
        style={{
          width: '85%',
          marginBottom: 10,
          marginTop: 10,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            textAlign: 'left',
            fontFamily: 'PlayfairDisplay_600SemiBold',
            color: '#7469B6',
          }}
        >
          Settings
        </Text>
      </View>
      <ScrollView
        style={{
          width: '100%',
        }}
        contentContainerStyle={{
          gap: 10,
          paddingBottom: 100,
          width: '85%',
          margin: 'auto',
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
        <Text
          style={{
            fontSize: 20,
            textAlign: 'left',
            color: isDarkMode ? 'white' : 'black',
            fontWeight: 'bold',
          }}
        >
          {'\n'}
          Your Banks
        </Text>
        <View
          style={{
            margin: 10,
          }}
        >
          {scopes.map((item, index) => (
            <View
              key={item.uuid}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
                backgroundColor: isDarkMode ? '#242526' : '#fff',
                padding: 16,
                borderRadius: 9,
              }}
            >
              <View
                style={{
                  flexDirection: 'column',
                  gap: 5,
                }}
              >
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
                <Pressable
                  onPress={() => {
                    router.push(
                      `tel:+91${item.phone
                        .replace(/\s/g, '')
                        .replace('+91', '')}`
                    )
                  }}
                  style={{
                    backgroundColor: '#f3f3f3',
                    width: 45,
                    height: 45,
                    borderRadius: 22.5,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Octicons name="device-mobile" size={24} color="#7469B6" />
                </Pressable>
              </View>
            </View>
          ))}
          {scopes.length === 0 ? (
            <View
              style={{
                marginBottom: 20,
              }}
            >
              <ActivityIndicator
                size="small"
                color={isDarkMode ? 'white' : 'black'}
              />
            </View>
          ) : null}
          <Pressable
            onPress={getAllBanks}
            style={{
              marginBottom: 20,
              backgroundColor: '#7469B6',
              padding: 16,
              borderRadius: 9,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <Octicons name="plus" size={18} color="white" />
            <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>
              Modify Banks
            </Text>
          </Pressable>
        </View>
        <View
          style={{
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              textAlign: 'left',
              color: isDarkMode ? 'white' : 'black',
              marginBottom: 5,
              fontWeight: 'bold',
            }}
          >
            {'\n'}
            Contact
          </Text>
          <FreeButton
            onPress={() => {
              router.push('mailto:openblood@pidgon.com')
            }}
          >
            <Octicons name="mail" size={20} /> Get Support
          </FreeButton>
          <FreeButton onPress={reportBug}>
            <Octicons name="bug" size={20} /> Report a Bug
          </FreeButton>
          <FreeButton onPress={()=>{
            router.push('https://github.com/openbloodfdn/app')
          }}>
            <Octicons name="mark-github" size={20} /> Star us on GitHub!
          </FreeButton>
        </View>
        <View
          style={{
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              textAlign: 'left',
              color: isDarkMode ? 'white' : 'black',
              marginBottom: 5,
              fontWeight: 'bold',
            }}
          >
            {'\n'}
            Security
          </Text>
        </View>

        <FreeButton
          onPress={() => {
            logoutUser()
            router.replace('/')
          }}
        >
          <Octicons name="sign-out" size={20} /> Log out
        </FreeButton>
        <FreeButton
          onPress={() => {
            Alert.alert(
              `Your account is managed by ${scopes.length} blood bank${
                scopes.length > 1 ? 's' : ''
              }.`,
              scopes.length == 1
                ? 'Contact the blood bank to delete your account. Alternatively, you can email Open Blood support.'
                : 'You will have to remove all banks but your primary, then contact the blood bank to delete your account. Alternatively, you can email Open Blood support.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Contact Support',
                  onPress: () => {
                    router.push(
                      'mailto:openblood@pidgon.com?subject=Open%20Blood%20Account%20Deletion'
                    )
                  },
                },
              ]
            )
          }}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FF463A',
          }}
        >
          <Octicons name="trash" size={20} color={'white'} />
          <Text
            style={{
              textAlign: 'center',
              fontSize: 20,
              color: 'white',
            }}
          >
            {' '}
            Delete Account
          </Text>
        </FreeButton>
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              color: 'gray',
              marginTop: 20,
              fontSize: 16,
            }}
          >
            Open Blood {Application.nativeApplicationVersion} [
            {Application.nativeBuildVersion}]
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
