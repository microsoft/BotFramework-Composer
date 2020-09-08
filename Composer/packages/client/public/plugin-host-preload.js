// add default doc styles
if (!document.getElementById('plugin-host-default-styles')) {
  const styles = document.createElement('style');
  styles.id = 'plugin-host-default-styles';
  styles.type = 'text/css';
  styles.appendChild(
    document.createTextNode(`
      html, body { padding: 0; margin: 0; }
      #plugin-root {
        display: flex;
        flex-flow: column nowrap;
        height: 100%;
      }
  `)
  );
  document.head.appendChild(styles);
}
// add the react mount point
if (!document.getElementById('plugin-root')) {
  const root = document.createElement('div');
  root.id = 'plugin-root';
  document.body.appendChild(root);
}
// initialize the API object
window.Composer = {};
// init the render function
window.Composer['render'] = function (component) {
  ReactDOM.render(component, document.getElementById('plugin-root'));
};
