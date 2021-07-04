/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import EndlessService from 'react-native-endless-background-service-without-notification';
const BackgroundTask = async () => {
  console.log('Background Task');
  EndlessService.stopService();
};

AppRegistry.registerHeadlessTask('EBSWN', () => BackgroundTask);
EndlessService.startService(60);
AppRegistry.registerComponent(appName, () => App);
