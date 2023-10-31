const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';

const client = new MongoClient(uri, { useUnifiedTopology: true });


async function run() {
  try {

    await client.connect();
    console.log('Connected successfully to the server');

    const database = client.db('gonogocore');
    console.log('database name is', database.databaseName);

    const collection = database.collection('thirdPartyTransactionLog');
    console.log('collection name is', collection.collectionName);

      var date = new Date();
      date.setMinutes(date.getMinutes() - 10000);
      var pipeline = [
        {
          $match: {
            "transactionLog.serviceType": {
              $in: [
                "PAN_VALIDATION_V2",
                "POSIDEX_INPUT_V2",
                "POSIDEX_PUBLISH_V2",
                "POSIDEX_OUTPUT_V2",
                "LOAN_ENQUIRY_V2",
                "LMS_LOAN_BOOKING_V2",
                "IMPS_PAYMENT_V2_XML",
                "IMPS_INQUIRY_V2_XML"
              ]
            },
            "date": {
              $gt: date
            }
          }
        },
        {
          $group: {
            _id: {
              ServiceType: "$transactionLog.serviceType"
            },
            Success_Count: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$transactionLog.status", "SUCCESS"]
                  },
                  1,
                  0
                ]
              }
            },
            Failure_Count: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      {
                        $eq: ["$transactionLog.status", "FAILED"]
                      },
                      {
                        $eq: ["$transactionLog.status", "ERROR"]
                      }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            Total_Count: {
              $sum: 1
            }
          }
        }
      ];
    console.log(pipeline)
    const cursor = collection.aggregate(pipeline);
    const result = await cursor.toArray();

    const formattedResult = result.map(item => ({
        "API Name": item._id.ServiceType,
        "Success Count": item.Success_Count.toString().padStart(6, '0'),
        "Failed Count": item.Failure_Count.toString().padStart(6, '0'),
        "Total Count": item.Total_Count.toString().padStart(6, '0')
      }));
  
      console.table(formattedResult);

      console.log("Exit!!")
  } finally {
    // Close the client
    await client.close();
  }
}

run().catch(console.dir);

// db = db.getSiblingDB('GNG_CORE_HBLTW');
// rs.secondaryOk();
// var date = new Date();
// var todate = new Date(date.setDate(date.getDate()  ));
// function formatDate(date) {
//    var d = new Date(date),
//        month = '' + (d.getMonth() + 1),
//        day = '' + d.getDate(),
//        year = d.getFullYear();
//    if (month.length < 2) month = '0' + month;
//    if (day.length < 2) day = '0' + day;
//    return [year, month, day].join('-');
// }
// function pad(number, length) {
//     var str = '' + number;
//     while (str.length < length) {
//         str = '0' + str;
//     }
//     return str;
// }
// var currentTime = new Date(),
//       hours = currentTime.getHours(),
//       minutes = currentTime.getMinutes();
// 	if (minutes < 10) {
// 	 minutes = "0" + minutes;
//   }
// 	var suffix = "AM";
// 	if (hours >= 12) {
//     suffix = "PM";
// hours = hours - 12;
// 	}
// 	if (hours == 0) {
// 	 hours = 12;
// 	}
// if (hours < 10) {
// 	 hours = "0" + hours;
//   }
// var curtime=(hours + ":" + minutes + "" + suffix)
// // Attaching a new function  toShortFormat()  to any instance of Date() class
// Date.prototype.toShortFormat = function() {
//     var month_names =["Jan","Feb","Mar",
//                       "Apr","May","Jun",
//                       "Jul","Aug","Sep",
//                       "Oct","Nov","Dec"];
//     var day = this.getDate();
//     var month_index = this.getMonth();
//     var year = this.getFullYear();
//     return "" + day + "-" + month_names[month_index] + "-" + year;
// }
// // Now any Date object can be declared
// var today = new Date();
//     today=(today.toShortFormat());
// var frmt_todate=formatDate(todate)
// //////////////////////////////////////////////////////////////////
// var hdbfs=db.goNoGoCustomerApplication.find({"applicationRequest.header.institutionId": "3989","intrimStatus.startTime" : { "$gte": new Date(frmt_todate)}}).count()
// var hdbfs_n=pad(hdbfs, 6)
// var approve_HDBFS=db.goNoGoCustomerApplication.find({"applicationRequest.header.institutionId": "3989","intrimStatus.startTime" : { "$gte": new Date(frmt_todate)},"applicationStatus":"Approved"}).count()
// var approve_HDBFS_n=pad(approve_HDBFS, 6)
// var dec_HDBFS=db.goNoGoCustomerApplication.find({"applicationRequest.header.institutionId": "3989","intrimStatus.startTime" : { "$gte": new Date(frmt_todate)},"applicationStatus":"Declined"}).count()
// var dec_HDBFS_n=pad(dec_HDBFS, 6)
// ////////////////////////////////////////////////////////////////////
// var bre=db.goNoGoCustomerApplication.find({"applicationRequest.header.institutionId": "3989","intrimStatus.startTime" : { "$gte": new Date(frmt_todate)},"applicationStatus":"BRE"}).count()
// var bre_n=pad(bre, 6)
// var lead=db.goNoGoCustomerApplication.find({"applicationRequest.header.institutionId": "3989","intrimStatus.startTime" : { "$gte": new Date(frmt_todate)},"applicationStatus":"LEAD"}).count()
// var lead_n=pad(bre, 6)
// var hdboth = hdbfs - (approve_HDBFS + dec_HDBFS + bre)
// var hdboth_n=pad(hdboth, 6)
// var hdboth_per = 100 * (approve_HDBFS / hdbfs )
// var hdboth_per_n=pad(hdboth_per, 6)
// print(today)
// print("TW@HDFC")
// print("TIME = 12:00AM to "+ curtime+"")
// print(""+ hdbfs_n+ " = Total Cases Submitted")
// print(""+ approve_HDBFS_n+" = Total Approved")
// print("" + dec_HDBFS_n+ " = Total Declined " )
// print("" + bre_n+ " = BRE " )
// print(""+ hdboth_n+ " = Total Others " )
// print(""+ hdboth_per_n+ " = Approval Rate " )
// print("===================================")
// print("Lentra.ai")