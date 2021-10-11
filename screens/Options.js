import * as React from 'react';
import {Linking} from 'react-native';
import * as Kitten from '../utility_components/ui-kitten.component.js';
import * as logger from '../utility_components/logging.component.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {ThemeContext} from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import {getVersion} from 'react-native-device-info';

import BTCIcon from '../pictures/bitcoin-btc-logo.svg';
import ETHIcon from '../pictures/ethereum-eth-logo.svg';
import Toast from 'react-native-simple-toast';

export default ({navigation}) => {
  const [resetModalVisible, setResetModalVisible] = React.useState(false);
  const themeContext = React.useContext(ThemeContext);
  const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

  const BackAction = () => (
    <Kitten.TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
  );
  const BackIcon = (props) => <Kitten.Icon {...props} name="arrow-back" />;
  const CautionIcon = (props) => (
    <Kitten.Icon name="alert-triangle-outline" {...props} />
  );
  const ImportIcon = (props) => (
    <Kitten.Icon name="arrow-downward-outline" {...props} />
  );
  const ExportIcon = (props) => <Kitten.Icon name="arrow-upward-outline" {...props} />;
  const OctoIcon = (props) => <Kitten.Icon name="github-outline" {...props} />;

  const makeVersionString = () => {
    return `Version ${getVersion()}`;
  };

  const clearData = () => {
    try {
      AsyncStorage.removeItem('categories').then((val) => {
        navigation.navigate('Main', {
          categoryName: '',
          action: 'reset',
        });
      });
    } catch (e) {
      Toast.show('Error reseting categores. Please try again.');
    }
  };

  const toggleTheme = () => {
    themeContext.toggleTheme();
    AsyncStorage.setItem(
      'theme',
      themeContext.theme == 'dark' ? 'light' : 'dark',
    );
  };

  const openGithub = () => {
    Linking.canOpenURL(
      'https://github.com/vukani-dev/improvement-roll.git',
    ).then((supported) => {
      if (supported) {
        Linking.openURL('https://github.com/vukani-dev/improvement-roll.git');
      } else {
        console.log(
          "Don't know how to open URI: https://github.com/vukani-dev/improvement-roll.git",
        );
      }
    });
  };

  const _renderResetModal = () => {
    return (
      <Kitten.Modal
        transparent={true}
        visible={resetModalVisible}
        backdropStyle={styleSheet.modal_backdrop}
        onBackdropPress={() => setResetModalVisible(false)}>
        <Kitten.Layout style={styleSheet.modal_container}>
          <Kitten.Layout
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              padding: 15,
            }}>
            <Kitten.Text style={{textAlign: 'center', marginBottom: 10}}>
              This will clear all of your categories and re-add the "General"
              category.
            </Kitten.Text>
            <Kitten.Text>Are you sure you want to do this?</Kitten.Text>
          </Kitten.Layout>
          <Kitten.Layout
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
              marginHorizontal: 70,
            }}>
            <Kitten.Button onPress={() => setResetModalVisible(false)}>No</Kitten.Button>
            <Kitten.Button onPress={() => clearData()}>Yes</Kitten.Button>
          </Kitten.Layout>
        </Kitten.Layout>
      </Kitten.Modal>
    );
  };
  return (
    <Kitten.Layout style={styleSheet.columned_container}>
      <Kitten.TopNavigation
        alignment="center"
        style={{backgroundColor: themeContext.backgroundColor}}
        title={makeVersionString()}
        accessoryLeft={BackAction}
      />

      <Kitten.Layout
        style={{
          flex: 0.3,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          marginTop: 40,
          backgroundColor: themeContext.backgroundColor,
        }}>
        <Kitten.Layout>
          <Kitten.Button
            style={{marginBottom: 20}}
            accessoryLeft={ImportIcon}
            accessoryRight={ExportIcon}
            onPress={() => navigation.navigate('ImportExport')}>
            Import / Export
          </Kitten.Button>
          <Kitten.Button
            status="warning"
            accessoryLeft={CautionIcon}
            onPress={() => setResetModalVisible(true)}>
            Reset Data
          </Kitten.Button>
        </Kitten.Layout>

        <Kitten.Toggle checked={themeContext.theme == 'dark'} onChange={toggleTheme}>
          Dark Mode
        </Kitten.Toggle>
      </Kitten.Layout>
      <Kitten.Divider />
      <Kitten.Text style={{textAlign: 'center', marginTop: 10, fontWeight: 'bold'}}>
        Code
      </Kitten.Text>
      <Kitten.Layout
        style={{
          flex: 0.4,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          marginTop: 40,
          backgroundColor: themeContext.backgroundColor,
        }}>
        <Kitten.Button
          style={{marginBottom: 30}}
          onPress={() => openGithub()}
          accessoryRight={OctoIcon}>
          View on github for instructions and code
        </Kitten.Button>
        <Kitten.Text>ALL feedback and suggestions are welcome!</Kitten.Text>
      </Kitten.Layout>

      <Kitten.Divider />
      <Kitten.Text style={{textAlign: 'center', marginTop: 10, fontWeight: 'bold'}}>
        Donate
      </Kitten.Text>
      <Kitten.Layout
        style={{flex: 0.6, backgroundColor: themeContext.backgroundColor}}>
        <Kitten.Layout
          style={{
            flexDirection: 'row',
            marginVertical: 20,
            justifyContent: 'space-evenly',
            backgroundColor: themeContext.backgroundColor,
          }}>
          <BTCIcon width={48} height={48}></BTCIcon>
          <Kitten.Text style={{marginTop: 10}} selectable={true}>
            3JEbKevTtts3ZAdt4vKnN7sbqdAkcoDKqY
          </Kitten.Text>
        </Kitten.Layout>
        <Kitten.Layout
          style={{
            flexDirection: 'row',
            marginVertical: 20,
            justifyContent: 'space-evenly',
            backgroundColor: themeContext.backgroundColor,
          }}>
          <ETHIcon width={48} height={48}></ETHIcon>
          <Kitten.Text style={{marginTop: 10}} selectable={true}>
            0xd75205A0Fb016e3a0C368F964D142cD29a829BF2
          </Kitten.Text>
        </Kitten.Layout>
      </Kitten.Layout>
      {_renderResetModal()}
    </Kitten.Layout>
  );
};
