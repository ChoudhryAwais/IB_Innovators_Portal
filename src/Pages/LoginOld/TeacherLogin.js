import React from 'react';
import styles from './TeacherLogin.module.css';
import { useState } from 'react';
import { useEffect } from 'react';

function TeacherLogin() {


  // LOGIN STATES


  const LoginForm = () => {
    const [loginUserName, setLoginUserName] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
  
    const LoginHandler = (e) => {
      e.preventDefault(); // Prevent the form from submitting
  
      // You can perform login validation here
      if (!loginUserName.trim()) {
        alert('Username is required');
      } else if (!loginPassword) {
        alert('Password is required');
      } else {
        // Perform login logic or call a login handler function
        console.log({
          username: loginUserName,
          password: loginPassword,
        });
      }
    };
  
    return (
      <form onSubmit={LoginHandler}>
        <div className={styles.row}>
          <label>Username</label>
          <input
            onChange={(e) => setLoginUserName(e.target.value)}
            value={loginUserName}
            placeholder="Enter your username"
            type="text"
          />
        </div>
  
        <div className={styles.row}>
          <label>Password</label>
          <input
            onChange={(e) => setLoginPassword(e.target.value)}
            value={loginPassword}
            placeholder="Enter your password"
            type="password"
          />
        </div>
  
        <div style={{ padding: '2rem', paddingBottom: 0 }}>
          <button type='submit' className={styles.rowButton} style={{ textAlign: 'center' }}>Log In</button>
        </div>
      </form>
    );
  };





  // _________________________________________________________________________________________


  useEffect(() => {console.log("SOmething HAPPENED")}, [])





   // _________________________________________________________________________________________


  const FormHeader = (props) => (
    <h2 style={{color: 'rgba(240, 2, 2, 0.7)',
    fontWeight: 'bold',}} className={styles.headerTitle}>{props.title}</h2>
  );

  // const LoginForm = (props) => (
  //   <div>
  //     <FormInput description="Username" placeholder="Enter your username" type="text" />
  //     <FormInput description="Password" placeholder="Enter your password" type="password" />
  //     <LoginFormButton onClick={LoginHandler} title="Log in" />
  //   </div>
  // );



  const LogInOtherMethods = (props) => (
    <div className={styles.alternativeLogin}>
      <label>Or Log In with:</label>
      <div className={styles.iconGroup}>
        <Google />
      </div>
    </div>
  );

  const Google = (props) => (
    <a href="/" className={styles.googleIcon}></a>
  );

  return (
    <div className={styles.backgroundColor}>
    <div className={styles.loginform}>
      <FormHeader title={'Teacher LogIn'} />
        <LoginForm/>
        <LogInOtherMethods/>
    </div>
    </div>
  );
}

export default TeacherLogin;
