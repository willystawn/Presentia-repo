import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {TabBar} from '../components/tabBar';

// Screens Import
import {Beranda} from './beranda';
import {Pengumuman} from './pengumuman';
import {Tugas} from './tugas';
import {Absen} from './absen';
import {Registrasi} from './registrasi';
import {Jadwal} from './jadwal';

// Stacks Options
const StackScreenOptions = {
  ...TransitionPresets.SlideFromBottomIOS,
};

// Bottom tabs
const BNavigator = createBottomTabNavigator().Navigator;
const BScreen = createBottomTabNavigator().Screen;

// Stacks
const SNavigator = createStackNavigator().Navigator;
const SScreen = createStackNavigator().Screen;

// All screens
const LayarBeranda = ({route, navigation}) => (
  <Beranda nav={navigation} route={route} />
);

const LayarPengumuman = ({route, navigation}) => (
  <Pengumuman nav={navigation} route={route} />
);

const LayarTugas = ({route, navigation}) => (
  <Tugas nav={navigation} route={route} />
);

const LayarAbsen = ({route, navigation}) => (
  <Absen nav={navigation} route={route} />
);

const LayarRegistrasi = ({route, navigation}) => (
  <Registrasi nav={navigation} />
);

const LayarJadwal = ({route, navigation}) => (
  <Jadwal nav={navigation} route={route} />
);

// Stacks screens & Navigator
const StacksScreen = () => (
  <SNavigator
    headerMode="none"
    initialRouteName="Registrasi"
    screenOptions={StackScreenOptions}>
    <SScreen name="TabNavigator" component={TabNavigator} />
    <SScreen name="Registrasi" component={LayarRegistrasi} />
  </SNavigator>
);

const TabNavigator = () => (
  <BNavigator
    initialRouteName="Beranda"
    tabBar={props => <TabBar {...props} />}>
    <BScreen
      name="Beranda"
      options={{tabBarLabel: 'home'}}
      component={LayarBeranda}
    />
    <BScreen
      name="Pengumuman"
      options={{tabBarLabel: 'message-alert'}}
      component={LayarPengumuman}
    />
    <BScreen
      name="Absen"
      options={{tabBarLabel: 'fingerprint'}}
      component={LayarAbsen}
    />
    <BScreen
      name="Tugas"
      options={{tabBarLabel: 'clipboard-text'}}
      component={LayarTugas}
    />
    <BScreen
      name="Jadwal"
      options={{tabBarLabel: 'calendar-arrow-right'}}
      component={LayarJadwal}
    />
  </BNavigator>
);

// App Navigator
export const AppNavigator = () => (
  <NavigationContainer>
    <StacksScreen />
  </NavigationContainer>
);
