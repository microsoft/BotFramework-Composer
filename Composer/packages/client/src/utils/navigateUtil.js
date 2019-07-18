import { globalHistory, navigate } from '@reach/router';
import { replace } from 'lodash';

class DialogHistory {
  constructor() {
    this.history = globalHistory;
    this.navigate = this.history.navigate;
  }

  getNavHistory() {
    return this.history.location.state.navHistory;
  }

  navTo(path, navHistory = null) {
    if (navHistory === null) {
      navHistory = [path];
    } else {
      navHistory.push(path);
    }
    path = this._removeUnusefulSymbol(path);
    navigate(`/dialogs/${path}`, { state: { navHistory } });
  }

  navigateDown(subPath) {
    const navHistory = this.getNavHistory();
    const index = navHistory.length - 1;
    const pathname = this.history.location.pathname;
    navHistory.push(navHistory[index] + subPath);
    navigate(pathname + '/' + replace(subPath, '.', ''), { state: { navHistory } });
  }

  focusTo(subPath, isForm = false) {
    const navHistory = this.getNavHistory();
    let searchParams = this.history.location.search;
    const pathname = this.history.location.pathname;
    if (isForm && searchParams) {
      searchParams = searchParams + subPath;
    } else {
      searchParams = '?focused=' + this._removeDot(subPath);
    }
    navigate(pathname + searchParams, { state: { navHistory } });
  }

  clearNavHistory(fromIndex) {
    const navHistory = this.getNavHistory();
    navHistory.splice(fromIndex, navHistory.length);
    return navHistory;
  }

  addNavHistory(item) {
    let navHistory = this.getNavHistory();
    if (navHistory) {
      navHistory.push(item);
    } else {
      navHistory = [item];
    }
    return navHistory;
  }

  urlParams(paramsString) {
    return new URLSearchParams(paramsString);
  }

  //Keep use navpath and focuspath. can remove it when editor is ok.
  // the data path for VisualEditor, based on `dialogs` which computed from files.
  // the data path for FormEditor
  getPath() {
    const searchParams = this.history.location.search;
    const pathname = this.history.location.pathname;
    let focusPath = '';
    let navPath = '';
    const items = pathname.split('/');

    //pathname = '/dialogs/Main'
    if (items.length <= 2 || items[1] !== 'dialogs') {
      return { navPath, focusPath };
    }

    items.splice(0, 2);
    navPath = items[0] + '#';
    items.splice(0, 1);
    navPath = items.reduce((result, item, index) => {
      return `${result}${index === 0 ? '' : '.'}${item}`;
    }, navPath);

    focusPath = '';
    const focused = this.urlParams(searchParams).get('focused');
    if (focused) {
      focusPath = navPath + '.' + focused;
    } else {
      focusPath = navPath;
    }
    return { navPath, focusPath };
  }

  //remove '#', '#.', '.'
  _removeUnusefulSymbol(str) {
    str = replace(str, '#', '');
    str = replace(str, '#.', '');
    return str;
  }

  //remove '.'
  _removeDot(str) {
    str = replace(str, '.', '');
    return str;
  }
}

export default new DialogHistory();
