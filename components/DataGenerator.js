import React, { Component } from 'react'
import { View, Text, TextInput } from 'react-native'
import Realm from 'realm'

import Button from './Button'
import Graph from './Graph'

const TemperatureVitalSchema = {
  name: 'TemperatureVital',
  properties: {
    value:  'double',
    timestamp: 'date'
  }
}

const realm = new Realm({
  schema: [TemperatureVitalSchema]
})

function * generate(count, generator) {
  const batchSize = 25
  let remaining = count
  let previous = null
  while (remaining > 0) {
    const gen = Math.min(batchSize, remaining)

    realm.write(() => {
      for (let i=0; i<batchSize; i++) {
        previous = generator.call(this, previous)
      }
    })

    remaining -= gen
    yield 1-(remaining/count)
  }
}

function generateRandomData(batchSize, generator) {
  realm.write(() => {
    for (let i=0; i<batchSize; i++) {
      generator.call(this)
    }
  })
}

export default class DataGenerator extends Component {

  constructor(props) {
    super(props)
    const vitals = realm.objects('TemperatureVital').sorted('timestamp', true)
    vitals.addListener((vitals, changes) => {
      this.setState({ vitals })
    })
    this.state = {
      generating: false,
      vitals
    }

  }

  _generateRealtime() {
    this.setState({ generating: true })
    this.generator = setInterval(() => {
      realm.write(() => {
        const obj = realm.create('TemperatureVital', { value: 97.6 + Math.random() * 2, timestamp: new Date(Date.now())})
      })
    }, 1000)
  }

  _stopGenerateRealtime() {
    if (this.generator) {
      clearInterval(this.generator)
      this.generator = null
      this.setState({ generating: false })
    }
  }

  render() {

    return (
      <View>
        <View style={{backgroundColor: '#C5CAE9'}}>
          <View style={{flexDirection: 'row', alignItems: 'center' }}>
            <Button onPress={this._generateRealtime.bind(this)}>
              Realtime
            </Button>
            <Button onPress={() => {
              this._stopGenerateRealtime()
            }}
              disabled={this.state.generating ? false : true }>
              Stop
            </Button>
          </View>
        </View>

        <Graph data={this.state.vitals} />
      </View>
    )
  }

}
