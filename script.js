// Replace this with your timestamp
var timestamp = 1633864800000;

// Create a new Date object with the timestamp
var date = new Date(timestamp);

// Convert the date and time to IST (Indian Standard Time)
var options = {
  timeZone: 'Asia/Kolkata', // Set the time zone to IST
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
};

var istDateTime = date.toLocaleString('en-US', options);

// Output the IST date and time
console.log(istDateTime);
