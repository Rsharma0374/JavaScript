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
        var todate = new Date(date.setDate(date.getDate()));
        function formatDate(date) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            return [year, month, day].join('-');
        }
        function pad(number, length) {
            var str = '' + number;
            while (str.length < length) {
                str = '0' + str;
            }
            return str;
        }
        var currentTime = new Date(),
            hours = currentTime.getHours(),
            minutes = currentTime.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        var suffix = "AM";
        if (hours >= 12) {
            suffix = "PM";
            hours = hours - 12;
        }
        if (hours == 0) {
            hours = 12;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        var curtime = (hours + ":" + minutes + "" + suffix)
        // Attaching a new function  toShortFormat()  to any instance of Date() class
        Date.prototype.toShortFormat = function () {
            var month_names = ["Jan", "Feb", "Mar",
                "Apr", "May", "Jun",
                "Jul", "Aug", "Sep",
                "Oct", "Nov", "Dec"];
            var day = this.getDate();
            var month_index = this.getMonth();
            var year = this.getFullYear();
            return "" + day + "-" + month_names[month_index] + "-" + year;
        }
        // Now any Date object can be declared
        var today = new Date();
        today = (today.toShortFormat());
        var frmt_todate = formatDate(todate)

        var date1 = new Date();
        date1.setMinutes(date1.getMinutes() - 10000);

        // For Third Party Logs
        var pipeline = [
            {
                $match: {
                    "transactionLog.serviceType": {
                        $in: [
                            "PAN_VALIDATION_V2",
                            "POSIDEX_INPUT_V2",
                            "POSIDEX_OUTPUT_V2",
                            "POSIDEX_PUBLISH_V2",
                            "LOAN_UPLOAD_V2",
                            "LOAN_ENQUIRY_V2",
                            "NOTEPAD_UPLOAD_V2",
                            "IMPS_PAYMENT_V2",
                            "NEFT_PAYMENT_V2",
                            "A2A_PAYMENT_V2"
                        ]
                    },
                    "date": {
                        $gt: date1
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
        //   console.log(pipeline)
        const cursor = collection.aggregate(pipeline);
        const result = await cursor.toArray();
        console.log("Result  :" +result);


        
        // Get current time
        var currentTime = new Date();

        // Subtract 15 minutes
        currentTime.setMinutes(currentTime.getMinutes() - 15);

        // Format the time as a string
        var formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });


        console.log("CD@HDFC")
        console.log("TIME = " + formattedTime + " to " + curtime);
        const formattedResult = result.map(item => ({
            "API Name": item._id.ServiceType,
            "Success Count": item.Success_Count.toString().padStart(6, '0'),
            "Failed Count": item.Failure_Count.toString().padStart(6, '0'),
            "Total Count": item.Total_Count.toString().padStart(6, '0')
        }));
        console.table(formattedResult);


        var bredate = new Date();
        bredate.setMinutes(date1.getMinutes() - 100000);
        // For BRE
        var brePipeline = [
            {
                $match: {
                    "multiBREType": {
                        $in: [
                            "COMPONENT_DETAILS_BRE",
                            "QDE_DETAILS_BRE",
                            "SURROGATE_DETAILS_BRE",
                            "ASSET_DETAILS_BRE",
                            "BANKING_DETAILS_BRE",
                            "DDE_DETAILS_BRE",
                            "DIGITAL_DISB_DETAILS_BRE",
                            "AUTO_DISB_DETAILS_BRE",
                            "DAP_INSTORE_EKYC_BRE",
                            "LEAD_OFFER_BRE",
                            "HL_LEAD_BRE"
                        ]
                    },
                    "scoringApplicationRequest.dateTime": {
                        $gt: bredate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        ServiceType: "$multiBREType"
                    },
                    Success_Count: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$status", "SUCCESS"]
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
                                            $eq: ["$status", "FAILED"]
                                        },
                                        {
                                            $eq: ["$status", "ERROR"]
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
        const breCollection = database.collection('multiBRELogs');

        const cursor2 = breCollection.aggregate(brePipeline);
        const result2 = await cursor2.toArray();
      console.log("\t\t\tBRE Response Table")
        const formattedResult2 = result2.map(item => ({
            "API Name": item._id.ServiceType,
            "Success Count": item.Success_Count.toString().padStart(6, '0'),
            "Failed Count": item.Failure_Count.toString().padStart(6, '0'),
            "Total Count": item.Total_Count.toString().padStart(6, '0')
        }));

        console.table(formattedResult2);

        var mbdate = new Date();
        mbdate.setMinutes(date1.getMinutes() - 100000);
        // For MB
        var mbPipeline = [
            {
                $match: {
                    "applicantComponentResponse.multiBureauJsonRespose": {
                        $exists: true

                    },
                    "intrimStatus.startTime": {
                        $gt: mbdate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        ServiceType: "MB"
                    },
                    Success_Count: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$applicantComponentResponse.multiBureauJsonRespose.status", "COMPLETED"]
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
                                            $eq: ["$applicantComponentResponse.multiBureauJsonRespose.status", "INTERNAL ERROR"]
                                        },
                                        {
                                            $eq: ["$applicantComponentResponse.multiBureauJsonRespose.status", "ERROR"]
                                        },
                                        {
                                            $eq: ["$applicantComponentResponse.multiBureauJsonRespose.status", "REJECTED"]
                                        },
                                        {
                                            $eq: ["$applicantComponentResponse.multiBureauJsonRespose.status", "NO-HIT"]
                                        },
                                        {
                                            $eq: ["$applicantComponentResponse.multiBureauJsonRespose.status", "IN-PROCESS"]
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
        const gngCollection = database.collection('goNoGoCustomerApplication');

        const cursor3 = gngCollection.aggregate(mbPipeline);
        const result3 = await cursor3.toArray();
      console.log("\t\t\tMB Response Table")
        const formattedResult3 = result3.map(item => ({
            "API Name": item._id.ServiceType,
            "Success Count": item.Success_Count.toString().padStart(6, '0'),
            "Failed Count": item.Failure_Count.toString().padStart(6, '0'),
            "Total Count": item.Total_Count.toString().padStart(6, '0')
        }));

        console.table(formattedResult3);

        console.log("Exit!!")
    } finally {
        // Close the client
        await client.close();
    }
}

run().catch(console.dir);