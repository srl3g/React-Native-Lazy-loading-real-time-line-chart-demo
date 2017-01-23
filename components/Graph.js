import React, { Component } from 'react'
import { View, Text, TextInput, ART } from 'react-native'
import { ListView } from 'realm/react-native'
import LRU from 'lru-cache'

import * as scale from 'd3-scale'
import * as shape from 'd3-shape'
import * as array from 'd3-array'

const d3 = {
  scale,
  array,
  shape
}

const {
  Group,
  Shape,
  Surface,
  Circle
} = ART

export default class Graph extends Component {

  constructor(props) {
    super(props)
    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1.timestamp != r2.timestamp || r1.value != r2.value
    })

    const scaleY = d3.scale.scaleLinear()
      .domain([95, 100])
      .range([0, 200])

    this.state = {
      dataSource: dataSource.cloneWithRows(this.props.data),
      height: 200,
      scaleY
    }

    this.renderCache = new LRU(100)
  }

  componentWillReceiveProps(newProps){
    this._onDataArrived(newProps)
  }

  _onDataArrived(props=this.props) {
    const { data } = props
    const { dataSource } = this.state
    this.setState({
      dataSource: dataSource.cloneWithRows(data)
    })
  }

  _renderItem(data, sectionId, rowId) {
    const cache = this.renderCache.get(data.timestamp.getTime())
    
    // Speed up rendering when real time data is added to list
    if (cache) {
      return cache
    }

    const { height, scaleY, dataSource } = this.state
    const next = dataSource.getRow(sectionId, rowId+1)

    if (!next || Math.abs(data.timestamp-next.timestamp) > 5000 ) {
      return (
        <View />
      )
    }

    const graphData = [ data, next ]

    const width = Math.round(Math.abs(next.timestamp-data.timestamp)/100.0)

    const scaleX = d3.scale.scaleTime()
      .domain([data.timestamp, next.timestamp])
      .range([0, width])

    const line = d3.shape.line()
      .x(row => scaleX(row.timestamp))
      .y(row => scaleY(row.value))

    const area = d3.shape.area()
      .x(row => scaleX(row.timestamp))
      .y0(0)
      .y1(row => scaleY(row.value))

    const component =  (
      <Surface width={width} height={height}>
        <Group>
          <Shape d={area(graphData)} fill="#00000050" />
          <Shape d={line(graphData)} stroke="#000" strokeWidth={3} />
        </Group>
      </Surface>
    )

    this.renderCache.set(data.timestamp.getTime(), component)

    return component
  }

  render() {
    // List is rotated 180 deg so that new data is appended at right end of list
    return (
      <ListView style={{ transform: [{rotate: '180deg'}], height: this.state.height, backgroundColor: '#ddd' }}
        horizontal
        showsHorizontalScrollIndicator={false}
        dataSource={this.state.dataSource}
        pageSize={15}
        automaticallyAdjustContentInsets={false}
        renderRow={this._renderItem.bind(this)}/>
    )
  }

}
