import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  BackHandler,
  TextInput,
  ToastAndroid,
  TouchableWithoutFeedback,
} from 'react-native';
import {Header} from '../components/header';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {global} from '../styles/global';
import {CardTugas} from '../components/cardTugas';
import {Loading} from '../components/loading';
import NetInfo from '@react-native-community/netinfo';

import dateConvert from '../modules/dateConvert.js';
import {Empty} from '../components/empty';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

export const Tugas = ({route, nav}) => {
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stugas, setSTugas] = useState([]);
  const refInput = useRef();

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

  const firstReload = async (internet = false) => {
    const connection = await NetInfo.fetch();

    try {
      const mhs = await getData('@deviceRegistered');
      let tugas;

      if (internet) {
        let main = await getData('@instance');

        if (!connection.isConnected) {
          return ToastAndroid.show(
            'Tidak ada koneksi internet',
            ToastAndroid.SHORT,
          );
        }
        const snapTugas = await firestore()
          .collection('task')
          .doc(main.instanceId)
          .collection('tugas')
          .where('kelas', '==', mhs.kelas)
          .get();
        tugas = snapTugas.docs.map(doc => doc.data());
      } else {
        tugas = await getData('@task');
      }
      if (mhs == null) {
        ToastAndroid.show('Anda tidak terdaftar', ToastAndroid.SHORT);
        await AsyncStorage.removeItem('@deviceRegistered');
        return BackHandler.exitApp();
      }

      setSTugas(tugas);
      return true;
    } catch (e) {
      ToastAndroid.show(`Terjadi kesalahan: ${e.message}`, ToastAndroid.SHORT);
      return false;
    }
  };

  useEffect(() => {
    const waitContent = firstReload();

    if (waitContent) setLoading(false);
    BackHandler.addEventListener('hardwareBackPressc', backAction);

    return () =>
      BackHandler.removeEventListener('hardwareBackPressc', backAction);
  }, []);

  // Rendertugas
  const renderTugas = () =>
    stugas
      .sort((a, b) => {
        let el = dateConvert(a, b, true);
        return el[0] - el[1];
      })
      .filter(el => {
        const deadlineReverse = el.deadline.split('/').reverse().join('/');
        const estimatedDeadline = Math.ceil(
          (new Date(deadlineReverse).getTime() - new Date().getTime()) /
            (1000 * 3600 * 24),
        );
        return estimatedDeadline > 0;
      })
      .filter(
        el =>
          el.title.toLowerCase().includes(query.toLowerCase()) ||
          el.category.toLowerCase().includes(query.toLowerCase()),
      )
      .map((el, id, arr) => {
        return (
          <CardTugas
            key={el.title}
            category={el.category}
            categoryOne={el.category == arr[id - 1]?.category ? false : true}
            title={el.title}
            content={el.content}
            file={el.file}
            url={el.url}
            type={el.type}
            deadline={el.deadline}
          />
        );
      });

  const tugasExist = renderTugas();
  return loading ? (
    <Loading green={true} />
  ) : (
    <ScrollView
      refreshControl={
        <RefreshControl
          colors={['#119DA4']}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      keyboardShouldPersistTaps="handled"
      style={{flex: 1}}
      contentContainerStyle={{paddingBottom: 70}}>
      <Header title="Tugas" description="Tugas dengan tenggat waktu aktif" />
      <View style={{flex: 0.7}}>
        <View style={global.wrapper}>
          <Text style={global.catTitle}>Cari Tugas</Text>
        </View>
        <View style={global.wrapper}>
          <TouchableWithoutFeedback onPress={() => refInput.current.focus()}>
            <View
              style={{
                ...global.card,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                backgroundColor: 'transparent',
                elevation: 0,
                borderColor: '#119DA4',
              }}>
              <Text>
                <MaterialCommunityIcons name="magnify" color="#AAA" size={20} />
              </Text>
              <TextInput
                style={{
                  ...global.cardLabel,
                  fontSize: 15,
                  paddingVertical: 0,
                  width: 'auto',
                }}
                placeholder="Cari di sini..."
                maxLength={25}
                placeholderTextColor="#AAA"
                ref={refInput}
                onChangeText={query => setQuery(query)}
                underlineColorAndroid="transparent"
              />
            </View>
          </TouchableWithoutFeedback>
        </View>

        {tugasExist && renderTugas()}
        {tugasExist.length == 0 && (
          <Empty
            msg={
              query.length != 0
                ? "Pencarian '" + query + "' tidak ditemukan"
                : 'Tidak ada tugas terbaru'
            }
          />
        )}
      </View>
    </ScrollView>
  );
};
