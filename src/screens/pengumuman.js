import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  RefreshControl,
  TouchableWithoutFeedback,
  ToastAndroid,
  BackHandler,
} from 'react-native';
import {Header} from '../components/header';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {global} from '../styles/global';
import {CardPengumuman} from '../components/cardPengumuman';
import {Loading} from '../components/loading';
import NetInfo from '@react-native-community/netinfo';

import dateConvert from '../modules/dateConvert';
import {Empty} from '../components/empty';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

export const Pengumuman = ({route, nav}) => {
  const [query2, setQuery2] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [spengumuman, setSPengumuman] = useState([]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    firstReload(true).then(() => setRefreshing(false));
  }, []);

  const backAction = () => {
    nav.navigate('Beranda');
    return true;
  };

  const refInput2 = useRef();

  const getData = async key => {
    const val = await AsyncStorage.getItem(key);
    const data = JSON.parse(val);
    return data;
  };

  const firstReload = async (internet = false) => {
    const connection = await NetInfo.fetch();

    try {
      const mhs = await getData('@deviceRegistered');
      let pengumuman;

      if (internet) {
        let main = await getData('@instance');

        if (!connection.isConnected) {
          return ToastAndroid.show(
            'Tidak ada koneksi internet',
            ToastAndroid.SHORT,
          );
        }

        const snapPengumuman = await firestore()
          .collection('announcement')
          .doc(main.instanceId)
          .collection('pengumuman')
          .get();
        pengumuman = snapPengumuman.docs.map(doc => doc.data());
      } else {
        pengumuman = await getData('@announcement');
      }

      if (mhs == null) {
        ToastAndroid.show('Anda tidak terdaftar', ToastAndroid.SHORT);
        await AsyncStorage.removeItem('@deviceRegistered');
        return BackHandler.exitApp();
      }

      setSPengumuman(pengumuman);
      return true;
    } catch (e) {
      ToastAndroid.show(`Terjadi kesalahan: ${e.message}`, ToastAndroid.SHORT);
      return false;
    }
  };

  useEffect(() => {
    const waitContent = firstReload();

    if (waitContent) setLoading(false);
    BackHandler.addEventListener('hardwareBackPressa', backAction);

    return () =>
      BackHandler.removeEventListener('hardwareBackPressa', backAction);
  }, []);

  const renderPengumuman = () =>
    spengumuman
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
      })
      .filter(el => el.title.toLowerCase().includes(query2.toLowerCase()))
      .map(el => {
        return (
          <CardPengumuman
            key={el.title}
            title={el.title}
            content={el.content}
            file={el.file}
            url={el.url}
            type={el.type}
            created={el.created}
          />
        );
      });

  const pengumumanExist = renderPengumuman();

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
      <Header title="Pengumuman" description="Pengumuman 14 hari terakhir" />
      <View style={{flex: 0.7}}>
        <View style={global.wrapper}>
          <Text style={global.catTitle}>Cari Pengumuman</Text>
        </View>
        <View style={global.wrapper}>
          <TouchableWithoutFeedback onPress={() => refInput2.current.focus()}>
            <View
              style={{
                ...global.card,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
                elevation: 0,
                borderColor: '#119DA4',
              }}>
              <Text>
                <MaterialCommunityIcons name="magnify" color="#AAA" size={20} />
              </Text>
              <TextInput
                style={{...global.cardLabel, fontSize: 15, padding: 0}}
                placeholder="Cari di sini..."
                maxLength={25}
                placeholderTextColor="#AAA"
                ref={refInput2}
                onChangeText={query => setQuery2(query)}
                underlineColorAndroid="transparent"
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
        {pengumumanExist && renderPengumuman()}
        {pengumumanExist.length == 0 && (
          <Empty
            msg={
              query2.length != 0
                ? "Pencarian '" + query2 + "' tidak ditemukan"
                : 'Tidak ada pengumuman terbaru'
            }
          />
        )}
      </View>
    </ScrollView>
  );
};
