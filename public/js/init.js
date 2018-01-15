// Initialize Firebase
var config = {
  apiKey: "AIzaSyCRH2FRIbkKgESpMoDYK2WlaQ_M2GMMZPo",
  authDomain: "mobiledevsberkeley-89d21.firebaseapp.com",
  projectId: "mobiledevsberkeley-89d21"
};
firebase.initializeApp(config);

// Init Stripe
var stripe = Stripe('pk_test_6V9CftAiiAykY6R0eZTZPPNZ');
var card = stripe.elements().create('card', {
  style: {
    base: {
      color: '#32325d',
      lineHeight: '18px',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
});
