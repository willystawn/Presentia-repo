import React, {useState, useEffect, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  View,
  Text,
  RefreshControl,
  ScrollView,
  ToastAndroid,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import {Header} from '../components/header';

import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');
import Modal from 'react-native-modal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {global} from '../styles/global';
import {CardTugas} from '../components/cardTugas';
import {CardPengumuman} from '../components/cardPengumuman';
import {Empty} from '../components/empty';
import {Loading} from '../components/loading';

import dateConvert from '../modules/dateConvert.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import firestore from '@react-native-firebase/firestore';

const getData = async key => {
  const val = await AsyncStorage.getItem(key);
  const data = JSON.parse(val);
  return data;
};

export const Beranda = ({route, nav}) => {
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [spengumuman, setSPengumuman] = useState([]);
  const [sjadwal, setSJadwal] = useState([]);
  const [stugas, setSTugas] = useState([]);
  const [data, setData] = useState(['', '', '']);
  const [smhs, setSMhs] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [meet, setMeet] = useState({});

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    firstReload(true).then(() => setRefreshing(false));
  }, []);

  const firstReload = async (internet = false) => {
    const connection = await NetInfo.fetch();

    try {
      let tugas, sekarang, pengumuman;
      let main = await getData('@instance');
      let mhs = await getData('@deviceRegistered');

      if (internet) {
        if (!connection.isConnected) {
          return ToastAndroid.show(
            'Tidak ada koneksi internet',
            ToastAndroid.SHORT,
          );
        }

        const mainSnap = await firestore()
          .collection('instance')
          .doc(main.instanceId)
          .get();
        main = mainSnap.data();

        const mhsSnap = await firestore()
          .collection('mahasiswa')
          .doc(main.instanceId)
          .collection('mhs')
          .doc(mhs.uniqueId)
          .get();
        mhs = mhsSnap.data();

        const snapPengumuman = await firestore()
          .collection('announcement')
          .doc(main.instanceId)
          .collection('pengumuman')
          .get();
        pengumuman = snapPengumuman.docs.map(doc => doc.data());

        const snapTugas = await firestore()
          .collection('task')
          .doc(main.instanceId)
          .collection('tugas')
          .get();
        tugas = snapTugas.docs.map(doc => doc.data());

        const snapJadwal = await firestore()
          .collection('schedule')
          .doc(main.instanceId)
          .collection(mhs.kelas)
          .get();

        const jadwal = snapJadwal.docs
          .map(doc => doc.data())
          .sort((a, b) => a.id - b.id);
        sekarang = jadwal.filter(el => el.id == new Date().getDay());
      } else {
        tugas = await getData('@task');
        sekarang = await getData('@scheduleNow');
        pengumuman = await getData('@announcement');
      }

      if (mhs == null || main == null) {
        ToastAndroid.show('Anda tidak terdaftar', ToastAndroid.SHORT);
        AsyncStorage.removeItem('@instance');
        AsyncStorage.removeItem('@deviceRegistered');
        return BackHandler.exitApp();
      }

      setSPengumuman(pengumuman);
      setSTugas(tugas);

      setSJadwal(sekarang);
      setSMhs(mhs);
      setData([mhs.name, mhs.uniqueId, main.instanceName]);

      NetInfo.fetch().then(async state => {
        if (!state.isConnected) {
          if (!state.isConnected) {
            return true;
          }
          const absentRecords = await firestore()
            .collection('absent')
            .doc(instance.instanceId)
            .collection(Mhs.kelas)
            .doc('absensi')
            .get();

          const meet = absentRecords.data();
          setMeet(meet);

          return true;
        }
      });

      if (internet) {
        ToastAndroid.show('Berhasil memperbarui', ToastAndroid.SHORT);
      }

      return true;
    } catch (e) {
      ToastAndroid.show(`Terjadi kesalahan: ${e.message}`, ToastAndroid.SHORT);
      return false;
    }
  };

  const tugas = stugas
    .sort((a, b) => {
      let el = dateConvert(a, b);
      return el[1] - el[0];
    })
    .filter(el => {
      const deadlineReverse = el.deadline.split('/').reverse().join('/');
      const estimatedDeadline = Math.ceil(
        (new Date(deadlineReverse).getTime() - new Date().getTime()) /
          (1000 * 3600 * 24),
      );
      return estimatedDeadline > 0;
    })[0];

  const pengumuman = spengumuman
    .sort((a, b) => {
      let el = dateConvert(a, b);
      return el[1] - el[0];
    })
    .filter(el => {
      const deadlineReverse = el.created.split('/').reverse().join('/');
      const estimatedDeadline = Math.ceil(
        (new Date().getTime() - new Date(deadlineReverse).getTime()) /
          (1000 * 3600 * 24),
      );
      return estimatedDeadline < 14;
    })[0];

  const today = sjadwal[0];

  const renderToday = () =>
    today?.start.map((el, id) => {
      const isAbsent =
        smhs[today?.name[id]]?.length == meet[today?.name[id]]?.length
          ? true
          : false;

      const absentStatus = isAbsent ? (
        <Text style={global.cardTextSuccess}>Sudah Absen</Text>
      ) : (
        <Text style={global.cardTextDanger}>Belum Absen</Text>
      );

      return (
        <View key={today?.name[id]} style={global.jadwalContainer}>
          <View style={global.jadwalStatusBelum}>{absentStatus}</View>
          <View style={{flex: 1, flexGap: 0}}>
            <Text style={{...global.cardTextMain, flex: 1}}>
              • {today?.start[id]}-{today?.end[id]}
              {'\n'}• {today?.name[id]}
            </Text>
          </View>
        </View>
      );
    });

  useEffect(() => {
    const waitContent = firstReload();
    if (waitContent) {
      setLoading(false);
    }

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      PushNotification.localNotification({
        channelId: 'Presentia',
        invokeApp: true,
        title: `Halo, ${data[0]}`,
        message: 'Kamu mempunyai informasi baru. Ketuk untuk membuka',
        userInfo: {},
        playSound: true,
        soundName: 'default',
        number: 10,
      });
    });

    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        setModal(true);
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, []),
  );

  return loading ? (
    <Loading />
  ) : (
    <ScrollView
      style={{flex: 1}}
      refreshControl={
        <RefreshControl
          colors={['#119DA4']}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      contentContainerStyle={{paddingBottom: 70}}>
      <Header title="Beranda" description={data[0] + ' • ' + data[1]} />
      <View style={{flex: 0.7}}>
        <View style={global.wrapper}>
          <Text style={global.catTitle}>{data[2]} •</Text>
        </View>
        <View style={global.wrapper}>
          <Text style={global.catTitle}>Jadwal Hari Ini</Text>
        </View>

        {today?.name.length != 0 && (
          <View style={global.wrapper}>
            <View style={global.card}>
              <Text style={global.cardTextGrey}>
                Halo, {data[0].split(' ')[0]}! Jangan lupa absen ya{' '}
              </Text>
              <View style={global.divider} />
              {renderToday()}
            </View>
          </View>
        )}
        {today?.name?.length == 0 && <Empty msg="Tidak ada jadwal hari ini" />}

        <View style={global.wrapper}>
          <Text style={global.catTitle}>Pengumuman Terbaru</Text>
        </View>

        {pengumuman && (
          <CardPengumuman
            key={pengumuman.title}
            title={pengumuman.title}
            content={pengumuman.content}
            file={pengumuman.file}
            url={pengumuman.url}
            type={pengumuman.type}
            created={pengumuman.created}
            accorn={false}
          />
        )}
        {!pengumuman && <Empty msg="Tidak ada pengumuman terbaru" />}

        <View style={global.wrapper}>
          <Text style={global.catTitle}>Tugas Terbaru</Text>
        </View>

        {tugas && (
          <CardTugas
            key={tugas.title}
            category={tugas.category}
            title={tugas.title}
            content={tugas.content}
            file={tugas.file}
            url={tugas.url}
            type={tugas.type}
            created={tugas.created}
            accorn={false}
            deadline={tugas.deadline}
          />
        )}
        {!tugas && <Empty msg="Tidak ada tugas terbaru" />}
        <Modal
          backdropColor="#111"
          backdropOpacity={0.2}
          onBackdropPress={() => setModal(false)}
          onBackButtonPress={() => setModal(false)}
          testID={'modal'}
          style={{justifyContent: 'flex-end'}}
          isVisible={modal}
          onSwipeComplete={() => setModal(false)}
          swipeDirection={['down', 'up', 'right', 'left']}>
          <View style={global.modalContainer}>
            <MaterialCommunityIcons
              name="emoticon-cry-outline"
              size={50}
              color="#119DA4"
            />
            <Text style={global.catTitle}>
              Apakah kamu yakin ingin meninggalkan Presentia?
            </Text>
            <View style={{flexDirection: 'row', marginTop: 15}}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => BackHandler.exitApp()}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  marginHorizontal: 5,
                  backgroundColor: '#FFF',
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: '#119DA4',
                    fontFamily: 'Sarabun-Bold',
                    fontSize: 15,
                  }}>
                  Tutup Presentia
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#119DA4',
                  paddingVertical: 10,
                  borderRadius: 10,
                  marginHorizontal: 5,
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: '#FFF',
                    fontFamily: 'Sarabun-Bold',
                    fontSize: 15,
                  }}>
                  Batal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};
