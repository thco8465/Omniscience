// UserFactory.js
//decouple CreateAccount from the creation of the user 
export function createUser(username, email, password) {
    return {
      username,
      email,
      password,
    };
  }
  