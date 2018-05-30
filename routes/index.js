import express from 'express';
import cmd from 'node-cmd';
import apiperformanceModel from '../models/apiperformanceModel';

const router = express.Router();

const serializeObject = array => array.reduce((accumulator, currentValue, currentIndex) => {
    accumulator[currentValue.name] = currentValue.value;
    return accumulator;
}, {});
Array.prototype.clean = function(deleteValue) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

/* GET index page. */
router.get('/', (req, res) => {
    res.render('index', {
        title: 'Testing of API Performance '
    });
});

router.post('/evaluateApi', (req, res) => {
    const bodys = req.body;
    const body = serializeObject(bodys);
    const method = body.methodName;
    body.apiUrl = body.hostName + body.apiRoute;
    let siegePath = '';
    const performanceData = body;
    switch (method) {
        case 'GET':
            {
                siegePath = `siege -r${body.repetition} -c${body.concurrentUsers} ${body.apiUrl}`;
                break;
            }
        case 'POST':
            {
                siegePath = `siege -r${body.repetition} -c${body.concurrentUsers} -t30S -H 'Content-Type: application/json'` + ` '${body.apiUrl} POST ${JSON.parse(JSON.stringify(body.reqBody))}'`;
                break;
            }
    }
    console.log(siegePath);
    performanceData.siegePath = siegePath;
    cmd.get(
        siegePath,
        (err, data, stderr) => {

            console.log('Fetching API Performance');
            if (err) {
                console.log("=============Error=================", err)
                let output = err;
                output = output.split('\n').clean('').clean(' ');
                output = output.splice(0, output.length);
                performanceData.report = output;
                performanceData.createdAt = new Date();
                const apiperformanceData = new apiperformanceModel(performanceData);
                apiperformanceData.save((error, data) => {
                    if (!error) {
                        console.log("Report Successfully added in database");
                        return res.status(200).json(err);
                    } else {
                        console.log("Error in recording response");
                        return res.status(200).json(err);
                    }
                });
                // return res.status(400).json({ msg: 'Error in Evaluation' });
            }
            if (data) {
                console.log("========================data==================", data)
            }
            if (stderr) {
                console.log("========================stderr=========================", stderr)
                let output = stderr;
                output = output.split('\n').clean('').clean(' ');
                output = output.splice(0, output.length);
                performanceData.report = output;
                performanceData.createdAt = new Date();
                const apiperformanceData = new apiperformanceModel(performanceData);
                apiperformanceData.save((err, data) => {
                    if (!err) {
                        console.log("Report Successfully added in database");
                        return res.status(200).json(stderr);
                    } else {
                        console.log("Error in recording response");
                        return res.status(200).json(stderr);
                    }
                });
            }
        }
    );
});

export default router;