// Initialize Firebase
var config = {
  apiKey: "AIzaSyCRH2FRIbkKgESpMoDYK2WlaQ_M2GMMZPo",
  authDomain: "mobiledevsberkeley-89d21.firebaseapp.com",
  projectId: "mobiledevsberkeley-89d21"
};
firebase.initializeApp(config);

// Init Stripe
var stripe = Stripe('pk_test_6V9CftAiiAykY6R0eZTZPPNZ');
