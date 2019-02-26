class ShellApi {
    constructor() {
        this.postMessage = window.parent.postMessage.bind(window.parent); 
    }

    loadSuccess = () => {
        this.postMessage({
            from: 'editor',
            commond: 'onLoad',
        })
    }

    saveValue = (data) => {
        this.postMessage({
            from: 'editor',
            commond: 'save',
            data: data
        })
    }
}

export default ShellApi