import styles from '@/assets/styles/styles'
import Button from '@/components/Button'
import FreeButton from '@/components/FreeButton'
import Octicons from '@expo/vector-icons/Octicons'
import { Picker } from '@react-native-picker/picker'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import fx from '@/components/Fetch'

export default function Query() {
  let [expandCriteria, setExpandCriteria] = useState<boolean>(false)
  let [expandSearchBox, setExpandSearchBox] = useState<boolean>(true)
  let [activeHotswap, setActiveHotswap] = useState<boolean>(true)
  let [bloodtype, setBloodtype] = useState<string>('')
  let [name, setName] = useState<string>('')
  let [minimumMonths, setMinimumMonths] = useState<string>('')
  let [modifyValue, setModifyValue] = useState<'distance' | 'months'>('months')
  let inputRef = useRef<TextInput>(null)
  let [showModal, setShowModal] = useState<boolean>(false)
  let [bbName, setBBName] = useState<string | null>('')

  let [showBloodTypeModal, setShowBloodTypeModal] = useState<boolean>(false)
  let [openUnverified, setOpenUnverified] = useState<boolean>(false)
  let [requireUsersVerified, setRequireUsersVerified] = useState<boolean>(true)
  let [radius, setRadius] = useState<string>('')
  let [token, setToken] = useState<string | null>('')
  let [bankCode, setBankCode] = useState<string | null>('')
  let [resultData, setResultData] = useState<any>([])
  let [loading, setLoading] = useState<boolean>(false)
  let [timeTaken, setTimeTaken] = useState<number>(0)
  let isAtLeastOneCriteriaActive =
    bloodtype !== '' ||
    radius !== '' ||
    minimumMonths !== '' ||
    requireUsersVerified

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

  function formatDistance(distance: number): string {
    const actual = distance < 1 ? distance * 1000 : distance
    const unit = distance < 1 ? 'm' : 'km'

    if (actual >= 1_000_000) {
      return `${(actual / 1_000_000).toFixed(1)}M ${unit} away`
    } else if (actual >= 1_000) {
      return `${(actual / 1_000).toFixed(1)}K ${unit} away`
    } else {
      return `${Math.round(actual).toLocaleString()} ${unit} away`
    }
  }

  useEffect(() => {
    async function getToken() {
      let id = await SecureStore.getItemAsync('id')
      let t = await SecureStore.getItemAsync('token')
      let name = await SecureStore.getItemAsync('bbName')
      setBBName(name)
      setBankCode(id)
      setToken(t)
    }
    getToken()
  }, [])
  async function queryDonors(refresh = false, unverified = false) {
    if (refresh) setLoading(true)
    if (unverified) setOpenUnverified(true)
    setResultData([])
    setLoading(true)
    let bankCode = await SecureStore.getItemAsync('id')
    let token = await SecureStore.getItemAsync('token')
    fx(`/hq/query-donor`, {
      method: 'POST',
      body: unverified
        ? {
            bankCode: bankCode,
            token: token,
            unverified: true,
          }
        : {
            bankCode: bankCode,
            token: token,
            months: minimumMonths == '' ? null : minimumMonths,
            verified: requireUsersVerified,
            distance: radius == '' ? null : radius,
            bloodtype: bloodtype,
            name: name,
            unverified: false,
          },
    })
      .then(async (response) => {
        if (refresh) setLoading(false)
        if (!unverified) setExpandSearchBox(false)
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
          setLoading(false)
          setTimeTaken(response.time)
          setResultData(response.data)
        }
      })
      .catch((error) => {
        if (refresh) setLoading(false)
        setLoading(false)
        Alert.alert('Error', 'Failed to fetch data')
      })
  }
  let isDarkMode = useColorScheme() === 'dark'
  return (
    <SafeAreaView
      style={{
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
          <KeyboardAwareScrollView>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: isDarkMode ? 'white' : 'black',
                }}
              >
                Set minimum {modifyValue}
              </Text>
              <Pressable
                onPress={() => {
                  setShowModal(false)
                  modifyValue == 'months' ? setMinimumMonths('') : setRadius('')
                }}
              >
                <Text style={{ fontSize: 20, color: 'red' }}>Remove</Text>
              </Pressable>
              <Pressable onPress={() => setShowModal(false)}>
                <Text style={{ fontSize: 20, color: '#7469B6' }}>Done</Text>
              </Pressable>
            </View>
            <Text
              style={{
                fontSize: 16,
                marginTop: 10,
                color: isDarkMode ? 'white' : 'black',
              }}
            >
              {modifyValue == 'months'
                ? 'Set the minimum number of months required before the last donation'
                : 'Set the minimum distance in kilometers from the donors to the blood bank'}
            </Text>
            <TextInput
              style={{
                ...styles.input,
                width: '90%',
                alignSelf: 'center',
              }}
              placeholderTextColor={'grey'}
              keyboardType={
                modifyValue == 'months' ? 'number-pad' : 'decimal-pad'
              }
              value={modifyValue == 'months' ? minimumMonths : radius}
              ref={inputRef}
              placeholder={
                modifyValue == 'months' ? 'Number of months' : 'Distance in km'
              }
              onChangeText={(e) => {
                modifyValue == 'months'
                  ? setMinimumMonths(e.replace(/[^0-9]/g, ''))
                  : setRadius(e.replace(/[^0-9.]/g, ''))
              }}
              onSubmitEditing={() => setShowModal(false)}
            />
          </KeyboardAwareScrollView>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowBloodTypeModal(false)
        }}
        visible={showBloodTypeModal}
      >
        <TouchableOpacity
          onPressOut={() => {
            setShowBloodTypeModal(false)
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
          <KeyboardAwareScrollView>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: isDarkMode ? 'white' : 'black',
                }}
              >
                Set required blood type
              </Text>
              <Pressable
                onPress={() => {
                  setShowBloodTypeModal(false)
                  setBloodtype('')
                }}
              >
                <Text style={{ fontSize: 20, color: 'red' }}>Remove</Text>
              </Pressable>
              <Pressable onPress={() => setShowBloodTypeModal(false)}>
                <Text style={{ fontSize: 20, color: '#7469B6' }}>Done</Text>
              </Pressable>
            </View>
            <Text
              style={{
                fontSize: 16,
                marginTop: 10,
                color: isDarkMode ? 'white' : 'black',
              }}
            >
              Set the required blood type of the donors.
            </Text>
            <Picker
              selectedValue={bloodtype}
              onValueChange={setBloodtype}
              style={{
                color: 'black',
                padding: 20,
                backgroundColor: '#fefefe',
                borderRadius: 16,
              }}
            >
              <Picker.Item label="Not required" value="" />
              <Picker.Item label="A+" value="A+" />
              <Picker.Item label="A-" value="A-" />
              <Picker.Item label="B+" value="B+" />
              <Picker.Item label="B-" value="B-" />
              <Picker.Item label="AB+" value="AB+" />
              <Picker.Item label="AB-" value="AB-" />
              <Picker.Item label="O+" value="O+" />
              <Picker.Item label="O-" value="O-" />
              <Picker.Item
                label="Bombay blood group"
                value="Bombay blood group"
              />
            </Picker>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <FlatList
          style={{
            width: '100%',
          }}
          data={resultData}
          ListEmptyComponent={() =>
            resultData.length == 0 && !expandSearchBox ? (
              <Text
                style={{
                  fontSize: 18,
                  textAlign: 'center',
                  marginTop: 20,
                  color: isDarkMode ? 'white' : 'black',
                }}
              >
                No donors found{'\n'} matching that criteria.
              </Text>
            ) : loading ? (
              <View
                style={{
                  marginTop: 20,
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator
                  size="small"
                  color={isDarkMode ? 'white' : 'black'}
                />
              </View>
            ) : null
          }
          ListFooterComponent={<View style={{ height: 100 }}></View>}
          ListHeaderComponent={
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  width: '85%',
                  justifyContent: 'space-between',
                  alignSelf: 'center',
                  marginTop: 20,
                  marginBottom: 20,
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
                    DonorBase
                  </Text>
                </View>
              </View>
              <View
                style={{
                  marginBottom: 10,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 10,
                    backgroundColor: isDarkMode ? '#242526' : '#EBEDEF',
                    padding: 10,
                    borderRadius: 20,
                  }}
                >
                  <Pressable
                    onPress={() => {
                      setActiveHotswap(true)
                      setOpenUnverified(false)
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      width: '45%',
                      backgroundColor: activeHotswap ? '#AD88C6' : '#D3D3D3',
                    }}
                  >
                    <Text
                      style={{
                        color: activeHotswap ? 'white' : 'black',
                        fontSize: 18,
                        textAlign: 'center',
                      }}
                    >
                      All
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setResultData([])
                      setActiveHotswap(false)
                      queryDonors(false, true)
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      width: '45%',
                      borderColor: '#D3D3D3',
                      backgroundColor: openUnverified ? '#AD88C6' : '#D3D3D3',
                    }}
                  >
                    <Text
                      style={{
                        color: openUnverified ? 'white' : 'black',
                        fontSize: 18,
                        textAlign: 'center',
                      }}
                    >
                      Unverified
                    </Text>
                  </Pressable>
                </View>
                {activeHotswap ? (
                  <Pressable
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '85%',
                      marginTop: 20,
                      alignSelf: 'center',
                    }}
                    onPress={() => setExpandSearchBox(!expandSearchBox)}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        alignSelf: 'flex-start',
                        fontWeight: 'bold',
                        color: '#7469B6',
                        fontFamily: 'PlayfairDisplay_600SemiBold',
                      }}
                    >
                      Search
                    </Text>
                    <Octicons
                      name={expandSearchBox ? 'chevron-up' : 'chevron-down'}
                      size={28}
                      color="#7469B6"
                    />
                  </Pressable>
                ) : null}
                {expandSearchBox ? (
                  <View
                    style={{
                      width: '90%',
                      flex: 1,
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 20,
                      backgroundColor: isDarkMode ? '#242526' : '#EBEDEF',
                      borderRadius: 20,
                    }}
                  >
                    {activeHotswap ? (
                      <Pressable
                        onPress={() => setExpandCriteria(!expandCriteria)}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          width: '90%',
                          marginTop: 20,
                          alignSelf: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 20,
                            alignSelf: 'flex-start',
                            fontWeight: 'bold',
                            color: isDarkMode ? 'white' : 'black',
                          }}
                        >
                          {!expandCriteria && isAtLeastOneCriteriaActive
                            ? 'Selected'
                            : ''}{' '}
                          Criteria
                        </Text>
                        <Octicons
                          name={expandCriteria ? 'chevron-up' : 'chevron-down'}
                          size={28}
                          color="#7469B6"
                        />
                      </Pressable>
                    ) : null}
                    {activeHotswap ? (
                      <ScrollView
                        horizontal={!expandCriteria}
                        contentContainerStyle={{
                          gap: 10,
                          padding: 9,
                          borderRadius: 16,
                        }}
                        style={{
                          width: '90%',
                          backgroundColor: isDarkMode ? '#3A3B3C' : '#fff',
                          borderRadius: 16,
                          marginTop: 5,
                        }}
                        showsHorizontalScrollIndicator={false}
                      >
                        {expandCriteria ||
                        (!expandCriteria && bloodtype !== '') ||
                        !isAtLeastOneCriteriaActive ? (
                          <Pressable
                            onPress={() => {
                              setShowBloodTypeModal(true)
                            }}
                            style={{
                              backgroundColor:
                                bloodtype == '' ? '#DDE1E4' : '#AD88C6',
                              padding: 10,
                              borderRadius: 7,
                              borderBottomLeftRadius: expandCriteria ? 3 : 7,
                              borderBottomRightRadius: expandCriteria ? 3 : 7,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                textAlign: 'left',
                                color: bloodtype == '' ? 'black' : 'white',
                              }}
                            >
                              {bloodtype == ''
                                ? 'Blood type'
                                : `${bloodtype} blood type`}
                            </Text>
                          </Pressable>
                        ) : null}
                        {expandCriteria ||
                        (!expandCriteria && radius !== '') ||
                        !isAtLeastOneCriteriaActive ? (
                          <Pressable
                            onPress={() => {
                              setModifyValue('distance')
                              setShowModal(true)
                              inputRef.current?.focus()
                            }}
                            style={{
                              backgroundColor:
                                radius == '' ? '#DDE1E4' : '#AD88C6',
                              padding: 10,
                              borderRadius: expandCriteria ? 3 : 7,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                textAlign: 'left',
                                color: radius == '' ? 'black' : 'white',
                              }}
                            >
                              {radius == ''
                                ? 'Minimum distance'
                                : `${radius} km radius`}
                            </Text>
                          </Pressable>
                        ) : null}
                        {expandCriteria ||
                        (!expandCriteria && minimumMonths !== '') ||
                        !isAtLeastOneCriteriaActive ? (
                          <Pressable
                            onPress={() => {
                              setModifyValue('months')
                              setShowModal(true)
                              inputRef.current?.focus()
                            }}
                            style={{
                              backgroundColor:
                                minimumMonths == '' ? '#DDE1E4' : '#AD88C6',
                              padding: 10,
                              borderRadius: expandCriteria ? 3 : 7,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                textAlign: 'left',
                                color: minimumMonths == '' ? 'black' : 'white',
                              }}
                            >
                              {minimumMonths} {minimumMonths == '' ? 'M' : 'm'}
                              inimum month
                              {parseInt(minimumMonths) == 1 ? '' : 's'}
                            </Text>
                          </Pressable>
                        ) : null}
                        {expandCriteria ||
                        (!expandCriteria && requireUsersVerified === true) ||
                        !isAtLeastOneCriteriaActive ? (
                          <Pressable
                            onPress={() => {
                              setRequireUsersVerified(!requireUsersVerified)
                            }}
                            style={{
                              backgroundColor:
                                requireUsersVerified == true
                                  ? '#AD88C6'
                                  : '#DDE1E4',
                              padding: 10,
                              borderRadius: expandCriteria ? 3 : 7,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                textAlign: 'left',
                                color:
                                  requireUsersVerified == true
                                    ? 'white'
                                    : 'black',
                              }}
                            >
                              Verification{' '}
                              {requireUsersVerified
                                ? 'required'
                                : 'not required'}
                            </Text>
                          </Pressable>
                        ) : null}
                      </ScrollView>
                    ) : null}
                    {activeHotswap ? (
                      <View
                        style={{
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          width: '90%',
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%',
                            alignSelf: 'center',
                            marginTop: 20,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 20,
                              alignSelf: 'flex-start',
                              fontWeight: 'bold',
                              color: isDarkMode ? 'white' : 'black',
                            }}
                          >
                            Name/Phone
                          </Text>
                          <Pressable onPress={() => setName('')}>
                            <Text
                              style={{
                                fontSize: 18,
                                color: 'red',
                              }}
                            >
                              Clear
                            </Text>
                          </Pressable>
                        </View>
                        <TextInput
                          style={{
                            ...styles.input,
                            width: '100%',
                            alignSelf: 'center',
                            marginTop: 10,
                            borderRadius: 16,
                            backgroundColor: '#fff',
                          }}
                          placeholderTextColor={'grey'}
                          placeholder="Type here"
                          value={name}
                          onChangeText={setName}
                          autoComplete="off"
                          autoCorrect={false}
                        />
                      </View>
                    ) : null}
                    {activeHotswap ? (
                      <FreeButton
                        onPress={() => {
                          queryDonors(false)
                        }}
                        style={{
                          borderRadius: 16,
                          width: '90%',
                          height: 50,
                          justifyContent: 'center',
                        }}
                      >
                        Search!
                      </FreeButton>
                    ) : null}
                  </View>
                ) : null}
                {resultData.length > 0 ? (
                  <Text
                    style={{
                      fontSize: 18,
                      color: isDarkMode ? 'white' : 'black',
                      textAlign: 'left',
                      alignSelf: 'flex-start',
                      margin: 30,
                      marginBottom: 10,
                    }}
                  >
                    {resultData.length.toLocaleString()} donors found in{' '}
                    {(timeTaken / 1000).toFixed(2)} seconds.
                  </Text>
                ) : null}
              </View>
            </View>
          }
          renderItem={({ item }: { item: any }) => (
            <View
              style={{
                width: '90%',
                backgroundColor: isDarkMode ? '#242526' : '#fff',
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                padding: 10,
                marginBottom: 10,
                gap: 10,
              }}
              key={item.uuid}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: isDarkMode ? 'white' : 'black',
                }}
              >
                {item.name}{' '}
                <Text style={{ color: 'red' }}>({item.bloodtype})</Text>
                {'  '}
                {item.affiliated ? '🏥' : ''}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 25,
                  margin: 'auto',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: item.verified ? '#26CD41' : '#FF3B2F',
                  }}
                >
                  {item.verified ? 'Verified' : 'Unverified'}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color:
                      item.distance < 5
                        ? '#35C759'
                        : item.distance < 10
                        ? '#FF9503'
                        : '#FF3B31',
                  }}
                >
                  {formatDistance(item.distance)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 5,
                  justifyContent: 'center',
                  alignSelf: 'flex-start',
                  width: '100%',
                }}
              >
                <View
                  style={{
                    flexDirection: 'column',
                    gap: 5,
                    backgroundColor: isDarkMode ? '#3a3b3c' : '#F3F3F3',
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: isDarkMode ? 'white' : 'black',
                    }}
                  >
                    {convertTimestampToShortString(item.lastdonated)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: isDarkMode ? 'white' : 'black',
                    }}
                  >
                    Last donated
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'column',
                    gap: 5,
                    backgroundColor: isDarkMode ? '#3a3b3c' : '#F3F3F3',
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: isDarkMode ? 'white' : 'black',
                    }}
                  >
                    {item.totaldonations || 0}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: isDarkMode ? 'white' : 'black',
                    }}
                  >
                    Total donations
                  </Text>
                </View>
              </View>
              <Button
                onPress={() => {
                  router.push(`tel:${item.phone}`)
                }}
                style={{
                  alignSelf: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  Call +91 {item.phone}
                </Text>
              </Button>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                }}
              >
                <Button
                  style={{ marginTop: 10 }}
                  onPress={() => {
                    router.push({
                      pathname: '/verifydonor',
                      params: {
                        uuid: item.uuid,
                        bankCode: bankCode,
                        token: token,
                      },
                    })
                  }}
                >
                  {item.verified ? 'View donor' : 'Verify'}
                </Button>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.uuid}
        />
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}
