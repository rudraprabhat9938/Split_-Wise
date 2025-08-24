import React, { useReducer } from 'react';
import axios from 'axios';
import GroupContext from './groupContext';
import groupReducer from './groupReducer';
import {
  GET_GROUPS,
  ADD_GROUP,
  DELETE_GROUP,
  GROUP_ERROR,
  SET_CURRENT_GROUP,
  CLEAR_CURRENT_GROUP
} from '../types';

const GroupState = props => {
  const initialState = {
    groups: [],
    currentGroup: null,
    error: null,
    loading: true
  };

  const [state, dispatch] = useReducer(groupReducer, initialState);

  // Get Groups
  const getGroups = async () => {
    try {
      const res = await axios.get('/api/groups');

      dispatch({
        type: GET_GROUPS,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: GROUP_ERROR,
        payload: err.response.msg
      });
    }
  };

  // Add Group
  const addGroup = async group => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post('/api/groups', group, config);

      dispatch({
        type: ADD_GROUP,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: GROUP_ERROR,
        payload: err.response.msg
      });
    }
  };

  // Set Current Group
  const setCurrentGroup = group => {
    dispatch({ type: SET_CURRENT_GROUP, payload: group });
  };

  // Clear Current Group
  const clearCurrentGroup = () => {
    dispatch({ type: CLEAR_CURRENT_GROUP });
  };

  // Delete Group
  const deleteGroup = async (groupId) => {
    try {
      await axios.delete(`/api/groups/${groupId}`);

      dispatch({
        type: DELETE_GROUP,
        payload: groupId
      });
    } catch (err) {
      dispatch({
        type: GROUP_ERROR,
        payload: err.response?.msg || 'Error deleting group'
      });
    }
  };

  return (
    <GroupContext.Provider
      value={{
        groups: state.groups,
        currentGroup: state.currentGroup,
        error: state.error,
        loading: state.loading,
        getGroups,
        addGroup,
        deleteGroup,
        setCurrentGroup,
        clearCurrentGroup
      }}
    >
      {props.children}
    </GroupContext.Provider>
  );
};

export default GroupState;