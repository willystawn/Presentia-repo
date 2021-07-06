import React, {useState, useEffect, useCallback, useRef} from 'react';
import moment from 'moment';
import 'moment/locale/id';
import {
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  Linking,
  TextInput,
  BackHandler,
  useWindowDimensions,
  Animated,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  ToastAndroid,
  View,
} from 'react-native';

import Geolocation from 'react-native-geolocation-service';
import NetInfo from '@react-native-community/netinfo';
import Modal from 'react-native-modal';
import {Loading} from '../components/loading';

import {global} from '../styles/global';
import {Header} from '../components/header';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {CountdownCircleTimer} from 'react-native-countdown-circle-timer';
import DeviceInfo from 'react-native-device-info';
import {sha256} from 'react-native-sha256';
import {inside} from '../modules/pointInPolygon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

moment.locale('id');

export const Absen = ({route, nav}) => {
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

  const {width} = useWindowDimensions();

  const [progress, setProgress] = useState(0);
  const [absentStatus, setAbsentStatus] = useState(false);
  const [statusText, setStatusText] = useState(' ');
  const [curLoc, setCurLoc] = useState(false);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trio, setTrio] = useState({});
  const [sinstansi, setSInstansi] = useState({});

  const [absening, setAbsening] = useState(false);
  const [countDown, setCountDown] = useState(false);
  const [currentMatkul, setCurrentMatkul] = useState({});
  const [mhs, setMhs] = useState({});
  const [absentNeed, setAbsentNeed] = useState([]);
  const [stat, setStat] = useState({});

  const backAction = () => {
    nav.navigate('Beranda');
    return true;
  };

  const [absenInput, setAbsenInput] = useState('');

  const watchId = useRef(null);
  UIManager.setLayoutAnimationEnabledExperimental(true);

  const getData = async key => {
    const val = await AsyncStorage.getItem(key);
    const data = JSON.parse(val);
    return data;
  };

  const firstReload = async () => {
    try {
      const Mhs = await getData('@deviceRegistered');
      const instance = await getData('@instance');
      const absentRecords = await firestore()
        .collection('absent')
        .doc(instance.instanceId)
        .collection(Mhs.kelas)
        .doc('absensi')
        .get();

      const meet = absentRecords.data();
      const jadwal = await getData('@scheduleNow');

      if ((Mhs == null) | (instance == null)) {
        ToastAndroid.show('Anda tidak terdaftar', ToastAndroid.SHORT);
        await AsyncStorage.removeItem('@deviceRegistered');
        BackHandler.exitApp();
        return;
      }

      const today = jadwal;

      if (!today) {
        setAbsening(true);
        setStatusText('Tidak ada absensi hari ini');
        return true;
      }

      const now = moment().format('LT');
      const currentExist = today[0]?.name.filter(
        (el, id) => now > today[0].start[id] && now < today[0].end[id],
      );

      let checkAbsent;
      if (currentExist.length == 0) {
        setStatusText(' ');
        setCurrentMatkul({noAbsence: true});
        setAbsening(true);
      } else {
        const currentIndex = today[0].name.indexOf(currentExist[0]);
        setCurrentMatkul({
          start: today[0].start[currentIndex],
          end: today[0].end[currentIndex],
          name: currentExist[0],
          onlineAbsent: today[0].onlineAbsent[currentIndex],
        });
        setSInstansi(instance);
        setMhs(Mhs);

        checkAbsent = meet[currentExist];
      }

      const statAbsen = Object.keys(meet)
        .map(el => Mhs[el])
        .flat();

      const statMeet = Object.keys(meet)
        .map(el => meet[el])
        .flat();

      setStat({
        H: statAbsen.filter(el => el == 'H').length,
        S: statAbsen.filter(el => (el == el[0]) == 'S').length,
        I: statAbsen.filter(el => (el == el[0]) == 'I').length,
        A: statMeet.length - statAbsen.filter(el => true).length,
      });

      const currentAbsentRecords = Mhs[currentExist];
      setAbsentNeed([currentAbsentRecords, checkAbsent]);

      if (checkAbsent != undefined) {
        if (checkAbsent.length == currentAbsentRecords.length) {
          if (checkAbsent[checkAbsent.length] != moment().format('L')) {
            setStatusText('Dosen belum memulai absensi');
          } else {
            setStatusText('Sudah Absen');
          }
          setAbsening(true);
          setAbsentStatus(true);
          return true;
        }
        setStatusText('Belum absen');
      }

      return true;
    } catch (e) {
      console.log(e.message);
      return false;
    }
  };

  useEffect(async () => {
    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        ToastAndroid.show(
          'Kamu tidak memiliki koneksi internet',
          ToastAndroid.SHORT,
        );
        return;
      }
    });
    const permissionCheck = await hasLocationPermission();
    const waitContent = firstReload();
    if (waitContent && permissionCheck) {
      setLoading(false);
      return;
    }

    if (!permissionCheck) {
      ToastAndroid.show(
        'Akses lokasi ditolak, izinkan Presentia untuk mengakses lokasi!',
        ToastAndroid.LONG,
      );

      nav.navigate('Beranda');
      return;
    }
    removeLocationUpdates();

    BackHandler.addEventListener('hardwareBackPressb', backAction);
    return () =>
      BackHandler.removeEventListener('hardwareBackPressb', backAction);
  }, []);

  const step = [
    'Mengecek mode absensi',
    'Mengecek izin lokasi',
    'Mengecek koneksi internet',
    'Mendeteksi lokasi',
    'Mengecek perangkat',
    'Memulai absensi',
  ];

  const handleAbsen = async absentType => {
    setAbsening(true);
    setCurLoc(false);
    // Cek status absen
    if (absentStatus)
      return ToastAndroid.show('Anda sudah absen', ToastAndroid.SHORT);

    // Cek mode absen
    setStatusText(step[0]);
    if (currentMatkul.onlineAbsent) {
      setTrio({
        title: 'Catatkan kehadiranmu',
        content:
          'Efek kupu-kupu merupakan sebuah teori dimana sekecil apapun perbuatanmu (kepakkan sayap kupu-kupu) di masa lalu, akan menghasilkan dampak yang besar di masa depan (badai angin).\n\nKejujuranmu sekarang akan berdampak besar dalam hidup kamu di masa depan.\n\nTuliskan "Saya bersungguh-sungguh mengikuti perkuliahan dengan baik" untuk absen.',
        visible: true,
        btn: 'Saya jujur',
        input: true,
        type: 'online',
        hideContextMenu: true,
      });

      setAbsening(false);
      return;
    }
    setProgress(15);

    if (absentType == 'sakit') {
      if (absenInput.length < 5) {
        ToastAndroid.show(
          'Mohon masukkan bukti bahwa anda sakit',
          ToastAndroid.SHORT,
        );
        return;
      }

      recordingAbsent(`S:${absenInput}`);
      setProgress(100);
      setStatusText('Sudah Absen Sakit');
      setAbsentStatus(true);
      return;
    }

    if (absentType == 'izin') {
      if (absenInput.length < 5) {
        ToastAndroid.show(
          'Mohon masukkan bukti bahwa anda sakit',
          ToastAndroid.SHORT,
        );
        return;
      }
      recordingAbsent(`I:${absenInput}`);
      setProgress(100);
      setStatusText('Sudah Absen Izin');
      setAbsentStatus(true);
      return;
    }

    setCountDown(true);
    watchId.current = Geolocation.watchPosition(
      position => {
        if (position.mocked == true) {
          removeLocationUpdates();
          ToastAndroid.show('GPS Palsu terdeteksi!', ToastAndroid.SHORT);
          return BackHandler.exitApp();
        }
        setPos([position.coords.latitude, position.coords.longitude]);
      },
      error => {
        return ToastAndroid.show(
          `Terjadi kesalahan ${error.message}, silakan mulai ulang aplikasi`,
          ToastAndroid.LONG,
        );
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 1500,
        fastestInterval: 1000,
        forceRequestLocation: true,
        showLocationDialog: true,
        useSignificantChanges: false,
      },
    );

    // Cek izin lokasi
    setStatusText(step[1]);
    const hasPermission = await hasLocationPermission();

    if (!hasPermission) {
      setStatusText('Presentia tidak memiliki izin akses lokasi!');
      return;
    }
    setProgress(30);

    // Cek koneksi internet
    setStatusText(step[2]);
    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        setStatusText('Tidak ada koneksi internet');
        return resetStatus();
      } else {
        setProgress(50);
        setStatusText(step[3]);
        setTimeout(() => {
          actualAbsent();
        }, 6000);
      }
    });
  };

  const recordingAbsent = async type => {
    const deviceCurrent = await sha256(deviceInformation);
    const deviceAsync = mhs.device;

    if (deviceCurrent != deviceAsync) {
      setStatusText('Perangkat tidak sesuai');
      setProgress(0);
      setAbsening(false);
      return;
    }

    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        setStatusText('Tidak ada koneksi internet');
        return;
      } else {
        let newest = absentNeed[0];
        newest[absentNeed[1].length] = type;

        firestore()
          .collection('mahasiswa')
          .doc(instance.instanceId)
          .collection('mhs')
          .doc(mhs.uniqueId)
          .update({
            [currentMatkul?.name]: newest,
          })
          .then(() => {
            setStat({...stat, [type]: stat[type] + 1});
            console.log('Sukses Absent');
          })
          .catch(err => {
            ToastAndroid.show(
              'Terjadi Kesalahan, mohon coba lagi',
              ToastAndroid.SHORT,
            );
          });
      }
    });
  };

  const actualAbsent = () => {
    setStatusText(step[4]);

    const last = inside(sinstansi.areaCoords, [pos[0], pos[1]]);
    if (!last) {
      resetStatus();
      setStatusText('Diluar jangkauan area');
      return;
    }

    removeLocationUpdates();

    setStatusText(step[5]);

    recordingAbsent('H');

    setStatusText('Sudah Absen');
    setAbsentStatus(true);
    setProgress(100);
    setAbsening(false);
  };

  const hasLocationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version < 23) return true;
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (hasPermission) return true;
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }
    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        'Izinkan Presentia mengakses lokasimu',
        ToastAndroid.SHORT,
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'Presentia tidak bisa berjalan tanpa akses lokasi',
        ToastAndroid.SHORT,
      );
    }

    return false;
  };

  const removeLocationUpdates = useCallback(() => {
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const resetStatus = () => {
    setTimeout(() => {
      setProgress(0);
      setAbsening(false);
      setStatusText(`Gagal Absen`);
      setCurLoc(true);
    }, 1000);
  };

  const circleMiddle = () => {
    if (countDown == 0) {
      return (
        <MaterialCommunityIcons
          name={!absentStatus ? 'fingerprint' : 'check'}
          style={{fontSize: width / 3}}
          color="#FFF"
        />
      );
    }

    return (
      <CountdownCircleTimer
        isPlaying={countDown}
        strokeWidth={0}
        duration={5}
        onComplete={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setCountDown(false);
        }}
        colors="#FFF">
        {({remainingTime, animatedColor}) => (
          <Animated.Text
            style={{
              color: animatedColor,
              fontSize: 32,
              fontFamily: 'Sarabun-Medium',
            }}>
            {remainingTime}
          </Animated.Text>
        )}
      </CountdownCircleTimer>
    );
  };

  const handleTrio = (title, content, btn, input, type) => {
    setTrio({
      title: title,
      content: content,
      visible: true,
      btn: btn,
      input: input,
      type: type,
    });
  };

  const absentIzin = () => {
    handleAbsen('izin');
    setTrio({visible: false});
  };

  const absentSakit = () => {
    handleAbsen('sakit');
    setTrio({visible: false});
  };

  const absentOnline = () => {
    if (
      absenInput !== 'Saya bersungguh-sungguh mengikuti perkuliahan dengan baik'
    ) {
      ToastAndroid.show('Kalimat tidak sesuai', ToastAndroid.SHORT);
      return;
    }
    setStatusText('Sudah Absen Daring');

    recordingAbsent('H');
    setProgress(100);
    setAbsentStatus(true);
    setTrio({visible: false});
  };
  const handleTrioOnPress = type => {
    switch (type) {
      case 'sakit':
        absentSakit();
        break;
      case 'izin':
        absentIzin();
        break;
      case 'online':
        absentOnline();
      default:
        setTrio({visible: false});
        break;
    }
  };

  const trioBtn = [
    {
      iconName: 'car-hatchback',
      btnTitle: 'Izin',
      titleModal: 'Sampaikan perizinan',
      contentModal:
        'Masukkan URL seperti gambar, surat izin, atau dokumen pendukung lainnya yang telah di unggah di Drive.\n\nCatatan:\nPastikan hak akses berbagi file tersebut dibuka dan keputusan akhir absensi berada di dosen yang bersangkutan.',
      buttonModal: 'Saya izin',
      input: true,
      type: 'izin',
    },
    {
      iconName: 'emoticon-dead',
      btnTitle: 'Sakit',
      titleModal: 'Kabarkan kondisimu',
      contentModal:
        'Masukkan URL seperti gambar, surat keterangan dokter, atau dokumen pendukung lainnya yang telah di unggah di Drive.\n\nCatatan:\nPastikan hak akses berbagi file tersebut dibuka dan keputusan akhir absensi berada di dosen yang bersangkutan.',
      buttonModal: 'Saya sakit',
      input: true,
      type: 'sakit',
    },
    {
      iconName: 'help-box',
      btnTitle: 'Bantuan',
      titleModal: 'Pelajari Presentia',
      contentModal:
        'Terdapat dua mode absensi yaitu Daring dan Lokasi, tergantung dari Dosen mata kuliah yang bersangkutan. Kamu akan dianggap Alfa saat belum absen dan akan berubah jika telah melakukan absensi.\n\nPresentia membutuhkan 5 detik untuk mendeteksi lokasimu dan apabila kamu kesulitan dalam absen mode lokasi, cobalah 3 sampai 4 kali, hindari absensi di tepi area, hidupkan dan matikan GPS serta matikan mode penghemat daya.\n\nPraktik terbaik adalah dengan membuka lokasimu di peta, lacak posisimu sampai berada di lokasi absensi lalu kembali absensi di Presentia.\n\nKamu dapat mengunggah buku panduan absensi di link dibawah ini.',
      buttonModal: 'Mengerti',
      input: false,
      type: 'tutup',
    },
  ];

  const renderTrio = () =>
    trioBtn.map(el => {
      return (
        <TouchableOpacity
          key={el.btnTitle}
          onPress={() =>
            handleTrio(
              el.titleModal,
              el.contentModal,
              el.buttonModal,
              el.input,
              el.type,
            )
          }
          style={global.absentBtn}
          activeOpacity={0.6}>
          <MaterialCommunityIcons
            name={el.iconName}
            size={20}
            color="#119DA4"
          />
          <Text style={global.tripleBtn}>{el.btnTitle}</Text>
        </TouchableOpacity>
      );
    });

  const renderToday = () => {
    if (!currentMatkul?.noAbsence) {
      return (
        <>
          <Text style={global.absentTitle}>{currentMatkul?.name || ''}</Text>
          <Text style={global.absentTime}>
            {moment().format('dddd, Do MMMM YYYY')} •{' '}
            {currentMatkul?.start || ''} - {currentMatkul?.end || ''}
          </Text>
        </>
      );
    }

    return (
      <Text style={global.absentTitle}>Tidak ada absensi di jam sekarang</Text>
    );
  };

  return loading ? (
    <Loading />
  ) : (
    <>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 130}}>
        <Header
          title="Absensi"
          description={
            currentMatkul.noAbsence
              ? ' '
              : 'Mode absensi • ' +
                (currentMatkul?.onlineAbsent ? 'Daring' : 'Lokasi')
          }
        />
        <View style={{flex: 0.7}}>
          <View style={global.wrapper}>
            <View style={{alignItems: 'center'}}>{renderToday()}</View>
          </View>

          <View style={global.wrapper}>
            <View
              style={[
                global.absentFinger,
                {width: width / 2, height: width / 2, borderRadius: width / 2},
              ]}>
              <TouchableOpacity
                style={global.absentFingerWrapper}
                disabled={absening}
                onPress={handleAbsen}
                activeOpacity={0.6}>
                {circleMiddle()}
                <AnimatedCircularProgress
                  rotation={0}
                  size={width / 2.2}
                  width={4}
                  backgroundWidth={5}
                  fill={progress}
                  style={{alignItems: 'center', position: 'absolute'}}
                  tintColor="#FFF"
                  lineCap="round"
                  duration={2000}
                  backgroundColor="#119DA4"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={global.wrapper}>
            <View style={{alignItems: 'center'}}>
              <Text
                style={[
                  global.absentTime,
                  {
                    textAlign: 'center',
                    color: absentStatus ? '#119DA4' : '#b51941',
                  },
                ]}>
                {statusText}
              </Text>
              {curLoc && (
                <Text
                  onPress={() =>
                    Linking.openURL(
                      `http://maps.google.co.id/maps?q=${pos[0]},${pos[1]}`,
                    )
                  }
                  style={[
                    global.absentTime,
                    {textAlign: 'center', color: '#b51941'},
                  ]}>
                  Lihat Lokasimu
                </Text>
              )}
            </View>
          </View>
          <View style={global.wrapper}>
            <View style={global.card}>
              <Text style={global.cardTitle}>Statistik kehadiranmu</Text>
              <View style={global.divider} />
              <View style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                  <Text
                    style={[
                      global.cardTextMain,
                      {textAlign: 'center', fontSize: 20},
                    ]}>
                    {stat.H}
                  </Text>
                  <Text style={[global.cardTextMain, {textAlign: 'center'}]}>
                    Hadir
                  </Text>
                </View>
                <View style={{flex: 1}}>
                  <Text
                    style={[
                      global.cardTextInfo,
                      {textAlign: 'center', fontSize: 20},
                    ]}>
                    {stat.S}
                  </Text>
                  <Text style={[global.cardTextInfo, {textAlign: 'center'}]}>
                    Sakit
                  </Text>
                </View>
                <View style={{flex: 1}}>
                  <Text
                    style={[
                      global.cardTextWarning,
                      {textAlign: 'center', fontSize: 20},
                    ]}>
                    {stat.I}
                  </Text>
                  <Text style={[global.cardTextWarning, {textAlign: 'center'}]}>
                    Izin
                  </Text>
                </View>
                <View style={{flex: 1}}>
                  <Text
                    style={[
                      global.cardTextDanger,
                      {textAlign: 'center', fontSize: 20},
                    ]}>
                    {stat.A}
                  </Text>
                  <Text style={[global.cardTextDanger, {textAlign: 'center'}]}>
                    Alfa
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={{...global.wrapper, position: 'absolute', bottom: 70}}>
        <View style={{justifyContent: 'center', flexDirection: 'row'}}>
          {renderTrio()}
        </View>
      </View>
      <Modal
        backdropColor="#111"
        backdropOpacity={0.2}
        onBackdropPress={() => setTrio({visible: false})}
        onBackButtonPress={() => setTrio({visible: false})}
        testID={'modal'}
        style={{justifyContent: 'flex-end'}}
        isVisible={trio.visible}
        onSwipeComplete={() => setTrio({visible: false})}
        swipeDirection={['down', 'up', 'right', 'left']}>
        <View style={global.modalContainer}>
          <Text style={global.catTitle}>{trio.title}</Text>
          <Text style={global.cardTextGrey}>
            {trio.content}
            {!trio.input && (
              <Text
                onPress={() => Linking.openURL('https://snowfluke.github.io/')}
                style={[
                  global.cardTextGrey,
                  {textAlign: 'left', textDecorationLine: 'underline'},
                ]}>
                {'\n\n'}
                Buku Panduan Mahasiswa Presentia
              </Text>
            )}
          </Text>
          {trio.input && (
            <TextInput
              maxLength={300}
              contextMenuHidden={trio.hideContextMenu ? true : false}
              placeholder={
                trio.hideContextMenu
                  ? 'Masukkan kejujuranmu disini ...'
                  : 'Masukkan URL disini ...'
              }
              placeholderTextColor="#AAA"
              onChangeText={teks => setAbsenInput(teks)}
              style={{
                width: '100%',
                borderRadius: 10,
                backgroundColor: '#EEE',
                color: '#AAA',
                textAlign: 'center',
                marginTop: 15,
              }}
            />
          )}
          <TouchableOpacity
            onPress={() => handleTrioOnPress(trio.type)}
            disabled={trio.type == 'tutup' ? false : absening}
            style={{
              backgroundColor: !absening
                ? '#119DA4'
                : trio.type == 'tutup'
                ? '#119DA4'
                : '#DDD',
              width: '100%',
              padding: 10,
              marginTop: 10,
              borderRadius: 10,
            }}
            activeOpacity={0.7}>
            <Text style={global.modalBtnText}>{trio.btn}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};
