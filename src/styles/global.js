import {StyleSheet, Dimensions} from 'react-native';

const white = '#FFF';
const black = '#000';
const main = '#119DA4'; // (17,157,164)
const main2 = '#0C7489'; // (27 , 106, 122)
const main3 = '#13505B'; // (19,80,91)
const main4 = '#040404'; // (4,4,4)
const main5 = '#D7D9CE'; // (217, 206, 215)

const main6 = '#41c8c2';
const success = '#0da149';
const info = '#0b5fc1';
const warning = '#db9003';
const danger = '#b51941';

export const global = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },

  wrapper: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: '90%',
    marginBottom: 5,
  },

  bgMain: {
    backgroundColor: main,
  },

  txtMain: {
    color: main,
  },

  bgWhite: {
    backgroundColor: white,
  },

  txtWhite: {
    color: white,
  },

  shadow: {
    shadowColor: black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },

  navigator: {
    position: 'absolute',
    bottom: 25,
    backgroundColor: white,
    borderRadius: 30,
    height: 60,
    elevation: 0,
    borderTopWidth: 0,
  },

  sliderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sliderTitle: {
    textAlign: 'center',
    fontSize: 22,
    marginBottom: 30,
    color: main,
    fontFamily: 'Sarabun-Bold',
  },

  sliderImage: {
    width: '100%',
    height: 250,
    alignSelf: 'center',
    resizeMode: 'contain',
  },

  sliderText: {
    textAlign: 'center',
    fontSize: 18,
    color: main2,
    fontFamily: 'Sarabun-Light',
    marginTop: 10,
  },

  sliderNext: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  h1: {
    fontFamily: 'Sarabun-SemiBold',
    fontSize: 26,
    color: main,
  },

  note: {
    fontFamily: 'Sarabun-Mediu',
    fontSize: 16,
    color: main3,
    marginVertical: 15,
  },

  b: {
    fontFamily: 'Sarabun-Bold',
  },

  input: {
    minHeight: 40,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
    width: '80%',
    fontFamily: 'Sarabun-Medium',
    letterSpacing: 0.5,
    backgroundColor: 'rgba(255,255,255,.2)',
    borderRadius: 10,
    alignSelf: 'center',
    fontSize: 18,
    textAlign: 'center',
    color: white,
  },

  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    alignSelf: 'center',
    textAlign: 'center',
  },

  headerText: {
    color: white,
    fontSize: 22,
    letterSpacing: 0.5,
    flex: 1,
    fontFamily: 'Sarabun-Bold',
    textAlign: 'center',
  },

  divider: {
    width: '100%',
    marginVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
  },

  headerDescription: {
    color: '#FFF',
    flex: 1,
    fontFamily: 'Sarabun-Light',
    fontSize: 14,
    textAlign: 'center',
  },

  card: {
    width: '100%',
    padding: 10,
    minHeight: 50,
    backgroundColor: white,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
  },

  cardDanger: {
    width: '100%',
    padding: 10,
    minHeight: 50,
    backgroundColor: white,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: danger,
    borderRadius: 10,
  },

  catTitle: {
    color: '#0C7489',
    fontSize: 18,
    fontFamily: 'Sarabun-Bold',
  },

  cardTitle: {
    fontFamily: 'Sarabun-Bold',
    fontSize: 15,
    color: main2,
    flex: 1,
  },

  cardLabel: {
    fontFamily: 'Sarabun-Medium',
    color: '#AAA',
    fontSize: 12,
  },

  cardText: {
    color: white,
    fontFamily: 'Sarabun-Medium',
  },

  cardTextDanger: {
    color: danger,
    fontFamily: 'Sarabun-Medium',
  },

  cardTextGrey: {
    color: '#AAA',
    fontFamily: 'Sarabun-Medium',
  },

  cardTextInfo: {
    color: info,
    fontFamily: 'Sarabun-Medium',
  },

  cardTextWarning: {
    color: warning,
    fontFamily: 'Sarabun-Medium',
  },

  cardTextSuccess: {
    color: success,
    fontFamily: 'Sarabun-Medium',
  },

  cardTextMain: {
    color: main,
    fontFamily: 'Sarabun-Medium',
  },

  jadwalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  jadwalStatusBelum: {
    borderColor: danger,
    borderWidth: 1,
    paddingHorizontal: 5,
    borderRadius: 5,
    marginRight: 10,
  },

  jadwalStatusSudah: {
    borderColor: success,
    borderWidth: 1,
    paddingHorizontal: 6.15,
    borderRadius: 5,
    marginRight: 10,
  },

  absentBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: black,
    shadowOffset: {
      width: 3,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
    borderRadius: 10,
    margin: 5,
    backgroundColor: white,
  },

  absentTitle: {
    fontFamily: 'Sarabun-Bold',
    fontSize: 18,
    color: main2,
  },

  absentTime: {
    fontFamily: 'Sarabun-Medium',
    fontSize: 16,
    color: main2,
  },

  absentDate: {
    fontFamily: 'Sarabun-Light',
    fontSize: 14,
    color: main2,
  },

  absentFinger: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: main,
    marginVertical: 25,
    alignSelf: 'center',
    position: 'relative',
    shadowColor: black,
    shadowOffset: {
      width: 3,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },

  absentFingerWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tripleBtn: {
    fontFamily: 'Sarabun-Light',
    fontSize: 14,
    color: main,
    marginLeft: 5,
  },

  pressableContainer: {
    backgroundColor: '#FFFFFF',
    width: '80%',
    borderRadius: 10,
    marginTop: 30,
    alignSelf: 'center',
    shadowColor: black,
    shadowOffset: {
      width: 3,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },

  pressableInnerContainer: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
    padding: 5,
  },

  outerHelp: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    top: 5,
    right: 5,
    backgroundColor: white,
    borderRadius: 20,
    position: 'absolute',
    shadowColor: black,
    shadowOffset: {
      width: 3,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },

  modalHelp: {
    width: '90%',
    textAlign: 'left',
    padding: 15,
    alignItems: 'flex-start',
  },

  modalHelpBtn: {
    flex: 1,
    width: '95%',
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: main,
  },

  modalBtnText: {
    alignSelf: 'center',
    color: '#FFF',
    fontFamily: 'Sarabun-Bold',
  },
});
