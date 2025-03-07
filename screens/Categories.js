import * as React from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Card,
  List,
  Text,
  Button,
  Icon,
  Modal,
  Layout,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';

import { ThemeContext } from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';

import RNFS from 'react-native-fs';
import { PermissionsAndroid } from 'react-native';
import * as TOML from '@iarna/toml';
import * as YAML from 'js-yaml';

function CategoriesScreen({ route, navigation }) {
  const [allCategories, setAllCategories] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState({});
  const [timeRanges, setTimeRanges] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const { action, type } = route.params;

  const themeContext = React.useContext(ThemeContext);
  const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

  const data = [
    {
      label: '0 - 10 min',
      value: 1,
    },
    {
      label: '10 - 20 min',
      value: 2,
    },
    {
      label: '30 min - 1 hour',
      value: 3,
    },
    {
      label: '1 hour +',
      value: 4,
    },
  ];

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
  );

  const AddIcon = (props) => <Icon {...props} name="plus-square-outline" />;
  const ExportIcon = (props) => <Icon {...props} name="arrow-upward-outline" />;
  const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
  React.useEffect(() => {
    AsyncStorage.getItem('categories').then((value) => {
      var categories = value != null ? JSON.parse(value) : [];

      // lookup better way to do this
      for (var i = 0; i < categories.length; i++) {
        categories[i].key = i;
      }
      setAllCategories(categories);
    });
  }, []);

  const _categorySelected = (category) => {
    console.log(category);
    switch (action) {
      case 'view':
        navigation.navigate('AddCategory', { categoryName: category.name });
        break;
      case 'roll':
        if (category.timeSensitive) {
          var newTimeRange = [];
          var highestTimeRange = 0;
          for (var i = 0; i < category.tasks.length; i++) {
            if (category.tasks[i].time > highestTimeRange) {
              highestTimeRange = category.tasks[i].time;
              newTimeRange.push(data[highestTimeRange - 1]);
            }
          }

          if (newTimeRange.length == 1) {
            navigation.navigate('Roll', { tasks: category.tasks });
            return;
          }

          setTimeRanges(newTimeRange);
          setSelectedCategory(category);
          setModalVisible(true);
        } else {
          navigation.navigate('Roll', { tasks: category.tasks });
        }
        break;
      case 'export':
        _export([category]);
        break;
    }
  };

  const _export = (categories) => {
    var granted = PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permissions',
        message: 'Your app needs permission.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    ).then((res) => {
      console.log(res);
      var filename =
        categories.length > 1
          ? `imp_roll_categories_${Date.now()}`
          : categories[0].name;
      var path2 = RNFS.DownloadDirectoryPath + `/${filename}.${type}`;
      var data = '';

      switch (type) {
        case 'json':
          data = JSON.stringify(categories);
          break;
        case 'toml':
          data = TOML.stringify(categories[0]);
          break;
        case 'yaml':
          data = YAML.dump(categories[0])
          break;
      }

      RNFS.writeFile(path2, data, 'utf8')
        .then((success) => {
          console.log(success);
          navigation.navigate('ImportExport', { action: 'export', path: path2 });
          console.log('WORKED');
        })
        .catch((err) => {
          console.log('ERROR');
          console.log(err);
        });
    });
  };

  const _renderCategoryFooter = (item) => (
    <Text category="p2" style={{ margin: 5, textAlign: 'center' }}>
      {item.description}
    </Text>
  );

  const _renderCategory = (item) => {
    return (
      <Card
        onPress={() => _categorySelected(item)}
        status="info"
        style={{ margin: 10 }}
        footer={() => _renderCategoryFooter(item)}>
        <Text
          style={{ alignContent: 'center', textAlign: 'center' }}
          category="h6">
          {item.name}
        </Text>
      </Card>
    );
  };

  const _timeSelected = (time) => {
    var eligibleTasks = [];
    for (var i = 0; i < selectedCategory.tasks.length; i++) {
      if (selectedCategory.tasks[i].time == time) {
        eligibleTasks.push(selectedCategory.tasks[i]);
      }
    }
    setModalVisible(false);
    navigation.navigate('Roll', { tasks: eligibleTasks });
  };

  const _renderTimeModal = () => {
    const timeIcon = (props) => <Icon {...props} name="clock-outline" />;
    const cancelIcon = (props) => (
      <Icon {...props} name="close-circle-outline" />
    );
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        backdropStyle={styleSheet.modal_backdrop}>
        <Layout style={styleSheet.modal_container}>
          <Text style={{ marginBottom: 10 }}>How much time do you have?</Text>

          {timeRanges.map((timeRange) => (
            <Button
              status="primary"
              accessoryLeft={timeIcon}
              onPress={() => _timeSelected(timeRange.value)}
              style={{ marginTop: 15 }}
              key={timeRange.value}>
              {timeRange.label}
            </Button>
          ))}

          <Button
            style={{ marginTop: 20 }}
            appearance="ghost"
            accessoryLeft={cancelIcon}
            onPress={() => setModalVisible(false)}
          />
        </Layout>
      </Modal>
    );
  };

  return (
    <Layout style={styleSheet.columned_container}>
      <TopNavigation
        alignment="center"
        style={{ backgroundColor: themeContext.backgroundColor }}
        title="Select a category"
        accessoryLeft={BackAction}
      />
      {_renderTimeModal()}
      <List
        style={{
          flex: 1,
          marginBottom: 15,
          backgroundColor:
            themeContext.theme === 'dark' ? '#1A2138' : '#FFFFEE',
        }}
        data={allCategories}
        renderItem={({ item }) => _renderCategory(item)}></List>
      <View style={{ flexDirection: 'row', flex: 0.1, justifyContent: 'center' }}>
        {action == 'view' ? (
          <Button
            style={{ marginBottom: 20 }}
            hidden
            accessoryRight={AddIcon}
            onPress={() => navigation.navigate('AddCategory')}>
            Create a new Category
          </Button>
        ) : (
          <View></View>
        )}
        {action == 'export' && type == 'json' ? (
          <Button
            style={{ marginBottom: 20 }}
            hidden
            accessoryRight={ExportIcon}
            accessoryLeft={ExportIcon}
            onPress={() => _export(allCategories)}>
            Export all
          </Button>
        ) : (
          <View></View>
        )}
      </View>
    </Layout>
  );
}

export default CategoriesScreen;
