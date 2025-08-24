import {
  GET_GROUPS,
  ADD_GROUP,
  DELETE_GROUP,
  GROUP_ERROR,
  SET_CURRENT_GROUP,
  CLEAR_CURRENT_GROUP
} from '../types';

export default (state, action) => {
  switch (action.type) {
    case GET_GROUPS:
      return {
        ...state,
        groups: action.payload,
        loading: false
      };
    case ADD_GROUP:
      return {
        ...state,
        groups: [action.payload, ...state.groups],
        loading: false
      };
    case DELETE_GROUP:
      return {
        ...state,
        groups: state.groups.filter(group => group.id !== action.payload),
        loading: false
      };
    case SET_CURRENT_GROUP:
      return {
        ...state,
        currentGroup: action.payload
      };
    case CLEAR_CURRENT_GROUP:
      return {
        ...state,
        currentGroup: null
      };
    case GROUP_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};