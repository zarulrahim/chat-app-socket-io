import React, { useEffect, useState } from 'react';
import { Button, Card, DatePicker, Input, List, Modal } from 'antd';
import { AiOutlineWarning  } from 'react-icons/ai';
import { FiEdit, FiTrash2, FiUser, FiUserPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getSnapshot } from 'mobx-state-tree';
import { observer } from 'mobx-react';
import Container from '../../components/container';
import { mstAuth } from '../../mobx';
import styles from './index.module.css';
import moment from 'moment';
import { colors } from '../../themes';

const AdminDashboardScreen = observer((props) => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState('default'); // default | register | edit
  const [formState, setFormState] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    dob: ""
  })
  
  useEffect(() => {
    mstAuth.fetchUser();
  }, [])

  const onChangeScreen = (screen) => {
    setCurrentScreen(screen);
  }

  const onChangeInput = (value, type) => {
    formState[type] = value;
    setFormState(formState);
    // console.log("check formState ===> ", formState)
  };

  const onUpdate = () => {
    mstAuth.updateUser(formState)
    .then((response) => {
      alert("User information has been updated!")
    })
    .catch((error) => {
      alert(error);
    })
  };

  const onRegister = () => {
    mstAuth.storeUser(formState)
    .then((response) => {
      // alert("User has been created!");
      onChangeScreen('default');
    })
    .catch((error) => {
      alert(error);
    })
  };

  const onRemoveUser = (user) => {
    Modal.confirm({
      title: 'User Deletion',
      icon: <AiOutlineWarning size={30} color={'orange'} style={{ marginBottom: 5  }} />,
      content: `Are you sure want to remove ${user.email} ?`,
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        mstAuth.deleteUser(user)
      }
    });
  }

  const onEditUser = (user) => {
    mstAuth.fetchSingleUser({ user_uuid: user.user_uuid })
    .then((response) => {
      // console.log("check response ===> ", response)
      setFormState({
        first_name: response.get_detail.first_name,
        last_name: response.get_detail.last_name,
        email: response.email,
        password: "",
        phone_number: response.phone_number,
        dob: response.get_detail.dob
      })
      onChangeScreen('edit');
    })
    .catch((error) => {
      alert("Something went wrong. Please try again later");
    })
  }

  const onGotoUser = (user) => {
    mstAuth.fetchSingleUser({ user_uuid: user.user_uuid })
    .then((response) => {
      // console.log("check response ===> ", response)
      mstAuth.updateChatUser(response);
      navigate('/users/' + response.user_uuid);
    })
    .catch((error) => {
      alert("Something went wrong. Please try again later");
    })
  }

  const UserListingComponent = (props) => {
    return (
      <List 
        className={styles.list}
        dataSource={props.users}
        header={
          <div className={styles.listHeader}>
            <div className={styles.wrapper}>
              <Input placeholder='Search User' className={styles.searchBox} />
              <Button className={styles.button} type='link' onClick={() => { onChangeScreen('register') }}>
                <FiUserPlus size={28} color={colors.primary} />
              </Button>
            </div>
          </div>
        }
        renderItem={(user, index) => {
          return (
            <Card
              bodyStyle={customStyles.list.cardBody}
            >
              <div className={styles.listItem}>
                <div className={styles.listItem}>
                  <div>{user.email}</div>
                </div>
                <div className={styles.listItem}>
                  <Button className={styles.button} style={{ marginRight: 15 }} type='link' onClick={() => { props.onGotoUser(user) }}>
                    <FiUser size={22} color={colors.primary} />
                  </Button>
                  <Button className={styles.button} style={{ marginRight: 15 }}  type='link' onClick={() => { props.onEditUser(user) }}>
                    <FiEdit size={20} color={colors.primary}/>
                  </Button>
                  <Button className={styles.button} style={{ marginRight: 0 }} type='link' onClick={() => { props.onRemoveUser(user) }}>
                    <FiTrash2 size={20} color={colors.primary} />
                  </Button>
                </div>
              </div>
            </Card>
          )
        }}
      />
    )
  }

  const UserRegisterComponent = (props) => {
    return (
      <div className={styles.login}>
        <div className={styles.flexContainer}>
          <Input className={styles.inputText} size="large" style={{marginRight: 5}} placeholder='First Name' onChange={(e) => { props.onChangeInput(e.target.value, "first_name")  }} />
          <Input className={styles.inputText} size="large" style={{marginLeft: 5}} placeholder='Last Name' onChange={(e) => { props.onChangeInput(e.target.value, "last_name")  }} />
        </div>
        <div className={styles.flexContainer}>
          <Input className={styles.inputText} size="large" style={{marginRight: 5}} placeholder='Email' onChange={(e) => { props.onChangeInput(e.target.value, "email")  }} />
          <Input className={styles.inputText} size="large" style={{marginLeft: 5}} placeholder='Phone' onChange={(e) => { props.onChangeInput(e.target.value, "phone_number")  }} />
        </div>
        <div className={styles.flexContainer}>
          <DatePicker className={styles.datePicker} size="large" placeholder='Date of Birth' onChange={(date, dateString) => { props.onChangeInput(dateString, "dob") }} />
        </div>
        <div className={styles.flexContainer}>
          <Input.Password className={styles.inputText} size="large" placeholder='Password' onChange={(e) => { props.onChangeInput(e.target.value, "password")  }} />
        </div>
        <div className={styles.flexContainer}>
          <Button className={styles.primaryBtn} type='link' size='large' onClick={() => { props.onRegister() }}>Add User</Button>
        </div>
      </div>
    )
  }

  const UserEditComponent = (props) => {
    return (
      <div className={styles.login}>
        <div className={styles.flexContainer}>
          <Input defaultValue={props.formState.first_name} className={styles.inputText} size="large" style={{marginRight: 5}} placeholder='First Name' onChange={(e) => { props.onChangeInput(e.target.value, "first_name")  }} />
          <Input defaultValue={props.formState.last_name} className={styles.inputText} size="large" style={{marginLeft: 5}} placeholder='Last Name' onChange={(e) => { props.onChangeInput(e.target.value, "last_name")  }} />
        </div>
        <div className={styles.flexContainer}>
          <Input defaultValue={props.formState.email} className={styles.inputText} size="large" style={{marginRight: 5}} placeholder='Email' onChange={(e) => { props.onChangeInput(e.target.value, "email")  }} />
          <Input defaultValue={props.formState.phone_number} className={styles.inputText} size="large" style={{marginLeft: 5}} placeholder='Phone' onChange={(e) => { props.onChangeInput(e.target.value, "phone_number")  }} />
        </div>
        <div className={styles.flexContainer}>
          <DatePicker defaultValue={moment(props.formState.dob, "YYYY-MM-DD")} className={styles.datePicker} size="large" placeholder='Date of Birth' onChange={(date, dateString) => { props.onChangeInput(dateString, "dob") }} />
        </div>
        <div className={styles.flexContainer}>
          <Input.Password className={styles.inputText} size="large" placeholder='Password' onChange={(e) => { props.onChangeInput(e.target.value, "password")  }} />
        </div>
        <div className={styles.flexContainer}>
          <Button className={styles.primaryBtn} type='link' size='large' onClick={() => { props.onUpdate() }}>Update User</Button>
        </div>
      </div>
    )
  }

  return (
    <Container
      isAdminScreen={true}
      enableBackButton={currentScreen !== 'default'}
      onBackEvent={() => onChangeScreen('default')}
    >
      <div className={styles.content}>
        {
          currentScreen === 'default' ?
          (
            <UserListingComponent users={getSnapshot(mstAuth).users || []} navigate={navigate} onEditUser={onEditUser} onRemoveUser={onRemoveUser} onGotoUser={onGotoUser} />
          )
          : currentScreen === 'register' ?
          (
            <UserRegisterComponent formState={formState} onChangeInput={onChangeInput} onRegister={onRegister} />
          )
          : currentScreen === 'edit' ?
          (
            <UserEditComponent formState={formState} onChangeInput={onChangeInput} onUpdate={onUpdate} />
          )
          :
          (
            null
          )
        }
      </div>
    </Container>
  )
})

const customStyles = {
  list: {
    cardBody: {
      paddingTop: 10,
      paddingBottom: 10,
    },
  }
}

export default AdminDashboardScreen;