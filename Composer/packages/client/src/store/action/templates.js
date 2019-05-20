import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';

export async function fetchTemplates(dispatch) {
  try {
    const response = await axios.get(`${BASEURL}/assets/projectTemplates`);
    dispatch({
      type: ActionTypes.GET_PROJECT_TEMPLATE_SUCCESS,
      payload: { response },
    });
    return response.data;
  } catch (err) {
    dispatch({
      type: ActionTypes.GET_PROJECT_TEMPLATE_FAILURE,
      payload: null,
      error: err,
    });
  }
}
