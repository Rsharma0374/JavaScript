// Replace this with your timestamp
var timestamp = 1696612461490;

// Create a new Date object with the timestamp
var date = new Date(timestamp);
console.log("Time is " + date)
// Extract the various date components
var year = date.getFullYear();
var month = date.getMonth() + 1; // Months are zero-based, so we add 1
var day = date.getDate();
var hours = date.getHours();
var minutes = date.getMinutes();
var seconds = date.getSeconds();

// Create a formatted date string
var formattedDate = year + "-" + pad(month) + "-" + pad(day) + " " + pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);

// Output the formatted date
console.log(formattedDate);

// Function to pad single digits with a leading zero
function pad(number) {
  if (number < 10) {
    return "0" + number;
  }
  return number;
}
