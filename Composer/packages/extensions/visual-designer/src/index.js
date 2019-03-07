import React, {Component, Fragment} from 'react'

export default class extends Component {

  constructor(props) {
    super(props);
  }

  onChange = (newData) => {
    var newData = {
      name: this.props.data.name, // this editor should not change file name
      content: JSON.stringify(newData, null, 4)
    }
    this.props.onChange(newData)
  }

  onClick = (item, index) => {
    this.props.shellApi.openSubEditor("right", item, (newData) => {
      console.log("data get back from sub editor");
      console.log(newData);
    })
  }



  render() {
    const data = JSON.parse(this.props.data.content);

    return (
      <div>
        <div> Dialog Visual Designer </div>
        <div> {data.$type} </div>

        {
          data.$type === "Microsoft.SequenceDialog" ?
          <Fragment>
            {
              data.sequence.map((item, index) => {
                return (
                  <div key={index} onClick={() => this.onClick(item, index)}> step {index} </div>
                );
              })
            }
          </Fragment>
          :
          <Fragment>
            <div>click here</div>
          </Fragment>
        }
      </div>
    )
  }
}
