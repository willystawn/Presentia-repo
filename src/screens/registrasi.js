import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  Linking,
  ToastAndroid,
  Text,
  TouchableHighlight,
  Image,
  TextInput,
} from 'react-native';
import PushNotification, {Importance} from 'react-native-push-notification';
import NetInfo from '@react-native-community/netinfo';
import {StackActions} from '@react-navigation/native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';

import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

import {sha256} from 'react-native-sha256';
import {global} from '../styles/global';
import {Loading} from '../components/loading';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

PushNotification.configure({
  onRegistrationError: function (err) {
    console.error(err.message, err);
  },

  requestPermissions: true,
});

PushNotification.createChannel({
  channelId: 'presentia',
  channelName: 'Presentia Channel',
  channelDescription:
    'Channel untuk menampung notifikasi dari aplikasi Presentia',
  playSound: false,
  soundName: 'default',
  importance: Importance.HIGH,
  vibrate: true,
});

auth()
  .signInAnonymously()
  .then(() => {
    console.log('User signed in anonymously');
  })
  .catch(error => {
    if (error.code === 'auth/operation-not-allowed') {
      console.log('Enable anonymous in your firebase console.');
    }

    console.error(error);
  });

export const Registrasi = ({nav}) => {
  const [loading, setLoading] = useState(true);
  const [process, setProcess] = useState(false);
  const [help, setHelp] = useState(false);
  const [instanceId, setInstanceId] = useState('');
  const [mhsId, setMhsId] = useState('');
  const [msg, setMsg] = useState({
    iconName: 'ab-testing',
    content: '',
    visible: false,
  });

  const getData = async key => {
    const val = await AsyncStorage.getItem(key);
    const data = JSON.parse(val);
    return data;
  };

  let deviceInformation = [
    DeviceInfo.getBrand(),
    DeviceInfo.getDeviceId(),
    DeviceInfo.getUniqueId(),
    DeviceInfo.getTotalMemorySync(),
    DeviceInfo.getTotalDiskCapacitySync(),
    DeviceInfo.getTotalDiskCapacitySync(),
    DeviceInfo.getDisplaySync(),
    DeviceInfo.getDeviceSync(),
  ].join('10072001');

  const checkConnectionDeviceInfoAndDatabases = async () => {
    try {
      const deviceId = await sha256(deviceInformation);

      return await NetInfo.fetch().then(async state => {
        if (!state.isConnected) {
          ToastAndroid.show(
            'Kamu tidak memiliki koneksi internet!',
            ToastAndroid.SHORT,
          );
          return false;
        }

        const serverAccount = await firestore()
          .collection('devices')
          .doc(deviceId)
          .get();

        if (serverAccount.exists) {
          try {
            const account = await getData('@deviceRegistered');
            const instance = await getData('@instance');

            if (account != null) {
              await syncDbToLocal(
                instance,
                account.uniqueId,
                account.kelas,
                false,
              );

              return true;
            }

            return false;
          } catch (error) {
            console.log(error.message);
          }
        }
        return false;
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const storeData = async (key, data) => {
    try {
      const val = JSON.stringify(data);
      await AsyncStorage.setItem(key, val);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const goToHome = () => {
    nav.dispatch(StackActions.replace('TabNavigator'));
  };

  const syncDbToLocal = async (instance, mhsId, mhsKelas, reg) => {
    const localInstance = await storeData('@instance', instance);
    const snapTugas = await firestore()
      .collection('task')
      .doc(instance.instanceId)
      .collection('tugas')
      .where('kelas', '==', mhsKelas)
      .get();

    const tugas = snapTugas.docs.map(doc => doc.data());

    const snapPengumuman = await firestore()
      .collection('announcement')
      .doc(instance.instanceId)
      .collection('pengumuman')
      .get();
    const pengumuman = snapPengumuman.docs.map(doc => doc.data());

    const snapJadwal = await firestore()
      .collection('schedule')
      .doc(instance.instanceId)
      .collection(mhsKelas)
      .get();

    const jadwal = snapJadwal.docs
      .map(doc => doc.data())
      .sort((a, b) => a.id - b.id);

    const jadwalSekarang = jadwal.filter(el => el.id == new Date().getDay());
    const mhs = await firestore()
      .collection('mahasiswa')
      .doc(instance.instanceId)
      .collection('mhs')
      .doc(mhsId)
      .get();

    await messaging()
      .subscribeToTopic(mhsKelas)
      .then(() => console.log('Subscribed to mhs kelas!'));

    await messaging()
      .subscribeToTopic(instance.instanceId)
      .then(() => console.log('Subscribed to instansi'));

    const localAccount = await storeData('@deviceRegistered', mhs._data);

    const task = await storeData('@task', tugas);
    const scheduleToday = await storeData('@scheduleNow', jadwalSekarang);
    const announcement = await storeData('@announcement', pengumuman);
    const schedule = await storeData('@schedule', jadwal);
    if (
      !localAccount ||
      !localInstance ||
      !scheduleToday ||
      !task ||
      !announcement ||
      !schedule
    ) {
      setMsg({
        iconName: 'close-circle',
        content: 'Terjadi kesalahan, mohon coba lagi.',
        visible: true,
      });
      setProcess(false);
      return;
    }

    const activeSchedule = jadwal.filter(el => el.name.length != 0);
    PushNotification.cancelAllLocalNotifications();
    PushNotification.removeAllDeliveredNotifications();

    activeSchedule.forEach(el => {
      el.start.forEach((er, i) => {
        let fireDate = new Date();
        fireDate.setDate(
          fireDate.getDate() + ((parseInt(el.id) + 7 - fireDate.getDay()) % 7),
        );
        let time = er.split('.');

        fireDate.setHours(parseInt(time[0]));
        fireDate.setMinutes(parseInt(time[1]));
        fireDate.setSeconds(0);

        if (el.id != new Date().getDay()) {
          PushNotification.localNotificationSchedule({
            channelId: 'presentia',
            invokeApp: true,
            title: el.name[i],
            message: 'Jangan lupa absen, ya!',
            userInfo: {},
            playSound: false,
            date: fireDate,
            soundName: 'default',
            number: 2,
            allowWhileIdle: true,
          });
          return;
        }

        const now = new Date().getHours() + '.' + new Date().getMinutes();
        if (now <= el.start[i]) {
          PushNotification.localNotificationSchedule({
            channelId: 'presentia',
            invokeApp: true,
            title: el.name[i],
            message: 'Jangan lupa absen ya!',
            userInfo: {},
            playSound: false,
            date: fireDate,
            soundName: 'default',
            number: 2,
            allowWhileIdle: true,
          });
          return;
        }
      });
    });

    if (reg) {
      setMsg({
        iconName: 'check-circle',
        content: 'Perangkat kamu berhasil terdaftar di Presentia!',
        visible: true,
      });
      setProcess(false);
      setTimeout(() => goToHome(), 1000);
    }
  };

  const handleRegistrasi = () => {
    NetInfo.fetch().then(async state => {
      if (!state.isConnected) {
        setMsg({
          iconName: 'google-downasaurus',
          content: 'Tidak ada koneksi internet',
          visible: true,
        });
        return;
      }

      if (instanceId.length == 0 || mhsId.length == 0) {
        setMsg({
          iconName: 'cancel',
          content: 'Mohon masukkan dengan benar',
          visible: true,
        });
        return;
      }

      if (instanceId.length != 10) {
        setMsg({
          iconName: 'pen-off',
          content: 'Kode kampus tidak valid',
          visible: true,
        });
        return;
      }

      if (mhsId.length > 12 || mhsId.length < 3) {
        setMsg({
          iconName: 'cancel',
          content: 'Kode mahasiswa tidak valid',
          visible: true,
        });
        return;
      }

      setProcess(true);
      const mainInstance = await firestore()
        .collection('instance')
        .doc(instanceId)
        .get();

      if (!mainInstance.exists) {
        setMsg({
          iconName: 'domain-off',
          content: 'Kampus tidak terdaftar',
          visible: true,
        });
        setProcess(false);
        return;
      }

      const instance = await firestore()
        .collection('mahasiswa')
        .doc(instanceId)
        .collection('mhs')
        .doc(mhsId)
        .get();

      if (!instance.exists) {
        setMsg({
          iconName: 'account-off-outline',
          content: 'Mahasiswa tidak terdaftar di kampus',
          visible: true,
        });
        setProcess(false);
        return;
      }

      const deviceEntry = await sha256(deviceInformation);

      if (
        instance._data.device.length > 1 &&
        instance._data.device != deviceEntry
      ) {
        setMsg({
          iconName: 'account-off-outline',
          content: 'Mahasiswa sudah di daftarkan di perangkat lain',
          visible: true,
        });
        setProcess(false);
        return;
      }

      if (instance._data.device == deviceEntry) {
        syncDbToLocal(
          mainInstance._data,
          instance._data.uniqueId,
          instance._data.kelas,
          true,
        );
        return;
      }

      const devices = await firestore()
        .collection('devices')
        .doc(deviceEntry)
        .get();

      if (devices.exists) {
        setMsg({
          iconName: 'cellphone-off',
          content: 'Perangkat sudah dipakai oleh mahasiswa lain.',
          visible: true,
        });
        setProcess(false);
        return;
      }

      try {
        firestore()
          .collection('devices')
          .doc(deviceEntry)
          .set({
            id: deviceEntry,
          })
          .then(() => {
            console.log('New Devices added!');
          });

        firestore()
          .collection('mahasiswa')
          .doc(instanceId)
          .collection('mhs')
          .doc(mhsId)
          .update({
            device: deviceEntry,
          })
          .then(() => {
            console.log('Mahasiswa registered!');
          });

        syncDbToLocal(
          mainInstance.data(),
          instance._data.uniqueId,
          instance._data.kelas,
          true,
        );
      } catch (e) {
        console.log(e.message);
      }
    });
  };

  const registerDevice = () => (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={[global.container, global.bgMain]}
      contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
      {!process && (
        <>
          <Text
            style={{
              ...global.sliderTitle,
              ...global.txtWhite,
              marginBottom: 0,
            }}>
            Registrasi Perangkat
          </Text>
          <Image
            source={require('../assets/illust/nim.png')}
            style={{...global.sliderImage, height: 200}}
          />

          <Text
            style={{...global.sliderText, ...global.txtWhite, fontSize: 18}}>
            Kode kampus
          </Text>

          <TextInput
            maxLength={10}
            value={instanceId}
            clearButtonMode="always"
            onChangeText={val => {
              setInstanceId(val);
              AsyncStorage.setItem('@inputInstance', val);
            }}
            style={global.input}
            placeholderTextColor={'#FFFFFF'}
          />

          <Text
            style={{...global.sliderText, ...global.txtWhite, fontSize: 18}}>
            Nomor identitas
          </Text>
          <TextInput
            maxLength={12}
            value={mhsId}
            onChangeText={val => {
              setMhsId(val);
              AsyncStorage.setItem('@inputMhs', val);
            }}
            clearButtonMode="always"
            style={global.input}
            placeholderTextColor={'#FFFFFF'}
          />

          <View style={global.pressableContainer}>
            <TouchableHighlight
              onPress={handleRegistrasi}
              activeOpacity={0.7}
              underlayColor="#EEE"
              style={global.pressableInnerContainer}>
              <Text style={{...global.cardTextMain, fontSize: 18}}>
                Selesaikan Registrasi
              </Text>
            </TouchableHighlight>
          </View>
        </>
      )}

      {process && <Loading green={true} />}

      {/* First modal */}
      <Modal
        backdropColor="#111"
        backdropOpacity={0.2}
        onBackdropPress={() => setMsg({visible: false})}
        onBackButtonPress={() => setMsg({visible: false})}
        testID={'modal'}
        style={{justifyContent: 'flex-end'}}
        isVisible={msg.visible}
        onSwipeComplete={() => setMsg({visible: false})}
        swipeDirection={['down', 'up', 'right', 'left']}>
        <View style={global.modalContainer}>
          <MaterialCommunityIcons
            name={msg.iconName}
            size={50}
            color="#119DA4"
          />
          <Text style={[global.catTitle, {textAlign: 'center'}]}>
            {msg.content}
          </Text>
        </View>
      </Modal>

      {/* Second modal */}
      <Modal
        testID={'modal'}
        onSwipeComplete={() => setHelp(false)}
        swipeDirection={['down', 'up', 'right', 'left']}
        backdropColor="#111"
        style={{justifyContent: 'flex-end'}}
        backdropOpacity={0.2}
        onBackdropPress={() => setHelp(false)}
        onBackButtonPress={() => setHelp(false)}
        isVisible={help}>
        <View style={[global.modalContainer, {textAlign: 'left'}]}>
          <Text style={global.catTitle}>Bantuan</Text>
          <Text style={[global.cardTextGrey, {textAlign: 'left'}]}>
            Kode kampus adalah kode unik yang diberikan kepada admin yang
            mendaftarkan kampusnya.{'\n\n'}
            Nomor identitas merupakan nomor unik yang membedakan kamu dengan
            orang lain dalam satu kampus.{'\n\n'}
            Hubungi admin kampusmu untuk mendapatkan kode kampus dan nomor
            identitas kamu.{'\n\n'}
            Hubungi admin kampusmu jika kamu ingin melakukan penyetelan ulang
            perangkat yang telah terdaftar di Presentia.{'\n\n'}
            <Text
              style={[
                global.cardTextGrey,
                {textDecorationLine: 'underline', textAlign: 'left'},
              ]}
              onPress={() =>
                Linking.openURL('http://presentia.stmikkomputama.ac.id/')
              }>
              Selengkapnya
            </Text>
          </Text>
          <View style={{flexDirection: 'row'}}>
            <TouchableHighlight
              style={global.modalHelpBtn}
              activeOpacity={0.7}
              underlayColor="#3AACB8"
              onPress={() => setHelp(false)}>
              <Text style={global.modalBtnText}>Mengerti</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
      <View style={global.outerHelp}>
        <TouchableHighlight
          activeOpacity={0.7}
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 50,
          }}
          underlayColor="#DDD"
          onPress={() => setHelp(true)}>
          <MaterialCommunityIcons name="help" size={22} color="#119DA4" />
        </TouchableHighlight>
      </View>
    </ScrollView>
  );

  useEffect(async () => {
    const registered = await checkConnectionDeviceInfoAndDatabases();
    if (registered) {
      return goToHome();
    }
    AsyncStorage.getItem('@inputMhs')
      .then(value => {
        if (value !== null) {
          setMhsId(value);
        }
      })
      .done();

    AsyncStorage.getItem('@inputInstance')
      .then(value => {
        if (value !== null) {
          setInstanceId(value);
        }
      })
      .done();

    setLoading(false);
  }, [deviceInformation]);

  return <>{loading ? <Loading green={true} /> : registerDevice()}</>;
};
