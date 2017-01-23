import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';


import DataGenerator from './components/DataGenerator'

export default class RNGraph extends Component {
  render() {
    return (
      <View style={styles.container}>
        <DataGenerator />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});


AppRegistry.registerComponent('RNGraph', () => RNGraph);
