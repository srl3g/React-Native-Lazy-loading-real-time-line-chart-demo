import React, { Component } from 'react'
import { TouchableOpacity, Text } from 'react-native'

export default class Button extends Component {

  render() {
    return (
      <TouchableOpacity
        {...this.props}
        style={[
          {
            backgroundColor: '#3F51B5',
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 5,
            paddingBottom: 5,
            borderRadius: 3,
            margin: 5
          },
          this.props.disabled ? { backgroundColor: '#7986CB' } : null,
          this.props.style
        ]}
        onPress={this.props.disabled ? null : this.props.onPress}>

        <Text style={{color: '#ffffff'}}>{this.props.children}</Text>

      </TouchableOpacity>
    )
  }

}
