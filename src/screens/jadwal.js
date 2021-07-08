import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  BackHandler,
  ToastAndroid,
  RefreshControl,
} from 'react-native';
import {Header} from '../components/header';

import {global} from '../styles/global';
import {CardJadwal} from '../components/cardJadwal';
import {Empty} from '../components/empty';
import {Loading} from '../components/loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';

export const Jadwal = ({route, nav}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sjadwal, setSJadwal] = useState([]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    firstReload(true).then(() => setRefreshing(false));
  }, []);

  const backAction = () => {
    nav.navigate('Beranda');
    return true;
  };

  const getData = async key => {
    const val = await AsyncStorage.getItem(key);
    const data = JSON.parse(val);
    return data;
  };

  const listJadwal = sjadwal;

  const now = new Date().getDay();
  const tomorrowSchedule = listJadwal.find(
    day => day.id == (now == 6 ? 0 : now + 1),
  );

  const firstReload = async (internet = false) => {
    const connection = await NetInfo.fetch();

    try {
      const mhs = await getData('@deviceRegistered');
      let jadwal;

      if (internet) {
        let main = await getData('@instance');

        if (!connection.isConnected) {
          return ToastAndroid.show(
            'Tidak ada koneksi internet',
            ToastAndroid.SHORT,
          );
        }
        const snapJadwal = await firestore()
          .collection('schedule')
          .doc(main.instanceId)
          .collection(mhs.kelas)
          .get();

        jadwal = snapJadwal.docs
          .map(doc => doc.data())
          .sort((a, b) => a.id - b.id);
      } else {
        jadwal = await getData('@schedule');
      }

      if (mhs == null) {
        ToastAndroid.show('Anda tidak terdaftar', ToastAndroid.SHORT);
        await AsyncStorage.removeItem('@deviceRegistered');
        return BackHandler.exitApp();
      }

      const cjadwal = jadwal.filter(el => el.name.length != 0);
      setSJadwal(cjadwal);

      return true;
    } catch (e) {
      ToastAndroid.show(`Terjadi kesalahan: ${e.message}`, ToastAndroid.SHORT);
      return false;
    }
  };

  useEffect(() => {
    const waitContent = firstReload();

    if (waitContent) setLoading(false);
    BackHandler.addEventListener('hardwareBackPressd', backAction);

    return () =>
      BackHandler.removeEventListener('hardwareBackPressd', backAction);
  }, []);

  const renderTomorrowSchedule = name =>
    name.map((el, id) => {
      return (
        <Text key={el} style={global.cardTextMain}>
          <Text style={global.cardTextGrey}>
            {tomorrowSchedule?.start[id]}-{tomorrowSchedule?.end[id]}
          </Text>{' '}
          • {el}
        </Text>
      );
    });

  const changedSchedule = listJadwal
    .filter(el => el.changed)
    .filter(el => {
      const deadlineReverse = el.lastChangedAt.split('/').reverse().join('/');
      const estimatedDeadline = Math.ceil(
        (new Date(deadlineReverse).getTime() - new Date().getTime()) /
          (1000 * 3600 * 24),
      );
      return estimatedDeadline < 7;
    });

  const renderChangedSchedule = () =>
    changedSchedule.map(el => (
      <View key={el.id} style={global.wrapper}>
        <View style={global.card}>
          <Text style={global.cardTextGrey}>{el.day} </Text>
          <View style={global.divider} />
          {el.name.map((er, id) => (
            <Text key={el.name[id]} style={global.cardTextMain}>
              <Text style={global.cardTextGrey}>
                {el.start[id]}-{el.end[id]}
              </Text>{' '}
              • {el.name[id]}
            </Text>
          ))}
        </View>
      </View>
    ));

  return loading ? (
    <Loading />
  ) : (
    <ScrollView
      refreshControl={
        <RefreshControl
          colors={['#119DA4']}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      style={{flex: 1}}
      contentContainerStyle={{paddingBottom: 70}}>
      <Header
        title="Jadwal"
        description="Jadwal terkini dengan perubahan terbaru"
      />
      <View style={{flex: 0.7}}>
        <View style={global.wrapper}>
          <Text style={global.catTitle}>Minggu Ini</Text>
        </View>

        {listJadwal.length > 0 && <CardJadwal data={listJadwal} />}
        {!listJadwal.length > 0 && <Empty msg="Tidak ada jadwal minggu ini" />}

        {changedSchedule.length != 0 && (
          <View style={global.wrapper}>
            <Text style={global.catTitle}>Perubahan Terbaru</Text>
          </View>
        )}
        {changedSchedule && renderChangedSchedule()}

        <View style={global.wrapper}>
          <Text style={global.catTitle}>Jadwal Besok</Text>
        </View>

        {tomorrowSchedule && (
          <View style={global.wrapper}>
            <View style={global.card}>
              <Text style={global.cardTextGrey}>{tomorrowSchedule.day}</Text>
              <View style={global.divider} />

              {renderTomorrowSchedule(tomorrowSchedule.name)}
            </View>
          </View>
        )}

        {!tomorrowSchedule && <Empty msg="Tidak ada jadwal untuk besok" />}
      </View>
    </ScrollView>
  );
};
