import FreeButton from '@/components/FreeButton'
import { Octicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  Pressable,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Progress from 'react-native-progress'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from '../../assets/styles/styles'
export default function Three({
  navigation,
  route,
}: {
  navigation: any
  route: any
}) {
  let [conditions, setConditions] = useState<string>(
    route.params?.conditions || ''
  )
  let [medications, setMedications] = useState<string>(
    route.params?.medications || ''
  )
  let [showConditions, setShowConditions] = useState<boolean>(false)
  let [showMedications, setShowMedications] = useState<boolean>(false)
  delete route.params?.conditions
  delete route.params?.medications

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
            <Pressable
              onPress={() => {
                Alert.alert(
                  'Are you sure?',
                  'Going back will reset your progress.',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Yes',
                      style: 'destructive',
                      onPress: () => {
                        router.replace('/')
                      },
                    },
                  ]
                )
              }}
            >
              <Octicons name="arrow-left" size={24} color={responsiveDark} />
            </Pressable>
            <Text
              style={{
                fontSize: 24,
                textAlign: 'center',
                color: '#7469B6',
                fontFamily: 'PlayfairDisplay_600SemiBold',
              }}
            >
              Open Blood
            </Text>
          </View>
          <Progress.Bar
            progress={0.6}
            width={300}
            height={10}
            color="#7469B6"
            borderRadius={10}
          />
        </View>
        <Text
          style={{
            fontSize: 28,
            textAlign: 'left',
            marginBottom: 20,
            fontFamily: 'PlayfairDisplay_600SemiBold',
            color: '#7469B6',
          }}
        >
          Conditions
        </Text>

        <View
          style={{
            width: '80%',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              marginBottom: 30,
              color: responsiveDark,
              fontFamily: 'S',
            }}
          >
            If you do not have any medical conditions or take any medications,
            you can skip this step.
          </Text>
          <Text
            style={{
              fontSize: 18,
              marginBottom: 20,
              color: responsiveDark,
            }}
          >
            Do you have any medical conditions?
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 20,
              alignSelf: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 18,
              }}
            >
              No
            </Text>
            <Switch value={showConditions} onValueChange={setShowConditions} />
            <Text
              style={{
                fontSize: 18,
              }}
            >
              Yes
            </Text>
          </View>
          {showConditions ? (
            <>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 20,
                  marginTop: 10,
                  color: 'gray',
                }}
              >
                This includes Epilepsy, Fainting, Heart Disease, Leprosy,
                Tuberculosis, Kidney Disease, Cancer, Diabetes-on insulin,
                Endocrine Disease, Hypo/Hypertension, Abnormal bleeding
                tendencies
              </Text>
              <TextInput
                style={{ ...styles.input, height: 100 }}
                value={conditions}
                placeholderTextColor={'grey'}
                onChangeText={setConditions}
                autoComplete="off"
                multiline={true}
                placeholder="Enter your conditions here"
              />
            </>
          ) : null}
          <Text
            style={{
              fontSize: 18,
              marginBottom: 20,
              color: responsiveDark,
            }}
          >
            Do you take any chronic medications?
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 20,
              alignSelf: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 18,
              }}
            >
              No
            </Text>
            <Switch
              value={showMedications}
              onValueChange={setShowMedications}
            />
            <Text
              style={{
                fontSize: 18,
              }}
            >
              Yes
            </Text>
          </View>

          {showMedications ? (
            <TextInput
              style={{ ...styles.input, height: 100 }}
              value={medications}
              placeholderTextColor={'grey'}
              onChangeText={setMedications}
              autoComplete="off"
              multiline={true}
              placeholder="Enter your medications here"
            />
          ) : null}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <FreeButton
            onPress={() => {
              navigation.navigate(`two`, {
                ...route.params,
                conditions,
                medications,
              })
            }}
            style={{
              width: '25%',
            }}
          >
            Back
          </FreeButton>
          <FreeButton
            onPress={() => {
              navigation.navigate(`four`, {
                ...route.params,
                conditions: showConditions ? conditions : '',
                medications: showMedications ? medications : '',
              })
            }}
            style={{
              width: '40%',
            }}
            disabled={
              (showConditions && conditions.trim() == '') ||
              (showMedications && medications.trim() == '')
                ? true
                : false
            }
          >
            Next
          </FreeButton>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  )
}
