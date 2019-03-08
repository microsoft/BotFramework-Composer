// this is currently hard-coded here

import JsonEditor from 'composer-extensions/sample-json-editor'
import FormEditor from 'composer-extensions/obieditortest'
import VisualDesigner from 'composer-extensions/visual-designer'


function getSuffix(fileName) {
    return fileName.substring(fileName.lastIndexOf('.'));
}


// Editors are registered in such an registration table
// Any editor is registered with a lamdba, testing when this kind of data is interested or not
//
// Besides the basic file structure, the shell doesn't provide\define any data structures
// a sample file data structure is like this
// { name: "filename", content: "content" }
//
// By doing so, our extension target can be very simple, powerful and flexible
//
// For example, any editor that is interested in a SequenceDialog, can have a condition that check
//    data.type === "Microsoft.SequeneDialog"
// This made multile editors interactions extremly easy, one parent editor can open up a children editor
// only by passing the data, and that's it
//

const EditorRegistration = [
    {
        when: (data) => data.name && (getSuffix(data.name) === ".dialog"),
        pick: VisualDesigner
    },

    {
        when: (data) => data.$type, // any data has a $type handle to form editor
        pick: FormEditor
    },

    {
        when: (data) => getSuffix(data.name) === ".lu",
        pick: JsonEditor
    },

    {
        when: (data) => true,
        pick: JsonEditor
    }
]


const getEditor = (data) => {
    if (data == null) {
        return "";
    }

    // pick the first Editor that matches
    return EditorRegistration.find(e => e.when(data)).pick;
}

export default getEditor