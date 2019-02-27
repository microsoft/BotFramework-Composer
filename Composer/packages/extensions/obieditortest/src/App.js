import React, { Component } from "react";
import "./App.css";
import Form from "react-jsonschema-form";

import schema3 from "./appschema.json";

class App extends Component {

  constructor(props) {
    super(props);
  }

  onChange = (newValue) => {
    // call props onChange with respect to the data format recieved

    var newData = {
      name: this.props.data.name, // this editor should not change file name
      content: JSON.stringify(newValue.formData)
    }
    console.log("new data from form editor");
    console.log(newData);
    this.props.onChange(newData)
  }

  isRootId = id => {
    return id.indexOf("root") !== -1;
  };

  isUnecessaryLabel = label => {
    return (
      label.indexOf("Microsoft.") === -1 &&
      label.indexOf("Dialog") === -1 &&
      label.indexOf("sequence") === -1
    );
  };

  fieldTemplate = props => {
    const { id, classNames, label, required, children } = props;

    return (
      <React.Fragment>
        {this.isRootId(id) && (
          <div className={classNames}>
            {children.map(c => {
              if (
                c &&
                c.props &&
                (c.props.name === "$type" ||
                  c.props.name === "$ref" ||
                  c.props.name === "$id")
              ) {
                return null;
              }
              return c;
            })}
          </div>
        )}
        {!this.isRootId(id) && (
          <div className={classNames}>
            {this.isUnecessaryLabel(label) && (
              <label htmlFor={id}>
                {label}
                {required ? "*" : null}
              </label>
            )}
            {children}
          </div>
        )}
      </React.Fragment>
    );
  };

  render() {
    return (
      <div className="App" style={{ margin: "15px 15px 15px 15px" }}>
        <Form
          FieldTemplate={this.fieldTemplate}
          noValidate
          className="schemaForm"
          onChange={this.onChange}
          formData={JSON.parse(this.props.data.content)}  // the props.data passed in will be a file object: {name: , content}
          schema={schema3}
        />
      </div>
    );
  }
}

export default App;
