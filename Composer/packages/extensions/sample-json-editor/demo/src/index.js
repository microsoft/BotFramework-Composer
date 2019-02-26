import React, {Component} from 'react'
import {render} from 'react-dom'

import JsonEditor from '../../src'

class Demo extends Component {


  constructor(props) {
    super(props);
    this.state = {
      data: "hello world"
    }
  }

  dataChange = () => {
    this.setState({
      data: "data changed"
    })
  }

  onChange = (newValue) => {
    this.setState({
      data: newValue
    })
  }

  render() {
    return <div>
      <h1>JsonEditor Demo</h1>
      <button onClick={this.dataChange}> change data </button>
      <JsonEditor  data={this.state.data} onChange={this.onChange}/>
      
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
